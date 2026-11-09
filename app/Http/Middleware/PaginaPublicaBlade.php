<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * As páginas públicas (landing, catálogo, loja) são Blade, para o texto vir no
 * HTML do servidor (Google, pré-visualizações de links, leitura por IA).
 *
 * Um <Link> do Inertia noutra página (ex.: «Início» no registo) pede-as por XHR
 * e espera JSON do Inertia; com HTML abriria um modal. Aqui manda-se o browser
 * fazer uma visita completa (409 + X-Inertia-Location).
 */
class PaginaPublicaBlade
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->header('X-Inertia')) {
            return Inertia::location($request->fullUrl());
        }

        return $next($request);
    }
}
