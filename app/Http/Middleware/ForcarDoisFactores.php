<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcarDoisFactores
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        if (! $user->precisaDoisFactores()) {
            return $next($request);
        }

        if (! session('sms_2fa_verificado')) {
            if ($request->routeIs('2fa.*') || $request->routeIs('logout')) {
                return $next($request);
            }
            return redirect()->route('2fa.desafio');
        }

        return $next($request);
    }
}
