<?php

namespace App\Console\Commands;

use App\Domains\Facturacao\Models\AcordoPagamento;
use App\Domains\Facturacao\Services\AcordoService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class QuebrarAcordosIncumpridos extends Command
{
    protected $signature = 'acordos:quebrar-incumpridos
                            {--dry-run : Apenas mostrar, sem quebrar}';

    protected $description = 'Quebra acordos aprovados/em cumprimento cujo ritmo de pagamento falhou (prestacoes vencidas ha mais de 10 dias sem cobertura).';

    public function handle(AcordoService $acordos): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $candidatos = AcordoPagamento::whereIn('estado', ['aprovado', 'em_cumprimento'])->get();
        $quebrados = 0;

        foreach ($candidatos as $acordo) {
            if (! $acordos->acordoEmDiaComRitmo($acordo)) {
                $this->warn("Acordo #{$acordo->id} (condomino {$acordo->condomino_id}) fora do ritmo -> quebrar");
                if (! $dryRun) {
                    $acordo->update(['estado' => 'quebrado']);
                    Log::info("Acordo #{$acordo->id} quebrado por incumprimento de ritmo.");
                    $quebrados++;
                }
            }
        }

        $this->info($dryRun
            ? "Dry-run: {$candidatos->count()} acordos verificados."
            : "Concluido: {$quebrados} acordo(s) quebrado(s) de {$candidatos->count()} verificados.");

        return self::SUCCESS;
    }
}
