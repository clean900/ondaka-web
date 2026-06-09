<?php

declare(strict_types=1);

namespace App\Domains\Financas\Services;

use App\Domains\Financas\Models\ContaBancaria;
use App\Domains\Financas\Models\ContaBancariaMovimento;
use App\Domains\Financas\Models\Despesa;
use App\Domains\Financas\Models\DespesaCategoria;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class DespesaService
{
    public const CATEGORIAS_PADRAO = [
        ['nome' => 'Manutenção', 'icone' => 'wrench', 'cor' => '#f59e0b'],
        ['nome' => 'Limpeza', 'icone' => 'spray-can', 'cor' => '#06b6d4'],
        ['nome' => 'Segurança', 'icone' => 'shield', 'cor' => '#ef4444'],
        ['nome' => 'Jardins', 'icone' => 'leaf', 'cor' => '#22c55e'],
        ['nome' => 'Água', 'icone' => 'droplet', 'cor' => '#3b82f6'],
        ['nome' => 'Electricidade', 'icone' => 'zap', 'cor' => '#facc15'],
        ['nome' => 'Outros', 'icone' => 'package', 'cor' => '#a855f7'],
    ];

    public function garantirCategoriasPadrao(int $empresaGestoraId): void
    {
        foreach (self::CATEGORIAS_PADRAO as $i => $cat) {
            DespesaCategoria::firstOrCreate(
                [
                    'empresa_gestora_id' => $empresaGestoraId,
                    'slug' => Str::slug($cat['nome']),
                ],
                [
                    'nome' => $cat['nome'],
                    'icone' => $cat['icone'],
                    'cor' => $cat['cor'],
                    'ordem' => $i,
                    'activa' => true,
                ]
            );
        }
    }

    public function aprovar(Despesa $despesa, int $userId): Despesa
    {
        if ($despesa->estado !== 'pendente') {
            throw new RuntimeException('Só despesas pendentes podem ser aprovadas. Estado actual: ' . $despesa->estado);
        }

        $despesa->update([
            'estado' => 'aprovada',
            'aprovada_em' => now(),
            'aprovada_por_user_id' => $userId,
        ]);

        return $despesa->fresh();
    }

    public function marcarPaga(Despesa $despesa, int $userId, ?string $dataPagamento = null, ?string $metodoPagamento = null): Despesa
    {
        if (! in_array($despesa->estado, ['pendente', 'aprovada'])) {
            throw new RuntimeException('Só despesas pendentes ou aprovadas podem ser marcadas como pagas. Estado actual: ' . $despesa->estado);
        }

        return DB::transaction(function () use ($despesa, $userId, $dataPagamento, $metodoPagamento) {
            $conta = ContaBancaria::lockForUpdate()->findOrFail($despesa->conta_bancaria_id);

            $data = $dataPagamento ?? now()->toDateString();

            $saldoApos = (float) $conta->saldo_actual - (float) $despesa->valor;

            $movimento = ContaBancariaMovimento::create([
                'conta_bancaria_id' => $conta->id,
                'data' => $data,
                'tipo' => 'saida',
                'descricao' => 'Despesa: ' . Str::limit($despesa->descricao, 120),
                'valor' => $despesa->valor,
                'saldo_apos' => $saldoApos,
                'origem_tipo' => 'despesa',
                'origem_id' => $despesa->id,
            ]);

            $conta->update(['saldo_actual' => $saldoApos]);

            $despesa->update([
                'estado' => 'paga',
                'paga_em' => now(),
                'metodo_pagamento' => $metodoPagamento,
                'paga_por_user_id' => $userId,
                'movimento_id' => $movimento->id,
            ]);

            return $despesa->fresh();
        });
    }

    public function cancelar(Despesa $despesa, int $userId, ?string $motivo = null): Despesa
    {
        if ($despesa->estado === 'paga') {
            throw new RuntimeException('Despesa já paga não pode ser cancelada. Use estorno.');
        }
        if ($despesa->estado === 'cancelada') {
            throw new RuntimeException('Despesa já está cancelada.');
        }

        $despesa->update([
            'estado' => 'cancelada',
            'cancelada_em' => now(),
            'cancelada_por_user_id' => $userId,
            'motivo_cancelamento' => $motivo,
        ]);

        return $despesa->fresh();
    }
}
