<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * Endpoint público que devolve o catálogo de funcionalidades ONDAKA.
 * Lê do ficheiro JSON em public/data/catalogo.json.
 *
 * Servido sem autenticação (igual ao /catalogo público da web).
 */
class CatalogoApiController extends Controller
{
    public function index(): JsonResponse
    {
        $path = public_path('data/catalogo.json');

        if (! file_exists($path)) {
            return response()->json([
                'message' => 'Catálogo não disponível.',
            ], 503);
        }

        $json = file_get_contents($path);
        $data = json_decode($json, true);

        if ($data === null) {
            return response()->json([
                'message' => 'Erro ao processar catálogo.',
            ], 500);
        }

        return response()->json(['data' => $data]);
    }
}
