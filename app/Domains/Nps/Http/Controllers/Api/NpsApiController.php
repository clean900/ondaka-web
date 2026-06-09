<?php

declare(strict_types=1);

namespace App\Domains\Nps\Http\Controllers\Api;

use App\Domains\Nps\Services\NpsService;
use App\Domains\Nps\Models\NpsConfiguracao;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NpsApiController extends Controller
{
    public function __construct(
        protected NpsService $nps,
    ) {}

    /**
     * Diz à app se deve pedir NPS, e para que alvos.
     * Condómino: pode avaliar o condomínio (alvo=condominio) e a plataforma (alvo=plataforma).
     */
    public function estado(Request $request): JsonResponse
    {
        $user = $request->user();
        $condominioId = $user->condominio_activo_id;

        $pedidos = [];

        // Alvo 1: o seu condomínio (só se tiver condomínio activo)
        if ($condominioId && $this->nps->devePedir($user->id, 'condominio', $condominioId, $user->empresa_gestora_id)) {
            $cfg = NpsConfiguracao::resolver('condominio', $user->empresa_gestora_id);
            $pedidos[] = [
                'alvo' => 'condominio',
                'titulo' => 'Como avalia a gestão do seu condomínio?',
                'pergunta' => $cfg['pergunta'],
                'seguimento' => $cfg['seguimento'],
            ];
        }

        // Alvo 2: a plataforma ONDAKA
        if ($this->nps->devePedir($user->id, 'plataforma')) {
            $cfg = NpsConfiguracao::resolver('plataforma', null);
            $pedidos[] = [
                'alvo' => 'plataforma',
                'titulo' => 'Como avalia a aplicação ONDAKA?',
                'pergunta' => $cfg['pergunta'],
                'seguimento' => $cfg['seguimento'],
            ];
        }

        return response()->json([
            'deve_pedir' => count($pedidos) > 0,
            'pedidos' => $pedidos,
        ]);
    }

    /**
     * Grava uma resposta de NPS do condómino.
     */
    public function responder(Request $request): JsonResponse
    {
        $user = $request->user();

        $dados = $request->validate([
            'alvo' => 'required|in:condominio,plataforma',
            'nota' => 'required|integer|min:0|max:10',
            'comentario' => 'nullable|string|max:2000',
            'seguimento' => 'nullable|string|max:2000',
        ]);

        $this->nps->registar([
            'user_id' => $user->id,
            'tipo_avaliador' => 'condomino',
            'alvo' => $dados['alvo'],
            'condominio_id' => $dados['alvo'] === 'condominio' ? $user->condominio_activo_id : null,
            'empresa_gestora_id' => $user->empresa_gestora_id,
            'nota' => $dados['nota'],
            'comentario' => $dados['comentario'] ?? null,
            'seguimento' => $dados['seguimento'] ?? null,
        ]);

        return response()->json(['sucesso' => true]);
    }
}
