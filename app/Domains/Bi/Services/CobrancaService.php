<?php

declare(strict_types=1);

namespace App\Domains\Bi\Services;

use Illuminate\Support\Facades\DB;

class CobrancaService
{
    /**
     * Métricas de cobrança para uma gestora (e opcionalmente um condomínio).
     * Baseado em lancamentos_condomino, excluindo cancelados e soft-deleted.
     */
    public function calcular(int $empresaGestoraId, ?int $condominioId): array
    {
        $base = fn () => DB::table('lancamentos_condomino')
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->whereNull('deleted_at')
            ->where('estado', '!=', 'cancelado')
            ->when($condominioId, fn ($q) => $q->where('condominio_id', $condominioId));

        // Taxa de cobrança: pago / cobrado (limitada a 0..100)
        $tot = $base()->selectRaw('SUM(valor) AS cobrado, SUM(valor_pago) AS pago')->first();
        $cobrado = (float) ($tot->cobrado ?? 0);
        $pago = (float) ($tot->pago ?? 0);
        $taxa = $cobrado > 0 ? min(100, max(0, round(($pago / $cobrado) * 100, 1))) : 0;

        // Aging: dívida (valor - valor_pago) por idade de vencimento, só com dívida positiva
        $hoje = now()->startOfDay();
        $aging = ['ate_30' => 0.0, 'd31_60' => 0.0, 'd61_90' => 0.0, 'mais_90' => 0.0, 'sem_venc' => 0.0];
        $devracha = $base()
            ->whereIn('estado', ['em_aberto', 'pago_parcial'])
            ->selectRaw('data_vencimento, (valor - valor_pago) AS divida')
            ->havingRaw('divida > 0')
            ->get();
        $dividaTotal = 0.0;
        foreach ($devracha as $row) {
            $d = (float) $row->divida;
            $dividaTotal += $d;
            if (! $row->data_vencimento) {
                $aging['sem_venc'] += $d;
                continue;
            }
            $dias = $hoje->diffInDays(\Carbon\Carbon::parse($row->data_vencimento)->startOfDay(), false);
            // dias negativos = já venceu há |dias|; positivos = ainda não venceu
            $atraso = $dias < 0 ? abs($dias) : 0;
            if ($atraso <= 30) $aging['ate_30'] += $d;
            elseif ($atraso <= 60) $aging['d31_60'] += $d;
            elseif ($atraso <= 90) $aging['d61_90'] += $d;
            else $aging['mais_90'] += $d;
        }
        foreach ($aging as $k => $v) $aging[$k] = round($v, 2);

        // Top devedores (por condomino_id)
        $topDevedores = $base()
            ->whereIn('estado', ['em_aberto', 'pago_parcial'])
            ->whereNotNull('condomino_id')
            ->selectRaw('condomino_id, SUM(valor - valor_pago) AS divida')
            ->groupBy('condomino_id')
            ->havingRaw('divida > 0')
            ->orderByDesc('divida')
            ->limit(10)
            ->get();

        // Resolver nomes dos condóminos
        $ids = $topDevedores->pluck('condomino_id')->all();
        $nomes = [];
        if ($ids) {
            $nomes = DB::table('users')->whereIn('id', $ids)->pluck('name', 'id')->all();
        }
        $devedores = $topDevedores->map(fn ($r) => [
            'condomino_id' => $r->condomino_id,
            'nome' => $nomes[$r->condomino_id] ?? ('Condómino #' . $r->condomino_id),
            'divida' => round((float) $r->divida, 2),
        ])->values();

        // DSO: média de dias entre vencimento e pago_em, nos pagos com ambas as datas
        $dso = $base()
            ->where('estado', 'pago')
            ->whereNotNull('data_vencimento')
            ->whereNotNull('pago_em')
            ->selectRaw('AVG(DATEDIFF(pago_em, data_vencimento)) AS dso')
            ->value('dso');

        return [
            'taxa_cobranca' => $taxa,
            'total_cobrado' => round($cobrado, 2),
            'total_pago' => round($pago, 2),
            'divida_total' => round($dividaTotal, 2),
            'aging' => $aging,
            'devedores' => $devedores,
            'dso' => $dso !== null ? round((float) $dso, 1) : null,
        ];
    }

    /**
     * Devedores detalhados: por imóvel (fracção), com condómino, meses e facturas.
     */
    public function devedoresDetalhados(int $empresaGestoraId, ?int $condominioId, array $filtros = []): array
    {
        $antiguidade = $filtros['antiguidade'] ?? 'todos'; // todos|30|60|90
        $tipo = $filtros['tipo'] ?? 'todos';
        $ordenar = $filtros['ordenar'] ?? 'divida'; // divida|meses|facturas
        $linhas = DB::table('lancamentos_condomino as l')
            ->leftJoin('fraccoes as f', 'f.id', '=', 'l.fraccao_id')
            ->leftJoin('users as u', 'u.id', '=', 'l.condomino_id')
            ->where('l.empresa_gestora_id', $empresaGestoraId)
            ->whereNull('l.deleted_at')
            ->whereIn('l.estado', ['em_aberto', 'pago_parcial'])
            ->when($condominioId, fn ($q) => $q->where('l.condominio_id', $condominioId))
            ->whereRaw('(l.valor - l.valor_pago) > 0')
            ->when($tipo !== 'todos', fn ($q) => $q->where('l.tipo', $tipo))
            ->when($antiguidade !== 'todos', function ($q) use ($antiguidade) {
                $limite = now()->subDays((int) $antiguidade)->toDateString();
                $q->whereNotNull('l.data_vencimento')->where('l.data_vencimento', '<=', $limite);
            })
            ->selectRaw('l.fraccao_id, f.identificador AS imovel, MAX(u.name) AS condomino,
                COUNT(*) AS facturas, SUM(l.valor - l.valor_pago) AS divida,
                MIN(l.data_vencimento) AS venc_antigo')
            ->groupBy('l.fraccao_id', 'f.identificador')
            ->orderByRaw(match ($ordenar) {
                'meses' => 'MIN(l.data_vencimento) ASC',
                'facturas' => 'COUNT(*) DESC',
                default => 'divida DESC',
            })
            ->limit(20)
            ->get();

        $hoje = now();
        return $linhas->map(function ($r) use ($hoje) {
            $meses = 0;
            if ($r->venc_antigo) {
                $meses = (int) floor($hoje->copy()->startOfMonth()->diffInMonths(\Carbon\Carbon::parse($r->venc_antigo)->startOfMonth()));
            }
            return [
                'fraccao_id' => $r->fraccao_id,
                'imovel' => $r->imovel ?: ('Imóvel #' . $r->fraccao_id),
                'condomino' => $r->condomino ?: 'Sem condómino atribuído',
                'facturas' => (int) $r->facturas,
                'meses' => max(0, $meses),
                'divida' => round((float) $r->divida, 2),
            ];
        })->values()->all();
    }

    /**
     * Lançamentos individuais em dívida de uma fracção (para o expandir).
     */
    public function lancamentosDaFraccao(int $empresaGestoraId, int $fraccaoId): array
    {
        return DB::table('lancamentos_condomino')
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->where('fraccao_id', $fraccaoId)
            ->whereNull('deleted_at')
            ->whereIn('estado', ['em_aberto', 'pago_parcial'])
            ->whereRaw('(valor - valor_pago) > 0')
            ->orderBy('data_vencimento')
            ->get(['id', 'tipo', 'descricao', 'valor', 'valor_pago', 'data_vencimento', 'estado'])
            ->map(fn ($l) => [
                'id' => $l->id,
                'tipo' => $l->tipo,
                'descricao' => $l->descricao,
                'divida' => round((float) ($l->valor - $l->valor_pago), 2),
                'data_vencimento' => $l->data_vencimento,
                'estado' => $l->estado,
            ])->values()->all();
    }

}
