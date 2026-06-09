<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Domains\Feature\Services\FeatureGate;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFeatureActive
{
    /**
     * Verifica se a empresa do utilizador tem a feature activa.
     *
     * Uso em rotas:
     *   Route::middleware('feature:proxypay_rps')->get(...)
     *
     * Se feature não activa, retorna 402 (JSON) ou redirecciona para loja.
     */
    public function handle(Request $request, Closure $next, string $featureSlug): Response
    {
        $empresa = app('empresa_gestora_actual');

        if (! $empresa) {
            return $next($request);
        }

        if (FeatureGate::has($empresa, $featureSlug)) {
            return $next($request);
        }

        // Feature não existe no catálogo
        if (! FeatureGate::exists($featureSlug)) {
            abort(404, "Feature '{$featureSlug}' não existe no catálogo.");
        }

        // Feature não activa para esta empresa
        $feature = FeatureGate::getFeatureBySlug($featureSlug);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => "Esta funcionalidade requer o add-on '{$feature?->nome}'.",
                'feature_slug' => $featureSlug,
                'feature_nome' => $feature?->nome,
                'disponivel' => $feature?->disponivelParaCompra() ?? false,
            ], 402);
        }

        $mensagem = $feature && $feature->em_breve
            ? "A funcionalidade '{$feature->nome}' ainda não está disponível."
            : "Esta funcionalidade requer o add-on '{$feature?->nome}'. Active na loja de funcionalidades.";

        return redirect()->route('funcionalidades.index')->with('warning', $mensagem);
    }
}
