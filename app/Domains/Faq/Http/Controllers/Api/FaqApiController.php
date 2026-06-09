<?php

declare(strict_types=1);

namespace App\Domains\Faq\Http\Controllers\Api;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Familiar\Support\CondominoResolver;
use App\Domains\Condomino\Models\ContratoOcupacao;
use App\Domains\Faq\Models\Faq;
use App\Domains\Faq\Services\FaqService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqApiController extends Controller
{
    public function __construct(protected FaqService $service) {}

    /**
     * GET /api/faqs — Lista FAQs activas: do condomínio do user + globais da empresa.
     */
    public function index(Request $request): JsonResponse
    {
        $condomino = CondominoResolver::paraUser($request->user());

        if (! $condomino) {
            return response()->json(['data' => [], 'message' => 'User não é condómino.']);
        }

        $condominioId = $this->descobrirCondominioId($condomino->id);

        $query = Faq::query()
            ->where('activa', true)
            ->where('empresa_gestora_id', $condomino->empresa_gestora_id);

        if ($condominioId) {
            $query->where(function ($q) use ($condominioId) {
                $q->where('condominio_id', $condominioId)
                  ->orWhereNull('condominio_id');
            });
        } else {
            $query->whereNull('condominio_id');
        }

        $faqs = $query->orderBy('categoria')
            ->orderBy('ordem')
            ->orderByDesc('id')
            ->get()
            ->map(fn ($f) => [
                'id' => $f->id,
                'categoria' => $f->categoria,
                'pergunta' => $f->pergunta,
                'resposta' => $f->resposta,
                'util_sim' => $f->util_sim,
                'util_nao' => $f->util_nao,
            ])
            ->values();

        return response()->json(['data' => $faqs]);
    }

    /**
     * GET /api/faqs/buscar?q=texto — Pesquisa textual via FaqService.
     */
    public function buscar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:2|max:200',
        ]);

        $condomino = CondominoResolver::paraUser($request->user());

        if (! $condomino) {
            return response()->json(['data' => [], 'total' => 0]);
        }

        $condominioId = $this->descobrirCondominioId($condomino->id);

        $resultados = $this->service->procurar(
            $validated['q'],
            $condomino->empresa_gestora_id,
            $condominioId,
            10
        );

        return response()->json([
            'data' => $resultados->map(fn ($f) => [
                'id' => $f->id,
                'categoria' => $f->categoria,
                'pergunta' => $f->pergunta,
                'resposta' => $f->resposta,
                'util_sim' => $f->util_sim,
                'util_nao' => $f->util_nao,
            ])->values(),
            'total' => $resultados->count(),
        ]);
    }

    /**
     * POST /api/faqs/{faq}/util — Marca FAQ como útil sim/não.
     */
    public function marcarUtil(Faq $faq, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'util' => 'required|boolean',
        ]);

        $faq->marcarUtil($validated['util']);

        return response()->json(['ok' => true]);
    }

    /**
     * Descobre o condomínio do condómino via primeiro contrato activo.
     */
    protected function descobrirCondominioId(int $condominoId): ?int
    {
        $contrato = ContratoOcupacao::where('condomino_id', $condominoId)
            ->where('estado', 'activo')
            ->with('fraccao:id,condominio_id')
            ->first();

        return $contrato?->fraccao?->condominio_id;
    }
}
