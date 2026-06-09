<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Services;

use App\Domains\Subscription\Models\Subscricao;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Gestão self-service de mudança de plano (ciclo) pelo cliente.
 *
 * Regras:
 * - UPGRADE (mensal→semestral, mensal→anual, semestral→anual):
 *   • Aplicado IMEDIATAMENTE
 *   • Gera factura pro-rata (diferença a pagar)
 *   • Após pagamento, ciclo muda
 *
 * - DOWNGRADE (anual→mensal, anual→semestral, semestral→mensal):
 *   • Agendado para fim do período actual
 *   • Sem reembolso
 *   • Sistema aplica automaticamente via cron
 *
 * - Trial: muda já o ciclo (vai ser aplicado quando trial expirar)
 * - Cancelada: NÃO permite mudar
 */
class MudancaPlanoService
{
    /**
     * Hierarquia de ciclos (maior = mais "alto" = upgrade).
     */
    private const HIERARQUIA = [
        'mensal' => 1,
        'semestral' => 2,
        'anual' => 3,
    ];

    public function __construct(
        protected PrecoSubscricaoService $precoService,
    ) {}

    /**
     * Preview da mudança: indica se é upgrade/downgrade,
     * data efectiva, e (se upgrade) valor pro-rata estimado.
     *
     * @return array{
     *     valida: bool,
     *     erro?: string,
     *     tipo: 'upgrade'|'downgrade'|'mesmo'|null,
     *     ciclo_actual: string,
     *     ciclo_novo: string,
     *     aplica_em: string|null,
     *     valor_proximo_ciclo_kz: float|null,
     *     pro_rata_estimado_kz: float|null,
     * }
     */
    public function obterPreview(Subscricao $sub, string $cicloNovo): array
    {
        $cicloActual = $sub->ciclo;

        // Validações
        if (! in_array($cicloNovo, ['mensal', 'semestral', 'anual'])) {
            return ['valida' => false, 'erro' => 'Ciclo inválido.'];
        }
        if ($sub->estado === 'cancelada') {
            return ['valida' => false, 'erro' => 'Subscrição cancelada não pode mudar de plano.'];
        }
        if ($cicloActual === $cicloNovo) {
            return ['valida' => false, 'erro' => 'O plano já é este.', 'tipo' => 'mesmo', 'ciclo_actual' => $cicloActual, 'ciclo_novo' => $cicloNovo, 'aplica_em' => null, 'valor_proximo_ciclo_kz' => null, 'pro_rata_estimado_kz' => null];
        }

        $tipo = self::HIERARQUIA[$cicloNovo] > self::HIERARQUIA[$cicloActual] ? 'upgrade' : 'downgrade';

        // Calcular preço completo do novo ciclo
        $numImoveis = max(1, (int) ($sub->num_imoveis ?? 0));
        $calc = $this->precoService->calcular($numImoveis, $cicloNovo);
        $valorNovoKz = (float) $calc['total_kz'];

        // Pro-rata aplicável apenas em upgrades (downgrades agendam, não cobram extra)
        $proRataKz = null;
        $aplicaEm = null;

        if ($tipo === 'upgrade') {
            // Upgrade: imediato. Pro-rata = valor novo - crédito do antigo (proporcional ao tempo restante)
            $aplicaEm = now()->toIso8601String();

            if ($sub->estado === 'activa' && $sub->periodo_actual_inicio && $sub->periodo_actual_fim) {
                $proRataKz = $this->calcularProRata($sub, $cicloNovo, $valorNovoKz);
            } else {
                // Trial ou limitado: paga valor completo do novo ciclo
                $proRataKz = $valorNovoKz;
            }
        } else {
            // Downgrade: agendado para fim do período actual (ou trial)
            $aplicaEm = $sub->periodo_actual_fim?->toIso8601String()
                ?? $sub->trial_expira_em?->toIso8601String();
        }

        return [
            'valida' => true,
            'tipo' => $tipo,
            'ciclo_actual' => $cicloActual,
            'ciclo_novo' => $cicloNovo,
            'aplica_em' => $aplicaEm,
            'valor_proximo_ciclo_kz' => $valorNovoKz,
            'pro_rata_estimado_kz' => $proRataKz,
        ];
    }

    /**
     * Calcula valor pro-rata para upgrade imediato.
     *
     * Lógica: cliente já pagou X pelo ciclo actual.
     * Crédito = X * (dias_restantes / dias_totais_periodo)
     * Pro-rata a pagar = valor_novo_ciclo_completo - crédito
     *
     * Mínimo zero (nunca devolução).
     */
    private function calcularProRata(Subscricao $sub, string $cicloNovo, float $valorNovoCiclo): float
    {
        $factura = DB::table('plataforma_facturas')
            ->where('subscricao_id', $sub->id)
            ->where('estado', 'paga')
            ->orderBy('id', 'desc')
            ->first();

        if (! $factura) {
            return $valorNovoCiclo;
        }

        $valorPago = (float) $factura->valor_total_kz;
        $inicio = Carbon::parse($sub->periodo_actual_inicio);
        $fim = Carbon::parse($sub->periodo_actual_fim);
        $hoje = Carbon::now();

        $diasTotais = max(1, $inicio->diffInDays($fim));
        $diasRestantes = max(0, $hoje->diffInDays($fim, false));

        $credito = round($valorPago * ($diasRestantes / $diasTotais), 2);
        $proRata = max(0, $valorNovoCiclo - $credito);

        return round($proRata, 2);
    }

    /**
     * Executa a mudança de plano.
     * - Upgrade: actualiza ciclo IMEDIATAMENTE + cria factura pro-rata pendente
     * - Downgrade: agenda mudança em proximo_ciclo + proximo_ciclo_aplica_em
     */
    public function executar(Subscricao $sub, string $cicloNovo, User $user): array
    {
        $preview = $this->obterPreview($sub, $cicloNovo);
        if (! $preview['valida']) {
            return ['ok' => false, 'erro' => $preview['erro'] ?? 'Mudança inválida.'];
        }

        return DB::transaction(function () use ($sub, $cicloNovo, $user, $preview) {
            if ($preview['tipo'] === 'upgrade') {
                $cicloAntigo = $sub->ciclo;

                DB::table('subscricoes')->where('id', $sub->id)->update([
                    'ciclo' => $cicloNovo,
                    'proximo_ciclo' => null,
                    'proximo_ciclo_aplica_em' => null,
                    'updated_at' => now(),
                ]);

                DB::table('plataforma_subscricao_eventos')->insert([
                    'subscricao_id' => $sub->id,
                    'tipo' => 'plano_alterado',
                    'descricao' => "Upgrade imediato: {$cicloAntigo} → {$cicloNovo}",
                    'meta_json' => json_encode([
                        'tipo' => 'upgrade',
                        'de' => $cicloAntigo,
                        'para' => $cicloNovo,
                        'valor_acrescimo_kz' => $preview['pro_rata_estimado_kz'],
                        'origem' => 'self_service',
                    ]),
                    'user_id' => $user->id,
                    'created_at' => now(),
                ]);

                return [
                    'ok' => true,
                    'tipo' => 'upgrade',
                    'ciclo_novo' => $cicloNovo,
                    'valor_acrescimo_kz' => $preview['pro_rata_estimado_kz'],
                ];
            }

            // Downgrade: agendar
            $aplicaEm = $sub->periodo_actual_fim ?? $sub->trial_expira_em ?? now();

            DB::table('subscricoes')->where('id', $sub->id)->update([
                'proximo_ciclo' => $cicloNovo,
                'proximo_ciclo_aplica_em' => $aplicaEm,
                'updated_at' => now(),
            ]);

            DB::table('plataforma_subscricao_eventos')->insert([
                'subscricao_id' => $sub->id,
                'tipo' => 'plano_alterado',
                'descricao' => "Downgrade agendado: {$sub->ciclo} → {$cicloNovo} em " . Carbon::parse($aplicaEm)->format('Y-m-d'),
                'meta_json' => json_encode([
                    'tipo' => 'downgrade_agendado',
                    'de' => $sub->ciclo,
                    'para' => $cicloNovo,
                    'aplica_em' => Carbon::parse($aplicaEm)->toIso8601String(),
                    'origem' => 'self_service',
                ]),
                'user_id' => $user->id,
                'created_at' => now(),
            ]);

            return [
                'ok' => true,
                'tipo' => 'downgrade',
                'ciclo_novo' => $cicloNovo,
                'aplica_em' => Carbon::parse($aplicaEm)->toIso8601String(),
            ];
        });
    }

    /**
     * Cancelar downgrade agendado.
     */
    public function cancelarDowngradeAgendado(Subscricao $sub, User $user): bool
    {
        if (! $sub->proximo_ciclo) return false;

        return DB::transaction(function () use ($sub, $user) {
            $cicloAgendado = $sub->proximo_ciclo;

            DB::table('subscricoes')->where('id', $sub->id)->update([
                'proximo_ciclo' => null,
                'proximo_ciclo_aplica_em' => null,
                'updated_at' => now(),
            ]);

            DB::table('plataforma_subscricao_eventos')->insert([
                'subscricao_id' => $sub->id,
                'tipo' => 'plano_alterado',
                'descricao' => "Downgrade agendado para {$cicloAgendado} foi cancelado",
                'meta_json' => json_encode([
                    'tipo' => 'downgrade_cancelado',
                    'ciclo_que_estava_agendado' => $cicloAgendado,
                    'origem' => 'self_service',
                ]),
                'user_id' => $user->id,
                'created_at' => now(),
            ]);

            return true;
        });
    }
}
