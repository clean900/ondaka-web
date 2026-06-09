<?php

declare(strict_types=1);

namespace App\Providers;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Subscription\Observers\EmpresaGestoraObserver;
use Carbon\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Binding default para 'empresa_gestora_actual'.
        // Usa bind() com closure em vez de instance(null) porque instance
        // com valor null nao fica detectavel como binding em Laravel 11.
        // O middleware ResolverEmpresaGestora sobrescreve via instance() no runtime.
        $this->app->bind('empresa_gestora_actual', function () {
            return null;
        });
    }

    public function boot(): void
    {
        Carbon::setLocale('pt');
        setlocale(LC_TIME, 'pt_PT.UTF-8', 'pt_PT', 'pt');

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // FIX 10-Mai-2026: Observer desactivado. RegistoEmpresaService cria subscricao explicitamente.
        // EmpresaGestora::observe(EmpresaGestoraObserver::class);
    }
}
