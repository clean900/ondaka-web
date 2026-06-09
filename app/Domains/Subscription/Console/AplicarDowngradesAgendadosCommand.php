<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Aplica downgrades de plano agendados cuja data chegou.
 * Corre diariamente às 02h (antes do facturamento).
 *
 * php artisan subscricoes:aplicar-downgrades-agendados
 */
class AplicarDowngradesAgendadosCommand extends Command
{
    protected $signature = 'subscricoes:aplicar-downgrades-agendados';
    protected $description = 'Aplica downgrades de plano agendados cuja data já chegou';

    public function handle(): int
    {
        $this->info('A processar downgrades agendados...');

        $hoje = now()->startOfDay();
        $aplicados = 0;

        $pendentes = DB::table('subscricoes')
            ->whereNotNull('proximo_ciclo')
            ->whereNotNull('proximo_ciclo_aplica_em')
            ->where('proximo_ciclo_aplica_em', '<=', $hoje)
            ->whereNull('deleted_at')
            ->get();

        foreach ($pendentes as $sub) {
            $cicloAntigo = $sub->ciclo;
            $cicloNovo = $sub->proximo_ciclo;

            DB::transaction(function () use ($sub, $cicloAntigo, $cicloNovo) {
                DB::table('subscricoes')->where('id', $sub->id)->update([
                    'ciclo' => $cicloNovo,
                    'proximo_ciclo' => null,
                    'proximo_ciclo_aplica_em' => null,
                    'updated_at' => now(),
                ]);

                DB::table('plataforma_subscricao_eventos')->insert([
                    'subscricao_id' => $sub->id,
                    'tipo' => 'plano_alterado',
                    'descricao' => "Downgrade agendado aplicado: {$cicloAntigo} → {$cicloNovo}",
                    'meta_json' => json_encode([
                        'tipo' => 'downgrade_aplicado',
                        'de' => $cicloAntigo,
                        'para' => $cicloNovo,
                        'origem' => 'cron_automatico',
                    ]),
                    'user_id' => null,
                    'created_at' => now(),
                ]);
            });

            $this->line("  → Subscrição #{$sub->id}: {$cicloAntigo} → {$cicloNovo}");
            $aplicados++;
        }

        $this->info("Total aplicados: {$aplicados}");
        return self::SUCCESS;
    }
}
