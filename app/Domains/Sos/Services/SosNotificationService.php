<?php

declare(strict_types=1);

namespace App\Domains\Sos\Services;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Notifications\Services\FcmSenderService;
use App\Domains\Sos\Catalog\TiposSos;
use App\Domains\Sos\Models\SosAlerta;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Service que dispara notificações push quando um SOS é criado.
 *
 * Regras por gravidade:
 *   - CRITICO: guarda + administrador-condominio + gestor + admin-empresa
 *   - ALTO   : guarda + administrador-condominio + gestor
 *   - MEDIO  : guarda + administrador-condominio
 *   - BAIXO  : administrador-condominio
 *
 * Filtra sempre por empresa_gestora_id do condomínio.
 * Para guardas, prefere os com condominio_activo_id = X se preenchido.
 */
class SosNotificationService
{
    public function __construct(protected FcmSenderService $fcmSender) {}

    /**
     * Mapa gravidade → roles que recebem notificação.
     *
     * @return array<string,array<string>>
     */
    private const REGRAS_POR_GRAVIDADE = [
        'critico' => ['guarda', 'administrador-condominio', 'gestor', 'admin-empresa'],
        'alto'    => ['guarda', 'administrador-condominio', 'gestor'],
        'medio'   => ['guarda', 'administrador-condominio'],
        'baixo'   => ['administrador-condominio'],
    ];

    /** Roles que recebem EMAIL (toda a hierarquia, sem guardas). */
    private const ROLES_EMAIL = ['administrador-condominio', 'gestor', 'admin-empresa'];

    /** Gravidades que disparam EMAIL. */
    private const GRAVIDADES_EMAIL = ['critico', 'alto'];

    /**
     * Notifica todos os utilizadores apropriados para este SOS.
     * Falha silenciosamente — não bloqueia o pedido se push falhar.
     */
    public function notificar(SosAlerta $alerta): int
    {
        try {
            $rolesAlvo = self::REGRAS_POR_GRAVIDADE[$alerta->gravidade] ?? ['administrador-condominio'];
            $destinatarios = $this->resolverDestinatarios($alerta, $rolesAlvo);

            $tipoInfo = TiposSos::todos()[$alerta->tipo] ?? null;
            $tipoLabel = $tipoInfo['label'] ?? $alerta->tipo;

            $emoji = match ($alerta->gravidade) {
                'critico' => '🚨',
                'alto'    => '⚠️',
                'medio'   => '🟡',
                'baixo'   => '🔔',
                default   => '🔔',
            };

            $titulo = "{$emoji} SOS — {$tipoLabel}";
            $corpo = $alerta->localizacao
                ? "Local: {$alerta->localizacao}"
                : 'Toca para ver detalhes e atender.';

            $data = [
                'tipo' => 'sos',
                'sos_id' => (string) $alerta->id,
                'gravidade' => $alerta->gravidade,
                'condominio_id' => (string) $alerta->condominio_id,
            ];

            $enviados = 0;
            foreach ($destinatarios as $user) {
                try {
                    // Só guardas recebem a sirene SOS; restantes (admins/gestores) canal normal.
                    $ehGuarda = $user->hasRole('guarda');
                    $envios = $this->fcmSender->enviarParaUser(
                        $user,
                        $titulo,
                        $corpo,
                        $data,
                        canal: $ehGuarda ? 'ondaka_sos' : 'ondaka_default',
                        som: $ehGuarda ? 'sirene_sos' : null,
                    );
                    $enviados += $envios;
                } catch (Throwable $e) {
                    Log::warning('[SOS] Falha push para user ' . $user->id, ['erro' => $e->getMessage()]);
                }
            }

            // === EMAIL (admin-empresa + gestor + admin-cond, só para crítico/alto) ===
            if (in_array($alerta->gravidade, self::GRAVIDADES_EMAIL, true)) {
                $this->enviarEmailHierarquia($alerta, $tipoLabel);
            }

            Log::info('[SOS] Notificações enviadas', [
                'alerta_id' => $alerta->id,
                'gravidade' => $alerta->gravidade,
                'destinatarios' => $destinatarios->count(),
                'envios_fcm' => $enviados,
            ]);

            return $enviados;
        } catch (Throwable $e) {
            Log::error('[SOS] Erro fatal no notification', [
                'alerta_id' => $alerta->id,
                'erro' => $e->getMessage(),
            ]);
            return 0;
        }
    }

    /**
     * @param  array<string>  $rolesAlvo
     * @return Collection<int,User>
     */
    /**
     * Envia email à hierarquia (admin-empresa + gestor + admin-cond) do empresa_gestora.
     * Falha silenciosamente.
     */
    private function enviarEmailHierarquia(SosAlerta $alerta, string $tipoLabel): void
    {
        try {
            $condominio = Condominio::find($alerta->condominio_id);
            if (! $condominio) return;

            $users = User::query()
                ->where('empresa_gestora_id', $condominio->empresa_gestora_id)
                ->whereHas('roles', fn ($q) => $q->whereIn('name', self::ROLES_EMAIL))
                ->whereNotNull('email')
                ->get();

            $alerta->loadMissing('fotos');

            $assunto = match ($alerta->gravidade) {
                'critico' => "🚨 EMERGÊNCIA CRÍTICA: {$tipoLabel}",
                'alto'    => "⚠️ Alerta SOS (alto): {$tipoLabel}",
                default   => "Alerta SOS: {$tipoLabel}",
            };

            foreach ($users as $user) {
                try {
                    Mail::send('emails.sos.alerta-criado', [
                        'user' => $user,
                        'alerta' => $alerta,
                        'tipoLabel' => $tipoLabel,
                        'condominio' => $condominio,
                        'gravidadeLabel' => match ($alerta->gravidade) {
                            'critico' => 'CRÍTICO',
                            'alto'    => 'ALTO',
                            default   => strtoupper($alerta->gravidade),
                        },
                        'urlDetalhe' => url('/sos/alertas/' . $alerta->id),
                    ], function ($message) use ($user, $assunto) {
                        $message->to($user->email)->subject($assunto);
                    });
                } catch (Throwable $e) {
                    Log::warning('[SOS] Email falhou para user ' . $user->id, ['erro' => $e->getMessage()]);
                }
            }

            Log::info('[SOS] Emails enviados', [
                'alerta_id' => $alerta->id,
                'destinatarios' => $users->count(),
            ]);
        } catch (Throwable $e) {
            Log::error('[SOS] Erro fatal no email', ['erro' => $e->getMessage()]);
        }
    }

    private function resolverDestinatarios(SosAlerta $alerta, array $rolesAlvo): Collection
    {
        $condominio = Condominio::find($alerta->condominio_id);
        if (! $condominio) {
            return collect();
        }

        $empresaGestoraId = $condominio->empresa_gestora_id;

        // Base: todos os users da empresa com qualquer role-alvo
        $query = User::query()
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->whereHas('roles', fn ($q) => $q->whereIn('name', $rolesAlvo));

        $users = $query->get();

        // Refinamento: se houver guardas com condominio_activo_id == este, usar SÓ esses
        // (assumimos que guardas em rotação têm condominio_activo_id preenchido)
        $guardasNoCondominio = $users->filter(fn ($u) =>
            $u->hasRole('guarda') && (int) ($u->condominio_activo_id ?? 0) === (int) $alerta->condominio_id
        );

        $temGuardasNoCondominio = $guardasNoCondominio->isNotEmpty();

        return $users->filter(function (User $u) use ($temGuardasNoCondominio, $guardasNoCondominio) {
            // Se é guarda E há guardas associados ao condomínio → só esses; senão, descartar
            if ($u->hasRole('guarda')) {
                if ($temGuardasNoCondominio) {
                    return $guardasNoCondominio->contains('id', $u->id);
                }
                // Sem filtro de condomínio_activo → notifica todos os guardas da empresa
                return true;
            }
            // Não-guardas (admins/gestores): notificar todos da empresa
            return true;
        })->unique('id')->values();
    }
}
