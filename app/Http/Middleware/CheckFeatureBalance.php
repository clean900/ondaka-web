<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Domains\Feature\Services\FeatureGate;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckFeatureBalance
{
    /**
     * Verifica se a empresa tem saldo mínimo numa feature consumível.
     *
     * Uso:
     *   Route::middleware('feature.saldo:sms_sender_id')->post('/sms/enviar', ...)
     *   Route::middleware('feature.saldo:sms_sender_id,10')->post(...)  // requer >=10
     *
     * Se sem saldo, retorna 402 com link de recarga.
     */
    public function handle(Request $request, Closure $next, string $featureSlug, int $minimo = 1): Response
    {
        $empresa = app('empresa_gestora_actual');

        if (! $empresa) {
            return $next($request);
        }

        if (! FeatureGate::has($empresa, $featureSlug)) {
            return $this->respostaSemFeature($request, $featureSlug);
        }

        $saldo = FeatureGate::balance($empresa, $featureSlug);

        if ($saldo >= $minimo) {
            return $next($request);
        }

        // Sem saldo suficiente
        $feature = FeatureGate::getFeatureBySlug($featureSlug);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => "Saldo insuficiente de '{$feature?->nome}'. Actual: {$saldo}, requerido: {$minimo}.",
                'feature_slug' => $featureSlug,
                'saldo_actual' => $saldo,
                'saldo_requerido' => $minimo,
                'unidade' => $feature?->unidade,
            ], 402);
        }

        return redirect()
            ->route('funcionalidades.show', $featureSlug)
            ->with('warning', "Saldo de '{$feature?->nome}' esgotado. Recarregue para continuar.");
    }

    private function respostaSemFeature(Request $request, string $slug): Response
    {
        $feature = FeatureGate::getFeatureBySlug($slug);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => "Funcionalidade '{$feature?->nome}' não activa.",
                'feature_slug' => $slug,
            ], 402);
        }

        return redirect()->route('funcionalidades.index')
            ->with('warning', "Esta acção requer o add-on '{$feature?->nome}'.");
    }
}
