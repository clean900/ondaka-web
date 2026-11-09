<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Support\Publico\CatalogoPublico;
use App\Support\Publico\PrecosPublicos;
use Illuminate\Contracts\View\View;

/**
 * Landing page pública de ondaka.ao.
 *
 * Blade (não Inertia): o texto tem de vir no HTML do servidor, senão o Google,
 * as pré-visualizações de links e a leitura por IA só vêem o título — o cPanel
 * não tem Node para o SSR do Inertia. Os preços vêm da BD, como o super-admin
 * os configurou.
 */
class LandingController extends Controller
{
    public function index(PrecosPublicos $precos): View
    {
        $totalCatalogo = array_sum(array_map(fn ($c) => count($c['features']), CatalogoPublico::publico()));

        return view('publico.landing', [
            'pricing' => $precos->pricing(),
            'totalCatalogo' => $totalCatalogo,
        ]);
    }
}
