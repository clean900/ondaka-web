<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * @deprecated Substituído por EnsureSubscricaoActiva (que trata estado "limitado").
 * Mantido como passthrough para não partir routes/web.php que ainda usa 'grace.bloquear'.
 * TODO: remover este middleware + remover alias de routes/web.php numa próxima sessão.
 */
class BloquearEmGrace
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }
}
