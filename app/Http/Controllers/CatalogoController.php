<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Support\Publico\CatalogoPublico;
use App\Support\Publico\PrecosPublicos;
use Illuminate\Contracts\View\View;

/**
 * Página pública /catalogo — funcionalidades do ONDAKA em produção.
 * Blade, para o texto vir no HTML do servidor (ver LandingController).
 */
class CatalogoController extends Controller
{
    public function index(PrecosPublicos $precos): View
    {
        $categorias = CatalogoPublico::publico();

        return view('publico.catalogo', [
            'categorias' => $categorias,
            'total' => array_sum(array_map(fn ($c) => count($c['features']), $categorias)),
            'trialDias' => $precos->condicoes()['trial_dias'],
        ]);
    }
}
