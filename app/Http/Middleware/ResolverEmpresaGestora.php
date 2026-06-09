<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolverEmpresaGestora
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->empresa_gestora_id) {
            $empresa = $user->empresaGestora;

            if (! $empresa || ! $empresa->activa) {
                auth()->logout();
                abort(403, 'Empresa gestora inactiva ou suspensa. Contacte suporte@ondaka.ao');
            }

            app()->instance('empresa_gestora_actual', $empresa);
        } else {
            // Super-admin não tem empresa — bind explícito a null
            app()->instance('empresa_gestora_actual', null);
        }

        return $next($request);
    }
}
