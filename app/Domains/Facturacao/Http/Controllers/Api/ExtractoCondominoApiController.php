<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Http\Controllers\Api;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Facturacao\Services\ExtractoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API endpoints para o condómino consultar o seu extracto.
 */
class ExtractoCondominoApiController extends Controller
{
    public function __construct(protected ExtractoService $service) {}

    /**
     * GET /api/extracto/saldo
     * Saldo agregado do condómino autenticado.
     */
    public function saldo(Request $request): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }

        $saldo = $this->service->calcularSaldo($condomino);

        return response()->json(['data' => $saldo]);
    }

    /**
     * GET /api/extracto
     * Lista de movimentos (lançamentos + pagamentos) ordenados por data desc.
     *
     * Query params opcionais:
     *  - limit: int (default 50, max 200)
     *  - desde: YYYY-MM-DD
     *  - ate: YYYY-MM-DD
     */
    public function movimentos(Request $request): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }

        $request->validate([
            'limit' => ['nullable', 'integer', 'min:1', 'max:200'],
            'desde' => ['nullable', 'date_format:Y-m-d'],
            'ate' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $movimentos = $this->service->listarMovimentos(
            condomino: $condomino,
            limit: (int) ($request->query('limit', 50)),
            desde: $request->query('desde'),
            ate: $request->query('ate'),
        );

        return response()->json(['data' => $movimentos]);
    }

    /**
     * GET /api/extracto/grafico-mensal
     * Agregado mensal (últimos 12 meses) para o gráfico de barras
     * do Dashboard mobile.
     *
     * Cada item: { mes, mes_curto, ano, pago: float, em_aberto: float }
     */
    public function graficoMensal(Request $request): JsonResponse
    {
        $condomino = $this->resolverCondomino($request);
        if ($condomino instanceof JsonResponse) {
            return $condomino;
        }
        $dados = $this->service->graficoMensal($condomino);
        return response()->json(['data' => $dados]);
    }

    /**
     * Resolve o Condomino associado ao User autenticado.
     */
    private function resolverCondomino(Request $request): Condomino|JsonResponse
    {
        $user = $request->user();

        $condomino = Condomino::where('user_id', $user->id)->first();

        if (! $condomino) {
            return response()->json([
                'message' => 'Não estás associado a nenhum condómino.',
            ], 404);
        }

        return $condomino;
    }
}
