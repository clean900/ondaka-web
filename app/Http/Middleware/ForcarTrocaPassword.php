<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Forca o utilizador a trocar a password se forcar_troca_password = 1.
 * Permite acesso apenas a /perfil/password e logout.
 */
class ForcarTrocaPassword
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || empty($user->forcar_troca_password)) {
            return $next($request);
        }

        // Rotas permitidas mesmo com flag activa
        $permitidas = [
            'perfil.password',
            'perfil.password.update',
            'logout',
        ];

        if ($request->routeIs($permitidas) || $request->routeIs('login*')) {
            return $next($request);
        }

        if ($request->expectsJson() || $request->header('X-Inertia')) {
            return redirect()->route('perfil.password')
                ->with('warning', 'Por motivos de segurança, deve definir uma nova password antes de continuar.');
        }

        return redirect()->route('perfil.password');
    }
}
