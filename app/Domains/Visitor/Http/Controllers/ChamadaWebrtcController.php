<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Controllers;

use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Visitor\Services\ChamadaWebrtcService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChamadaWebrtcController extends Controller
{
    public function __construct(private ChamadaWebrtcService $chamadas) {}

    /** GET /api/chamadas/destinos — quem o utilizador pode ligar + imóveis (se aplicável). */
    public function destinos(Request $request): JsonResponse
    {
        $user = $request->user();
        $papel = $this->chamadas->papel($user);
        $destinos = $this->chamadas->destinosPermitidos($papel);

        $fraccoes = [];
        if (in_array('morador', $destinos, true)) {
            $fraccoes = Fraccao::where('empresa_gestora_id', $user->empresa_gestora_id)
                ->when($user->condominio_activo_id, fn ($q) => $q->where('condominio_id', $user->condominio_activo_id))
                ->orderBy('identificador')
                ->get(['id', 'identificador']);
        }

        return response()->json(['papel' => $papel, 'destinos' => $destinos, 'fraccoes' => $fraccoes]);
    }

    /** POST /api/chamadas — inicia chamada. body: destino (portaria|gestor|morador), fraccao_id? */
    public function iniciar(Request $request): JsonResponse
    {
        $request->validate([
            'destino' => 'required|string|in:portaria,gestor,morador',
            'fraccao_id' => 'nullable|integer',
        ]);
        $r = $this->chamadas->iniciar(
            $request->user(),
            (string) $request->string('destino'),
            $request->integer('fraccao_id') ?: null,
        );

        return response()->json($r, $r['ok'] ? 200 : 422);
    }
}
