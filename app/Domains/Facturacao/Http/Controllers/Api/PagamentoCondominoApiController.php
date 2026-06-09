<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Http\Controllers\Api;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Facturacao\Models\Pagamento;
use App\Domains\Facturacao\Services\PagamentoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * API endpoints para o condómino gerir os seus pagamentos.
 */
class PagamentoCondominoApiController extends Controller
{
    public function __construct(protected PagamentoService $service) {}

    /**
     * GET /api/extracto/pagamentos
     * Lista os pagamentos do condómino autenticado.
     */
    public function index(Request $request): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }

        $pagamentos = Pagamento::query()
            ->where('condomino_id', $condomino->id)
            ->with(['fraccao:id,identificador', 'imputacoes.lancamento:id,descricao'])
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn ($p) => $this->serializar($p));

        return response()->json(['data' => $pagamentos]);
    }

    /**
     * GET /api/extracto/pagamentos/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }

        $pagamento = Pagamento::with(['fraccao:id,identificador', 'imputacoes.lancamento'])
            ->where('id', $id)
            ->where('condomino_id', $condomino->id)
            ->first();

        if (! $pagamento) {
            return response()->json(['message' => 'Pagamento não encontrado.'], 404);
        }

        return response()->json(['data' => $this->serializar($pagamento, detalhado: true)]);
    }

    /**
     * GET /api/extracto/pagamentos/{id}/confirmacao-pdf
     * Descarrega a Confirmacao de Pagamento (PDF) do proprio condomino.
     */
    public function confirmacaoPdf(Request $request, int $id)
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }

        $pagamento = Pagamento::where('id', $id)
            ->where('condomino_id', $condomino->id)
            ->first();

        if (! $pagamento) {
            return response()->json(['message' => 'Pagamento nao encontrado.'], 404);
        }

        if ($pagamento->estado !== Pagamento::ESTADO_CONFIRMADO) {
            return response()->json(['message' => 'Confirmacao disponivel apenas para pagamentos confirmados.'], 422);
        }

        // Gerar on-demand se ainda nao existir em disco (defensivo)
        if (! $pagamento->confirmacao_pdf_path
            || ! \Illuminate\Support\Facades\Storage::disk('public')->exists($pagamento->confirmacao_pdf_path)) {
            $path = app(\App\Domains\Facturacao\Services\ConfirmacaoPagamentoPdfService::class)
                ->gerarEGuardar($pagamento);
            if (! $path) {
                return response()->json(['message' => 'Nao foi possivel gerar a confirmacao.'], 500);
            }
            $pagamento->update(['confirmacao_pdf_path' => $path]);
            $pagamento->refresh();
        }

        $fullPath = \Illuminate\Support\Facades\Storage::disk('public')->path($pagamento->confirmacao_pdf_path);
        $nomeDownload = 'Confirmacao-' . $pagamento->referencia . '.pdf';

        return response()->download($fullPath, $nomeDownload, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    /**
     * POST /api/extracto/pagamentos
     * Submeter novo pagamento.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fraccao_id' => ['required', 'integer', 'exists:fraccoes,id'],
            'conta_bancaria_id' => ['nullable', 'integer', 'exists:contas_bancarias,id'],
            'metodo' => ['required', 'string', 'in:transferencia_bancaria,deposito_bancario,proxypay_rps,dinheiro,outro'],
            'valor' => ['required', 'numeric', 'min:0.01'],
            'data_pagamento' => ['required', 'date_format:Y-m-d'],
            'lancamento_ids' => ['nullable', 'array'],
            'lancamento_ids.*' => ['integer', 'exists:lancamentos_condomino,id'],
            'referencia_externa' => ['nullable', 'string', 'max:100'],
            'banco_origem' => ['nullable', 'string', 'max:100'],
            'notas_condomino' => ['nullable', 'string', 'max:1000'],
            'comprovativo' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // 5MB
        ]);

        $dados = $validated;

        // Processar upload se enviado
        if ($request->hasFile('comprovativo')) {
            $file = $request->file('comprovativo');
            $nome = 'pag-' . now()->format('YmdHis') . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('pagamentos', $nome, 'public');

            $dados['comprovativo'] = [
                'path' => $path,
                'nome_original' => $file->getClientOriginalName(),
                'mime' => $file->getMimeType(),
                'tamanho' => $file->getSize(),
            ];
        }

        // Garantir que o valor é string (para bcmath)
        $dados['valor'] = number_format((float) $dados['valor'], 2, '.', '');

        try {
            $pagamento = $this->service->criarPagamentoCondomino($dados, $request->user());
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'data' => $this->serializar($pagamento, detalhado: true),
            'message' => 'Pagamento submetido. Aguarda validação.',
        ], 201);
    }

    /**
     * PATCH /api/extracto/pagamentos/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }

        $pagamento = Pagamento::where('id', $id)
            ->where('condomino_id', $condomino->id)
            ->first();

        if (! $pagamento) {
            return response()->json(['message' => 'Pagamento não encontrado.'], 404);
        }

        $validated = $request->validate([
            'metodo' => ['nullable', 'string', 'in:transferencia_bancaria,deposito_bancario,proxypay_rps,dinheiro,outro'],
            'valor' => ['nullable', 'numeric', 'min:0.01'],
            'data_pagamento' => ['nullable', 'date_format:Y-m-d'],
            'lancamento_ids' => ['nullable', 'array'],
            'lancamento_ids.*' => ['integer', 'exists:lancamentos_condomino,id'],
            'referencia_externa' => ['nullable', 'string', 'max:100'],
            'banco_origem' => ['nullable', 'string', 'max:100'],
            'notas_condomino' => ['nullable', 'string', 'max:1000'],
            'comprovativo' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $dados = array_filter($validated, fn ($v) => $v !== null);

        if (isset($dados['valor'])) {
            $dados['valor'] = number_format((float) $dados['valor'], 2, '.', '');
        }

        if ($request->hasFile('comprovativo')) {
            $file = $request->file('comprovativo');

            // Apagar anterior se existir
            if ($pagamento->comprovativo_path) {
                Storage::disk('public')->delete($pagamento->comprovativo_path);
            }

            $nome = 'pag-' . now()->format('YmdHis') . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('pagamentos', $nome, 'public');

            $dados['comprovativo'] = [
                'path' => $path,
                'nome_original' => $file->getClientOriginalName(),
                'mime' => $file->getMimeType(),
                'tamanho' => $file->getSize(),
            ];
        }

        try {
            $pagamento = $this->service->editarPagamento($pagamento, $dados, $request->user());
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'data' => $this->serializar($pagamento->load(['imputacoes.lancamento']), detalhado: true),
        ]);
    }

    /**
     * DELETE /api/extracto/pagamentos/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }

        $pagamento = Pagamento::where('id', $id)
            ->where('condomino_id', $condomino->id)
            ->first();

        if (! $pagamento) {
            return response()->json(['message' => 'Pagamento não encontrado.'], 404);
        }

        try {
            $this->service->cancelarPagamento($pagamento, $request->user());
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Pagamento cancelado.']);
    }

    /**
     * GET /api/extracto/pagamentos/lancamentos-em-aberto
     */
    public function lancamentosEmAberto(Request $request): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }

        $fraccoesIds = \App\Domains\Condomino\Models\ContratoOcupacao::where('condomino_id', $condomino->id)
            ->where('estado', 'activo')
            ->pluck('fraccao_id')
            ->toArray();

        if (empty($fraccoesIds)) {
            return response()->json(['data' => []]);
        }

        $lancamentos = \App\Domains\Facturacao\Models\Lancamento::query()
            ->whereIn('fraccao_id', $fraccoesIds)
            ->emAberto()
            ->with('fraccao:id,identificador')
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
                'fraccao' => [
                    'id' => $l->fraccao_id,
                    'identificador' => $l->fraccao?->identificador,
                ],
            ]);

        return response()->json(['data' => $lancamentos]);
    }

    /**
     * GET /api/extracto/pagamentos/coordenadas-bancarias
     * Devolve dados bancarios do condominio do condomino para
     * mostrar no form de pagamento (transferencia/deposito).
     */
    public function coordenadasBancarias(Request $request): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }

        $fraccao = \App\Domains\Condomino\Models\ContratoOcupacao::where('condomino_id', $condomino->id)
            ->where('estado', 'activo')
            ->with('fraccao:id,condominio_id,empresa_gestora_id,identificador')
            ->first()?->fraccao;

        if (! $fraccao) {
            return response()->json(['data' => null]);
        }

        $config = \App\Domains\Facturacao\Models\CondominioFacturacaoConfig::where('condominio_id', $fraccao->condominio_id)
            ->first();

        if (! $config) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => [
                'banco_nome' => $config->banco_nome,
                'iban' => $config->iban,
                'numero_conta' => $config->numero_conta,
                'titular_conta' => $config->titular_conta,
                'nif_emissor' => $config->nif_emissor,
                'observacoes_facturacao' => $config->observacoes_facturacao,
                'fraccao_identificador' => $fraccao->identificador,
            ],
        ]);
    }

    /**
     * GET /api/extracto/pagamentos/contas-disponiveis
     * Devolve as contas bancarias activas do condominio que aceitam pagamento
     * manual (transferencia/deposito), para o condomino escolher onde depositar.
     * Inclui nif_emissor e observacoes da config de facturacao (dados do condominio).
     */
    public function contasDisponiveis(Request $request): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }

        $fraccao = \App\Domains\Condomino\Models\ContratoOcupacao::where('condomino_id', $condomino->id)
            ->where('estado', 'activo')
            ->with('fraccao:id,condominio_id,empresa_gestora_id,identificador')
            ->first()?->fraccao;

        if (! $fraccao) {
            return response()->json(['data' => ['contas' => [], 'config' => null]]);
        }

        $contas = \App\Domains\Financas\Models\ContaBancaria::where('condominio_id', $fraccao->condominio_id)
            ->where('activa', true)
            ->where('aceita_manual', true)
            ->orderByDesc('principal')
            ->orderBy('id')
            ->get(['id', 'nome', 'banco', 'iban', 'instrucoes_pagamento', 'principal'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'nome' => $c->nome,
                'banco' => $c->banco,
                'iban' => $c->iban,
                'instrucoes_pagamento' => $c->instrucoes_pagamento,
                'principal' => (bool) $c->principal,
            ])
            ->values();

        // Dados de facturacao do condominio (NIF emissor + observacoes) — Q4=b
        $config = \App\Domains\Facturacao\Models\CondominioFacturacaoConfig::where('condominio_id', $fraccao->condominio_id)
            ->first();

        // Fallback: sem contas na tabela mas config tem dados bancarios -> usar a config
        if ($contas->isEmpty() && $config && $config->iban) {
            $contas = collect([[
                'id' => null,
                'nome' => $config->titular_conta ?: 'Conta do condominio',
                'banco' => $config->banco_nome,
                'iban' => $config->iban,
                'instrucoes_pagamento' => null,
                'principal' => true,
            ]])->values();
        }

        return response()->json([
            'data' => [
                'contas' => $contas,
                'config' => $config ? [
                    'nif_emissor' => $config->nif_emissor,
                    'observacoes_facturacao' => $config->observacoes_facturacao,
                ] : null,
                'fraccao_identificador' => $fraccao->identificador,
            ],
        ]);
    }

    /**
     * POST /api/extracto/pagamentos/{id}/gerar-referencia
     * Gera referência ProxyPay para um pagamento existente.
     */
    public function gerarReferenciaProxyPay(Request $request, int $id): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }

        $pagamento = \App\Domains\Facturacao\Models\Pagamento::where('id', $id)
            ->where('condomino_id', $condomino->id)
            ->first();

        if (! $pagamento) {
            return response()->json(['message' => 'Pagamento não encontrado.'], 404);
        }

        if ($pagamento->metodo !== \App\Domains\Facturacao\Models\Pagamento::METODO_PROXYPAY) {
            return response()->json(['message' => 'Pagamento não é do método ProxyPay.'], 422);
        }

        try {
            $proxy = new \App\Domains\Facturacao\Services\ProxyPayB2CService();
            $ref = $proxy->criarReferenciaParaPagamentoCondomino($pagamento);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'data' => [
                'reference_id' => $ref->reference_id,
                'entity_id' => $ref->entity_id,
                'amount' => (string) $ref->amount,
                'expira_em' => $ref->expira_em?->toDateString(),
                'status' => $ref->status,
            ],
            'message' => 'Referência gerada. Paga no Multicaixa Express, ATM ou balcão.',
        ]);
    }

    /**
     * GET /api/extracto/pagamentos/{id}/referencia
     * Devolve a referência ProxyPay activa de um pagamento (se existir).
     */
    public function obterReferenciaProxyPay(Request $request, int $id): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }

        $pagamento = \App\Domains\Facturacao\Models\Pagamento::where('id', $id)
            ->where('condomino_id', $condomino->id)
            ->first();

        if (! $pagamento) {
            return response()->json(['message' => 'Pagamento não encontrado.'], 404);
        }

        $ref = \App\Domains\Payment\Models\PagamentoReferencia::where('pagamento_condomino_id', $pagamento->id)
            ->orderByDesc('id')
            ->first();

        if (! $ref) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => [
                'reference_id' => $ref->reference_id,
                'entity_id' => $ref->entity_id,
                'amount' => (string) $ref->amount,
                'expira_em' => $ref->expira_em?->toDateString(),
                'status' => $ref->status,
                'pago_em' => $ref->pago_em?->toIso8601String(),
            ],
        ]);
    }

    private function resolverCondomino(Request $request): Condomino|JsonResponse
    {
        $condomino = Condomino::where('user_id', $request->user()->id)->first();

        if (! $condomino) {
            return response()->json(['message' => 'Não estás associado a nenhum condómino.'], 404);
        }

        return $condomino;
    }

    private function serializar(Pagamento $p, bool $detalhado = false): array
    {
        $base = [
            'id' => $p->id,
            'referencia' => $p->referencia,
            'metodo' => $p->metodo,
            'valor' => (string) $p->valor,
            'data_pagamento' => $p->data_pagamento?->toDateString(),
            'estado' => $p->estado,
            'created_at' => $p->created_at?->toIso8601String(),
            'fraccao' => $p->fraccao ? [
                'id' => $p->fraccao->id,
                'identificador' => $p->fraccao->identificador,
            ] : null,
        ];

        if ($detalhado) {
            $base['referencia_externa'] = $p->referencia_externa;
            $base['banco_origem'] = $p->banco_origem;
            $base['notas_condomino'] = $p->notas_condomino;
            $base['confirmado_em'] = $p->confirmado_em?->toIso8601String();
            $base['rejeitado_em'] = $p->rejeitado_em?->toIso8601String();
            $base['motivo_rejeicao'] = $p->motivo_rejeicao;
            $base['comprovativo_url'] = $p->comprovativo_path
                ? '/ficheiros/' . $p->comprovativo_path
                : null;
            $base['comprovativo_nome'] = $p->comprovativo_nome_original;
            $base['imputacoes'] = $p->imputacoes->map(fn ($i) => [
                'lancamento_id' => $i->lancamento_id,
                'lancamento_descricao' => $i->lancamento?->descricao,
                'valor' => (string) $i->valor,
            ])->toArray();
        }

        return $base;
    }
}
