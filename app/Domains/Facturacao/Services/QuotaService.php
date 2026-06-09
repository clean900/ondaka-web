<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Services;

use App\Domains\Condomino\Models\ContratoOcupacao;
use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Facturacao\Models\CondominioFacturacaoConfig;
use App\Domains\Facturacao\Models\Lancamento;
use App\Domains\Facturacao\Models\Quota;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Service de gestão de quotas mensais.
 *
 * Responsabilidades:
 * - Gerar quotas para um período (ano+mês) — só fracções com contrato activo
 * - Cada quota gera 2 lançamentos (quota_base + fundo_reserva)
 * - Idempotente — não gera duplicados (constraint única fraccao_id+ano+mes)
 * - Retorna estatísticas detalhadas para admin auditar
 */
class QuotaService
{
    /**
     * Gera quotas para todas as fracções com contrato activo de um condomínio
     * num período específico.
     *
     * @return array{geradas: int, ignoradas_ja_existem: int, ignoradas_sem_contrato: int, ignoradas_sem_valores: int, total_kz: float, detalhes: array}
     */
    public function gerarQuotasParaPeriodo(
        int $condominioId,
        int $empresaGestoraId,
        int $ano,
        int $mes,
        ?User $por = null,
        string $origem = Quota::ORIGEM_MANUAL
    ): array {
        $config = CondominioFacturacaoConfig::paraCondominio($condominioId, $empresaGestoraId);

        $dataReferencia = Carbon::create($ano, $mes, 1)->startOfDay();
        $diaVencimento = min($config->dia_vencimento, $dataReferencia->daysInMonth);
        $dataVencimento = $dataReferencia->copy()->day($diaVencimento);

        $fraccoes = Fraccao::query()
            ->where('condominio_id', $condominioId)
            ->orderBy('identificador')
            ->get();

        $estatisticas = [
            'geradas' => 0,
            'ignoradas_ja_existem' => 0,
            'ignoradas_sem_contrato' => 0,
            'ignoradas_sem_valores' => 0,
            'total_kz' => 0.0,
            'detalhes' => [],
        ];

        foreach ($fraccoes as $fraccao) {
            $resultado = $this->gerarQuotaParaFraccao(
                fraccao: $fraccao,
                empresaGestoraId: $empresaGestoraId,
                ano: $ano,
                mes: $mes,
                dataReferencia: $dataReferencia,
                dataVencimento: $dataVencimento,
                origem: $origem,
                por: $por,
            );

            $estatisticas[$resultado['status']] ??= 0;
            $estatisticas[$resultado['status']]++;

            if ($resultado['status'] === 'geradas' && isset($resultado['valor_total'])) {
                $estatisticas['total_kz'] += $resultado['valor_total'];
            }

            $estatisticas['detalhes'][] = [
                'fraccao_id' => $fraccao->id,
                'identificador' => $fraccao->identificador,
                'status' => $resultado['status'],
                'mensagem' => $resultado['mensagem'],
                'valor_total' => $resultado['valor_total'] ?? null,
                'quota_id' => $resultado['quota_id'] ?? null,
            ];
        }

        return $estatisticas;
    }

    /**
     * Gera quota individual para uma fracção (com transacção).
     */
    private function gerarQuotaParaFraccao(
        Fraccao $fraccao,
        int $empresaGestoraId,
        int $ano,
        int $mes,
        Carbon $dataReferencia,
        Carbon $dataVencimento,
        string $origem,
        ?User $por,
    ): array {
        // 1. Já existe?
        $existe = Quota::where('fraccao_id', $fraccao->id)
            ->where('ano', $ano)
            ->where('mes', $mes)
            ->whereNull('deleted_at')
            ->exists();

        if ($existe) {
            return [
                'status' => 'ignoradas_ja_existem',
                'mensagem' => "Quota já existe para {$ano}-{$mes}",
            ];
        }

        // 2. Tem contrato activo? (regra B — ignoramos fracções sem contrato)
        $contratoActivo = ContratoOcupacao::query()
            ->where('fraccao_id', $fraccao->id)
            ->where('estado', 'activo')
            ->orderByRaw("CASE WHEN tipo = 'proprietario' THEN 0 ELSE 1 END")
            ->orderBy('created_at')
            ->first();

        if (! $contratoActivo) {
            return [
                'status' => 'ignoradas_sem_contrato',
                'mensagem' => 'Sem contrato activo',
            ];
        }

        // 3. Tem valores definidos?
        $valorBase = (float) ($fraccao->quota_mensal_base ?? 0);
        $valorReserva = (float) ($fraccao->quota_mensal_fundo_reserva ?? 0);

        if ($valorBase <= 0 && $valorReserva <= 0) {
            return [
                'status' => 'ignoradas_sem_valores',
                'mensagem' => 'Sem quota definida na fracção',
            ];
        }

        $valorTotal = round($valorBase + $valorReserva, 2);

        // 4. Criar tudo numa transacção
        return DB::transaction(function () use (
            $fraccao,
            $empresaGestoraId,
            $contratoActivo,
            $ano,
            $mes,
            $dataReferencia,
            $dataVencimento,
            $valorBase,
            $valorReserva,
            $valorTotal,
            $origem,
            $por,
        ) {
            $quota = Quota::create([
                'empresa_gestora_id' => $empresaGestoraId,
                'condominio_id' => $fraccao->condominio_id,
                'fraccao_id' => $fraccao->id,
                'ano' => $ano,
                'mes' => $mes,
                'data_referencia' => $dataReferencia,
                'data_vencimento' => $dataVencimento,
                'valor_quota_base' => $valorBase,
                'valor_fundo_reserva' => $valorReserva,
                'valor_total' => $valorTotal,
                'estado' => Quota::ESTADO_ABERTA,
                'valor_pago' => 0,
                'origem_geracao' => $origem,
                'gerada_por_user_id' => $por?->id,
            ]);

            $mesNome = $dataReferencia->locale('pt_PT')->translatedFormat('F Y');

            // Lançamento 1: Quota base
            if ($valorBase > 0) {
                Lancamento::create([
                    'empresa_gestora_id' => $empresaGestoraId,
                    'condominio_id' => $fraccao->condominio_id,
                    'fraccao_id' => $fraccao->id,
                    'condomino_id' => $contratoActivo->condomino_id,
                    'quota_id' => $quota->id,
                    'tipo' => Lancamento::TIPO_QUOTA_BASE,
                    'descricao' => "Taxa de Condomínio mensal — {$mesNome}",
                    'valor' => $valorBase,
                    'data_lancamento' => $dataReferencia,
                    'data_vencimento' => $dataVencimento,
                    'estado' => Lancamento::ESTADO_EM_ABERTO,
                    'criado_por_user_id' => $por?->id,
                ]);
            }

            // Lançamento 2: Fundo de reserva
            if ($valorReserva > 0) {
                Lancamento::create([
                    'empresa_gestora_id' => $empresaGestoraId,
                    'condominio_id' => $fraccao->condominio_id,
                    'fraccao_id' => $fraccao->id,
                    'condomino_id' => $contratoActivo->condomino_id,
                    'quota_id' => $quota->id,
                    'tipo' => Lancamento::TIPO_FUNDO_RESERVA,
                    'descricao' => "Fundo de reserva — {$mesNome}",
                    'detalhes' => 'Reserva legal — Decreto 141/15 art. 5',
                    'valor' => $valorReserva,
                    'data_lancamento' => $dataReferencia,
                    'data_vencimento' => $dataVencimento,
                    'estado' => Lancamento::ESTADO_EM_ABERTO,
                    'criado_por_user_id' => $por?->id,
                ]);
            }

            return [
                'status' => 'geradas',
                'mensagem' => 'Quota gerada com sucesso',
                'valor_total' => $valorTotal,
                'quota_id' => $quota->id,
            ];
        });
    }
}
