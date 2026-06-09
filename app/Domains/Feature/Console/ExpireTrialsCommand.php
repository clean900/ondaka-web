<?php

namespace App\Domains\Feature\Console;

use App\Domains\Feature\Services\TrialService;
use Illuminate\Console\Command;

/**
 * ONDAKA — feature:expire-trials
 *
 * Comando que marca como 'expirada' todos os trials cuja data de
 * expiração já passou. Deve correr diariamente via schedule:run.
 *
 * Uso manual:   php artisan feature:expire-trials
 * Uso em cron:  está registado em routes/console.php (schedule daily)
 */
class ExpireTrialsCommand extends Command
{
    protected $signature = 'feature:expire-trials';

    protected $description = 'Marca como expirada todas as subscrições de trial cujo prazo terminou.';

    public function handle(TrialService $service): int
    {
        $this->info('A verificar trials vencidos...');

        $count = $service->expirarVencidos();

        if ($count === 0) {
            $this->info('Nenhum trial para expirar.');
        } else {
            $this->info("✅ {$count} trial(s) marcado(s) como expirada.");
        }

        return self::SUCCESS;
    }
}
