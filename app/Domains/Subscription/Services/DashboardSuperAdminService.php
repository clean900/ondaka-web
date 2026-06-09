<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Calcula KPIs do negócio Soluções Simples para o dashboard super-admin.
 *
 * Métricas calculadas:
 *  - MRR (Monthly Recurring Revenue): receita normalizada para mensal
 *  - ARR (Annual Recurring Revenue): MRR × 12
 *  - Clientes activos: empresas com estado='activa'
 *  - Pipeline: breakdown por estado da subscrição
 *  - Churn rate: % cancelamentos últimos 30d
 *  - Receita por escalão
 *  - Clientes recentes
 */
class DashboardSuperAdminService
{
    /**
     * Devolve todos os dados do dashboard num único objecto.
     */
    public function obterDados(): array
    {
        return [
            'kpis' => $this->calcularKpis(),
            'pipeline' => $this->calcularPipeline(),
            'receita_por_escalao' => $this->calcularReceitaPorEscalao(),
            'clientes_recentes' => $this->obterClientesRecentes(),
            'gerado_em' => now()->toIso8601String(),
        ];
    }

    /**
     * 4 KPIs principais (cards topo).
     */
    public function calcularKpis(): array
    {
        $mrr = $this->calcularMrr();
        $clientesActivos = DB::table('subscricoes')->where('estado', 'activa')->count();
        $imoveisTotal = (int) DB::table('subscricoes')->where('estado', 'activa')->sum('num_imoveis');
        $novosEsteMes = DB::table('subscricoes')
            ->where('estado', 'activa')
            ->whereMonth('activa_desde', now()->month)
            ->whereYear('activa_desde', now()->year)
            ->count();
        $churn = $this->calcularChurnRate();

        return [
            'mrr_kz' => $mrr,
            'arr_kz' => round($mrr * 12, 2),
            'clientes_activos' => $clientesActivos,
            'novos_este_mes' => $novosEsteMes,
            'imoveis_total' => $imoveisTotal,
            'imoveis_media_por_cliente' => $clientesActivos > 0 ? (int) round($imoveisTotal / $clientesActivos) : 0,
            'churn_rate_30d' => $churn['rate_pct'],
            'cancelamentos_30d' => $churn['cancelamentos'],
        ];
    }

    /**
     * MRR (Monthly Recurring Revenue):
     * Soma normalizada das subscrições activas — total_kz dividido pelo nº meses do ciclo.
     */
    public function calcularMrr(): float
    {
        // Para cada subscrição activa, pegar a última factura paga (snapshot do total) e dividir pelos meses
        // Aproximação: usa-se o periodo_actual_inicio/fim para inferir nº meses

        $activas = DB::table('subscricoes')
            ->where('estado', 'activa')
            ->whereNotNull('periodo_actual_inicio')
            ->whereNotNull('periodo_actual_fim')
            ->get();

        $mrr = 0.0;

        foreach ($activas as $sub) {
            // Buscar última factura paga para esta subscrição
            $factura = DB::table('plataforma_facturas')
                ->where('subscricao_id', $sub->id)
                ->where('estado', 'paga')
                ->orderBy('id', 'desc')
                ->first();

            if (! $factura) {
                continue;
            }

            // Calcular nº meses do período
            $inicio = Carbon::parse($sub->periodo_actual_inicio);
            $fim = Carbon::parse($sub->periodo_actual_fim);
            $meses = max(1, $inicio->diffInMonths($fim));

            $mrr += ((float) $factura->valor_total_kz) / $meses;
        }

        return round($mrr, 2);
    }

    /**
     * Pipeline: breakdown por estado.
     */
    public function calcularPipeline(): array
    {
        $estados = DB::table('subscricoes')
            ->select('estado', DB::raw('count(*) as total'))
            ->groupBy('estado')
            ->get()
            ->keyBy('estado');

        return [
            'trial' => (int) ($estados->get('trial')->total ?? 0),
            'activa' => (int) ($estados->get('activa')->total ?? 0),
            'limitado' => (int) ($estados->get('limitado')->total ?? 0),
            'cancelada' => (int) ($estados->get('cancelada')->total ?? 0),
        ];
    }

    /**
     * Churn rate últimos 30 dias.
     * Cálculo simplificado: nº de subscrições que passaram a cancelada nos últimos 30d
     * dividido por total de subscrições activas há 30d (aproximação: activas + canceladas hoje).
     */
    public function calcularChurnRate(): array
    {
        $cancelamentos30d = DB::table('plataforma_subscricao_eventos')
            ->where('tipo', 'cancelada')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        $activasHoje = DB::table('subscricoes')->where('estado', 'activa')->count();
        $baseCalc = $activasHoje + $cancelamentos30d;

        $rate = $baseCalc > 0 ? round(($cancelamentos30d / $baseCalc) * 100, 2) : 0;

        return [
            'cancelamentos' => $cancelamentos30d,
            'rate_pct' => $rate,
            'base_calculo' => $baseCalc,
        ];
    }

    /**
     * Receita por escalão de imóveis (Bronze/Prata/Ouro/Enterprise).
     */
    public function calcularReceitaPorEscalao(): array
    {
        $escaloes = DB::table('escaloes_core')->orderBy('ordem', 'asc')->get();
        $resultado = [];

        $mrrTotal = $this->calcularMrr();

        foreach ($escaloes as $e) {
            // Buscar todas as subscrições activas que se encaixam neste escalão
            $subs = DB::table('subscricoes')
                ->where('estado', 'activa')
                ->where('num_imoveis', '>=', $e->min_fraccoes)
                ->where(function ($q) use ($e) {
                    if ($e->max_fraccoes !== null) {
                        $q->where('num_imoveis', '<=', $e->max_fraccoes);
                    }
                })
                ->get();

            $mrrEscalao = 0.0;
            foreach ($subs as $sub) {
                $factura = DB::table('plataforma_facturas')
                    ->where('subscricao_id', $sub->id)
                    ->where('estado', 'paga')
                    ->orderBy('id', 'desc')
                    ->first();

                if ($factura && $sub->periodo_actual_inicio && $sub->periodo_actual_fim) {
                    $meses = max(1, Carbon::parse($sub->periodo_actual_inicio)->diffInMonths(Carbon::parse($sub->periodo_actual_fim)));
                    $mrrEscalao += ((float) $factura->valor_total_kz) / $meses;
                }
            }

            $resultado[] = [
                'nome' => $e->nome,
                'imoveis_min' => $e->min_fraccoes,
                'imoveis_max' => $e->max_fraccoes,
                'desconto_pct' => (float) ($e->desconto_pct ?? 0),
                'num_clientes' => $subs->count(),
                'mrr_kz' => round($mrrEscalao, 2),
                'mrr_pct' => $mrrTotal > 0 ? round(($mrrEscalao / $mrrTotal) * 100, 1) : 0,
            ];
        }

        return $resultado;
    }

    /**
     * Últimos clientes activados (max 10).
     */
    public function obterClientesRecentes(int $limit = 10): array
    {
        return DB::table('subscricoes as s')
            ->leftJoin('empresas_gestoras as e', 'e.id', '=', 's.empresa_gestora_id')
            ->select(
                's.id as subscricao_id',
                's.estado',
                's.ciclo',
                's.num_imoveis',
                's.activa_desde',
                's.created_at',
                'e.id as empresa_id',
                'e.nome as empresa_nome',
                'e.tipo_cliente',
                'e.nif',
            )
            ->whereNotNull('s.empresa_gestora_id')
            ->orderBy('s.created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($s) {
                $factura = DB::table('plataforma_facturas')
                    ->where('subscricao_id', $s->subscricao_id)
                    ->where('estado', 'paga')
                    ->orderBy('id', 'desc')
                    ->first();

                $mrrEstimado = 0.0;
                if ($factura) {
                    $meses = match ($s->ciclo) {
                        'mensal' => 1,
                        'semestral' => 6,
                        'anual' => 12,
                        default => 1,
                    };
                    $mrrEstimado = ((float) $factura->valor_total_kz) / $meses;
                }

                return [
                    'id' => $s->subscricao_id,
                    'empresa_id' => $s->empresa_id,
                    'empresa_nome' => $s->empresa_nome,
                    'tipo_cliente' => $s->tipo_cliente,
                    'nif' => $s->nif,
                    'estado' => $s->estado,
                    'ciclo' => $s->ciclo,
                    'num_imoveis' => $s->num_imoveis,
                    'mrr_estimado_kz' => round($mrrEstimado, 2),
                    'desde' => $s->activa_desde ?? $s->created_at,
                ];
            })
            ->toArray();
    }
}
