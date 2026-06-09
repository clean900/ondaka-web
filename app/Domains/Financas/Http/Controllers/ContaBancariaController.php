<?php

declare(strict_types=1);

namespace App\Domains\Financas\Http\Controllers;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Financas\Models\ContaBancaria;
use App\Domains\Financas\Models\ContaBancariaMovimento;
use App\Domains\Financas\Services\ContaBancariaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContaBancariaController extends Controller
{
    public function __construct(
        protected ContaBancariaService $service,
    ) {}

    /**
     * Listar contas do condomínio activo. Mostra movimentos da conta seleccionada (ou da principal).
     */
    public function index(Request $request): Response
    {
        $condominio = $this->resolverCondominio($request);

        $contas = ContaBancaria::where('condominio_id', $condominio->id)
            ->orderByDesc('principal')
            ->orderBy('id')
            ->get();

        $contaSeleccionadaId = $request->integer('conta_id') ?: $contas->firstWhere('principal', true)?->id;
        $contaSeleccionada = $contaSeleccionadaId
            ? $contas->firstWhere('id', $contaSeleccionadaId)
            : null;

        $movimentos = $contaSeleccionada
            ? $contaSeleccionada->movimentos()->with('criadoPor:id,name')->paginate(20)->withQueryString()
            : null;

        // Lista de condominios da empresa gestora (para o selector)
        $condominios = Condominio::where('empresa_gestora_id', $condominio->empresa_gestora_id)
            ->orderBy('nome')
            ->get(['id', 'nome']);

        return Inertia::render('Financas/ContasBancarias/Index', [
            'condominio' => $condominio->only(['id', 'nome']),
            'condominios' => $condominios,
            'contas' => $contas,
            'contaSeleccionadaId' => $contaSeleccionada?->id,
            'movimentos' => $movimentos,
        ]);
    }

    /**
     * Criar nova conta bancária.
     */
    public function store(Request $request): RedirectResponse
    {
        $condominio = $this->resolverCondominio($request);

        $data = $request->validate([
            'nome' => 'required|string|max:100',
            'banco' => 'required|string|max:80',
            'iban' => 'nullable|string|max:50',
            'tipo' => 'required|in:corrente,poupanca',
            'moeda' => 'nullable|string|size:3',
            'saldo_inicial' => 'nullable|numeric|min:0',
            'notas' => 'nullable|string|max:1000',
            'principal' => 'boolean',
            'aceita_proxypay' => 'boolean',
            'aceita_manual' => 'boolean',
            'instrucoes_pagamento' => 'nullable|string|max:2000',
        ]);

        $conta = $this->service->criar($condominio->id, $data);

        return redirect()->route('financas.contas-bancarias.index', ['conta_id' => $conta->id])
            ->with('success', 'Conta bancária criada com sucesso.');
    }

    /**
     * Actualizar dados da conta.
     */
    public function update(Request $request, ContaBancaria $conta): RedirectResponse
    {
        $this->autorizar($request, $conta);

        $data = $request->validate([
            'nome' => 'required|string|max:100',
            'banco' => 'required|string|max:80',
            'iban' => 'nullable|string|max:50',
            'tipo' => 'required|in:corrente,poupanca',
            'moeda' => 'nullable|string|size:3',
            'notas' => 'nullable|string|max:1000',
            'activa' => 'boolean',
            'principal' => 'boolean',
            'aceita_proxypay' => 'boolean',
            'aceita_manual' => 'boolean',
            'instrucoes_pagamento' => 'nullable|string|max:2000',
        ]);

        $this->service->actualizar($conta, $data);

        return back()->with('success', 'Conta bancária actualizada.');
    }

    /**
     * Marcar conta como principal.
     */
    public function marcarPrincipal(Request $request, ContaBancaria $conta): RedirectResponse
    {
        $this->autorizar($request, $conta);
        $this->service->marcarPrincipal($conta);

        return back()->with('success', "Conta '{$conta->nome}' marcada como principal.");
    }

    /**
     * Apagar conta (com confirmação no frontend).
     */
    public function destroy(Request $request, ContaBancaria $conta): RedirectResponse
    {
        $this->autorizar($request, $conta);
        $this->service->apagar($conta);

        return redirect()->route('financas.contas-bancarias.index')
            ->with('success', 'Conta bancária eliminada.');
    }

    /**
     * Adicionar movimento manual a uma conta específica.
     */
    public function adicionarMovimento(Request $request, ContaBancaria $conta): RedirectResponse
    {
        $this->autorizar($request, $conta);

        $data = $request->validate([
            'data' => 'required|date|before_or_equal:today',
            'tipo' => 'required|in:entrada,saida',
            'descricao' => 'required|string|max:200',
            'valor' => 'required|numeric|min:0.01',
        ]);

        $this->service->adicionarMovimento($conta, $data);

        return back(303)->with('success', 'Movimento registado.');
    }

    /**
     * Apagar movimento e recalcular saldos.
     */
    public function apagarMovimento(Request $request, ContaBancariaMovimento $movimento): RedirectResponse
    {
        $this->autorizar($request, $movimento->conta);
        $this->service->apagarMovimento($movimento);

        return back()->with('success', 'Movimento apagado.');
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers privados
    // ─────────────────────────────────────────────────────────────

    /**
     * Troca o condominio activo do user (valida tenancy: tem de ser da mesma empresa gestora).
     */
    public function trocarCondominio(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'condominio_id' => ['required', 'integer', 'exists:condominios,id'],
        ]);

        $user = $request->user();
        $actual = $this->resolverCondominio($request);

        $novo = Condominio::where('id', $validated['condominio_id'])
            ->where('empresa_gestora_id', $actual->empresa_gestora_id)
            ->first();

        if (! $novo) {
            return back()->with('erro', 'Condomínio inválido ou de outra empresa gestora.');
        }

        $user->update(['condominio_activo_id' => $novo->id]);

        return redirect()->route('financas.contas-bancarias.index');
    }

    private function resolverCondominio(Request $request): Condominio
    {
        $user = $request->user();
        $condominioId = $user->condominio_activo_id ?? null;

        if (!$condominioId) {
            abort(400, 'Selecciona um condomínio activo primeiro.');
        }

        return Condominio::findOrFail($condominioId);
    }

    private function autorizar(Request $request, ContaBancaria $conta): void
    {
        $condominio = $this->resolverCondominio($request);
        if ($conta->condominio_id !== $condominio->id) {
            abort(403, 'Não tens acesso a esta conta bancária.');
        }
    }
}
