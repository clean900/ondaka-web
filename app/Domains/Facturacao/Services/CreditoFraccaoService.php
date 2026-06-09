<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Services;

use App\Domains\Facturacao\Models\CreditoFraccao;
use App\Domains\Facturacao\Models\Lancamento;
use App\Domains\Facturacao\Models\Pagamento;
use App\Domains\Facturacao\Models\PagamentoImputacao;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class CreditoFraccaoService
{
    /**
     * Usa parte (ou todo) do saldo de um crédito para pagar um lançamento em aberto.
     * Cria um Pagamento sintético com metodo='credito_saldo' e imputa-o ao lançamento.
     */
    public function usarCredito(
        CreditoFraccao $credito,
        Lancamento $lancamento,
        string $valor,
        User $por
    ): Pagamento {
        // Tenancy
        if ($credito->empresa_gestora_id !== $por->empresa_gestora_id) {
            throw new InvalidArgumentException('Crédito não pertence à empresa do utilizador.');
        }
        if ($lancamento->empresa_gestora_id !== $por->empresa_gestora_id) {
            throw new InvalidArgumentException('Lançamento não pertence à empresa do utilizador.');
        }

        // Mesma fracção
        if ($credito->fraccao_id !== $lancamento->fraccao_id) {
            throw new InvalidArgumentException('Crédito e lançamento têm de ser da mesma fracção.');
        }

        // Lançamento tem de estar em aberto
        if (! in_array($lancamento->estado, [Lancamento::ESTADO_EM_ABERTO, Lancamento::ESTADO_PAGO_PARCIAL], true)) {
            throw new InvalidArgumentException('Lançamento não está em aberto.');
        }

        // Validar valor (string-safe com bcmath)
        if (bccomp($valor, '0', 2) <= 0) {
            throw new InvalidArgumentException('Valor tem de ser positivo.');
        }

        $saldoDisp = $credito->saldoDisponivel();
        if (bccomp($valor, $saldoDisp, 2) > 0) {
            throw new InvalidArgumentException("Valor ({$valor}) excede saldo disponível ({$saldoDisp}).");
        }

        $emDivida = bcsub((string) $lancamento->valor, (string) $lancamento->valor_pago, 2);
        if (bccomp($valor, $emDivida, 2) > 0) {
            throw new InvalidArgumentException("Valor ({$valor}) excede o que falta pagar no lançamento ({$emDivida}).");
        }

        return DB::transaction(function () use ($credito, $lancamento, $valor, $por) {
            // 1. Gerar referência sequencial
            $ano = now()->year;
            $count = Pagamento::where('empresa_gestora_id', $credito->empresa_gestora_id)
                ->where('metodo', 'credito_saldo')
                ->whereYear('created_at', $ano)
                ->count();
            $referencia = sprintf('CRED-%d-%05d', $ano, $count + 1);

            // 2. Criar pagamento sintético
            $pagamento = Pagamento::create([
                'referencia' => $referencia,
                'empresa_gestora_id' => $credito->empresa_gestora_id,
                'condominio_id' => $credito->condominio_id,
                'fraccao_id' => $credito->fraccao_id,
                'condomino_id' => $credito->condomino_id,
                'metodo' => 'credito_saldo',
                'valor' => $valor,
                'moeda' => 'AOA',
                'data_pagamento' => now()->toDateString(),
                'estado' => Pagamento::ESTADO_CONFIRMADO,
                'confirmado_em' => now(),
                'confirmado_por_user_id' => $por->id,
                'registado_por_user_id' => $por->id,
                'referencia_externa' => "Credito #{$credito->id}",
                'notas_admin' => "Utilização de crédito #{$credito->id}. Origem: PAG #{$credito->pagamento_origem_id}",
            ]);

            // 3. Imputação ao lançamento
            PagamentoImputacao::create([
                'pagamento_id' => $pagamento->id,
                'lancamento_id' => $lancamento->id,
                'valor' => $valor,
            ]);

            // 4. Incrementar valor_usado do crédito
            $credito->update([
                'valor_usado' => bcadd((string) $credito->valor_usado, $valor, 2),
            ]);

            // 5. Recalcular estado do lançamento
            $lancamento->recalcularEstado();

            return $pagamento;
        });
    }
}