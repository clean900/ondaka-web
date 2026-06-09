<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Redirecciona utilizadores com roles 'condomino', 'guarda' ou 'prestador'
 * para a página /mobile-redirect.
 *
 * Estes roles só devem usar o app móvel — a plataforma web é para gestores.
 *
 * Excepções (continuam acessíveis):
 *  - /mobile-redirect (a própria página de aviso)
 *  - /logout (poder sair)
 */
class RedirecionarParaMobile
{
    private const ROLES_MOBILE_ONLY = ['condomino', 'guarda', 'prestador'];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        if (! $user->hasAnyRole(self::ROLES_MOBILE_ONLY)) {
            return $next($request);
        }

        $rotasPermitidas = [
            'mobile-redirect',
            'logout',
        ];

        if (in_array($request->path(), $rotasPermitidas, true)) {
            return $next($request);
        }

        return redirect()->route('mobile-redirect');
    }
}
