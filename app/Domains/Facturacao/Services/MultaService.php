<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Services;

use App\Domains\Facturacao\Models\CondominioFacturacaoConfig;
use App\Domains\Facturacao\Models\Lancamento;
use App\Domains\Facturacao\Models\Quota;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Service de multas automáticas.
 *
 * Regras de negócio:
 * - Multa é por FRACÇÃO/MÊS (uma multa por quota, não por lançamento individual)
 * - Multa só é gerada se: quota em atraso > dias_tolerancia
 * - Se config.multa_recorrente=false: só gera 1 multa total para a quota
 * - Se config.multa_recorrente=true: gera 1 multa por mês de atraso
 * - Valor: fixo (multa_valor_kz) ou percentagem (sobre dívida ou original)
 */
class MultaService
{
    /**
     * Aplica multas a quotas elegíveis para um condomínio.
     *
     * @return array Estatísticas: criadas, ignoradas, total_kz, detalhes
     */
    public function aplicarMultasParaCondominio(int $condominioId, ?Carbon $hoje = null): array
    {
        $hoje ??= Carbon::now();

        $config = CondominioFacturacaoConfig::where('condominio_id', $condominioId)->first();

        if (! $config || ! $config->multa_activa) {
            return [
                'criadas' => 0,
                'ignoradas' => 0,
                'total_kz' => '0.00',
                'mensagem' => 'Multas desactivadas para este condomínio.',
                'detalhes' => [],
            ];
        }

        $diasTolerancia = (int) ($config->dias_tolerancia_multa ?? 7);
        $dataLimite = $hoje->copy()->subDays($diasTolerancia)->toDateString();

        // Buscar quotas em atraso (vencidas há mais de N dias, ainda em aberto)
        $quotas = Quota::query()
            ->where('condominio_id', $condominioId)
            ->whereIn('estado', [Quota::ESTADO_ABERTA, Quota::ESTADO_PAGA_PARCIAL])
            ->where('data_vencimento', '<', $dataLimite)
            ->with(['lancamentos'])
            ->get();

        $criadas = 0;
        $ignoradas = 0;
        $totalKz = '0';
        $detalhes = [];

        foreach ($quotas as $quota) {
            $resultado = $this->aplicarMultaParaQuota($quota, $config, $hoje);
            $detalhes[] = $resultado;

            if ($resultado['estado'] === 'criada') {
                $criadas++;
                $totalKz = bcadd($totalKz, $resultado['valor'] ?? '0', 2);
            } else {
                $ignoradas++;
            }
        }

        return [
            'criadas' => $criadas,
            'ignoradas' => $ignoradas,
            'total_kz' => $totalKz,
            'detalhes' => $detalhes,
        ];
    }

    /**
     * Aplica multa para todos os condomínios com facturação activa.
     */
    public function aplicarMultasGlobalmente(?Carbon $hoje = null): array
    {
        $hoje ??= Carbon::now();
        $configs = CondominioFacturacaoConfig::where('multa_activa', true)
            ->with('condominio:id,nome')
            ->get();

        $totalCriadas = 0;
        $totalKz = '0';
        $porCondominio = [];

        foreach ($configs as $config) {
            $r = $this->aplicarMultasParaCondominio($config->condominio_id, $hoje);
            $totalCriadas += $r['criadas'];
            $totalKz = bcadd($totalKz, $r['total_kz'], 2);
            $porCondominio[] = [
                'condominio_id' => $config->condominio_id,
                'nome' => $config->condominio?->nome ?? '—',
                'criadas' => $r['criadas'],
                'total_kz' => $r['total_kz'],
            ];
        }

        return [
            'total_criadas' => $totalCriadas,
            'total_kz' => $totalKz,
            'por_condominio' => $porCondominio,
        ];
    }

    /**
     * Verifica se já existe multa para esta quota e decide se cria nova.
     */
    private function aplicarMultaParaQuota(Quota $quota, CondominioFacturacaoConfig $config, Carbon $hoje): array
    {
        // Buscar lançamento "âncora" da quota (primeiro lançamento, normalmente quota_base)
        $lancamentoAncora = $quota->lancamentos
            ->whereIn('tipo', [Lancamento::TIPO_QUOTA_BASE, Lancamento::TIPO_FUNDO_RESERVA])
            ->sortBy('id')
            ->first();

        if (! $lancamentoAncora) {
            return [
                'estado' => 'ignorada',
                'motivo' => 'Quota sem lançamentos âncora',
                'quota_id' => $quota->id,
            ];
        }

        // Quanto tempo está em atraso?
        $diasAtraso = (int) Carbon::parse($quota->data_vencimento)->diffInDays($hoje, false);
        if ($diasAtraso < 0) {
            return [
                'estado' => 'ignorada',
                'motivo' => 'Não está em atraso',
                'quota_id' => $quota->id,
            ];
        }

        // Buscar multas já existentes para esta quota (via lancamento_origem_id)
        $multasExistentes = Lancamento::where('lancamento_origem_id', $lancamentoAncora->id)
            ->where('tipo', Lancamento::TIPO_MULTA)
            ->whereIn('estado', [
                Lancamento::ESTADO_EM_ABERTO,
                Lancamento::ESTADO_PAGO_PARCIAL,
                Lancamento::ESTADO_PAGO,
            ])
            ->get();

        // Multa não recorrente: se já existe alguma, não cria
        if (! $config->multa_recorrente && $multasExistentes->isNotEmpty()) {
            return [
                'estado' => 'ignorada',
                'motivo' => 'Multa não recorrente já existe',
                'quota_id' => $quota->id,
            ];
        }

        // Multa recorrente: verificar se já há multa criada este mês
        if ($config->multa_recorrente) {
            $multaEsteMes = $multasExistentes->first(fn ($m) =>
                Carbon::parse($m->data_lancamento)->year === $hoje->year
                && Carbon::parse($m->data_lancamento)->month === $hoje->month
            );

            if ($multaEsteMes) {
                return [
                    'estado' => 'ignorada',
                    'motivo' => 'Multa recorrente já criada este mês',
                    'quota_id' => $quota->id,
                ];
            }
        }

        // Calcular valor da multa
        $valorMulta = $this->calcularValorMulta($quota, $config);

        if (bccomp($valorMulta, '0.01', 2) < 0) {
            return [
                'estado' => 'ignorada',
                'motivo' => 'Valor da multa zero',
                'quota_id' => $quota->id,
            ];
        }

        // Criar lançamento de multa
        return DB::transaction(function () use ($quota, $config, $hoje, $valorMulta, $lancamentoAncora, $diasAtraso) {
            $descricao = sprintf(
                'Multa por atraso — %s/%d (%d dias)',
                str_pad((string) $quota->mes, 2, '0', STR_PAD_LEFT),
                $quota->ano,
                (int) $diasAtraso
            );

            $multa = Lancamento::create([
                'empresa_gestora_id' => $quota->empresa_gestora_id,
                'condominio_id' => $quota->condominio_id,
                'fraccao_id' => $quota->fraccao_id,
                'condomino_id' => $lancamentoAncora->condomino_id,
                'tipo' => Lancamento::TIPO_MULTA,
                'descricao' => $descricao,
                'detalhes' => sprintf(
                    'Aplicada após %d dias de tolerância. Tipo: %s.',
                    (int) $config->dias_tolerancia_multa,
                    $config->multa_tipo,
                ),
                'valor' => $valorMulta,
                'data_lancamento' => $hoje->toDateString(),
                'data_vencimento' => $hoje->copy()->addDays(7)->toDateString(),
                'estado' => Lancamento::ESTADO_EM_ABERTO,
                'lancamento_origem_id' => $lancamentoAncora->id,
            ]);

            // Notificar o condómino após o commit da transação (after_commit=false na config)
            $valorFmt = number_format((float) $valorMulta, 2, ',', '.');
            $vencimentoFmt = $hoje->copy()->addDays(7)->format('d/m/Y');
            $multaId = $multa->id;
            $condominoId = $multa->condomino_id;
            $motivo = $descricao;
            \Illuminate\Support\Facades\DB::afterCommit(function () use ($condominoId, $motivo, $valorFmt, $vencimentoFmt, $multaId) {
                if (! $condominoId) return;
                $condomino = \App\Domains\Condomino\Models\Condomino::find($condominoId);
                if (! $condomino || ! $condomino->user_id) return;
                $user = \App\Models\User::find($condomino->user_id);
                if (! $user) return;
                try {
                    $user->notify(new \App\Domains\Condomino\Notifications\MultaAplicadaNotification(
                        nome: $user->name,
                        motivo: $motivo,
                        valor: $valorFmt,
                        vencimento: $vencimentoFmt,
                        multaId: $multaId,
                    ));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('[MultaService] Falha a notificar multa '.$multaId.': '.$e->getMessage());
                }
            });

            return [
                'estado' => 'criada',
                'quota_id' => $quota->id,
                'multa_id' => $multa->id,
                'valor' => $valorMulta,
                'fraccao_id' => $quota->fraccao_id,
            ];
        });
    }

    /**
     * Calcula valor da multa segundo o tipo configurado.
     */
    private function calcularValorMulta(Quota $quota, CondominioFacturacaoConfig $config): string
    {
        if ($config->multa_tipo === CondominioFacturacaoConfig::MULTA_TIPO_PERCENTAGEM) {
            $percent = (string) ($config->multa_percentagem ?? '0');
            $base = $config->multa_percentagem_base === 'original'
                ? (string) $quota->valor_total
                : bcsub((string) $quota->valor_total, (string) $quota->valor_pago, 2);
            return bcdiv(bcmul($base, $percent, 4), '100', 2);
        }

        // Fixa
        return number_format((float) ($config->multa_valor_kz ?? 0), 2, '.', '');
    }
}
