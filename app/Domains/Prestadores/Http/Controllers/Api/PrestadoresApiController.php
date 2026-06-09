<?php

declare(strict_types=1);

namespace App\Domains\Prestadores\Http\Controllers\Api;

use App\Domains\Prestadores\Models\PrestadorCategoria;
use App\Domains\Prestadores\Services\PrestadoresService;
use App\Domains\Tickets\Models\EmpresaPrestadora;
use App\Domains\Feature\Services\FeatureGate;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrestadoresApiController extends Controller
{
    public function __construct(
        protected PrestadoresService $service,
    ) {}

    /**
     * Lista de prestadores para o condómino autenticado.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $empresaGestoraId = $user->empresa_gestora_id ?? null;

        // Gate: a empresa gestora do condomino tem de ter o add-on activo
        $addonActivo = false;
        if ($empresaGestoraId) {
            $empresa = \App\Domains\Empresa\Models\EmpresaGestora::find($empresaGestoraId);
            $addonActivo = $empresa
                ? \App\Domains\Feature\Services\FeatureGate::has($empresa, 'empresas_prestadoras')
                : false;
        }

        if (! $addonActivo) {
            return response()->json([
                'addon_activo' => false,
                'categorias' => [],
                'prestadores' => [],
            ]);
        }

        $lat = $request->has('lat') ? (float) $request->input('lat') : null;
        $lng = $request->has('lng') ? (float) $request->input('lng') : null;
        $categoriaId = $request->has('categoria_id') ? (int) $request->input('categoria_id') : null;

        $prestadores = $this->service->listarParaCondomino($empresaGestoraId, $lat, $lng, $categoriaId);

        return response()->json([
            'addon_activo' => true,
            'categorias' => PrestadorCategoria::activas()->get(['id', 'nome', 'slug', 'icone']),
            'prestadores' => $prestadores,
        ]);
    }

    /**
     * Detalhe de um prestador + avaliações.
     */
    public function show(EmpresaPrestadora $prestadora): JsonResponse
    {
        $avaliacoes = $prestadora->avaliacoes()
            ->where('aprovado', true)
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['id', 'user_id', 'estrelas', 'comentario', 'created_at']);

        return response()->json([
            'prestador' => [
                'id' => $prestadora->id,
                'nome' => $prestadora->nome,
                'tipo' => $prestadora->tipo,
                'telefone' => $prestadora->telefone,
                'email' => $prestadora->email,
                'especialidades' => $prestadora->especialidades,
                'foto_path' => $prestadora->foto_path,
                'media_estrelas' => $prestadora->media_estrelas,
                'total_avaliacoes' => $prestadora->total_avaliacoes,
            ],
            'avaliacoes' => $avaliacoes,
        ]);
    }

    /**
     * Condómino avalia um prestador.
     */
    public function avaliar(Request $request, EmpresaPrestadora $prestadora): JsonResponse
    {
        $data = $request->validate([
            'estrelas' => 'required|integer|between:1,5',
            'comentario' => 'nullable|string|max:1000',
        ]);

        $avaliacao = $this->service->avaliar(
            $prestadora->id,
            $request->user()->id,
            $data['estrelas'],
            $data['comentario'] ?? null,
        );

        return response()->json([
            'sucesso' => true,
            'avaliacao' => $avaliacao,
            'media_estrelas' => $prestadora->fresh()->media_estrelas,
        ]);
    }
}
