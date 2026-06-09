<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Console;

use App\Domains\Facturacao\Services\MultaService;
use Illuminate\Console\Command;

/**
 * Cron diário de aplicação de multas automáticas.
 *
 * Schedule: diariamente às 02:30 (definido em routes/console.php)
 *
 * Lógica:
 * - Para cada condomínio com multas activas
 * - Verifica quotas vencidas há mais de N dias (config)
 * - Aplica multa segundo regras configuradas
 *
 * Idempotente — não duplica multas (config.multa_recorrente decide).
 *
 * Uso manual:
 *   php artisan multas:aplicar
 *   php artisan multas:aplicar --condominio=2
 */
class AplicarMultasCommand extends Command
{
    protected $signature = 'multas:aplicar
                            {--condominio= : ID de um condomínio específico (omitir = todos)}';

    protected $description = 'Aplica multas automáticas a quotas em atraso';

    public function handle(MultaService $service): int
    {
        $condominioId = $this->option('condominio');

        $this->info('=== Aplicação de multas — ' . now()->toDateTimeString() . ' ===');
        $this->newLine();

        if ($condominioId) {
            $r = $service->aplicarMultasParaCondominio((int) $condominioId);
            $this->mostrarResultadoCondominio((int) $condominioId, $r);
            return self::SUCCESS;
        }

        // Todos os condomínios
        $r = $service->aplicarMultasGlobalmente();

        $linhas = array_map(fn ($c) => [
            $c['nome'],
            $c['criadas'],
            number_format((float) $c['total_kz'], 2, ',', '.') . ' Kz',
        ], $r['por_condominio']);

        $this->table(['Condomínio', 'Multas criadas', 'Total'], $linhas);
        $this->newLine();
        $this->info("Total geral de multas criadas: {$r['total_criadas']}");
        $this->info('Total facturado em multas: ' . number_format((float) $r['total_kz'], 2, ',', '.') . ' Kz');

        return self::SUCCESS;
    }

    private function mostrarResultadoCondominio(int $id, array $r): void
    {
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Criadas', $r['criadas']],
                ['Ignoradas', $r['ignoradas']],
                ['Total (Kz)', number_format((float) $r['total_kz'], 2, ',', '.')],
            ]
        );

        if (! empty($r['detalhes'])) {
            $this->newLine();
            $linhas = array_map(fn ($d) => [
                $d['quota_id'] ?? '—',
                $d['estado'],
                $d['valor'] ?? $d['motivo'] ?? '—',
            ], $r['detalhes']);
            $this->table(['Quota', 'Estado', 'Valor / Motivo'], $linhas);
        }
    }
}
