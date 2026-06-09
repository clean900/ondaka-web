<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Http\Controllers\Web;

use App\Domains\Facturacao\Models\Lancamento;
use App\Domains\Facturacao\Models\CreditoFraccao;
use App\Domains\Facturacao\Models\Pagamento;
use App\Domains\Facturacao\Services\PagamentoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * UI Inertia/React para admin gerir pagamentos B2C.
 *
 * Tenancy automática por empresa_gestora_id.
 */
class PagamentosWebController extends Controller
{
    public function __construct(protected PagamentoService $service) {}

    /**
     * GET /admin/pagamentos
     * Lista de pagamentos com filtros.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Stats
        $stats = [
            'pendentes' => Pagamento::where('empresa_gestora_id', $user->empresa_gestora_id)
                ->where('estado', Pagamento::ESTADO_PENDENTE)
                ->count(),
            'em_revisao' => Pagamento::where('empresa_gestora_id', $user->empresa_gestora_id)
                ->where('estado', Pagamento::ESTADO_EM_REVISAO)
                ->count(),
            'confirmados_mes' => Pagamento::where('empresa_gestora_id', $user->empresa_gestora_id)
                ->where('estado', Pagamento::ESTADO_CONFIRMADO)
                ->whereMonth('confirmado_em', now()->month)
                ->whereYear('confirmado_em', now()->year)
                ->count(),
            'valor_confirmado_mes' => (string) Pagamento::where('empresa_gestora_id', $user->empresa_gestora_id)
                ->where('estado', Pagamento::ESTADO_CONFIRMADO)
                ->whereMonth('confirmado_em', now()->month)
                ->whereYear('confirmado_em', now()->year)
                ->sum('valor'),
        ];

        // Lista
        $query = Pagamento::query()
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->with(['fraccao:id,identificador', 'condomino:id,nome_completo', 'condominio:id,nome'])
            ->orderByDesc('created_at');

        if ($estado = $request->query('estado')) {
            $query->where('estado', $estado);
        }
        if ($fraccaoId = $request->query('fraccao_id')) {
            $query->where('fraccao_id', $fraccaoId);
        }
        if ($condominioId = $request->query('condominio_id')) {
            $query->where('condominio_id', $condominioId);
        }
        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('referencia', 'like', "%{$search}%")
                    ->orWhereHas('condomino', fn ($c) => $c->where('nome_completo', 'like', "%{$search}%"));
            });
        }

        $pagamentos = $query->paginate(20)->withQueryString();

        return Inertia::render('Pagamentos/Index', [
            'pagamentos' => $pagamentos,
            'stats' => $stats,
            'filtros' => [
                'estado' => $request->query('estado'),
                'fraccao_id' => $request->query('fraccao_id'),
                'condominio_id' => $request->query('condominio_id'),
                'q' => $request->query('q'),
            ],
        ]);
    }

    /**
     * GET /admin/pagamentos/{id}
     */
    public function show(Request $request, int $id): Response
    {
        $user = $request->user();

        $pagamento = Pagamento::query()
            ->where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->with([
                'fraccao:id,identificador,condominio_id',
                'condomino:id,nome_completo,numero_bi',
                'condominio:id,nome',
                'imputacoes.lancamento',
                'registadoPor:id,name',
                'confirmadoPor:id,name',
            ])
            ->firstOrFail();

        // Buscar lançamentos em aberto da fracção (para admin imputar)
        $lancamentosEmAberto = Lancamento::query()
            ->where('fraccao_id', $pagamento->fraccao_id)
            ->emAberto()
            ->orderBy('data_vencimento')
            ->get()
            ->map(fn ($l) => [
                'id' => $l->id,
                'tipo' => $l->tipo,
                'descricao' => $l->descricao,
                'data_vencimento' => $l->data_vencimento?->toDateString(),
                'valor' => (string) $l->valor,
                'valor_pago' => (string) $l->valor_pago,
                'valor_em_divida' => bcsub((string) $l->valor, (string) $l->valor_pago, 2),
                'em_atraso' => $l->estaEmAtraso(),
            ]);

        // Créditos da fracção (com saldo)
        $creditosFraccao = CreditoFraccao::query()
            ->where('fraccao_id', $pagamento->fraccao_id)
            ->whereRaw('valor > valor_usado')
            ->orderByDesc('id')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'valor' => (string) $c->valor,
                'valor_usado' => (string) $c->valor_usado,
                'saldo' => $c->saldoDisponivel(),
                'descricao' => $c->descricao,
                'pagamento_origem_referencia' => $c->pagamentoOrigem?->referencia,
            ]);

        return Inertia::render('Pagamentos/Show', [
            'pagamento' => array_merge($pagamento->toArray(), [
                'comprovativo_url' => $pagamento->comprovativo_path
                    ? route('pagamentos.ver-comprovativo', $pagamento->id)
                    : null,
                'tem_confirmacao_pdf' => $pagamento->estado === Pagamento::ESTADO_CONFIRMADO,
            ]),
            'lancamentos_em_aberto' => $lancamentosEmAberto,
            'creditos_fraccao' => $creditosFraccao,
        ]);
    }

    /**
     * GET /admin/pagamentos/{id}/confirmacao-pdf
     * Descarrega a Confirmacao de Pagamento (PDF) — admin/gestor da empresa.
     */
    public function confirmacaoPdf(Request $request, int $id)
    {
        $user = $request->user();
        $pagamento = Pagamento::query()
            ->where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->firstOrFail();

        if ($pagamento->estado !== Pagamento::ESTADO_CONFIRMADO) {
            abort(422, 'Confirmacao disponivel apenas para pagamentos confirmados.');
        }

        // Gerar on-demand se faltar (cobre pagamentos confirmados antes desta feature)
        if (! $pagamento->confirmacao_pdf_path
            || ! \Illuminate\Support\Facades\Storage::disk('public')->exists($pagamento->confirmacao_pdf_path)) {
            $path = app(\App\Domains\Facturacao\Services\ConfirmacaoPagamentoPdfService::class)
                ->gerarEGuardar($pagamento);
            if (! $path) {
                abort(500, 'Nao foi possivel gerar a confirmacao.');
            }
            $pagamento->update(['confirmacao_pdf_path' => $path]);
            $pagamento->refresh();
        }

        $fullPath = \Illuminate\Support\Facades\Storage::disk('public')->path($pagamento->confirmacao_pdf_path);

        return response()->download($fullPath, 'Confirmacao-' . $pagamento->referencia . '.pdf', [
            'Content-Type' => 'application/pdf',
        ]);
    }

    /**
     * GET /admin/pagamentos/{id}/comprovativo
     */
    public function comprovativo(Request $request, int $id)
    {
        $user = $request->user();
        $pagamento = Pagamento::query()
            ->where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->firstOrFail();
        if (! $pagamento->comprovativo_path
            || ! \Illuminate\Support\Facades\Storage::disk('public')->exists($pagamento->comprovativo_path)) {
            abort(404, 'Comprovativo nao encontrado.');
        }
        $fullPath = \Illuminate\Support\Facades\Storage::disk('public')->path($pagamento->comprovativo_path);
        $mime = $pagamento->comprovativo_mime ?: \Illuminate\Support\Facades\File::mimeType($fullPath);
        return response()->file($fullPath, ['Content-Type' => $mime]);
    }

    /**
     * POST /admin/pagamentos/{id}/confirmar
     */
    public function confirmar(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();

        $pagamento = Pagamento::query()
            ->where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->firstOrFail();

        $request->validate([
            'imputacoes' => ['nullable', 'array'],
            'imputacoes.*.lancamento_id' => ['required_with:imputacoes', 'integer', 'exists:lancamentos_condomino,id'],
            'imputacoes.*.valor' => ['required_with:imputacoes', 'numeric', 'min:0.01'],
        ]);

        $imputacoes = $request->input('imputacoes');
        if (is_array($imputacoes)) {
            $imputacoes = array_map(fn ($i) => [
                'lancamento_id' => (int) $i['lancamento_id'],
                'valor' => number_format((float) $i['valor'], 2, '.', ''),
            ], $imputacoes);
        }

        try {
            $this->service->confirmarPagamento($pagamento, $user, $imputacoes);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['confirmar' => $e->getMessage()]);
        }

        return redirect()->route('pagamentos.index')
            ->with('flash.success', 'Pagamento confirmado.');
    }

    /**
     * POST /pagamentos/{id}/devolver
     * Devolve pagamento confirmado — dinheiro tem que sair fisicamente.
     */
    public function devolver(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();

        $pagamento = Pagamento::query()
            ->where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->firstOrFail();

        $validated = $request->validate([
            'motivo' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        try {
            $this->service->devolverPagamento($pagamento, $user, $validated['motivo']);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['devolver' => $e->getMessage()]);
        }

        return redirect()->route('pagamentos.index')
            ->with('flash.success', 'Pagamento devolvido. Lançamentos voltaram ao estado original.');
    }

    /**
     * POST /pagamentos/{id}/converter-credito
     * Converte pagamento em crédito da fracção.
     */
    public function converterCredito(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();

        $pagamento = Pagamento::query()
            ->where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->firstOrFail();

        $validated = $request->validate([
            'motivo' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        try {
            $credito = $this->service->converterEmCredito($pagamento, $user, $validated['motivo']);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['converter' => $e->getMessage()]);
        }

        return redirect()->route('pagamentos.index')
            ->with('flash.success', 'Pagamento convertido em crédito #' . $credito->id . ' (' . $credito->valor . ' Kz).');
    }

    /**
     * POST /admin/pagamentos/{id}/rejeitar
     */
    public function rejeitar(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();

        $pagamento = Pagamento::query()
            ->where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->firstOrFail();

        $request->validate([
            'motivo' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        try {
            $this->service->rejeitarPagamento($pagamento, $user, $request->input('motivo'));
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['rejeitar' => $e->getMessage()]);
        }

        return redirect()->route('pagamentos.index')
            ->with('flash.success', 'Pagamento rejeitado.');
    }
}
