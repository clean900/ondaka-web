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
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withCommands([
        \App\Domains\Subscription\Console\CriarTrialCommand::class,
        \App\Domains\Subscription\Console\TestarEmailAvisoCommand::class,
        \App\Domains\Subscription\Console\EmitirFacturasPlataforma::class,
        \App\Domains\Subscription\Console\NotificarRecuperacaoTrialCommand::class,
        \App\Domains\Subscription\Console\AplicarDowngradesAgendadosCommand::class,
        \App\Domains\Feature\Console\ListarFeaturesCommand::class,
        \App\Domains\Feature\Console\GrantFeatureCommand::class,
        \App\Domains\Feature\Console\InspectFeaturesCommand::class,
        \App\Domains\Feature\Console\ProcessarRecargasAutoCommand::class,
        \App\Domains\Feature\Console\ExpireTrialsCommand::class,
        \App\Domains\Feature\Console\ExpireSubscriptionsCommand::class,
        \App\Domains\Bi\Console\EnviarRelatoriosAgendadosCommand::class,
        \App\Domains\Payment\Console\ListarOrdensCommand::class,
        \App\Domains\Payment\Console\CriarOrdemTesteCommand::class,
        \App\Domains\Payment\Console\EmitirFacturaCommand::class,
        \App\Domains\Integracao\Sms\Console\EnviarSmsTesteCommand::class,
        \App\Domains\Integracao\Sms\Console\ConsultarSaldoSmsCommand::class,
        \App\Domains\Facturacao\Console\BackfillPagamentosCommand::class,
        \App\Domains\Financas\Console\SincronizarContasConfigCommand::class,
        \App\Domains\Manutencao\Console\AlertarManutencoesCommand::class,
    ])
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'webhooks/proxypay',
            'api/*',
        ]);
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
            'mobile.redirect' => \App\Http\Middleware\RedirecionarParaMobile::class,
            'condomino.semdivida' => \App\Http\Middleware\BloquearCondominoEmDivida::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
