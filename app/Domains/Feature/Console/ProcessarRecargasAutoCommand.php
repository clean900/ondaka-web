<?php

declare(strict_types=1);

namespace App\Domains\Feature\Console;

use App\Domains\Feature\Services\RecargaAutoService;
use Illuminate\Console\Command;

class ProcessarRecargasAutoCommand extends Command
{
    protected $signature = 'feature:recargas-auto
                            {--dry-run : Apenas lista candidatas, não dispara}';

    protected $description = 'Processar recargas automáticas para features consumíveis com saldo baixo';

    public function handle(RecargaAutoService $service): int
    {
        $dryRun = $this->option('dry-run');

        $this->info($dryRun ? 'MODO DRY-RUN (sem disparar)' : 'Processando recargas automáticas...');
        $this->newLine();

        $candidatas = $service->encontrarCandidatas();

        if ($candidatas->isEmpty()) {
            $this->info('Nenhuma subscription precisa de recarga automática.');
            return self::SUCCESS;
        }

        $this->line("Encontradas {$candidatas->count()} candidatas:");
        $this->newLine();

        $disparadas = 0;
        $falhadas = 0;

        foreach ($candidatas as $sub) {
            $ownerNome = $sub->owner?->nome ?? 'ID ' . $sub->owner_id;
            $feature = $sub->feature?->nome ?? 'desconhecida';
            $saldo = $sub->saldo_actual;
            $limite = $sub->recarga_limite_baixo;
            $pacote = $sub->recargaPacote?->nome ?? '—';

            $this->line("  [#{$sub->id}] {$feature} de {$ownerNome}");
            $this->line("    Saldo: {$saldo} (limite: {$limite}) → pacote: {$pacote}");

            if (! $dryRun) {
                if ($service->dispararRecarga($sub)) {
                    $disparadas++;
                    $this->line('    <fg=green>✓ Recarga disparada</fg=green>');
                } else {
                    $falhadas++;
                    $this->line('    <fg=red>✗ Falha</fg=red>');
                }
            }
        }

        $this->newLine();

        if ($dryRun) {
            $this->warn("Dry-run concluído. {$candidatas->count()} candidatas encontradas.");
        } else {
            $this->info("Disparadas: {$disparadas} · Falhadas: {$falhadas}");
        }

        // Alerta: subscriptions com saldo baixo que NÃO têm recarga auto
        $semRecarga = $service->subscriptionsComSaldoBaixo();
        $semRecargaCount = $semRecarga->filter(fn ($s) => ! $s->recarga_automatica)->count();

        if ($semRecargaCount > 0) {
            $this->newLine();
            $this->warn("Atenção: {$semRecargaCount} subscriptions com saldo baixo SEM recarga automática configurada.");
        }

        return self::SUCCESS;
    }
}
