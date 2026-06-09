<?php

declare(strict_types=1);

namespace App\Domains\Bi\Services;

use Illuminate\Support\Facades\DB;

class OperacionalService
{
    public function calcular(int $empresaGestoraId, ?int $condominioId, int $numMeses = 12): array
    {
        $base = fn () => DB::table('tickets')
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->when($condominioId, fn ($q) => $q->where('condominio_id', $condominioId));

        $total = (clone $base())->count();

        // Por estado
        $porEstado = (clone $base())
            ->selectRaw('estado, COUNT(*) AS n')
            ->groupBy('estado')
            ->pluck('n', 'estado');

        // Por categoria
        $porCategoria = (clone $base())
            ->selectRaw('categoria, COUNT(*) AS n')
            ->groupBy('categoria')
            ->orderByDesc('n')
            ->get()
            ->map(fn ($r) => ['categoria' => $r->categoria, 'n' => (int) $r->n])
            ->values();

        // Por prioridade
        $porPrioridade = (clone $base())
            ->selectRaw('prioridade, COUNT(*) AS n')
            ->groupBy('prioridade')
            ->pluck('n', 'prioridade');

        // Tempo medio de resolucao (dias entre created_at e resolvido_em), nos resolvidos
        $resolvidos = (clone $base())
            ->whereNotNull('resolvido_em')
            ->selectRaw('AVG(DATEDIFF(resolvido_em, created_at)) AS dias, COUNT(*) AS n')
            ->first();
        $tempoResolucao = ($resolvidos && $resolvidos->n > 0)
            ? ['disponivel' => true, 'dias_medio' => round((float) $resolvidos->dias, 1), 'resolvidos' => (int) $resolvidos->n]
            : ['disponivel' => false, 'motivo' => 'Ainda não há pedidos resolvidos para calcular o tempo médio.'];

        // Evolucao mensal (pedidos abertos por mes)
        $inicio = now()->subMonths($numMeses - 1)->startOfMonth();
        $mensal = (clone $base())
            ->where('created_at', '>=', $inicio->toDateString())
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') AS mes, COUNT(*) AS n")
            ->groupBy('mes')
            ->pluck('n', 'mes');
        $meses = [];
        $cursor = $inicio->copy();
        for ($i = 0; $i < $numMeses; $i++) {
            $chave = $cursor->format('Y-m');
            $meses[] = ['label' => $cursor->format('m/Y'), 'n' => (int) ($mensal[$chave] ?? 0)];
            $cursor->addMonth();
        }

        return [
            'total' => $total,
            'por_estado' => $porEstado,
            'por_categoria' => $porCategoria,
            'por_prioridade' => $porPrioridade,
            'tempo_resolucao' => $tempoResolucao,
            'meses' => $meses,
        ];
    }
}
