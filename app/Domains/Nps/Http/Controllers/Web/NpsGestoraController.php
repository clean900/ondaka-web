<?php

declare(strict_types=1);

namespace App\Domains\Nps\Http\Controllers\Web;

use App\Domains\Nps\Models\NpsResposta;
use App\Domains\Nps\Services\NpsService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Domains\Nps\Models\NpsConfiguracao;
use Inertia\Inertia;
use Inertia\Response;

class NpsGestoraController extends Controller
{
    public function __construct(
        protected NpsService $nps,
    ) {}

    /**
     * Dashboard NPS da gestora — apenas o seu condomínio (alvo=condominio + a sua gestora).
     */
    public function dashboard(Request $request): Response
    {
        $gestoraId = $request->user()->empresa_gestora_id;

        $base = NpsResposta::where('alvo', 'condominio')
            ->where('empresa_gestora_id', $gestoraId);

        $score = $this->nps->calcularScore(clone $base);

        $recentes = (clone $base)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'nota' => $r->nota,
                'categoria' => $r->categoria,
                'comentario' => $r->comentario,
                'seguimento' => $r->seguimento,
                'created_at' => $r->created_at?->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Nps/Dashboard', [
            'score' => $score,
            'recentes' => $recentes,
        ]);
    }

    /**
     * Estado do NPS da plataforma para a gestora (consumido pelo modal automatico).
     */
    public function estadoPlataforma(Request $request): JsonResponse
    {
        $user = $request->user();
        $cfg = NpsConfiguracao::resolver('plataforma', null);
        $devePedir = $this->nps->devePedir($user->id, 'plataforma');

        return response()->json([
            'deve_pedir' => $devePedir,
            'pergunta' => $cfg['pergunta'],
            'seguimento' => $cfg['seguimento'],
        ]);
    }

    /**
     * Grava a resposta NPS da gestora sobre a plataforma.
     */
    public function responderPlataforma(Request $request): RedirectResponse
    {
        $user = $request->user();

        $dados = $request->validate([
            'nota' => 'required|integer|min:0|max:10',
            'comentario' => 'nullable|string|max:2000',
            'seguimento' => 'nullable|string|max:2000',
        ]);

        $this->nps->registar([
            'user_id' => $user->id,
            'tipo_avaliador' => 'gestora',
            'alvo' => 'plataforma',
            'condominio_id' => null,
            'empresa_gestora_id' => $user->empresa_gestora_id,
            'nota' => $dados['nota'],
            'comentario' => $dados['comentario'] ?? null,
            'seguimento' => $dados['seguimento'] ?? null,
        ]);

        return back()->with('success', 'Obrigado pela sua avaliação!');
    }

}
