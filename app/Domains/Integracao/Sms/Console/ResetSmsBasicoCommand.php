<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Console;

use App\Domains\Feature\Models\Feature;
use App\Domains\Feature\Models\FeatureSubscription;
use Illuminate\Console\Command;

/**
 * Repõe o saldo mensal de 200 SMS do serviço SMS Básico (sms_basico)
 * para todas as subscrições activas. Agendado no início de cada mês.
 */
class ResetSmsBasicoCommand extends Command
{
    protected $signature = 'sms:reset-basico';

    protected $description = 'Repõe o pacote mensal de 200 SMS do serviço SMS Básico (subscrições activas).';

    public function handle(): int
    {
        $feature = Feature::where('slug', 'sms_basico')->first();
        if (! $feature) {
            $this->warn('Feature sms_basico não existe.');
            return self::SUCCESS;
        }

        $n = FeatureSubscription::where('feature_id', $feature->id)
            ->where('estado', 'activa')
            ->update([
                'saldo_inicial' => 200,
                'saldo_actual' => 200,
                'saldo_utilizado' => 0,
            ]);

        $this->info("Reposto o pacote mensal de 200 SMS em {$n} subscrição(ões) do serviço básico.");

        return self::SUCCESS;
    }
}
