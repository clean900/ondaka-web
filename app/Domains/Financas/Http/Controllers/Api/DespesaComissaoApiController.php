<?php

declare(strict_types=1);

namespace App\Domains\Financas\Http\Controllers\Api;

use App\Domains\Condominio\Models\ComissaoMembro;
use App\Domains\Financas\Models\Despesa;
use App\Domains\Financas\Services\DespesaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/**
 * F-03 (camada 3): API para a comissão de moradores aprovar/recusar despesas
 * pendentes na app mobile. Só despesas de condomínios onde o utilizador é membro
 * da comissão e a regra está ligada.
 */
class DespesaComissaoApiController extends Controller
{
    public function __construct(private DespesaService $service) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Condomínios onde o user é membro da comissão E a regra está ligada.
        $condominioIds = ComissaoMembro::where('user_id', $user->id)
            ->whereHas('condominio', fn ($q) => $q->where('exige_aprovacao_comissao', true))
            ->pluck('condominio_id');

        if ($condominioIds->isEmpty()) {
            return response()->json(['e_membro_comissao' => false, 'despesas' => []]);
        }

        $despesas = Despesa::whereIn('condominio_id', $condominioIds)
            ->where('estado', 'pendente')
            ->with(['categoria:id,nome', 'condominio:id,nome'])
            ->orderByDesc('data_despesa')
            ->get()
            ->map(fn (Despesa $d) => [
                'id' => $d->id,
                'descricao' => $d->descricao,
                'fornecedor' => $d->fornecedor,
                'valor' => (float) $d->valor,
                'data_despesa' => $d->data_despesa?->toDateString(),
                'categoria' => $d->categoria?->nome,
                'condominio' => $d->condominio?->nome,
            ]);

        return response()->json(['e_membro_comissao' => true, 'despesas' => $despesas]);
    }

    public function aprovar(Request $request, Despesa $despesa): JsonResponse
    {
        if (! $this->podeDecidir($request, $despesa)) {
            return response()->json(['message' => 'Sem permissão para aprovar esta despesa.'], 403);
        }

        try {
            // O gate em aprovar() confirma que o user é membro da comissão.
            $this->service->aprovar($despesa, $request->user()->id);
            return response()->json(['message' => 'Despesa aprovada.']);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function recusar(Request $request, Despesa $despesa): JsonResponse
    {
        if (! $this->podeDecidir($request, $despesa)) {
            return response()->json(['message' => 'Sem permissão para recusar esta despesa.'], 403);
        }

        $request->validate(['motivo' => 'nullable|string|max:300']);

        try {
            $this->service->cancelar($despesa, $request->user()->id, $request->input('motivo'));
            return response()->json(['message' => 'Despesa recusada.']);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * O user só pode decidir despesas de condomínios onde é membro da comissão
     * e a regra está ligada.
     */
    private function podeDecidir(Request $request, Despesa $despesa): bool
    {
        if (! $despesa->condominio_id) {
            return false;
        }

        $condominio = $despesa->condominio;
        if (! $condominio || ! $condominio->exige_aprovacao_comissao) {
            return false;
        }

        return ComissaoMembro::where('condominio_id', $despesa->condominio_id)
            ->where('user_id', $request->user()->id)
            ->exists();
    }
}
