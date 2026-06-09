<?php

declare(strict_types=1);

namespace App\Domains\Dashboard\Services;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Facturacao\Models\Quota;
use App\Domains\Avisos\Models\Aviso;
use App\Domains\Tickets\Models\Ticket;
use App\Domains\Assembleia\Models\Assembleia;
use App\Domains\Financas\Models\ContaBancaria;
use App\Domains\Financas\Models\Despesa;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Devolve KPIs e widgets do Dashboard do cliente (admin-empresa / gestor),
 * sempre filtrados pela empresa_gestora actual (multi-tenancy).
 *
 * Arquitectura reutilizavel: os calculos financeiros operam sobre um array
 * de condominioIds. Isto permite que vistas futuras (ex: administrador-condominio
 * que ve so o seu condominio) reutilizem os mesmos metodos passando um subconjunto.
 *
 * Notas tecnicas:
 * - Pagamentos consultados via DB::table('pagamentos_condomino') porque o Model
 *   Facturacao\Pagamento infere para 'pagamentos' (Loja SaaS). TODO: corrigir Model.
 * - Despesas usam o Model Financas\Despesa (tem $table correcto).
 * - Assembleias usam 'data_agendada' e tem 'empresa_gestora_id' directo.
 */
class DashboardClienteService
{
    public function obterDashboard(EmpresaGestora $empresa): array
    {
        $condominioIds = Condominio::where('empresa_gestora_id', $empresa->id)->pluck('id');

        return [
            'kpis' => $this->kpis($empresa, $condominioIds),
            'receita_mensal' => $this->receitaMensal($condominioIds),
            'fluxo_mensal' => $this->fluxoMensal($condominioIds),
            'contas' => $this->contasDetalhe($condominioIds),
            'proximas_assembleias' => $this->proximasAssembleias($empresa),
            'actividade_recente' => $this->actividadeRecente($condominioIds),
        ];
    }

    protected function kpis(EmpresaGestora $empresa, Collection $condominioIds): array
    {
        $totalCondominios = $condominioIds->count();
        $totalFraccoes = Fraccao::whereIn('condominio_id', $condominioIds)->count();

        $fraccoesOcupadas = 0;
        try {
            $fraccoesOcupadas = Fraccao::whereIn('condominio_id', $condominioIds)
                ->whereHas('contratoOcupacaoActivo')
                ->count();
        } catch (\Throwable $e) {
            $fraccoesOcupadas = 0;
        }

        $ocupacaoPct = $totalFraccoes > 0
            ? round(($fraccoesOcupadas / $totalFraccoes) * 100, 1)
            : 0;

        $inicioMes = Carbon::now()->startOfMonth();
        $fimMes = Carbon::now()->endOfMonth();

        $pendenteQuotas = Quota::whereIn('condominio_id', $condominioIds)
            ->whereIn('estado', ['aberta', 'paga_parcial'])
            ->sum('valor_total');
        $pendenteCount = Quota::whereIn('condominio_id', $condominioIds)
            ->whereIn('estado', ['aberta', 'paga_parcial'])
            ->count();

        $imoveisEmDivida = Quota::whereIn('condominio_id', $condominioIds)
            ->whereIn('estado', ['aberta', 'paga_parcial'])
            ->distinct('fraccao_id')
            ->count('fraccao_id');

        $receitaMes = (float) DB::table('pagamentos_condomino')
            ->whereIn('condominio_id', $condominioIds)
            ->where('estado', 'confirmado')
            ->whereNull('deleted_at')
            ->whereBetween('data_pagamento', [$inicioMes, $fimMes])
            ->sum('valor');

        // NOVO: Despesas pagas no mes corrente
        $despesasMes = (float) Despesa::whereIn('condominio_id', $condominioIds)
            ->where('estado', 'paga')
            ->whereBetween('paga_em', [$inicioMes, $fimMes])
            ->sum('valor');

        // NOVO: Saldo agregado das contas bancarias dos condominios
        $saldoContas = (float) ContaBancaria::whereIn('condominio_id', $condominioIds)
            ->where('activa', true)
            ->sum('saldo_actual');

        $contasCount = ContaBancaria::whereIn('condominio_id', $condominioIds)
            ->where('activa', true)
            ->count();

        return [
            'condominios' => [
                'valor' => $totalCondominios,
                'delta' => $totalCondominios === 1 ? 'condomínio activo' : 'condomínios activos',
            ],
            'imoveis' => [
                'valor' => $totalFraccoes,
                'delta' => $totalFraccoes > 0 ? "{$ocupacaoPct}% ocupação" : 'sem imóveis',
            ],
            'pendente' => [
                'valor' => (float) $pendenteQuotas,
                'delta' => $this->deltaPendente($pendenteCount, $imoveisEmDivida),
            ],
            'receita_mes' => [
                'valor' => (float) $receitaMes,
                'delta' => $receitaMes > 0 ? 'recebido este mês' : 'sem entradas ainda',
            ],
            'despesas_mes' => [
                'valor' => $despesasMes,
                'delta' => $despesasMes > 0 ? 'pago este mês' : 'sem despesas ainda',
            ],
            'saldo_contas' => [
                'valor' => $saldoContas,
                'delta' => $contasCount === 1 ? '1 conta activa' : "{$contasCount} contas activas",
            ],
        ];
    }

    /**
     * Lista simples de contas bancarias activas com saldo + condominio.
     * Apenas info operacional (saldo actual) — analises ricas ficam para o add-on BI.
     */
    protected function contasDetalhe(Collection $condominioIds): array
    {
        if ($condominioIds->isEmpty()) {
            return [];
        }

        return ContaBancaria::whereIn('condominio_id', $condominioIds)
            ->where('activa', true)
            ->with('condominio:id,nome')
            ->orderByDesc('principal')
            ->orderBy('condominio_id')
            ->get(['id', 'condominio_id', 'nome', 'banco', 'saldo_actual', 'principal'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'nome' => $c->nome,
                'banco' => $c->banco,
                'condominio' => $c->condominio?->nome ?? '—',
                'saldo_actual' => (float) $c->saldo_actual,
                'principal' => (bool) $c->principal,
            ])
            ->all();
    }

    protected function deltaPendente(int $facturas, int $imoveis): string
    {
        $f = $facturas === 1 ? '1 factura pendente' : "{$facturas} facturas pendentes";
        $i = $imoveis === 1 ? '1 imóvel em dívida' : "{$imoveis} imóveis em dívida";
        return "{$f} · {$i}";
    }

    protected function receitaMensal(Collection $condominioIds): array
    {
        $meses_pt = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

        if ($condominioIds->isEmpty()) {
            $resultado = [];
            for ($i = 5; $i >= 0; $i--) {
                $data = Carbon::now()->subMonths($i);
                $resultado[] = ['mes' => $meses_pt[$data->month - 1], 'valor' => 0];
            }
            return $resultado;
        }

        $fim = Carbon::now()->endOfMonth();
        $inicio = Carbon::now()->subMonths(5)->startOfMonth();

        $linhas = DB::table('pagamentos_condomino')
            ->whereIn('condominio_id', $condominioIds)
            ->where('estado', 'confirmado')
            ->whereNull('deleted_at')
            ->whereBetween('data_pagamento', [$inicio, $fim])
            ->select(
                DB::raw('YEAR(data_pagamento) as ano'),
                DB::raw('MONTH(data_pagamento) as mes_num'),
                DB::raw('SUM(valor) as total'),
            )
            ->groupBy('ano', 'mes_num')
            ->orderBy('ano')
            ->orderBy('mes_num')
            ->get()
            ->keyBy(fn ($r) => $r->ano . '-' . str_pad((string) $r->mes_num, 2, '0', STR_PAD_LEFT));

        $resultado = [];
        for ($i = 5; $i >= 0; $i--) {
            $data = Carbon::now()->subMonths($i);
            $chave = $data->format('Y-m');
            $resultado[] = [
                'mes' => $meses_pt[$data->month - 1],
                'valor' => isset($linhas[$chave]) ? (float) $linhas[$chave]->total : 0,
            ];
        }

        return $resultado;
    }

    /**
     * NOVO: Fluxo mensal combinado — Receitas vs Despesas, 6 meses.
     * Estrutura por mes: ['mes' => 'Mai', 'receitas' => x, 'despesas' => y].
     */
    protected function fluxoMensal(Collection $condominioIds): array
    {
        $meses_pt = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

        $base = [];
        for ($i = 5; $i >= 0; $i--) {
            $data = Carbon::now()->subMonths($i);
            $base[$data->format('Y-m')] = [
                'mes' => $meses_pt[$data->month - 1],
                'receitas' => 0.0,
                'despesas' => 0.0,
            ];
        }

        if ($condominioIds->isEmpty()) {
            return array_values($base);
        }

        $fim = Carbon::now()->endOfMonth();
        $inicio = Carbon::now()->subMonths(5)->startOfMonth();

        // Receitas (pagamentos confirmados)
        $receitas = DB::table('pagamentos_condomino')
            ->whereIn('condominio_id', $condominioIds)
            ->where('estado', 'confirmado')
            ->whereNull('deleted_at')
            ->whereBetween('data_pagamento', [$inicio, $fim])
            ->select(
                DB::raw('YEAR(data_pagamento) as ano'),
                DB::raw('MONTH(data_pagamento) as mes_num'),
                DB::raw('SUM(valor) as total'),
            )
            ->groupBy('ano', 'mes_num')
            ->get();

        foreach ($receitas as $r) {
            $chave = $r->ano . '-' . str_pad((string) $r->mes_num, 2, '0', STR_PAD_LEFT);
            if (isset($base[$chave])) {
                $base[$chave]['receitas'] = (float) $r->total;
            }
        }

        // Despesas (pagas)
        $despesas = Despesa::whereIn('condominio_id', $condominioIds)
            ->where('estado', 'paga')
            ->whereBetween('paga_em', [$inicio, $fim])
            ->select(
                DB::raw('YEAR(paga_em) as ano'),
                DB::raw('MONTH(paga_em) as mes_num'),
                DB::raw('SUM(valor) as total'),
            )
            ->groupBy('ano', 'mes_num')
            ->get();

        foreach ($despesas as $d) {
            $chave = $d->ano . '-' . str_pad((string) $d->mes_num, 2, '0', STR_PAD_LEFT);
            if (isset($base[$chave])) {
                $base[$chave]['despesas'] = (float) $d->total;
            }
        }

        return array_values($base);
    }

    protected function proximasAssembleias(EmpresaGestora $empresa): array
    {
        return Assembleia::where('empresa_gestora_id', $empresa->id)
            ->whereIn('estado', ['agendada', 'em_curso'])
            ->where('data_agendada', '>=', Carbon::now())
            ->orderBy('data_agendada')
            ->limit(5)
            ->get(['id', 'titulo', 'data_agendada', 'condominio_id', 'estado', 'modo'])
            ->map(fn ($a) => [
                'id' => $a->id,
                'titulo' => $a->titulo,
                'data_agendada' => $a->data_agendada?->toIso8601String(),
                'condominio_id' => $a->condominio_id,
                'estado' => $a->estado,
                'modo' => $a->modo,
            ])
            ->all();
    }

    protected function actividadeRecente(Collection $condominioIds): array
    {
        if ($condominioIds->isEmpty()) {
            return [];
        }

        $itens = collect();

        try {
            Aviso::whereIn('condominio_id', $condominioIds)
                ->where('estado', 'publicado')
                ->orderByDesc('created_at')
                ->limit(5)
                ->get(['id', 'titulo', 'created_at'])
                ->each(function ($a) use ($itens) {
                    $itens->push([
                        'tipo' => 'aviso',
                        'titulo' => 'Aviso publicado',
                        'descricao' => $a->titulo,
                        'created_at' => $a->created_at?->toIso8601String(),
                    ]);
                });
        } catch (\Throwable $e) {}

        try {
            DB::table('pagamentos_condomino')
                ->whereIn('condominio_id', $condominioIds)
                ->where('estado', 'confirmado')
                ->whereNull('deleted_at')
                ->orderByDesc('confirmado_em')
                ->limit(5)
                ->get(['id', 'valor', 'confirmado_em'])
                ->each(function ($p) use ($itens) {
                    $itens->push([
                        'tipo' => 'pagamento',
                        'titulo' => 'Pagamento confirmado',
                        'descricao' => number_format((float) $p->valor, 2, ',', '.') . ' Kz',
                        'created_at' => $p->confirmado_em ? Carbon::parse($p->confirmado_em)->toIso8601String() : null,
                    ]);
                });
        } catch (\Throwable $e) {}

        // NOVO: Despesas pagas na actividade recente
        try {
            Despesa::whereIn('condominio_id', $condominioIds)
                ->where('estado', 'paga')
                ->orderByDesc('paga_em')
                ->limit(5)
                ->get(['id', 'valor', 'descricao', 'paga_em'])
                ->each(function ($d) use ($itens) {
                    $itens->push([
                        'tipo' => 'despesa',
                        'titulo' => 'Despesa paga',
                        'descricao' => number_format((float) $d->valor, 2, ',', '.') . ' Kz — ' . $d->descricao,
                        'created_at' => $d->paga_em ? Carbon::parse($d->paga_em)->toIso8601String() : null,
                    ]);
                });
        } catch (\Throwable $e) {}

        try {
            Ticket::whereIn('condominio_id', $condominioIds)
                ->orderByDesc('created_at')
                ->limit(5)
                ->get(['id', 'titulo', 'created_at'])
                ->each(function ($t) use ($itens) {
                    $itens->push([
                        'tipo' => 'ticket',
                        'titulo' => 'Pedido aberto',
                        'descricao' => $t->titulo,
                        'created_at' => $t->created_at?->toIso8601String(),
                    ]);
                });
        } catch (\Throwable $e) {}

        return $itens
            ->filter(fn ($i) => $i['created_at'] !== null)
            ->sortByDesc('created_at')
            ->take(6)
            ->values()
            ->all();
    }
}
