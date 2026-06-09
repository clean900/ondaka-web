<?php

declare(strict_types=1);

namespace App\Domains\Feature\Console;

use App\Domains\Feature\Models\FeatureSubscription;
use Illuminate\Console\Command;

/**
 * ONDAKA — feature:expire-subscriptions
 *
 * Marca como 'expirada' as subscrições PAGAS (não-trial) cujo
 * prazo (expira_em) já passou e que ainda estão 'activa'.
 *
 * Complementa o feature:expire-trials (que só trata trials).
 *
 * Uso manual: php artisan feature:expire-subscriptions
 */
class ExpireSubscriptionsCommand extends Command
{
    protected $signature = 'feature:expire-subscriptions';

    protected $description = 'Marca como expirada as subscrições pagas (não-trial) cujo prazo terminou.';

    public function handle(): int
    {
        $this->info('A verificar subscrições pagas vencidas...');

        $vencidas = FeatureSubscription::query()
            ->where('estado', 'activa')
            ->whereNotNull('expira_em')
            ->where('expira_em', '<=', now())
            ->where(function ($q) {
                $q->whereNull('configuracao')
                  ->orWhere('configuracao', 'not like', '%is_trial%');
            })
            ->get();

        $count = 0;
        foreach ($vencidas as $sub) {
            $sub->update([
                'estado' => 'expirada',
                'notas_admin' => trim(($sub->notas_admin ?? '') . "\nSubscrição expirada em " . now()->format('d/m/Y H:i')),
            ]);
            $count++;
        }

        if ($count === 0) {
            $this->info('Nenhuma subscrição paga para expirar.');
        } else {
            $this->info("✅ {$count} subscrição(ões) marcada(s) como expirada.");
        }

        return self::SUCCESS;
    }
}
