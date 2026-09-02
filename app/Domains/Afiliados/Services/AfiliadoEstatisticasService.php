<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Services;

use App\Domains\Afiliados\Models\Afiliado;
use App\Domains\Afiliados\Models\AfiliadoComissao;
use App\Domains\Afiliados\Models\AfiliadoPagamento;
use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Agregados para o portal do afiliado, API mobile e painel super-admin.
 * Valores monetários devolvidos como strings "1234.56" (bcmath / JSON seguro).
 */
class AfiliadoEstatisticasService
{
    public function __construct(
        protected AfiliadoService $afiliados,
        protected AfiliadoConfigService $config,
    ) {}

    // -----------------------------------------------------------------
    // Portal do afiliado
    // -----------------------------------------------------------------

    public function resumoAfiliado(Afiliado $af): array
    {
        $porEstado = AfiliadoComissao::where('afiliado_id', $af->id)
            ->selectRaw('estado, COUNT(*) as n, COALESCE(SUM(valor_comissao_kz),0) as total, COALESCE(SUM(valor_base_kz),0) as base')
            ->groupBy('estado')
            ->get()
            ->keyBy('estado');
        $tot = fn (string $e) => $this->dec($porEstado[$e]->total ?? 0);
        $num = fn (string $e) => (int) ($porEstado[$e]->n ?? 0);

        $registos = EmpresaGestora::where('afiliado_id', $af->id)->count();
        $activos = DB::table('empresas_gestoras as e')
            ->join('subscricoes as s', 's.empresa_gestora_id', '=', 'e.id')
            ->where('e.afiliado_id', $af->id)
            ->whereNull('e.deleted_at')
            ->whereNull('s.deleted_at')
            ->where('s.estado', 'activa')
            ->count();

        $mesInicio = now()->startOfMonth();
        $mesActual = AfiliadoComissao::where('afiliado_id', $af->id)->naoAnuladas()
            ->where('created_at', '>=', $mesInicio)->sum('valor_comissao_kz');
        $registosMes = EmpresaGestora::where('afiliado_id', $af->id)
            ->where('afiliado_atribuido_em', '>=', $mesInicio)->count();

        $baseGerada = AfiliadoComissao::where('afiliado_id', $af->id)->naoAnuladas()->sum('valor_base_kz');
        $totalGerado = bcadd(bcadd($tot('pendente'), $tot('aprovada'), 2), $tot('paga'), 2);

        $ultimoPag = AfiliadoPagamento::where('afiliado_id', $af->id)->orderByDesc('pago_em')->orderByDesc('id')->first();
        $totalPagoLiquido = AfiliadoPagamento::where('afiliado_id', $af->id)->sum('valor_liquido_kz');

        return [
            'cliques' => (int) $af->total_cliques,
            'registos' => $registos,
            'registos_mes' => $registosMes,
            'clientes_activos' => $activos,
            'clientes_pagantes' => $this->afiliados->clientesPagantes($af),
            'nivel' => $af->nivel,
            'nivel_label' => $af->nivel_label,
            'taxa_pct' => $this->dec($af->taxa_actual_pct),
            'taxa_manual' => $af->taxa_manual_pct !== null,
            'proximo_nivel' => $this->afiliados->proximoNivel($af),
            'pendente_kz' => $tot('pendente'), 'pendente_n' => $num('pendente'),
            'aprovada_kz' => $tot('aprovada'), 'aprovada_n' => $num('aprovada'),
            'paga_kz' => $tot('paga'), 'paga_n' => $num('paga'),
            'anulada_kz' => $tot('anulada'), 'anulada_n' => $num('anulada'),
            'total_gerado_kz' => $totalGerado,
            'base_gerada_kz' => $this->dec($baseGerada),
            'mes_actual_kz' => $this->dec($mesActual),
            'total_pago_liquido_kz' => $this->dec($totalPagoLiquido),
            'serie_12m' => $this->serie12Meses($af->id),
            'ultimo_pagamento' => $ultimoPag ? [
                'numero' => $ultimoPag->numero,
                'valor_liquido_kz' => $this->dec($ultimoPag->valor_liquido_kz),
                'pago_em' => $ultimoPag->pago_em?->toDateString(),
            ] : null,
            'pagamento_minimo_kz' => $this->config->decimal('afiliado_pagamento_minimo_kz'),
            'carencia_dias' => $this->config->int('afiliado_carencia_dias'),
            'atinge_minimo' => bccomp($tot('aprovada'), $this->config->decimal('afiliado_pagamento_minimo_kz'), 2) >= 0,
        ];
    }

    /** Comissões geradas por mês (últimos 12 meses, incluindo o actual), não anuladas. */
    public function serie12Meses(?int $afiliadoId = null): array
    {
        $inicio = now()->startOfMonth()->subMonths(11);
        $q = AfiliadoComissao::query()->naoAnuladas()->where('created_at', '>=', $inicio)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as mes, COALESCE(SUM(valor_comissao_kz),0) as total, COUNT(*) as n")
            ->groupBy('mes');
        if ($afiliadoId) {
            $q->where('afiliado_id', $afiliadoId);
        }
        $dados = $q->get()->keyBy('mes');

        $serie = [];
        for ($i = 0; $i < 12; $i++) {
            $m = $inicio->copy()->addMonths($i);
            $chave = $m->format('Y-m');
            $serie[] = [
                'mes' => $chave,
                'label' => $m->locale('pt')->translatedFormat('M/y'),
                'total_kz' => $this->dec($dados[$chave]->total ?? 0),
                'n' => (int) ($dados[$chave]->n ?? 0),
            ];
        }

        return $serie;
    }

    public function clientesDoAfiliado(Afiliado $af): array
    {
        $rows = DB::table('empresas_gestoras as e')
            ->leftJoin('subscricoes as s', function ($j) {
                $j->on('s.empresa_gestora_id', '=', 'e.id')->whereNull('s.deleted_at');
            })
            ->where('e.afiliado_id', $af->id)
            ->whereNull('e.deleted_at')
            ->orderByDesc('e.afiliado_atribuido_em')
            ->get([
                'e.id', 'e.nome', 'e.tipo_cliente', 'e.provincia', 'e.municipio', 'e.created_at',
                'e.afiliado_atribuido_em', 'e.afiliado_origem', 'e.afiliado_expira_em',
                's.estado as subscricao_estado', 's.num_imoveis',
            ]);

        $agg = AfiliadoComissao::where('afiliado_id', $af->id)->naoAnuladas()
            ->selectRaw('empresa_gestora_id, COUNT(*) as n, COALESCE(SUM(valor_base_kz),0) as base, COALESCE(SUM(valor_comissao_kz),0) as comissao, MAX(pago_pelo_cliente_em) as ultimo')
            ->groupBy('empresa_gestora_id')
            ->get()
            ->keyBy('empresa_gestora_id');

        return $rows->map(function ($r) use ($agg) {
            $a = $agg[$r->id] ?? null;
            $expira = $r->afiliado_expira_em;

            return [
                'id' => (int) $r->id,
                'nome' => $r->nome,
                'tipo_cliente' => $r->tipo_cliente,
                'provincia' => $r->provincia,
                'municipio' => $r->municipio,
                'registado_em' => $r->created_at,
                'atribuido_em' => $r->afiliado_atribuido_em,
                'origem' => $r->afiliado_origem,
                'expira_em' => $expira,
                'atribuicao_activa' => ! $expira || $expira >= now()->toDateString(),
                'subscricao_estado' => $r->subscricao_estado ?? 'sem_subscricao',
                'num_imoveis' => (int) ($r->num_imoveis ?? 0),
                'n_pagamentos' => (int) ($a->n ?? 0),
                'base_kz' => $this->dec($a->base ?? 0),
                'comissao_kz' => $this->dec($a->comissao ?? 0),
                'ultimo_pagamento_em' => $a->ultimo ?? null,
            ];
        })->values()->all();
    }

    // -----------------------------------------------------------------
    // Comissões (portal + super-admin)
    // -----------------------------------------------------------------

    public function comissoesQuery(?Afiliado $af, array $f = []): Builder
    {
        $q = AfiliadoComissao::query()
            ->with(['empresa:id,nome,tipo_cliente', 'afiliado:id,nome,codigo', 'pagamento:id,numero,pago_em'])
            ->orderByDesc('id');

        if ($af) {
            $q->where('afiliado_id', $af->id);
        }
        if (! empty($f['afiliado_id'])) {
            $q->where('afiliado_id', (int) $f['afiliado_id']);
        }
        if (! empty($f['empresa_id'])) {
            $q->where('empresa_gestora_id', (int) $f['empresa_id']);
        }
        if (! empty($f['estado']) && $f['estado'] !== 'todos') {
            $q->where('estado', $f['estado']);
        }
        if (! empty($f['origem']) && $f['origem'] !== 'todas') {
            $q->where('origem_type', $f['origem']);
        }
        if (! empty($f['de'])) {
            $q->whereDate('created_at', '>=', $f['de']);
        }
        if (! empty($f['ate'])) {
            $q->whereDate('created_at', '<=', $f['ate']);
        }
        if (! empty($f['busca'])) {
            $b = '%'.$f['busca'].'%';
            $q->where(function ($w) use ($b) {
                $w->where('descricao', 'like', $b)
                    ->orWhere('origem_numero', 'like', $b)
                    ->orWhereHas('empresa', fn ($e) => $e->where('nome', 'like', $b))
                    ->orWhereHas('afiliado', fn ($a) => $a->where('nome', 'like', $b)->orWhere('codigo', 'like', $b));
            });
        }

        return $q;
    }

    /** Totais por estado do conjunto filtrado. */
    public function totaisComissoes(Builder $q): array
    {
        $rows = (clone $q)->reorder()->withoutEagerLoads()
            ->selectRaw('estado, COUNT(*) as n, COALESCE(SUM(valor_comissao_kz),0) as total, COALESCE(SUM(valor_base_kz),0) as base')
            ->groupBy('estado')
            ->get()
            ->keyBy('estado');
        $out = [];
        foreach (['pendente', 'aprovada', 'paga', 'anulada'] as $e) {
            $out[$e] = ['n' => (int) ($rows[$e]->n ?? 0), 'total_kz' => $this->dec($rows[$e]->total ?? 0), 'base_kz' => $this->dec($rows[$e]->base ?? 0)];
        }
        $out['total_nao_anulada_kz'] = bcadd(bcadd($out['pendente']['total_kz'], $out['aprovada']['total_kz'], 2), $out['paga']['total_kz'], 2);

        return $out;
    }

    public function serializarComissao(AfiliadoComissao $c): array
    {
        return [
            'id' => $c->id,
            'afiliado' => $c->afiliado ? ['id' => $c->afiliado->id, 'nome' => $c->afiliado->nome, 'codigo' => $c->afiliado->codigo] : null,
            'empresa' => $c->empresa ? ['id' => $c->empresa->id, 'nome' => $c->empresa->nome, 'tipo_cliente' => $c->empresa->tipo_cliente] : null,
            'origem_type' => $c->origem_type,
            'origem_label' => $c->origem_label,
            'origem_numero' => $c->origem_numero,
            'descricao' => $c->descricao,
            'valor_pago_total_kz' => $this->dec($c->valor_pago_total_kz),
            'valor_imposto_kz' => $this->dec($c->valor_imposto_kz),
            'valor_base_kz' => $this->dec($c->valor_base_kz),
            'taxa_pct' => $this->dec($c->taxa_pct),
            'valor_comissao_kz' => $this->dec($c->valor_comissao_kz),
            'nivel' => $c->nivel,
            'estado' => $c->estado,
            'estado_label' => $c->estado_label,
            'pago_pelo_cliente_em' => $c->pago_pelo_cliente_em?->toIso8601String(),
            'disponivel_em' => $c->disponivel_em?->toDateString(),
            'aprovada_em' => $c->aprovada_em?->toIso8601String(),
            'paga_em' => $c->paga_em?->toIso8601String(),
            'anulada_em' => $c->anulada_em?->toIso8601String(),
            'motivo_anulacao' => $c->motivo_anulacao,
            'pagamento' => $c->pagamento ? ['id' => $c->pagamento->id, 'numero' => $c->pagamento->numero, 'pago_em' => $c->pagamento->pago_em?->toDateString()] : null,
            'created_at' => $c->created_at?->toIso8601String(),
        ];
    }

    public function serializarPagamento(AfiliadoPagamento $p): array
    {
        return [
            'id' => $p->id,
            'numero' => $p->numero,
            'afiliado' => $p->relationLoaded('afiliado') && $p->afiliado ? ['id' => $p->afiliado->id, 'nome' => $p->afiliado->nome, 'codigo' => $p->afiliado->codigo] : null,
            'num_comissoes' => (int) $p->num_comissoes,
            'valor_bruto_kz' => $this->dec($p->valor_bruto_kz),
            'retencao_pct' => $this->dec($p->retencao_pct),
            'retencao_valor_kz' => $this->dec($p->retencao_valor_kz),
            'valor_liquido_kz' => $this->dec($p->valor_liquido_kz),
            'metodo' => $p->metodo,
            'metodo_label' => $p->metodo_label,
            'referencia_bancaria' => $p->referencia_bancaria,
            'iban_destino' => $p->iban_destino,
            'tem_comprovativo' => ! empty($p->comprovativo_path),
            'comprovativo_nome' => $p->comprovativo_nome,
            'pago_em' => $p->pago_em?->toDateString(),
            'notas' => $p->notas,
            'registado_por' => $p->relationLoaded('registadoPor') ? $p->registadoPor?->name : null,
            'created_at' => $p->created_at?->toIso8601String(),
        ];
    }

    // -----------------------------------------------------------------
    // Super-admin
    // -----------------------------------------------------------------

    public function resumoGlobal(): array
    {
        $porEstadoAf = Afiliado::selectRaw('estado, COUNT(*) as n')->groupBy('estado')->pluck('n', 'estado');
        $porEstado = AfiliadoComissao::selectRaw('estado, COUNT(*) as n, COALESCE(SUM(valor_comissao_kz),0) as total, COALESCE(SUM(valor_base_kz),0) as base')
            ->groupBy('estado')->get()->keyBy('estado');
        $tot = fn (string $e) => $this->dec($porEstado[$e]->total ?? 0);
        $num = fn (string $e) => (int) ($porEstado[$e]->n ?? 0);

        $minimo = $this->config->decimal('afiliado_pagamento_minimo_kz');
        $aPagar = AfiliadoComissao::where('estado', 'aprovada')
            ->selectRaw('afiliado_id, SUM(valor_comissao_kz) as total')
            ->groupBy('afiliado_id')
            ->havingRaw('SUM(valor_comissao_kz) >= ?', [$minimo])
            ->get();

        $mesInicio = now()->startOfMonth();

        $top = Afiliado::query()
            ->select('afiliados.id', 'afiliados.nome', 'afiliados.codigo', 'afiliados.nivel')
            ->selectSub(
                AfiliadoComissao::selectRaw('COALESCE(SUM(valor_comissao_kz),0)')->whereColumn('afiliado_id', 'afiliados.id')->where('estado', '!=', 'anulada'),
                'total_kz',
            )
            ->selectSub(
                EmpresaGestora::selectRaw('COUNT(*)')->whereColumn('afiliado_id', 'afiliados.id'),
                'clientes',
            )
            ->where('estado', Afiliado::ESTADO_ACTIVO)
            ->orderByDesc('total_kz')
            ->limit(5)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id, 'nome' => $a->nome, 'codigo' => $a->codigo, 'nivel' => $a->nivel,
                'total_kz' => $this->dec($a->total_kz), 'clientes' => (int) $a->clientes,
            ])->all();

        return [
            'afiliados_total' => (int) $porEstadoAf->sum(),
            'afiliados_activos' => (int) ($porEstadoAf['activo'] ?? 0),
            'afiliados_pendentes' => (int) ($porEstadoAf['pendente'] ?? 0),
            'afiliados_suspensos' => (int) ($porEstadoAf['suspenso'] ?? 0),
            'clientes_indicados' => EmpresaGestora::whereNotNull('afiliado_id')->count(),
            'clientes_pagantes' => (int) AfiliadoComissao::naoAnuladas()->distinct()->count('empresa_gestora_id'),
            'pendente_kz' => $tot('pendente'), 'pendente_n' => $num('pendente'),
            'aprovada_kz' => $tot('aprovada'), 'aprovada_n' => $num('aprovada'),
            'paga_kz' => $tot('paga'), 'paga_n' => $num('paga'),
            'anulada_kz' => $tot('anulada'), 'anulada_n' => $num('anulada'),
            'base_gerada_kz' => $this->dec(AfiliadoComissao::naoAnuladas()->sum('valor_base_kz')),
            'mes_comissoes_kz' => $this->dec(AfiliadoComissao::naoAnuladas()->where('created_at', '>=', $mesInicio)->sum('valor_comissao_kz')),
            'mes_registos' => EmpresaGestora::whereNotNull('afiliado_id')->where('afiliado_atribuido_em', '>=', $mesInicio)->count(),
            'afiliados_a_pagar' => $aPagar->count(),
            'afiliados_a_pagar_kz' => $this->dec($aPagar->sum('total')),
            'pagamento_minimo_kz' => $minimo,
            'top' => $top,
            'serie_12m' => $this->serie12Meses(null),
        ];
    }

    public function listaAfiliados(array $f = [], int $perPage = 20): LengthAwarePaginator
    {
        $q = Afiliado::query()
            ->with('user:id,name,email')
            ->select('afiliados.*')
            ->selectSub(EmpresaGestora::selectRaw('COUNT(*)')->whereColumn('afiliado_id', 'afiliados.id'), 'clientes_count')
            ->selectSub(AfiliadoComissao::selectRaw('COALESCE(SUM(valor_comissao_kz),0)')->whereColumn('afiliado_id', 'afiliados.id')->where('estado', 'aprovada'), 'aprovada_kz')
            ->selectSub(AfiliadoComissao::selectRaw('COALESCE(SUM(valor_comissao_kz),0)')->whereColumn('afiliado_id', 'afiliados.id')->where('estado', 'pendente'), 'pendente_kz')
            ->selectSub(AfiliadoComissao::selectRaw('COALESCE(SUM(valor_comissao_kz),0)')->whereColumn('afiliado_id', 'afiliados.id')->where('estado', 'paga'), 'paga_kz')
            ->orderByRaw("FIELD(afiliados.estado, 'pendente', 'activo', 'suspenso', 'recusado')")
            ->orderByDesc('afiliados.id');

        if (! empty($f['estado']) && $f['estado'] !== 'todos') {
            $q->where('afiliados.estado', $f['estado']);
        }
        if (! empty($f['busca'])) {
            $b = '%'.$f['busca'].'%';
            $q->where(function ($w) use ($b) {
                $w->where('afiliados.nome', 'like', $b)
                    ->orWhere('afiliados.email', 'like', $b)
                    ->orWhere('afiliados.codigo', 'like', $b)
                    ->orWhere('afiliados.telefone', 'like', $b);
            });
        }

        return $q->paginate($perPage)->withQueryString()->through(fn (Afiliado $a) => [
            'id' => $a->id,
            'codigo' => $a->codigo,
            'nome' => $a->nome,
            'email' => $a->email,
            'telefone' => $a->telefone,
            'tipo' => $a->tipo,
            'estado' => $a->estado,
            'estado_label' => $a->estado_label,
            'nivel' => $a->nivel,
            'taxa_pct' => $this->dec($a->taxa_actual_pct),
            'taxa_manual' => $a->taxa_manual_pct !== null,
            'clientes_count' => (int) $a->clientes_count,
            'cliques' => (int) $a->total_cliques,
            'pendente_kz' => $this->dec($a->pendente_kz),
            'aprovada_kz' => $this->dec($a->aprovada_kz),
            'paga_kz' => $this->dec($a->paga_kz),
            'created_at' => $a->created_at?->toIso8601String(),
            'aprovado_em' => $a->aprovado_em?->toIso8601String(),
        ]);
    }

    public function serializarAfiliado(Afiliado $af): array
    {
        $af->loadMissing(['user:id,name,email,empresa_gestora_id', 'empresaGestora:id,nome', 'aprovadoPor:id,name']);

        return [
            'id' => $af->id,
            'codigo' => $af->codigo,
            'link' => $af->linkReferencia(),
            'tipo' => $af->tipo,
            'nome' => $af->nome,
            'email' => $af->email,
            'telefone' => $af->telefone,
            'nif' => $af->nif,
            'estado' => $af->estado,
            'estado_label' => $af->estado_label,
            'nivel' => $af->nivel,
            'nivel_label' => $af->nivel_label,
            'taxa_actual_pct' => $this->dec($af->taxa_actual_pct),
            'taxa_manual_pct' => $af->taxa_manual_pct !== null ? $this->dec($af->taxa_manual_pct) : null,
            'iban' => $af->iban,
            'banco' => $af->banco,
            'titular_conta' => $af->titular_conta,
            'como_divulga' => $af->como_divulga,
            'notas_admin' => $af->notas_admin,
            'motivo_recusa' => $af->motivo_recusa,
            'motivo_suspensao' => $af->motivo_suspensao,
            'aprovado_em' => $af->aprovado_em?->toIso8601String(),
            'aprovado_por' => $af->aprovadoPor?->name,
            'suspenso_em' => $af->suspenso_em?->toIso8601String(),
            'total_cliques' => (int) $af->total_cliques,
            'user' => $af->user ? ['id' => $af->user->id, 'name' => $af->user->name, 'email' => $af->user->email] : null,
            'empresa_gestora' => $af->empresaGestora ? ['id' => $af->empresaGestora->id, 'nome' => $af->empresaGestora->nome] : null,
            'dados_pagamento_completos' => ! empty($af->iban) && ! empty($af->titular_conta),
            'created_at' => $af->created_at?->toIso8601String(),
        ];
    }

    public function dec(mixed $v): string
    {
        $s = str_replace([',', ' '], ['.', ''], trim((string) ($v ?? '0')));
        if ($s === '' || ! is_numeric($s)) {
            $s = '0';
        }

        return bcadd($s, '0', 2);
    }
}
