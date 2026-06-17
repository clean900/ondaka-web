<?php

declare(strict_types=1);

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

/**
 * Notifica os super-admins quando uma tarefa agendada crítica falha.
 */
$notificarFalhaCron = function (string $tarefa): void {
    try {
        $sas = \App\Models\User::role('super-admin')->get();
        foreach ($sas as $sa) {
            $sa->notify(new \App\Domains\Empresa\Notifications\CronFalhouSuperAdminNotification($tarefa));
        }
    } catch (\Throwable $e) {
        \Illuminate\Support\Facades\Log::error('Notificacao cron falhou (meta): '.$e->getMessage());
    }
};

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Processar fila a cada minuto (cPanel compatível)
Schedule::command('queue:work --stop-when-empty --max-time=55')
    ->everyMinute()
    ->withoutOverlapping();

// Limpeza de códigos 2FA expirados diária
Schedule::command('model:prune', ['--model' => [\App\Models\CodigoVerificacaoSms::class]])
    ->daily();

// ============================================
// Subscrição - Fase 1
// ============================================

// Expirar trials (trial -> grace -> suspensa) - todos os dias às 06h
Schedule::job(new \App\Domains\Subscription\Jobs\ExpirarTrialsJob)
    ->dailyAt('06:00')
    ->withoutOverlapping()
    ->name('ondaka.expirar-trials');

// Notificar clientes com trial a expirar (7d, 3d, 1d) - 09h00 diário
Schedule::command('subscricoes:notificar-recuperacao-trial')
    ->dailyAt('09:00')
    ->withoutOverlapping()
    ->name('ondaka.recuperacao-trial');

// Aplicar downgrades de plano agendados — 02h00 (antes do facturamento)
Schedule::command('subscricoes:aplicar-downgrades-agendados')
    ->dailyAt('02:00')
    ->withoutOverlapping()
    ->name('ondaka.aplicar-downgrades');

// Enviar avisos D-7, D-3, D0, D+1, D+3, D+7 - todos os dias às 07h
Schedule::job(new \App\Domains\Subscription\Jobs\EnviarAvisosTrialJob)
    ->dailyAt('07:00')
    ->withoutOverlapping()
    ->name('ondaka.enviar-avisos-trial');

// Renovar subscrições (cria novo período) - todos os dias às 08h
Schedule::job(new \App\Domains\Subscription\Jobs\RenovarSubscricoesJob)
    ->dailyAt('08:00')
    ->withoutOverlapping()
    ->name('ondaka.renovar-subscricoes');

// ============================================
// Features - Fase 2
// ============================================

// Processar recargas automáticas de features consumíveis
// (dispara quando saldo <= limite_baixo e recarga_automatica = true)
Schedule::command('feature:recargas-auto')
    ->everyTwoHours()
    ->withoutOverlapping()
    ->name('ondaka.recargas-auto');

// Expirar trials de features cuja data de expiração já passou
Schedule::command('feature:expire-trials')
    ->dailyAt('02:30')
    ->withoutOverlapping()
    ->name('ondaka.expire-trials');

// ============================================
// Encomendas - automação diária
// ============================================
// Aviso ao residente quando encomenda atinge limite de dias na portaria (default 5)
Schedule::command('encomendas:aviso-5-dias')
    ->dailyAt('09:00')
    ->withoutOverlapping()
    ->name('ondaka.encomendas-aviso');

// Aplicar multa automática a encomendas que ultrapassam dias_multa (default 7)
// Corre 5min após o aviso para garantir ordem
Schedule::command('encomendas:aplicar-multa')
    ->dailyAt('09:05')
    ->withoutOverlapping()
    ->name('ondaka.encomendas-multa');

// ============================================
// Subscrição B2B - Fase 2 (nova spec)
// ============================================

// Emitir facturas plataforma para subscrições com trial expirado ou renovação
// Corre de hora a hora para apanhar trials que expiram durante o dia
Schedule::command('subscricoes:emitir-facturas')
    ->hourly()
    ->withoutOverlapping()
    ->name('ondaka.emitir-facturas-plataforma')
    ->onFailure(fn () => $notificarFalhaCron('Emitir facturas plataforma'));

// ============================================
// Quotas - Geração Recorrente Mensal
// ============================================
// Verifica diariamente às 02:00 se algum condomínio tem dia_geracao = hoje
Schedule::command('quotas:gerar-recorrente')
    ->dailyAt('02:00')
    ->withoutOverlapping()
    ->name('ondaka.quotas-recorrentes')
    ->onFailure(fn () => $notificarFalhaCron('Gerar quotas recorrentes'));

// ============================================
// Saldo SMS - Alerta ao super-admin
// ============================================
// Verifica diariamente o saldo SMS e notifica o super-admin se abaixo do limite
Schedule::command('sms:saldo')
    ->dailyAt('08:00')
    ->withoutOverlapping()
    ->name('ondaka.saldo-sms')
    ->onFailure(fn () => $notificarFalhaCron('Verificar saldo SMS'));

// ============================================
// Taxas de Condomínio - Avisos ao condómino
// ============================================
// Notifica condóminos sobre taxas a vencer (3 dias antes) e vencidas
Schedule::command('taxas:notificar')
    ->dailyAt('08:00')
    ->withoutOverlapping()
    ->name('ondaka.taxas-notificar')
    ->onFailure(fn () => $notificarFalhaCron('Notificar taxas condómino'));

// ============================================
// SMS Básico — reset mensal do pacote de 200 SMS
// ============================================
Schedule::command('sms:reset-basico')
    ->monthlyOn(1, '00:30')
    ->withoutOverlapping()
    ->name('ondaka.sms-reset-basico')
    ->onFailure(fn () => $notificarFalhaCron('Reset mensal SMS básico'));
