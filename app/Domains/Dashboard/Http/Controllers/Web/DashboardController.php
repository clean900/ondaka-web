<?php

declare(strict_types=1);

namespace App\Domains\Dashboard\Http\Controllers\Web;

use App\Domains\Dashboard\Services\DashboardClienteService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardClienteService $service,
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        // Condóminos: dashboard próprio é /minhas-quotas
        if ($request->user()?->hasRole('condomino')) {
            return redirect()->route('minhas-quotas');
        }

        $empresa = app()->has('empresa_gestora_actual')
            ? app('empresa_gestora_actual')
            : null;

        // Sem empresa resolvida (super-admin sem tenancy, ou erro do middleware)
        if (! $empresa) {
            return Inertia::render('Dashboard', [
                'dados' => [
                    'kpis' => [
                        'condominios' => ['valor' => 0, 'delta' => 'sem empresa'],
                        'imoveis' => ['valor' => 0, 'delta' => 'sem empresa'],
                        'pendente' => ['valor' => 0, 'delta' => 'sem empresa'],
                        'receita_mes' => ['valor' => 0, 'delta' => 'sem empresa'],
                    ],
                    'receita_mensal' => [],
                    'proximas_assembleias' => [],
                    'actividade_recente' => [],
                ],
            ]);
        }

        return Inertia::render('Dashboard', [
            'dados' => $this->service->obterDashboard($empresa),
        ]);
    }
}
