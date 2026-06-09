<?php

declare(strict_types=1);

namespace App\Domains\Payment\Http\Controllers\Api;

use App\Domains\Payment\Models\OrdemCompra;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrdemApiController extends Controller
{
    /**
     * GET /api/ordens — Lista as ordens do user actual.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Lista ordens criadas pelo user OU onde o user é o owner (via empresa)
        $query = OrdemCompra::query()
            ->where(function ($q) use ($user) {
                $q->where('criada_por_user_id', $user->id);
                if ($user->empresa_gestora_id) {
                    $q->orWhere(function ($qq) use ($user) {
                        $qq->where('owner_type', 'App\\Domains\\Empresa\\Models\\EmpresaGestora')
                            ->where('owner_id', $user->empresa_gestora_id);
                    });
                }
            })
            ->orderBy('created_at', 'desc');

        if ($request->filled('estado')) {
            $query->where('estado', $request->string('estado'));
        }

        $ordens = $query->paginate($request->integer('per_page', 20));

        return response()->json($ordens);
    }

    /**
     * GET /api/ordens/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $ordem = OrdemCompra::query()
            ->where('id', $id)
            ->where(function ($q) use ($user) {
                $q->where('criada_por_user_id', $user->id);
                if ($user->empresa_gestora_id) {
                    $q->orWhere(function ($qq) use ($user) {
                        $qq->where('owner_type', 'App\\Domains\\Empresa\\Models\\EmpresaGestora')
                            ->where('owner_id', $user->empresa_gestora_id);
                    });
                }
            })
            ->with(['pagamentos'])
            ->first();

        if (! $ordem) {
            return response()->json(['message' => 'Ordem não encontrada.'], 404);
        }

        return response()->json(['data' => $ordem]);
    }
}
