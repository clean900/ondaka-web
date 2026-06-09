<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Console;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Subscription\Services\NotificacaoB2BService;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Notifica clientes com trial a expirar.
 * Corre diariamente. Notifica em 3 momentos: 7d, 3d, 1d antes da expiração.
 *
 * php artisan subscricoes:notificar-recuperacao-trial
 */
class NotificarRecuperacaoTrialCommand extends Command
{
    protected $signature = 'subscricoes:notificar-recuperacao-trial';
    protected $description = 'Notifica clientes com trial a expirar (7d, 3d, 1d)';

    protected array $diasAlvo = [7, 3, 1];

    public function handle(NotificacaoB2BService $notificacao): int
    {
        $this->info('A processar notificações de recuperação trial...');

        $hoje = Carbon::today();
        $totalNotificados = 0;

        foreach ($this->diasAlvo as $dias) {
            $alvoData = $hoje->copy()->addDays($dias);

            $subscricoes = DB::table('subscricoes')
                ->where('estado', 'trial')
                ->whereDate('trial_expira_em', $alvoData->toDateString())
                ->whereNull('deleted_at')
                ->get();

            foreach ($subscricoes as $sub) {
                $empresa = EmpresaGestora::find($sub->empresa_gestora_id);
                if (! $empresa) continue;

                $user = User::where('empresa_gestora_id', $sub->empresa_gestora_id)
                    ->whereHas('roles', fn ($q) => $q->where('name', 'admin-empresa'))
                    ->first();
                if (! $user) continue;

                // Evitar duplicados — verificar se já foi notificado HOJE para este nº dias
                $jaNotificado = DB::table('plataforma_subscricao_eventos')
                    ->where('subscricao_id', $sub->id)
                    ->where('tipo', 'recuperacao_notificada')
                    ->whereDate('created_at', $hoje)
                    ->where('descricao', 'like', "%{$dias} dias%")
                    ->exists();

                if ($jaNotificado) continue;

                $notificacao->recuperacaoTrialExpirar($user, $empresa, $dias);

                DB::table('plataforma_subscricao_eventos')->insert([
                    'subscricao_id' => $sub->id,
                    'tipo' => 'recuperacao_notificada',
                    'descricao' => "Notificação trial expira em {$dias} dias enviada",
                    'meta_json' => json_encode(['dias_restantes' => $dias, 'canais' => $dias <= 7 ? ['email', 'sms'] : ['email']]),
                    'user_id' => null,
                    'created_at' => now(),
                ]);

                $this->line("  → Notificado: {$empresa->nome} ({$dias}d restantes)");
                $totalNotificados++;
            }
        }

        $this->info("Total notificados: {$totalNotificados}");
        return self::SUCCESS;
    }
}
