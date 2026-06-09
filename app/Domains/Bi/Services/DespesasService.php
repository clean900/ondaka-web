<?php

declare(strict_types=1);

namespace App\Domains\Bi\Services;

use Illuminate\Support\Facades\DB;

class DespesasService
{
    /**
     * Análise de despesas pagas para uma gestora (e opcionalmente um condomínio).
     */
    public function calcular(int $empresaGestoraId, ?int $condominioId, int $numMeses = 12): array
    {
        $inicio = now()->subMonths($numMeses - 1)->startOfMonth();

        $base = fn () => DB::table('despesas')
            ->where('despesas.empresa_gestora_id', $empresaGestoraId)
            ->where('despesas.estado', 'paga')
            ->when($condominioId, fn ($q) => $q->where('despesas.condominio_id', $condominioId));

        // Total
        $total = (float) $base()->sum('valor');

        // Por categoria
        $porCategoria = $base()
            ->leftJoin('despesa_categorias', 'despesa_categorias.id', '=', 'despesas.categoria_id')
            ->selectRaw('COALESCE(despesa_categorias.nome, "Sem categoria") AS categoria, SUM(despesas.valor) AS total')
            ->groupBy('categoria')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => [
                'categoria' => $r->categoria,
                'total' => round((float) $r->total, 2),
            ])->values();

        // Evolução mensal
        $mensal = $base()
            ->where('data_despesa', '>=', $inicio->toDateString())
            ->selectRaw("DATE_FORMAT(data_despesa, '%Y-%m') AS mes, SUM(valor) AS total")
            ->groupBy('mes')
            ->pluck('total', 'mes');

        $meses = [];
        $cursor = $inicio->copy();
        for ($i = 0; $i < $numMeses; $i++) {
            $chave = $cursor->format('Y-m');
            $meses[] = [
                'mes' => $chave,
                'label' => $cursor->format('m/Y'),
                'total' => round((float) ($mensal[$chave] ?? 0), 2),
            ];
            $cursor->addMonth();
        }

        return [
            'total' => round($total, 2),
            'por_categoria' => $porCategoria,
            'meses' => $meses,
        ];
    }
}
