<?php

declare(strict_types=1);

namespace App\Domains\Empresa\Http\Controllers\Api;

use App\Domains\Empresa\Services\ContactosSuporteService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmpresaGestoraApiController extends Controller
{
    public function __construct(protected ContactosSuporteService $service) {}

    /**
     * GET /api/empresa-gestora/contactos
     * Devolve os contactos de suporte da empresa gestora associada
     * ao condómino autenticado.
     */
    public function contactos(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        $dados = $this->service->obterParaUser($user);

        if ($dados === null) {
            return response()->json([
                'message' => 'Não estás associado a uma empresa gestora.',
            ], 404);
        }

        return response()->json(['data' => $dados]);
    }
}
