<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Controllers;

use App\Domains\Visitor\Models\Visita;
use App\Domains\Visitor\Models\VisitaItem;
use App\Domains\Visitor\Services\VisitaItemService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use RuntimeException;

/**
 * API — Controlo de Bens (add-on feature:controlo_bens).
 *
 * Regista itens à entrada de uma visita e reconcilia na saída.
 * Todas as rotas protegidas por auth:sanctum + middleware feature:controlo_bens.
 */
class VisitaItemController extends Controller
{
    public function __construct(
        protected VisitaItemService $service,
    ) {}

    /** GET /api/portaria/visitas/{id}/itens */
    public function index(Request $request, int $id): JsonResponse
    {
        $visita = Visita::find($id);
        if ($visita === null) {
            return response()->json(['message' => 'Visita não encontrada.'], 404);
        }

        try {
            $itens = $this->service->listar($visita, $request->user());

            return response()->json(['data' => $itens]);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    /** POST /api/portaria/visitas/{id}/itens */
    public function store(Request $request, int $id): JsonResponse
    {
        $visita = Visita::find($id);
        if ($visita === null) {
            return response()->json(['message' => 'Visita não encontrada.'], 404);
        }

        $dados = $request->validate([
            'descricao' => ['required', 'string', 'min:2', 'max:150'],
            'categoria' => ['nullable', 'string', 'max:30'],
            'quantidade' => ['nullable', 'integer', 'min:1', 'max:9999'],
            'identificador' => ['nullable', 'string', 'max:100'],
            'foto_entrada_path' => ['nullable', 'string', 'max:255'],
            'observacoes' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $item = $this->service->registar($visita, $request->user(), $dados);

            return response()->json([
                'message' => 'Item registado.',
                'data' => $item,
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    /** POST /api/portaria/visitas/{id}/itens/nao-declarado */
    public function naoDeclarado(Request $request, int $id): JsonResponse
    {
        $visita = Visita::find($id);
        if ($visita === null) {
            return response()->json(['message' => 'Visita não encontrada.'], 404);
        }

        $dados = $request->validate([
            'descricao' => ['required', 'string', 'min:2', 'max:150'],
            'quantidade' => ['nullable', 'integer', 'min:1', 'max:9999'],
            'identificador' => ['nullable', 'string', 'max:100'],
            'observacoes' => ['nullable', 'string', 'max:255'],
            'foto' => ['required', 'image', 'max:5120'],
        ]);

        $dados['foto_entrada_path'] = $request->file('foto')->store('controlo-bens', 'public');

        try {
            $item = $this->service->registarNaoDeclarado($visita, $request->user(), $dados);

            return response()->json([
                'message' => 'Registado. A aguardar autorização do condómino.',
                'data' => $item,
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    /** POST /api/portaria/visitas/{id}/itens/{itemId}/reter
     *  O guarda retém o bem (não autorizado / sem resposta) → liberta a saída. */
    public function reter(Request $request, int $id, int $itemId): JsonResponse
    {
        $item = VisitaItem::where('visita_id', $id)->find($itemId);
        if ($item === null) {
            return response()->json(['message' => 'Item não encontrado.'], 404);
        }

        try {
            $item = $this->service->reterItem($item, $request->user());

            return response()->json(['message' => 'Bem retido na portaria.', 'data' => $item]);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    /** POST /api/portaria/visitas/{id}/itens/{itemId}/saida */
    public function resolver(Request $request, int $id, int $itemId): JsonResponse
    {
        $item = VisitaItem::where('visita_id', $id)->find($itemId);
        if ($item === null) {
            return response()->json(['message' => 'Item não encontrado.'], 404);
        }

        $dados = $request->validate([
            'resolucao' => ['required', 'string', 'in:saiu,ficou'],
            'observacoes' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $item = $this->service->resolver(
                $item,
                $request->user(),
                $dados['resolucao'],
                $dados['observacoes'] ?? null,
            );

            return response()->json([
                'message' => $dados['resolucao'] === 'saiu' ? 'Item saiu.' : 'Item ficou no condomínio.',
                'data' => $item,
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    /** DELETE /api/portaria/visitas/{id}/itens/{itemId} */
    public function destroy(Request $request, int $id, int $itemId): JsonResponse
    {
        $item = VisitaItem::where('visita_id', $id)->find($itemId);
        if ($item === null) {
            return response()->json(['message' => 'Item não encontrado.'], 404);
        }

        try {
            $this->service->remover($item, $request->user());

            return response()->json(['message' => 'Item removido.']);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    // === Autorização de saída de bem (condómino / gestor) ===

    /** GET /api/visitas/itens/pendentes-autorizacao */
    public function pendentes(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->hasAnyRole(['condomino', 'gestor', 'administrador-condominio', 'admin-empresa', 'super-admin'])) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        return response()->json([
            'data' => $this->service->pendentesAutorizacao($user),
        ]);
    }

    /** POST /api/visitas/itens/{itemId}/autorizar  body: { aprovar: bool } */
    public function autorizar(Request $request, int $itemId): JsonResponse
    {
        // Multi-tenant cedo: só itens da empresa do utilizador.
        $item = VisitaItem::where('empresa_gestora_id', $request->user()->empresa_gestora_id)->find($itemId);
        if ($item === null) {
            return response()->json(['message' => 'Item não encontrado.'], 404);
        }

        $dados = $request->validate(['aprovar' => ['required', 'boolean']]);

        try {
            $item = $this->service->autorizarSaida($item, $request->user(), $dados['aprovar']);

            return response()->json([
                'message' => $dados['aprovar'] ? 'Saída autorizada.' : 'Saída recusada — bem retido.',
                'data' => $item,
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }
}
