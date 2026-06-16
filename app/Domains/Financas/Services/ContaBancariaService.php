<?php

declare(strict_types=1);

namespace App\Domains\Financas\Services;

use App\Domains\Financas\Models\ContaBancaria;
use App\Domains\Financas\Models\ContaBancariaMovimento;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ContaBancariaService
{
    /**
     * Criar nova conta bancária para um condomínio.
     * Se for a primeira conta do condomínio, automaticamente fica principal.
     * Se vier "principal=true", desmarca as outras.
     */
    public function criar(int $condominioId, array $dados): ContaBancaria
    {
        return DB::transaction(function () use ($condominioId, $dados) {
            $jaTemContas = ContaBancaria::where('condominio_id', $condominioId)->exists();
            $deveSerPrincipal = ($dados['principal'] ?? false) || !$jaTemContas;

            if ($deveSerPrincipal && $jaTemContas) {
                ContaBancaria::where('condominio_id', $condominioId)
                    ->update(['principal' => false]);
            }

            return ContaBancaria::create([
                'condominio_id' => $condominioId,
                'nome' => $dados['nome'],
                'banco' => $dados['banco'],
                'iban' => $dados['iban'] ?? null,
                'tipo' => $dados['tipo'] ?? 'corrente',
                'moeda' => $dados['moeda'] ?? 'AOA',
                'saldo_inicial' => $dados['saldo_inicial'] ?? 0,
                'saldo_actual' => $dados['saldo_inicial'] ?? 0,
                'notas' => $dados['notas'] ?? null,
                'activa' => $dados['activa'] ?? true,
                'principal' => $deveSerPrincipal,
                'aceita_proxypay' => $dados['aceita_proxypay'] ?? false,
                'aceita_manual' => $dados['aceita_manual'] ?? true,
                'instrucoes_pagamento' => $dados['instrucoes_pagamento'] ?? null,
            ]);
        });
    }

    /**
     * Actualizar dados básicos da conta (sem mexer no saldo).
     */
    public function actualizar(ContaBancaria $conta, array $dados): ContaBancaria
    {
        return DB::transaction(function () use ($conta, $dados) {
            if (isset($dados['principal']) && $dados['principal'] && !$conta->principal) {
                ContaBancaria::where('condominio_id', $conta->condominio_id)
                    ->where('id', '!=', $conta->id)
                    ->update(['principal' => false]);
            }

            $conta->update(array_filter([
                'nome' => $dados['nome'] ?? null,
                'banco' => $dados['banco'] ?? null,
                'iban' => $dados['iban'] ?? null,
                'tipo' => $dados['tipo'] ?? null,
                'moeda' => $dados['moeda'] ?? null,
                'notas' => $dados['notas'] ?? null,
                'activa' => $dados['activa'] ?? null,
                'principal' => $dados['principal'] ?? null,
                'aceita_proxypay' => $dados['aceita_proxypay'] ?? null,
                'aceita_manual' => $dados['aceita_manual'] ?? null,
                'instrucoes_pagamento' => $dados['instrucoes_pagamento'] ?? null,
            ], fn($v) => $v !== null));

            return $conta->fresh();
        });
    }

    /**
     * Marcar uma conta como principal (desmarca outras do mesmo condomínio).
     */
    public function marcarPrincipal(ContaBancaria $conta): void
    {
        DB::transaction(function () use ($conta) {
            ContaBancaria::where('condominio_id', $conta->condominio_id)
                ->where('id', '!=', $conta->id)
                ->update(['principal' => false]);

            $conta->update(['principal' => true]);
        });
    }

    /**
     * Adicionar movimento manual (entrada ou saída).
     */
    public function adicionarMovimento(ContaBancaria $conta, array $dados): ContaBancariaMovimento
    {
        return DB::transaction(function () use ($conta, $dados) {
            $valor = (float) $dados['valor'];
            $tipo = $dados['tipo'];

            $saldoAposMovimento = $tipo === 'entrada'
                ? (float) $conta->saldo_actual + $valor
                : (float) $conta->saldo_actual - $valor;

            $movimento = ContaBancariaMovimento::create([
                'conta_bancaria_id' => $conta->id,
                'data' => $dados['data'],
                'tipo' => $tipo,
                'descricao' => $dados['descricao'],
                'valor' => $valor,
                'saldo_apos' => $saldoAposMovimento,
                'origem_tipo' => $dados['origem_tipo'] ?? 'manual',
                'origem_id' => $dados['origem_id'] ?? null,
                'criado_por_user_id' => Auth::id(),
            ]);

            $conta->update(['saldo_actual' => $saldoAposMovimento]);

            return $movimento;
        });
    }

    /**
     * Transferência entre duas contas bancárias: saída na origem + entrada no
     * destino, de forma atómica. As contas têm de ser diferentes.
     */
    public function transferir(ContaBancaria $origem, ContaBancaria $destino, array $dados): void
    {
        if ($origem->id === $destino->id) {
            throw new \RuntimeException('A conta de origem e destino têm de ser diferentes.');
        }

        DB::transaction(function () use ($origem, $destino, $dados) {
            $valor = (float) $dados['valor'];
            $data = $dados['data'];
            $descricao = $dados['descricao'] ?? 'Transferência entre contas';

            // Lock para evitar corridas
            $origem = ContaBancaria::lockForUpdate()->findOrFail($origem->id);
            $destino = ContaBancaria::lockForUpdate()->findOrFail($destino->id);

            $saldoOrigem = (float) $origem->saldo_actual - $valor;
            $saldoDestino = (float) $destino->saldo_actual + $valor;

            $movSaida = ContaBancariaMovimento::create([
                'conta_bancaria_id' => $origem->id,
                'data' => $data,
                'tipo' => 'saida',
                'descricao' => $descricao . ' → ' . $destino->nome,
                'valor' => $valor,
                'saldo_apos' => $saldoOrigem,
                'origem_tipo' => 'transferencia',
                'criado_por_user_id' => Auth::id(),
            ]);

            ContaBancariaMovimento::create([
                'conta_bancaria_id' => $destino->id,
                'data' => $data,
                'tipo' => 'entrada',
                'descricao' => $descricao . ' ← ' . $origem->nome,
                'valor' => $valor,
                'saldo_apos' => $saldoDestino,
                'origem_tipo' => 'transferencia',
                'origem_id' => $movSaida->id,
                'criado_por_user_id' => Auth::id(),
            ]);

            $origem->update(['saldo_actual' => $saldoOrigem]);
            $destino->update(['saldo_actual' => $saldoDestino]);
        });
    }

    /**
     * Apagar movimento e recalcular saldos da conta.
     */
    public function apagarMovimento(ContaBancariaMovimento $movimento): void
    {
        DB::transaction(function () use ($movimento) {
            $conta = $movimento->conta;
            $movimento->delete();
            $this->recalcularSaldos($conta);
        });
    }

    /**
     * Recalcular saldos a partir de saldo_inicial + movimentos em ordem cronológica.
     */
    public function recalcularSaldos(ContaBancaria $conta): void
    {
        $movimentos = $conta->movimentos()
            ->orderBy('data', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $saldo = (float) $conta->saldo_inicial;

        foreach ($movimentos as $mov) {
            $saldo = $mov->tipo === 'entrada'
                ? $saldo + (float) $mov->valor
                : $saldo - (float) $mov->valor;

            $mov->update(['saldo_apos' => $saldo]);
        }

        $conta->update(['saldo_actual' => $saldo]);
    }

    /**
     * Apagar conta. Se for principal, marca a próxima activa como principal.
     */
    public function apagar(ContaBancaria $conta): void
    {
        DB::transaction(function () use ($conta) {
            $eraPrincipal = $conta->principal;
            $condominioId = $conta->condominio_id;

            $conta->delete();

            if ($eraPrincipal) {
                $proxima = ContaBancaria::where('condominio_id', $condominioId)
                    ->where('activa', true)
                    ->orderBy('id', 'asc')
                    ->first();

                if ($proxima) {
                    $proxima->update(['principal' => true]);
                }
            }
        });
    }
}
