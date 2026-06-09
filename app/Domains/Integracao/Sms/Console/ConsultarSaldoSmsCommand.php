<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Console;

use App\Domains\Integracao\Sms\Adapters\TelcoSmsAdapter;
use App\Domains\Integracao\Sms\Contracts\SmsProviderInterface;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Domains\Empresa\Notifications\SaldoSmsBaixoSuperAdminNotification;

class ConsultarSaldoSmsCommand extends Command
{
    protected $signature = 'sms:saldo {--detalhe : Mostrar info completa da conta}';

    protected $description = 'Consultar saldo de SMS na conta de serviço SMS ONDAKA';

    public function handle(SmsProviderInterface $provider): int
    {
        $this->line('Provider: '.$provider->nome());
        $this->line('A consultar saldo...');
        $this->newLine();

        $saldo = $provider->saldo();

        if ($saldo === null) {
            $this->error('Não foi possível consultar o saldo.');
            $this->line('Verifique a API key em .env (TELCOSMS_API_KEY) e os logs.');
            return self::FAILURE;
        }

        $this->info("Saldo actual: {$saldo} SMS");

        // Info detalhada (se provider TelcoSMS)
        if ($provider instanceof TelcoSmsAdapter) {
            $info = $provider->infoConta();
            if (! empty($info)) {
                $this->newLine();
                $this->line('Conta:');
                if (isset($info['name'])) $this->line('  Nome: '.$info['name']);
                if (isset($info['email'])) $this->line('  Email: '.$info['email']);
                if (isset($info['sms_sent'])) $this->line('  SMS enviados histórico: '.$info['sms_sent']);

                if (isset($info['plan_expirad']) && $info['plan_expirad'] === 'yes') {
                    $this->newLine();
                    $this->warn('⚠ PLANO EXPIRADO na TelcoSMS');
                    if (isset($info['can_send_without_balance']) && $info['can_send_without_balance'] === 'no') {
                        $this->warn('⚠ Envios podem ser bloqueados. Renovar plano na TelcoSMS.');
                    }
                }
            }
        }

        $minimo = (int) config('sms.taxa_minima_saldo', 100);
        if ($saldo < $minimo) {
            $this->newLine();
            $this->warn("⚠ Saldo abaixo do limite mínimo ({$minimo}). Considere recarregar.");

            // Notificar super-admins (sino + email) — trava anti-spam de 24h
            if (! Cache::has('saldo_sms_baixo_notificado')) {
                try {
                    $sasNotif = User::role('super-admin')->get();
                    foreach ($sasNotif as $saNotif) {
                        $saNotif->notify(new SaldoSmsBaixoSuperAdminNotification($saldo, $minimo));
                    }
                    Cache::put('saldo_sms_baixo_notificado', true, now()->addHours(24));
                    $this->info('Super-admins notificados do saldo baixo.');
                } catch (\Throwable $e) {
                    Log::error('Notificacao saldo SMS baixo falhou: '.$e->getMessage());
                }
            } else {
                $this->line('(Notificação de saldo baixo já enviada nas últimas 24h — ignorada)');
            }
        } else {
            // Saldo voltou ao normal — limpar a trava para voltar a avisar no futuro
            Cache::forget('saldo_sms_baixo_notificado');
        }

        return self::SUCCESS;
    }
}
