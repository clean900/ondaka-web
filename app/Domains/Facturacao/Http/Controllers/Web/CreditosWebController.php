<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Http\Controllers\Web;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Facturacao\Models\CreditoFraccao;
use App\Domains\Facturacao\Models\Lancamento;
use App\Domains\Facturacao\Services\CreditoFraccaoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CreditosWebController extends Controller
{
    public function __construct(protected CreditoFraccaoService $service) {}

    /**
     * GET /creditos
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;

        $stats = [
            'total' => CreditoFraccao::where('empresa_gestora_id', $empresaId)->count(),
            'com_saldo' => CreditoFraccao::where('empresa_gestora_id', $empresaId)
                ->whereRaw('valor > valor_usado')
                ->count(),
            'esgotados' => CreditoFraccao::where('empresa_gestora_id', $empresaId)
                ->whereRaw('valor <= valor_usado')
                ->count(),
            'saldo_total_disponivel' => (string) CreditoFraccao::where('empresa_gestora_id', $empresaId)
                ->whereRaw('valor > valor_usado')
                ->sum(DB::raw('valor - valor_usado')),
        ];

        $query = CreditoFraccao::query()
            ->where('empresa_gestora_id', $empresaId)
            ->with([
                'fraccao:id,identificador,condominio_id',
                'condominio:id,nome',
                'condomino:id,nome_completo',
                'pagamentoOrigem:id,referencia',
                'createdBy:id,name',
            ])
            ->orderByDesc('id');

        if ($condominioId = $request->query('condominio_id')) {
            $query->where('condominio_id', $condominioId);
        }
        if ($request->query('com_saldo') === '1') {
            $query->whereRaw('valor > valor_usado');
        }
        if ($fraccaoId = $request->query('fraccao_id')) {
            $query->where('fraccao_id', $fraccaoId);
        }

        $creditos = $query->paginate(30)->withQueryString();

        // Para cada crédito com saldo, carregar lançamentos em aberto da mesma fracção
        $fraccaoIds = collect($creditos->items())
            ->filter(fn ($c) => bccomp((string) $c->valor, (string) $c->valor_usado, 2) > 0)
            ->pluck('fraccao_id')
            ->unique()
            ->values();

        $lancamentosPorFraccao = [];
        if ($fraccaoIds->isNotEmpty()) {
            $lancamentos = Lancamento::query()
                ->where('empresa_gestora_id', $empresaId)
                ->whereIn('fraccao_id', $fraccaoIds)
                ->whereIn('estado', [Lancamento::ESTADO_EM_ABERTO, Lancamento::ESTADO_PAGO_PARCIAL])
                ->orderBy('data_vencimento')
                ->get(['id', 'fraccao_id', 'tipo', 'descricao', 'valor', 'valor_pago', 'data_vencimento']);

            foreach ($lancamentos as $l) {
                $lancamentosPorFraccao[$l->fraccao_id][] = [
                    'id' => $l->id,
                    'tipo' => $l->tipo,
                    'descricao' => $l->descricao,
                    'valor' => (string) $l->valor,
                    'valor_pago' => (string) $l->valor_pago,
                    'em_divida' => bcsub((string) $l->valor, (string) $l->valor_pago, 2),
                    'data_vencimento' => $l->data_vencimento?->toDateString(),
                ];
            }
        }

        $condominios = Condominio::query()
            ->where('empresa_gestora_id', $empresaId)
            ->select('id', 'nome')
            ->orderBy('nome')
            ->get();

        return Inertia::render('Creditos/Index', [
            'creditos' => $creditos,
            'stats' => $stats,
            'condominios' => $condominios,
            'lancamentosPorFraccao' => $lancamentosPorFraccao,
            'filtros' => [
                'condominio_id' => $request->query('condominio_id'),
                'fraccao_id' => $request->query('fraccao_id'),
                'com_saldo' => $request->query('com_saldo'),
            ],
        ]);
    }

    /**
     * POST /creditos/{credito}/usar
     */
    public function usar(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();

        $credito = CreditoFraccao::query()
            ->where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->firstOrFail();

        $validated = $request->validate([
            'lancamento_id' => ['required', 'integer', 'exists:lancamentos_condomino,id'],
            'valor' => ['required', 'numeric', 'min:0.01'],
        ]);

        $lancamento = Lancamento::query()
            ->where('id', $validated['lancamento_id'])
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->firstOrFail();

        try {
            $pagamento = $this->service->usarCredito(
                $credito,
                $lancamento,
                (string) $validated['valor'],
                $user
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['usar_credito' => $e->getMessage()]);
        }

        return back()->with(
            'flash.success',
            "Crédito usado: {$validated['valor']} Kz aplicados ao lançamento #{$lancamento->id}. Pagamento {$pagamento->referencia} criado."
        );
    }
}
