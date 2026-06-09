<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Verifica estado da subscrição.
 * 
 * Estados:
 *  - trial:    OK, acesso total durante o período de trial
 *  - activa:   OK, subscrição paga e activa
 *  - limitado: BLOQUEIO PARCIAL (só /subscricao, perfil, logout)
 *  - cancelada: BLOQUEIO TOTAL (redirect para /subscricao)
 * 
 * Sem subscrição: permite (onboarding, criação inicial).
 */
class EnsureSubscricaoActiva
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Sem user autenticado: deixa passar
        if (! $user) {
            return $next($request);
        }

        // Super-admin: nunca bloqueado
        if ($user->roles?->contains('name', 'super-admin')) {
            return $next($request);
        }

        $empresa = app('empresa_gestora_actual');
        if (! $empresa) {
            return $next($request);
        }

        $subscricao = $empresa->subscricao;

        // Sem subscrição ainda criada: permitir (vai ser redireccionado para /subscricao via outra rota)
        if (! $subscricao) {
            return $next($request);
        }

        // Trial: trial já expirou? -> mover para limitado
        if ($subscricao->estado === 'trial' && $subscricao->trial_expira_em && $subscricao->trial_expira_em->isPast()) {
            $subscricao->update(['estado' => 'limitado']);
            
            // Audit trail
            \DB::table('plataforma_subscricao_eventos')->insert([
                'subscricao_id' => $subscricao->id,
                'tipo' => 'trial_expirou',
                'descricao' => 'Trial expirou automaticamente. Subscrição passou a modo limitado.',
                'meta_json' => json_encode(['data_expira' => $subscricao->trial_expira_em->toIso8601String()]),
                'user_id' => null,
                'created_at' => now(),
            ]);
        }

        // Estados permitidos: trial (não expirado), activa
        if (in_array($subscricao->estado, ['trial', 'activa'])) {
            return $next($request);
        }

        // Estado limitado/cancelada: bloqueia, mas permite acesso a páginas essenciais
        if ($this->paginaPermitidaEmModoLimitado($request)) {
            return $next($request);
        }

        // Bloqueio: redireccionar para /subscricao
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'A sua subscrição não está activa. Por favor, regularize o pagamento.',
                'estado' => $subscricao->estado,
            ], 402);
        }

        return redirect()->route('subscricao.index')->with('warning', 'A sua subscrição expirou. Por favor, regularize o pagamento para continuar.');
    }

    /**
     * Lista de rotas permitidas mesmo em modo limitado.
     */
    private function paginaPermitidaEmModoLimitado(Request $request): bool
    {
        $rotasPermitidas = [
            'subscricao.*',          // /subscricao, /subscricao/calcular, /subscricao/activar, /subscricao/expirada
            'profile.*',             // /profile, /profile/edit
            'logout',
            'verification.*',
            'password.*',
        ];

        $routeName = $request->route()?->getName() ?? '';

        foreach ($rotasPermitidas as $padrao) {
            if (str_ends_with($padrao, '*')) {
                $prefix = substr($padrao, 0, -1);
                if (str_starts_with($routeName, $prefix)) {
                    return true;
                }
            } elseif ($routeName === $padrao) {
                return true;
            }
        }

        return false;
    }
}
