<?php

declare(strict_types=1);

namespace App\Domains\Bi\Services;

use Illuminate\Support\Facades\DB;

class ReceitasDespesasService
{
    /**
     * Receitas vs Despesas por mês, para uma gestora (e opcionalmente um condomínio).
     * Receita = pagamentos_condomino confirmados. Despesa = despesas pagas.
     *
     * @return array{meses: array, totais: array}
     */
    public function calcular(int $empresaGestoraId, ?int $condominioId, int $numMeses = 12): array
    {
        $inicio = now()->subMonths($numMeses - 1)->startOfMonth();

        // Receitas por mês
        $receitasQ = DB::table('pagamentos_condomino')
            ->selectRaw("DATE_FORMAT(data_pagamento, '%Y-%m') AS mes, SUM(valor) AS total")
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->where('estado', 'confirmado')
            ->where('data_pagamento', '>=', $inicio->toDateString());
        if ($condominioId) {
            $receitasQ->where('condominio_id', $condominioId);
        }
        $receitas = $receitasQ->groupBy('mes')->pluck('total', 'mes');

        // Despesas por mês
        $despesasQ = DB::table('despesas')
            ->selectRaw("DATE_FORMAT(data_despesa, '%Y-%m') AS mes, SUM(valor) AS total")
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->where('estado', 'paga')
            ->where('data_despesa', '>=', $inicio->toDateString());
        if ($condominioId) {
            $despesasQ->where('condominio_id', $condominioId);
        }
        $despesas = $despesasQ->groupBy('mes')->pluck('total', 'mes');

        // Construir a série de meses (mesmo os vazios)
        $meses = [];
        $totalReceita = 0.0;
        $totalDespesa = 0.0;
        $cursor = $inicio->copy();
        for ($i = 0; $i < $numMeses; $i++) {
            $chave = $cursor->format('Y-m');
            $r = (float) ($receitas[$chave] ?? 0);
            $d = (float) ($despesas[$chave] ?? 0);
            $meses[] = [
                'mes' => $chave,
                'label' => $cursor->format('m/Y'),
                'receita' => round($r, 2),
                'despesa' => round($d, 2),
                'saldo' => round($r - $d, 2),
            ];
            $totalReceita += $r;
            $totalDespesa += $d;
            $cursor->addMonth();
        }

        return [
            'meses' => $meses,
            'totais' => [
                'receita' => round($totalReceita, 2),
                'despesa' => round($totalDespesa, 2),
                'saldo' => round($totalReceita - $totalDespesa, 2),
            ],
        ];
    }

    /** Totais (receita/despesa) entre duas datas. */
    private function totaisEntre(int $empresaGestoraId, ?int $condominioId, string $de, string $ate): array
    {
        $receita = (float) DB::table('pagamentos_condomino')
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->where('estado', 'confirmado')
            ->whereBetween('data_pagamento', [$de, $ate])
            ->when($condominioId, fn ($q) => $q->where('condominio_id', $condominioId))
            ->sum('valor');

        $despesa = (float) DB::table('despesas')
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->where('estado', 'paga')
            ->whereBetween('data_despesa', [$de, $ate])
            ->when($condominioId, fn ($q) => $q->where('condominio_id', $condominioId))
            ->sum('valor');

        return ['receita' => round($receita, 2), 'despesa' => round($despesa, 2), 'saldo' => round($receita - $despesa, 2)];
    }

    /** Compara o período actual (numMeses) com o período anterior equivalente. */
    public function comparacao(int $empresaGestoraId, ?int $condominioId, int $numMeses = 12): array
    {
        $fimActual = now()->endOfMonth();
        $inicioActual = now()->subMonths($numMeses - 1)->startOfMonth();
        $fimAnterior = $inicioActual->copy()->subDay()->endOfMonth();
        $inicioAnterior = $inicioActual->copy()->subMonths($numMeses)->startOfMonth();

        $actual = $this->totaisEntre($empresaGestoraId, $condominioId, $inicioActual->toDateString(), $fimActual->toDateString());
        $anterior = $this->totaisEntre($empresaGestoraId, $condominioId, $inicioAnterior->toDateString(), $fimAnterior->toDateString());

        $variacao = function (float $a, float $b): ?float {
            if ($b == 0.0) {
                return $a == 0.0 ? 0.0 : null; // null = "novo" (sem base de comparacao)
            }
            return round((($a - $b) / abs($b)) * 100, 1);
        };

        return [
            'receita' => $variacao($actual['receita'], $anterior['receita']),
            'despesa' => $variacao($actual['despesa'], $anterior['despesa']),
            'saldo' => $variacao($actual['saldo'], $anterior['saldo']),
        ];
    }

}
