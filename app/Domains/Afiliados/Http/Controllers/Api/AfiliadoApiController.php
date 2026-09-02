<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Http\Controllers\Api;

use App\Domains\Afiliados\Models\AfiliadoPagamento;
use App\Domains\Afiliados\Services\AfiliadoConfigService;
use App\Domains\Afiliados\Services\AfiliadoEstatisticasService;
use App\Domains\Afiliados\Services\AfiliadoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API do portal do afiliado para a app móvel (Sanctum).
 */
class AfiliadoApiController extends Controller
{
    public function __construct(
        protected AfiliadoService $service,
        protected AfiliadoEstatisticasService $stats,
        protected AfiliadoConfigService $config,
    ) {}

    public function resumo(Request $request): JsonResponse
    {
        $af = $this->service->doUser($request->user());
        if (! $af) {
            return response()->json(['afiliado' => null, 'programa_activo' => $this->config->programaActivo()]);
        }

        return response()->json([
            'afiliado' => $this->stats->serializarAfiliado($af),
            'resumo' => $this->stats->resumoAfiliado($af),
            'config' => $this->config->publico(),
        ]);
    }

    public function clientes(Request $request): JsonResponse
    {
        $af = $this->service->doUser($request->user());
        if (! $af) {
            return response()->json(['message' => 'Não é afiliado.'], 404);
        }

        return response()->json(['clientes' => $this->stats->clientesDoAfiliado($af)]);
    }

    public function comissoes(Request $request): JsonResponse
    {
        $af = $this->service->doUser($request->user());
        if (! $af) {
            return response()->json(['message' => 'Não é afiliado.'], 404);
        }
        $filtros = $request->only(['estado', 'origem', 'de', 'ate', 'busca']);
        $query = $this->stats->comissoesQuery($af, $filtros);
        $pag = $query->paginate(25)->withQueryString()->through(fn ($c) => $this->stats->serializarComissao($c));

        return response()->json(['comissoes' => $pag, 'totais' => $this->stats->totaisComissoes($query)]);
    }

    public function pagamentos(Request $request): JsonResponse
    {
        $af = $this->service->doUser($request->user());
        if (! $af) {
            return response()->json(['message' => 'Não é afiliado.'], 404);
        }
        $pagamentos = AfiliadoPagamento::where('afiliado_id', $af->id)
            ->orderByDesc('pago_em')->orderByDesc('id')->get()
            ->map(fn ($p) => $this->stats->serializarPagamento($p))->values()->all();

        return response()->json(['pagamentos' => $pagamentos]);
    }
}
