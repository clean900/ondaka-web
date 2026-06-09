<?php

use App\Http\Middleware\ForcarDoisFactores;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\ResolverEmpresaGestora;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withCommands([
        \App\Domains\Subscription\Console\CriarTrialCommand::class,
        \App\Domains\Subscription\Console\TestarEmailAvisoCommand::class,
        \App\Domains\Feature\Console\ListarFeaturesCommand::class,
        \App\Domains\Feature\Console\GrantFeatureCommand::class,
        \App\Domains\Feature\Console\InspectFeaturesCommand::class,
        \App\Domains\Feature\Console\ProcessarRecargasAutoCommand::class,
        \App\Domains\Payment\Console\ListarOrdensCommand::class,
        \App\Domains\Payment\Console\CriarOrdemTesteCommand::class,
    ])
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            ResolverEmpresaGestora::class,
            HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            '2fa' => ForcarDoisFactores::class,
            'tenant' => ResolverEmpresaGestora::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'subscricao.activa' => \App\Http\Middleware\EnsureSubscricaoActiva::class,
            'grace.bloquear' => \App\Http\Middleware\BloquearEmGrace::class,
            'feature' => \App\Http\Middleware\EnsureFeatureActive::class,
            'feature.saldo' => \App\Http\Middleware\CheckFeatureBalance::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
