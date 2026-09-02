<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Http\Middleware;

use App\Domains\Afiliados\Services\AfiliadoConfigService;
use App\Domains\Afiliados\Services\AfiliadoService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Qualquer página pública visitada com ?ref=CODIGO guarda o código do afiliado num
 * cookie (N dias) e regista o clique. O auto-registo lê o cookie para atribuir o cliente.
 */
class CapturarCodigoAfiliado
{
    public const COOKIE = 'ondaka_ref';

    public function handle(Request $request, Closure $next): Response
    {
        $codigo = $request->query('ref');
        if (! is_string($codigo) || $codigo === '' || ! $request->isMethod('GET')) {
            return $next($request);
        }

        $codigo = strtoupper(trim($codigo));
        if (! preg_match('/^[A-Z0-9]{4,20}$/', $codigo)) {
            return $next($request);
        }

        $afiliado = null;
        try {
            $service = app(AfiliadoService::class);
            $afiliado = $service->porCodigo($codigo);
            if ($afiliado) {
                $service->registarClique($afiliado, $request);
            }
        } catch (\Throwable $e) {
            Log::warning('Afiliados: captura de código falhou: '.$e->getMessage());
        }

        $response = $next($request);

        if ($afiliado) {
            try {
                $dias = max(1, app(AfiliadoConfigService::class)->int('afiliado_cookie_dias'));
                $response->headers->setCookie(cookie(self::COOKIE, $codigo, $dias * 24 * 60));
            } catch (\Throwable $e) {
                Log::warning('Afiliados: cookie não definido: '.$e->getMessage());
            }
        }

        return $response;
    }
}
