<?php

namespace App\Domains\Publicidade\Http\Controllers\Api;

use App\Domains\Publicidade\Models\PublicidadePopup;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PublicidadeApiController extends Controller
{
    /**
     * Devolve o popup ativo para mobile (ou null).
     */
    public function popupAtivo(): JsonResponse
    {
        $popup = PublicidadePopup::ativoAgora('mobile')->orderByDesc('id')->first();

        if (! $popup) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => [
                'id' => $popup->id,
                'titulo' => $popup->titulo,
                'mensagem' => $popup->mensagem,
                'imagem_url' => $popup->imagem_url,
                'botao_texto' => $popup->botao_texto,
                'link_url' => $popup->link_url,
            ],
        ]);
    }
}
