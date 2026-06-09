<?php
declare(strict_types=1);

namespace App\Domains\Facturacao\Http\Controllers\Api;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Facturacao\Models\AcordoPagamento;
use App\Domains\Facturacao\Services\AcordoService;
use App\Domains\Facturacao\Services\LimitacaoAcessoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API: o condómino propõe e consulta acordos de pagamento.
 */
class AcordoCondominoApiController extends Controller
{
    public function __construct(
        protected AcordoService $acordos,
        protected LimitacaoAcessoService $limitacao,
    ) {}

    /**
     * GET /api/acordos
     * Lista os acordos do condómino + estado de limitação atual.
     */
    public function index(Request $request): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }

        $acordos = AcordoPagamento::where('condomino_id', $condomino->id)
            ->with(['prestacoes', 'propostas'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $acordos,
            'limitacao' => $this->limitacao->motivoLimitacao($condomino),
        ]);
    }

    /**
     * POST /api/acordos
     * Condómino propõe um acordo (num_prestacoes 2-6).
     */
    public function propor(Request $request): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }

        $validated = $request->validate([
            'num_prestacoes' => ['required', 'integer', 'min:2', 'max:6'],
            'observacoes' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $acordo = $this->acordos->proporComDialogo(
                $condomino,
                $validated['num_prestacoes'],
                $validated['observacoes'] ?? null,
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Proposta enviada. Aguarda resposta da gestão.',
            'data' => $acordo->load(['prestacoes', 'propostas']),
        ], 201);
    }

    /**
     * POST /api/acordos/{acordo}/contrapropor
     * Condomino contrapropoe um novo numero de prestacoes.
     */
    public function contrapropor(Request $request, int $acordo): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }
        $ac = \App\Domains\Facturacao\Models\AcordoPagamento::where('id', $acordo)
            ->where('condomino_id', $condomino->id)->first();
        if (! $ac) {
            return response()->json(['message' => 'Acordo nao encontrado.'], 404);
        }
        $validated = $request->validate([
            'num_prestacoes' => ['required', 'integer', 'min:1', 'max:36'],
            'observacoes' => ['nullable', 'string', 'max:1000'],
        ]);
        try {
            $ac = $this->acordos->contrapropostaCondomino($ac, $validated['num_prestacoes'], $validated['observacoes'] ?? null);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
        return response()->json(['message' => 'Contraproposta enviada.', 'data' => $ac->load(['prestacoes', 'propostas'])]);
    }

    /**
     * POST /api/acordos/{acordo}/aceitar
     */
    public function aceitar(Request $request, int $acordo): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }
        $ac = \App\Domains\Facturacao\Models\AcordoPagamento::where('id', $acordo)
            ->where('condomino_id', $condomino->id)->first();
        if (! $ac) {
            return response()->json(['message' => 'Acordo nao encontrado.'], 404);
        }
        try {
            $ac = $this->acordos->aceitarDialogo($ac, $condomino->user_id);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
        return response()->json(['message' => 'Acordo aceite.', 'data' => $ac->load(['prestacoes', 'propostas'])]);
    }

    /**
     * POST /api/acordos/{acordo}/recusar
     */
    public function recusar(Request $request, int $acordo): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }
        $ac = \App\Domains\Facturacao\Models\AcordoPagamento::where('id', $acordo)
            ->where('condomino_id', $condomino->id)->first();
        if (! $ac) {
            return response()->json(['message' => 'Acordo nao encontrado.'], 404);
        }
        $validated = $request->validate(['motivo' => ['nullable', 'string', 'max:500']]);
        try {
            $ac = $this->acordos->recusarDialogo($ac, $condomino->user_id, $validated['motivo'] ?? null);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
        return response()->json(['message' => 'Acordo recusado.', 'data' => $ac]);
    }

    private function resolverCondomino(Request $request): Condomino|JsonResponse
    {
        $user = $request->user();
        $condomino = Condomino::where('user_id', $user->id)->first();
        if (! $condomino) {
            return response()->json(['message' => 'Não estás associado a nenhum condómino.'], 404);
        }
        return $condomino;
    }
}
