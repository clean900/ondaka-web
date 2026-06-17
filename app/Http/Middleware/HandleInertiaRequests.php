<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Domains\Condominio\Models\Condominio;
use App\Domains\Feature\Models\Feature;
use App\Domains\Feature\Services\FeatureGate;
use Illuminate\Support\Facades\Cache;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'telefone' => $request->user()->telefone,
                    'empresa_gestora_id' => $request->user()->empresa_gestora_id,
                    'empresa_gestora' => $request->user()->empresaGestora?->only([
                        'id', 'nome', 'slug', 'logotipo_path', 'tipo_cliente', 'documento_tipo', 'nome_completo_responsavel',
                    ]),
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                    'locale' => $request->user()->locale,
                    'estado' => $request->user()->estado,
                ] : null,
            ],
            'subscricao' => fn () => $this->dadosSubscricao(),
            'features' => $this->dadosFeatures(),
            'features_catalog' => $this->dadosFeaturesCatalog(),
            'trials' => $this->dadosTrials(),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
                'warning' => fn () => $request->session()->get('warning'),
                'fase' => fn () => $request->session()->get('fase'),
                'status' => fn () => $request->session()->get('status'),
            ],
            'locale' => app()->getLocale(),
            'locales' => ['pt', 'en', 'fr'],
        ];
    }

    /**
     * Dados da subscrição da empresa actual para o frontend.
     * Usado para banners e indicadores de estado.
     */
    private function dadosSubscricao(): ?array
    {
        $empresa = app()->has('empresa_gestora_actual')
            ? app('empresa_gestora_actual')
            : null;

        if (! $empresa) {
            return null;
        }

        $sub = $empresa->subscricao;
        if (! $sub) {
            return null;
        }

        $diasRestantesTrial = null;
        if ($sub->emTrial() && $sub->trial_expira_em) {
            $diff = now()->diffInDays($sub->trial_expira_em, false);
            $diasRestantesTrial = max(0, (int) ceil($diff));
        }

        return [
            'estado' => $sub->estado,
            'ciclo' => $sub->ciclo,
            'num_imoveis' => $sub->num_imoveis ?? 0,
            'em_trial' => $sub->emTrial(),
            'activa' => $sub->activa(),
            'tem_acesso' => $sub->temAcesso(),
            'dias_restantes_trial' => $diasRestantesTrial,
            'trial_expira_em' => $sub->trial_expira_em?->toIso8601String(),
            'periodo_actual_fim' => $sub->periodo_actual_fim?->toIso8601String(),
        ];
    }

    /**
     * Features activas do user (empresa_gestora + condominio_activo).
     * Retorna ['slug' => true, ...] para lookup rápido em React.
     */
    private function dadosFeatures(): array
    {
        $user = request()->user();
        if (!$user) {
            return [];
        }
        $slugs = [];
        // Menu: mostra as features que a empresa/condomínio POSSUEM (subscrição
        // activa), independentemente do saldo — assim o cadeado não "volta" quando
        // os SMS (ou outro consumível) chegam a 0.
        if ($user->empresa_gestora_id) {
            $empresa = $user->empresaGestora;
            if ($empresa) {
                foreach (FeatureGate::allOwnedSlugs($empresa) as $slug) {
                    $slugs[$slug] = true;
                }
            }
        }
        if ($user->condominio_activo_id) {
            $condominio = Condominio::find($user->condominio_activo_id);
            if ($condominio) {
                foreach (FeatureGate::allOwnedSlugs($condominio) as $slug) {
                    $slugs[$slug] = true;
                }
            }
        }
        return $slugs;
    }


    /**
     * Catálogo completo de features activas (metadata leve, sem comercial_json).
     * Cache Redis 1h para evitar query em todas as requests Inertia.
     * Para forçar refresh: php artisan cache:forget features_catalog
     */
    private function dadosFeaturesCatalog(): array
    {
        return Cache::remember('features_catalog', 3600, function () {
            return Feature::where('activa', true)
                ->orderBy('categoria')
                ->orderBy('ordem_listagem')
                ->get([
                    'id',
                    'slug',
                    'nome',
                    'descricao',
                    'icone',
                    'categoria',
                    'comprador',
                    'modelo_cobranca',
                    'unidade',
                    'preco_base',
                    'em_breve',
                    'requer_aprovacao_manual',
                    'requer_hardware',
                    'ordem_listagem',
                ])
                ->toArray();
        });
    }

    private function dadosTrials(): array
    {
        $user = request()->user();
        if (!$user) {
            return [];
        }
        $service = app(\App\Domains\Feature\Services\TrialService::class);
        $trials = collect();
        if ($user->empresa_gestora_id) {
            $empresa = $user->empresaGestora;
            if ($empresa) {
                $trials = $trials->merge($service->activosDoOwner($empresa));
            }
        }
        if ($user->condominio_activo_id) {
            $condominio = \App\Domains\Condominio\Models\Condominio::find($user->condominio_activo_id);
            if ($condominio) {
                $trials = $trials->merge($service->activosDoOwner($condominio));
            }
        }
        return $trials->map(function ($t) {
            return [
                'slug' => $t->feature->slug ?? null,
                'nome' => $t->feature->nome ?? null,
                'expira_em' => $t->expira_em ? $t->expira_em->toIso8601String() : null,
                'dias_restantes' => $t->expira_em ? (int) max(0, now()->diffInDays($t->expira_em, false)) : 0,
            ];
        })->filter(fn($t) => $t['slug'] !== null)->values()->all();
    }
}
