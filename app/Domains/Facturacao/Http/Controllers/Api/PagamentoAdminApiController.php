<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Http\Controllers\Api;

use App\Domains\Facturacao\Models\Lancamento;
use App\Domains\Facturacao\Models\Pagamento;
use App\Domains\Facturacao\Services\PagamentoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API endpoints admin para gerir pagamentos B2C.
 *
 * Tenancy: filtragem automática por empresa_gestora_id do user.
 */
class PagamentoAdminApiController extends Controller
{
    public function __construct(protected PagamentoService $service) {}

    /**
     * GET /api/admin/pagamentos
     * Lista pagamentos com filtros.
     *
     * Query params: estado, fraccao_id, condominio_id
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Pagamento::query()
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->with([
                'fraccao:id,identificador',
                'condomino:id,nome_completo',
                'condominio:id,nome',
            ])
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

        $pagamentos = $query->limit(100)->get()->map(fn ($p) => $this->serializar($p));

        return response()->json(['data' => $pagamentos]);
    }

    /**
     * GET /api/admin/pagamentos/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $pagamento = Pagamento::query()
            ->where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->with([
                'fraccao:id,identificador',
                'condomino:id,nome_completo,bi_passport',
                'condominio:id,nome',
                'imputacoes.lancamento',
                'registadoPor:id,name',
                'confirmadoPor:id,name',
            ])
            ->first();

        if (! $pagamento) {
            return response()->json(['message' => 'Pagamento não encontrado.'], 404);
        }

        return response()->json(['data' => $this->serializar($pagamento, detalhado: true)]);
    }

    /**
     * GET /api/admin/pagamentos/lancamentos-em-aberto/{fraccaoId}
     * Lança lista de lançamentos em aberto da fracção — para o admin
     * escolher como imputar o pagamento.
     */
    public function lancamentosEmAberto(Request $request, int $fraccaoId): JsonResponse
    {
        $user = $request->user();

        // Tenancy: garantir que a fracção pertence à empresa gestora
        $fraccao = \App\Domains\Condominio\Models\Fraccao::query()
            ->where('id', $fraccaoId)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->first();

        if (! $fraccao) {
            return response()->json(['message' => 'Fracção não encontrada.'], 404);
        }

        $lancamentos = Lancamento::query()
            ->where('fraccao_id', $fraccaoId)
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
                'estado' => $l->estado,
                'em_atraso' => $l->estaEmAtraso(),
            ]);

        return response()->json(['data' => $lancamentos]);
    }

    /**
     * POST /api/admin/pagamentos/{id}/confirmar
     *
     * Body opcional:
     * {
     *   "imputacoes": [
     *     {"lancamento_id": 5, "valor": "15000.00"},
     *     {"lancamento_id": 6, "valor": "5000.00"}
     *   ]
     * }
     *
     * Se "imputacoes" for omitido, mantém as sugeridas pelo condómino.
     */
    public function confirmar(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $pagamento = Pagamento::query()
            ->where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->first();

        if (! $pagamento) {
            return response()->json(['message' => 'Pagamento não encontrado.'], 404);
        }

        $request->validate([
            'imputacoes' => ['nullable', 'array'],
            'imputacoes.*.lancamento_id' => ['required_with:imputacoes', 'integer', 'exists:lancamentos_condomino,id'],
            'imputacoes.*.valor' => ['required_with:imputacoes', 'numeric', 'min:0.01'],
        ]);

        $imputacoes = $request->input('imputacoes');

        // Normalizar valores como strings para bcmath
        if (is_array($imputacoes)) {
            $imputacoes = array_map(fn ($i) => [
                'lancamento_id' => (int) $i['lancamento_id'],
                'valor' => number_format((float) $i['valor'], 2, '.', ''),
            ], $imputacoes);
        }

        try {
            $pagamento = $this->service->confirmarPagamento($pagamento, $user, $imputacoes);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'data' => $this->serializar($pagamento->load(['imputacoes.lancamento']), detalhado: true),
            'message' => 'Pagamento confirmado.',
        ]);
    }

    /**
     * POST /api/admin/pagamentos/{id}/rejeitar
     */
    public function rejeitar(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $pagamento = Pagamento::query()
            ->where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->first();

        if (! $pagamento) {
            return response()->json(['message' => 'Pagamento não encontrado.'], 404);
        }

        $request->validate([
            'motivo' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        try {
            $pagamento = $this->service->rejeitarPagamento(
                $pagamento,
                $user,
                $request->input('motivo')
            );
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'data' => $this->serializar($pagamento, detalhado: true),
            'message' => 'Pagamento rejeitado.',
        ]);
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
            'condomino' => $p->condomino ? [
                'id' => $p->condomino->id,
                'nome_completo' => $p->condomino->nome_completo,
            ] : null,
            'condominio' => $p->condominio ? [
                'id' => $p->condominio->id,
                'nome' => $p->condominio->nome,
            ] : null,
        ];

        if ($detalhado) {
            $base['referencia_externa'] = $p->referencia_externa;
            $base['banco_origem'] = $p->banco_origem;
            $base['notas_condomino'] = $p->notas_condomino;
            $base['notas_admin'] = $p->notas_admin;
            $base['confirmado_em'] = $p->confirmado_em?->toIso8601String();
            $base['rejeitado_em'] = $p->rejeitado_em?->toIso8601String();
            $base['motivo_rejeicao'] = $p->motivo_rejeicao;
            $base['comprovativo_url'] = $p->comprovativo_path
                ? '/ficheiros/' . $p->comprovativo_path
                : null;
            $base['comprovativo_nome'] = $p->comprovativo_nome_original;
            $base['comprovativo_mime'] = $p->comprovativo_mime;
            $base['registado_por'] = $p->registadoPor ? [
                'id' => $p->registadoPor->id,
                'nome' => $p->registadoPor->name,
            ] : null;
            $base['confirmado_por'] = $p->confirmadoPor ? [
                'id' => $p->confirmadoPor->id,
                'nome' => $p->confirmadoPor->name,
            ] : null;
            $base['imputacoes'] = $p->imputacoes->map(fn ($i) => [
                'lancamento_id' => $i->lancamento_id,
                'lancamento_descricao' => $i->lancamento?->descricao,
                'lancamento_tipo' => $i->lancamento?->tipo,
                'valor' => (string) $i->valor,
            ])->toArray();
        }

        return $base;
    }
}
