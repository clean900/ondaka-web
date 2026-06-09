<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Http\Controllers\Web;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Facturacao\Models\Lancamento;
use App\Domains\Facturacao\Services\LancamentoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * UI Inertia/React para admin gerir lançamentos manuais.
 *
 * Lançamentos manuais = despesas extras, ajustes débito, ajustes crédito.
 * Quotas mensais são geridas via QuotaService (não passam por aqui).
 *
 * URL base: /lancamentos (dentro do menu Facturação)
 *
 * Tenancy automática por empresa_gestora_id.
 */
class LancamentosWebController extends Controller
{
    public function __construct(protected LancamentoService $service) {}

    /**
     * GET /lancamentos
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;

        $tiposManuais = [
            Lancamento::TIPO_DESPESA_EXTRA,
            Lancamento::TIPO_AJUSTE_DEBITO,
            Lancamento::TIPO_AJUSTE_CREDITO,
        ];

        $statsBase = Lancamento::where('empresa_gestora_id', $empresaId)
            ->whereIn('tipo', $tiposManuais);

        $stats = [
            'total' => (clone $statsBase)->count(),
            'em_aberto' => (clone $statsBase)
                ->whereIn('estado', [Lancamento::ESTADO_EM_ABERTO, Lancamento::ESTADO_PAGO_PARCIAL])
                ->count(),
            'pagos' => (clone $statsBase)
                ->where('estado', Lancamento::ESTADO_PAGO)
                ->count(),
            'cancelados' => (clone $statsBase)
                ->where('estado', Lancamento::ESTADO_CANCELADO)
                ->count(),
            'valor_em_aberto' => (string) (clone $statsBase)
                ->whereIn('estado', [Lancamento::ESTADO_EM_ABERTO, Lancamento::ESTADO_PAGO_PARCIAL])
                ->sum(DB::raw('valor - valor_pago')),
        ];

        $query = Lancamento::query()
            ->where('empresa_gestora_id', $empresaId)
            ->whereIn('tipo', $tiposManuais)
            ->with([
                'fraccao:id,identificador,condominio_id',
                'condominio:id,nome',
                'condomino:id,nome_completo',
                'criadoPor:id,name',
            ])
            ->orderByDesc('data_lancamento')
            ->orderByDesc('id');

        if ($condominioId = $request->query('condominio_id')) {
            $query->where('condominio_id', $condominioId);
        }
        if ($fraccaoId = $request->query('fraccao_id')) {
            $query->where('fraccao_id', $fraccaoId);
        }
        if ($tipo = $request->query('tipo')) {
            $query->where('tipo', $tipo);
        }
        if ($estado = $request->query('estado')) {
            $query->where('estado', $estado);
        }

        $lancamentos = $query->paginate(30)->withQueryString();

        $condominios = Condominio::query()
            ->where('empresa_gestora_id', $empresaId)
            ->select('id', 'nome')
            ->orderBy('nome')
            ->get();

        // Fracções por condomínio (para o modal "Nova despesa")
        $fraccoesPorCondominio = [];
        $fraccoes = Fraccao::query()
            ->where('empresa_gestora_id', $empresaId)
            ->select('id', 'identificador', 'condominio_id')
            ->orderBy('identificador')
            ->get();

        foreach ($fraccoes as $f) {
            $fraccoesPorCondominio[$f->condominio_id][] = [
                'id' => $f->id,
                'identificador' => $f->identificador,
            ];
        }

        
        // ===== DASHBOARD DE DESPESAS =====
        $hoje = now();
        $inicioAno = $hoje->copy()->startOfYear();
        $inicioMes = $hoje->copy()->startOfMonth();
        $inicioMesAnt = $hoje->copy()->subMonth()->startOfMonth();
        $fimMesAnt = $hoje->copy()->subMonth()->endOfMonth();

        $baseDespesas = Lancamento::where('empresa_gestora_id', $empresaId)
            ->where('tipo', Lancamento::TIPO_DESPESA_EXTRA)
            ->where('estado', '!=', Lancamento::ESTADO_CANCELADO);

        $totalAno = (string) (clone $baseDespesas)
            ->where('data_lancamento', '>=', $inicioAno)
            ->sum('valor');

        $totalMes = (string) (clone $baseDespesas)
            ->where('data_lancamento', '>=', $inicioMes)
            ->sum('valor');

        $totalMesAnt = (string) (clone $baseDespesas)
            ->whereBetween('data_lancamento', [$inicioMesAnt, $fimMesAnt])
            ->sum('valor');

        $totalMesNum = (float) $totalMes;
        $totalMesAntNum = (float) $totalMesAnt;
        $variacaoPct = $totalMesAntNum > 0
            ? round((($totalMesNum - $totalMesAntNum) / $totalMesAntNum) * 100, 1)
            : ($totalMesNum > 0 ? 100.0 : 0.0);

        // Despesas mensais ultimos 12 meses
        $despesasMensais = (clone $baseDespesas)
            ->where('data_lancamento', '>=', $hoje->copy()->subMonths(11)->startOfMonth())
            ->selectRaw("DATE_FORMAT(data_lancamento, '%Y-%m') AS mes, SUM(valor) AS total")
            ->groupBy('mes')
            ->orderBy('mes')
            ->pluck('total', 'mes')
            ->all();

        // Top 5 descricoes (categorias)
        $topCategorias = (clone $baseDespesas)
            ->where('data_lancamento', '>=', $inicioAno)
            ->selectRaw('descricao, COUNT(*) AS qty, SUM(valor) AS total')
            ->groupBy('descricao')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'descricao' => $r->descricao,
                'qty' => (int) $r->qty,
                'total' => (string) $r->total,
            ])
            ->all();

        // Top 10 maiores lancamentos do ano
        $topLancamentos = (clone $baseDespesas)
            ->where('data_lancamento', '>=', $inicioAno)
            ->orderByDesc('valor')
            ->limit(10)
            ->get(['id', 'descricao', 'valor', 'data_lancamento', 'estado'])
            ->map(fn ($l) => [
                'id' => $l->id,
                'descricao' => $l->descricao,
                'valor' => (string) $l->valor,
                'data_lancamento' => $l->data_lancamento?->format('Y-m-d'),
                'estado' => $l->estado,
            ])
            ->all();

        $dashboard = [
            'total_ano' => $totalAno,
            'total_mes' => $totalMes,
            'total_mes_anterior' => $totalMesAnt,
            'variacao_pct' => $variacaoPct,
            'mensais' => $despesasMensais,
            'top_categorias' => $topCategorias,
            'top_lancamentos' => $topLancamentos,
        ];

        return Inertia::render('Lancamentos/Index', [
            'lancamentos' => $lancamentos,
            'stats' => $stats,
            'dashboard' => $dashboard,
            'condominios' => $condominios,
            'fraccoesPorCondominio' => $fraccoesPorCondominio,
            'filtros' => [
                'condominio_id' => $request->query('condominio_id'),
                'fraccao_id' => $request->query('fraccao_id'),
                'tipo' => $request->query('tipo'),
                'estado' => $request->query('estado'),
            ],
        ]);
    }

    /**
     * POST /lancamentos
     * Cria N lançamentos (1 ou várias fracções do mesmo condomínio).
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'condominio_id' => ['required', 'integer', 'exists:condominios,id'],
            'fraccao_ids' => ['required', 'array', 'min:1'],
            'fraccao_ids.*' => ['integer', 'exists:fraccoes,id'],
            'tipo' => ['required', 'string', 'in:despesa_extra,ajuste_debito,ajuste_credito'],
            'descricao' => ['required', 'string', 'min:3', 'max:255'],
            'valor' => ['required', 'numeric', 'min:0.01'],
            'data_vencimento' => ['nullable', 'date'],
            'detalhes' => ['nullable', 'string', 'max:5000'],
            'observacoes' => ['nullable', 'string', 'max:5000'],
        ]);

        $condominio = Condominio::findOrFail($validated['condominio_id']);
        if ($condominio->empresa_gestora_id !== $user->empresa_gestora_id) {
            abort(403, 'Condomínio não pertence à empresa do utilizador.');
        }

        $fraccoes = Fraccao::whereIn('id', $validated['fraccao_ids'])
            ->where('condominio_id', $condominio->id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->get();

        if ($fraccoes->count() !== count($validated['fraccao_ids'])) {
            return back()->withErrors([
                'fraccao_ids' => 'Algumas fracções não pertencem ao condomínio seleccionado.',
            ])->withInput();
        }

        $criados = 0;
        $erros = [];

        DB::transaction(function () use ($fraccoes, $validated, $user, &$criados, &$erros) {
            foreach ($fraccoes as $fraccao) {
                try {
                    $this->service->criarDespesaExtra([
                        'fraccao_id' => $fraccao->id,
                        'tipo' => $validated['tipo'],
                        'descricao' => $validated['descricao'],
                        'valor' => (float) $validated['valor'],
                        'data_vencimento' => $validated['data_vencimento'] ?? null,
                        'detalhes' => $validated['detalhes'] ?? null,
                        'observacoes' => $validated['observacoes'] ?? null,
                    ], $user);
                    $criados++;
                } catch (\Throwable $e) {
                    $erros[] = "Fracção {$fraccao->identificador}: " . $e->getMessage();
                }
            }
        });

        if ($criados === 0) {
            return back()->withErrors([
                'store' => 'Não foi possível criar nenhum lançamento. ' . implode(' | ', $erros),
            ])->withInput();
        }

        $msg = "Lançamentos criados: {$criados}";
        if (! empty($erros)) {
            $msg .= " (com " . count($erros) . " erros: " . implode(' | ', $erros) . ")";
        }

        return redirect()
            ->route('lancamentos.index', ['condominio_id' => $condominio->id])
            ->with('flash.success', $msg);
    }

    /**
     * POST /lancamentos/{id}/cancelar
     */
    public function cancelar(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();

        $lancamento = Lancamento::query()
            ->where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->firstOrFail();

        $validated = $request->validate([
            'motivo' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        try {
            $this->service->cancelarLancamento($lancamento, $user, $validated['motivo']);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['cancelar' => $e->getMessage()]);
        }

        return back()->with('flash.success', "Lançamento cancelado (#{$lancamento->id}).");
    }
}
