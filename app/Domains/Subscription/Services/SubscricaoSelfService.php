<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Services;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Subscription\Models\Subscricao;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Gestão self-service da subscrição pelo próprio cliente (admin-empresa).
 * Permite cancelar e reverter o cancelamento.
 */
class SubscricaoSelfService
{
    public function __construct(
        protected NotificacaoB2BService $notificacao,
    ) {}

    /**
     * Lista de motivos pré-definidos para cancelamento.
     */
    public const MOTIVOS = [
        'preco_elevado' => 'Preço demasiado elevado',
        'pouco_uso' => 'Não estou a usar o suficiente',
        'funcionalidade_falta' => 'Funcionalidade em falta',
        'mudei_fornecedor' => 'Mudei para outro fornecedor',
        'problemas_tecnicos' => 'Problemas técnicos / Bugs',
        'encerrei_negocio' => 'Encerrei o negócio',
        'outro' => 'Outro motivo',
    ];

    /**
     * Cancelar subscrição (cancela_no_fim_periodo=true).
     * Subscrição mantém-se activa até fim do período pago.
     */
    public function cancelar(int $subscricaoId, User $user, string $motivoChave, ?string $detalhes = null): bool
    {
        return DB::transaction(function () use ($subscricaoId, $user, $motivoChave, $detalhes) {
            $sub = DB::table('subscricoes')->where('id', $subscricaoId)->first();
            if (! $sub) return false;

            $motivoTexto = self::MOTIVOS[$motivoChave] ?? 'Não especificado';
            $motivoCompleto = $detalhes ? "{$motivoTexto} — {$detalhes}" : $motivoTexto;

            $dataFimAcesso = $sub->periodo_actual_fim ?? $sub->trial_expira_em ?? now();
            DB::table('subscricoes')->where('id', $subscricaoId)->update([
                'cancela_no_fim_periodo' => $dataFimAcesso,
                'cancelada_em' => now(),
                'motivo_cancelamento' => $motivoCompleto,
                'updated_at' => now(),
            ]);

            DB::table('plataforma_subscricao_eventos')->insert([
                'subscricao_id' => $subscricaoId,
                'tipo' => 'cancelada_pelo_cliente',
                'descricao' => "Subscrição cancelada pelo cliente: {$motivoTexto}",
                'meta_json' => json_encode([
                    'motivo_chave' => $motivoChave,
                    'motivo_texto' => $motivoTexto,
                    'detalhes' => $detalhes,
                    'origem' => 'self_service',
                ]),
                'user_id' => $user->id,
                'created_at' => now(),
            ]);

            // Notificação por email (hook ao Service existente)
            $empresa = EmpresaGestora::find($sub->empresa_gestora_id);
            if ($empresa) {
                $this->notificacao->cancelamentoProcessado($user, $empresa, $motivoCompleto);

                // Notificar super-admins (sino + email) — só no self-service (cliente cancelou)
                try {
                    $sasNotif = \App\Models\User::role('super-admin')->get();
                    foreach ($sasNotif as $saNotif) {
                        $saNotif->notify(new \App\Domains\Empresa\Notifications\CancelamentoSubscricaoSuperAdminNotification(
                            $empresa,
                            $motivoCompleto,
                            $dataFimAcesso ? (string) $dataFimAcesso : null
                        ));
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Notificacao cancelamento super-admin falhou: '.$e->getMessage());
                }
            }

            return true;
        });
    }

    /**
     * Reverter cancelamento.
     * Só funciona se ainda não chegou ao fim do período pago.
     */
    public function reverterCancelamento(int $subscricaoId, User $user): bool
    {
        return DB::transaction(function () use ($subscricaoId, $user) {
            $sub = DB::table('subscricoes')->where('id', $subscricaoId)->first();
            if (! $sub) return false;
            if ($sub->cancela_no_fim_periodo === null) return false;

            DB::table('subscricoes')->where('id', $subscricaoId)->update([
                'cancela_no_fim_periodo' => null,
                'cancelada_em' => null,
                'motivo_cancelamento' => null,
                'updated_at' => now(),
            ]);

            DB::table('plataforma_subscricao_eventos')->insert([
                'subscricao_id' => $subscricaoId,
                'tipo' => 'cancelamento_revertido',
                'descricao' => 'Cancelamento revertido pelo cliente',
                'meta_json' => json_encode(['origem' => 'self_service']),
                'user_id' => $user->id,
                'created_at' => now(),
            ]);

            return true;
        });
    }
}
