<?php

declare(strict_types=1);

namespace App\Domains\Nps\Http\Controllers\Web;

use App\Domains\Nps\Models\NpsResposta;
use App\Domains\Nps\Services\NpsService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminNpsController extends Controller
{
    public function __construct(
        protected NpsService $nps,
    ) {}

    public function index(Request $request): Response
    {
        // Scores por alvo
        $scorePlataforma = $this->nps->calcularScore(
            NpsResposta::where('alvo', 'plataforma')
        );
        $scoreCondominios = $this->nps->calcularScore(
            NpsResposta::where('alvo', 'condominio')
        );

        // Score da plataforma só por condóminos vs só por gestoras
        $scorePlataformaCondominos = $this->nps->calcularScore(
            NpsResposta::where('alvo', 'plataforma')->where('tipo_avaliador', 'condomino')
        );
        $scorePlataformaGestoras = $this->nps->calcularScore(
            NpsResposta::where('alvo', 'plataforma')->where('tipo_avaliador', 'gestora')
        );

        // Respostas recentes (com comentário/seguimento) para leitura qualitativa
        $recentes = NpsResposta::query()
            ->with('autor:id,name')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'tipo_avaliador' => $r->tipo_avaliador,
                'alvo' => $r->alvo,
                'nota' => $r->nota,
                'categoria' => $r->categoria,
                'comentario' => $r->comentario,
                'seguimento' => $r->seguimento,
                'autor' => $r->autor?->name,
                'created_at' => $r->created_at?->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Admin/Nps/Index', [
            'scores' => [
                'plataforma' => $scorePlataforma,
                'condominios' => $scoreCondominios,
                'plataforma_condominos' => $scorePlataformaCondominos,
                'plataforma_gestoras' => $scorePlataformaGestoras,
            ],
            'recentes' => $recentes,
        ]);
    }
}
