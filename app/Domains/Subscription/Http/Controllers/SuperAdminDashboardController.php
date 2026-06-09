<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Http\Controllers;

use App\Domains\Subscription\Services\DashboardSuperAdminService;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminDashboardController extends Controller
{
    public function __construct(
        protected DashboardSuperAdminService $service,
    ) {}

    public function index(): Response
    {
        return Inertia::render('SuperAdmin/Dashboard/Index', [
            'dados' => $this->service->obterDados(),
        ]);
    }
}
