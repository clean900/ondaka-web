<?php

declare(strict_types=1);

namespace App\Domains\Avisos\Services;

use App\Domains\Avisos\Models\Aviso;
use App\Domains\Avisos\Models\AvisoComentario;
use App\Domains\Feature\Services\FeatureGate;
use App\Domains\Integracao\Sms\Contracts\SmsProviderInterface;
use App\Domains\Notifications\Services\FcmSenderService;
use App\Domains\Avisos\Notifications\AvisoNovoNotification;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Orquestra notificações de Avisos.
 *
 * Push, email e SMS para todos os condominos com contrato activo nas fracções segmentadas.
 * Cada canal é opcional (controlado por flags no aviso) + saldo (SMS).
 */
class AvisoNotificationService
{
    public function __construct(
        protected SmsProviderInterface $smsProvider,
        protected FcmSenderService $fcmSender,
    ) {}

    public function avisoPublicado(Aviso $aviso): void
    {
        $destinatarios = $this->resolverDestinatarios($aviso);

        if ($destinatarios->isEmpty()) {
            Log::info("[AvisoNotification] Aviso #{$aviso->id} sem destinatários após segmentação.");
            return;
        }

        Log::info("[AvisoNotification] Aviso #{$aviso->id} a notificar {$destinatarios->count()} users");

        $assunto = "Novo aviso: {$aviso->titulo}";
        $mensagem = $aviso->descricao;
        $pushTitulo = "📢 " . mb_strimwidth($aviso->titulo, 0, 80, '...');
        $pushCorpo = mb_strimwidth(strip_tags($aviso->descricao), 0, 120, '...');
        $pushData = [
            'aviso_id' => (string) $aviso->id,
            'tipo' => 'aviso_publicado',
        ];

        foreach ($destinatarios as $user) {
            try {
                $user->notify(new AvisoNovoNotification(
                    avisoId: $aviso->id,
                    avisoTitulo: $aviso->titulo,
                    resumo: $pushCorpo,
                ));
            } catch (\Throwable $e) {
                Log::warning("[AvisoNotification] Sino in-app falhou user {$user->id}: " . $e->getMessage());
            }
            if ($aviso->notificar_email) {
                $this->tentarEnviarEmail($user, $assunto, $mensagem, $aviso);
            }
            if ($aviso->notificar_sms) {
                $this->tentarEnviarSms($aviso, $user, $mensagem);
            }
            if ($aviso->notificar_push) {
                $this->tentarEnviarPush($user, $pushTitulo, $pushCorpo, $pushData);
            }
        }
    }

    public function novoComentario(Aviso $aviso, AvisoComentario $comentario): void
    {
        $destinatariosIds = collect();

        if ($aviso->autor_user_id !== $comentario->user_id) {
            $destinatariosIds->push($aviso->autor_user_id);
        }

        $outrosComentadoresIds = $aviso->todosComentarios()
            ->where('user_id', '!=', $comentario->user_id)
            ->pluck('user_id')
            ->unique();

        $destinatariosIds = $destinatariosIds->merge($outrosComentadoresIds)->unique();

        if ($destinatariosIds->isEmpty()) return;

        $autor = $comentario->user->name ?? 'Alguém';
        $pushTitulo = "💬 Comentário em \"{$aviso->titulo}\"";
        $pushCorpo = "{$autor}: " . mb_strimwidth($comentario->mensagem, 0, 100, '...');
        $pushData = [
            'aviso_id' => (string) $aviso->id,
            'tipo' => 'novo_comentario',
        ];

        $users = User::whereIn('id', $destinatariosIds)->get();
        foreach ($users as $user) {
            $this->tentarEnviarPush($user, $pushTitulo, $pushCorpo, $pushData);
        }
    }

    /**
     * Resolve destinatários conforme segmentação.
     * Estrutura: users ← condominos.user_id ← contratos_ocupacao (estado=activo) → fraccoes
     */
    protected function resolverDestinatarios(Aviso $aviso): Collection
    {
        $aviso->load('segmentacoes');

        $userIds = collect();

        foreach ($aviso->segmentacoes as $seg) {
            $userIds = $userIds->merge($this->userIdsParaSegmentacao($aviso, $seg));
        }

        $userIdsUnicos = $userIds->unique()->filter()->values();

        if ($userIdsUnicos->isEmpty()) {
            return collect();
        }

        return User::whereIn('id', $userIdsUnicos)->get();
    }

    /**
     * Retorna user_ids para uma segmentação específica.
     */
    protected function userIdsParaSegmentacao(Aviso $aviso, $seg): Collection
    {
        switch ($seg->tipo) {
            case 'todos':
                // Todos os users com contrato activo em alguma fração do condomínio
                return DB::table('contratos_ocupacao')
                    ->join('fraccoes', 'contratos_ocupacao.fraccao_id', '=', 'fraccoes.id')
                    ->join('condominos', 'contratos_ocupacao.condomino_id', '=', 'condominos.id')
                    ->where('fraccoes.condominio_id', $aviso->condominio_id)
                    ->where('contratos_ocupacao.estado', 'activo')
                    ->whereNotNull('condominos.user_id')
                    ->pluck('condominos.user_id');

            case 'fraccao':
                if (! $seg->alvo_id) return collect();
                return DB::table('contratos_ocupacao')
                    ->join('condominos', 'contratos_ocupacao.condomino_id', '=', 'condominos.id')
                    ->where('contratos_ocupacao.fraccao_id', $seg->alvo_id)
                    ->where('contratos_ocupacao.estado', 'activo')
                    ->whereNotNull('condominos.user_id')
                    ->pluck('condominos.user_id');

            case 'bloco':
                // Fracções com edificio_id específico (bloco/torre)
                if (! $seg->alvo_id) return collect();
                return DB::table('contratos_ocupacao')
                    ->join('fraccoes', 'contratos_ocupacao.fraccao_id', '=', 'fraccoes.id')
                    ->join('condominos', 'contratos_ocupacao.condomino_id', '=', 'condominos.id')
                    ->where('fraccoes.edificio_id', $seg->alvo_id)
                    ->where('contratos_ocupacao.estado', 'activo')
                    ->whereNotNull('condominos.user_id')
                    ->pluck('condominos.user_id');

            case 'grupo':
                // TODO: implementar quando tabela grupos existir
                return collect();

            default:
                return collect();
        }
    }

    protected function tentarEnviarEmail(User $user, string $assunto, string $mensagem, ?Aviso $aviso = null): void
    {
        if (empty($user->email)) return;

        try {
            $condominioNome = $aviso && $aviso->condominio ? 'Condomínio ' . $aviso->condominio->nome : null;
            $empresaNome = $aviso && $aviso->empresaGestora ? $aviso->empresaGestora->nome : null;
            $dados = [
                'assunto' => $assunto,
                'titulo' => $assunto,
                'corpo' => strip_tags($mensagem),
                'condominioNome' => $condominioNome,
                'empresaNome' => $empresaNome,
                'saudacao' => 'Caro(a) ' . $user->name . ',',
                'badge' => '📢 Aviso',
            ];
            Mail::send('emails.notificacao', $dados, function ($m) use ($user, $assunto) {
                $m->to($user->email, $user->name)->subject($assunto);
            });
        } catch (Throwable $e) {
            Log::warning("[AvisoNotification] Email falhou para {$user->email}: " . $e->getMessage());
        }
    }

    protected function tentarEnviarSms(Aviso $aviso, User $user, string $mensagem): void
    {
        $numero = $user->phone ?? $user->telefone ?? null;
        if (empty($numero)) return;

        $condominio = $aviso->condominio;
        if (! $condominio) return;

        $featureSlug = FeatureGate::has($condominio, 'sms_sender_id')
            ? 'sms_sender_id'
            : 'sms_pack_extra';

        if (! FeatureGate::has($condominio, $featureSlug)) return;

        $smsMensagem = mb_strimwidth(strip_tags($mensagem), 0, 155, '...');

        $consumido = FeatureGate::consume(
            owner: $condominio,
            featureSlug: $featureSlug,
            quantidade: 1,
            acao: 'sms_aviso',
            referenciavel: $aviso,
            metadata: ['aviso_id' => $aviso->id, 'numero' => $numero],
        );

        if (! $consumido) return;

        try {
            $this->smsProvider->enviar($numero, $smsMensagem);
        } catch (Throwable $e) {
            Log::error("[AvisoNotification] SMS falhou para {$numero}: " . $e->getMessage());
        }
    }

    protected function tentarEnviarPush(
        User $user,
        string $titulo,
        string $corpo,
        array $data = [],
    ): void {
        try {
            $this->fcmSender->enviarParaUser($user, $titulo, $corpo, $data);
        } catch (Throwable $e) {
            Log::error("[AvisoNotification] Push falhou user {$user->id}: " . $e->getMessage());
        }
    }
}
