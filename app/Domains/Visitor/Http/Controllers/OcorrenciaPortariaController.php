<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Controllers;

use App\Domains\Visitor\Models\OcorrenciaPortaria;
use App\Domains\Visitor\Services\OcorrenciaPortariaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use RuntimeException;

/**
 * API — Livro de Ocorrências + Passagem de Turno (add-on feature:livro_ocorrencias).
 */
class OcorrenciaPortariaController extends Controller
{
    public function __construct(protected OcorrenciaPortariaService $service) {}

    /** GET /api/portaria/ocorrencias?abertas=1 */
    public function index(Request $request): JsonResponse
    {
        $abertas = $request->has('abertas')
            ? filter_var($request->query('abertas'), FILTER_VALIDATE_BOOLEAN)
            : null;

        return response()->json(['data' => $this->service->listar($request->user(), $abertas)]);
    }

    /** POST /api/portaria/ocorrencias  (multipart: tipo, descricao, foto?, latitude?, longitude?) */
    public function store(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'tipo' => ['nullable', 'string', 'in:observacao,incidente,alerta'],
            'descricao' => ['required', 'string', 'min:3', 'max:1000'],
            'foto' => ['nullable', 'image', 'max:8192'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
        ]);

        if ($request->hasFile('foto')) {
            $dados['foto_path'] = $request->file('foto')->store('ocorrencias', 'public');
        }

        try {
            $oc = $this->service->criar($request->user(), $dados);

            return response()->json(['message' => 'Ocorrência registada.', 'data' => $oc], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /** POST /api/portaria/ocorrencias/{id}/resolver  body: { notas? } */
    public function resolver(Request $request, int $id): JsonResponse
    {
        $oc = OcorrenciaPortaria::where('empresa_gestora_id', $request->user()->empresa_gestora_id)->find($id);
        if ($oc === null) {
            return response()->json(['message' => 'Ocorrência não encontrada.'], 404);
        }

        $dados = $request->validate(['notas' => ['nullable', 'string', 'max:500']]);

        try {
            $oc = $this->service->resolver($oc, $request->user(), $dados['notas'] ?? null);

            return response()->json(['message' => 'Ocorrência resolvida.', 'data' => $oc]);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    /** POST /api/portaria/passagem-turno  body: { resumo } */
    public function passagem(Request $request): JsonResponse
    {
        $dados = $request->validate(['resumo' => ['required', 'string', 'min:3', 'max:2000']]);
        $p = $this->service->criarPassagem($request->user(), $dados['resumo']);

        return response()->json(['message' => 'Passagem de turno registada.', 'data' => $p], 201);
    }

    /** GET /api/portaria/passagens-turno */
    public function passagens(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->service->listarPassagens($request->user())]);
    }
}
