<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Controllers;

use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Familiar\Support\CondominoResolver;
use App\Domains\Visitor\Services\ChamadaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChamadaApiController extends Controller
{
    public function __construct(private ChamadaService $chamadas) {}

    /** GET /api/portaria/fraccoes — imóveis do condomínio activo do guarda (para escolher quem ligar). */
    public function fraccoes(Request $request): JsonResponse
    {
        $guarda = $request->user();
        $fraccoes = Fraccao::where('empresa_gestora_id', $guarda->empresa_gestora_id)
            ->when($guarda->condominio_activo_id, fn ($q) => $q->where('condominio_id', $guarda->condominio_activo_id))
            ->orderBy('identificador')
            ->get(['id', 'identificador']);

        return response()->json(['data' => $fraccoes]);
    }

    /** POST /api/portaria/chamadas — guarda liga ao condómino de uma fração. */
    public function ligarCondomino(Request $request): JsonResponse
    {
        $request->validate(['fraccao_id' => 'required|integer']);
        $r = $this->chamadas->guardaParaCondomino($request->user(), (int) $request->integer('fraccao_id'));

        return response()->json($r, $r['ok'] ? 200 : 422);
    }

    /** POST /api/chamadas/portaria — condómino liga à portaria. */
    public function ligarPortaria(Request $request): JsonResponse
    {
        $user = $request->user();
        $condomino = CondominoResolver::paraUser($user);
        if (! $condomino) {
            return response()->json(['ok' => false, 'erro' => 'User não é condómino.'], 403);
        }
        $r = $this->chamadas->condominoParaPortaria($condomino, $user);

        return response()->json($r, $r['ok'] ? 200 : 422);
    }
}
