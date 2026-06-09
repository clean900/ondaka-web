<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Console;

use App\Domains\Facturacao\Models\CondominioFacturacaoConfig;
use App\Domains\Facturacao\Models\Quota;
use App\Domains\Facturacao\Services\QuotaService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

/**
 * Cron job mensal de geração de quotas.
 *
 * Schedule: diariamente às 02:00 (definido em routes/console.php).
 *
 * Lógica:
 * 1. Lê todos os condomínios com geracao_automatica=true
 * 2. Para cada um, verifica se hoje é o dia_geracao configurado
 * 3. Se sim, gera quotas para o mês actual
 *
 * O service é idempotente — correr várias vezes no mesmo dia
 * NÃO cria duplicados (constraint unique fraccao+ano+mes).
 *
 * Uso manual (testes):
 *   php artisan quotas:gerar-mensal
 *   php artisan quotas:gerar-mensal --force      # ignora dia_geracao
 *   php artisan quotas:gerar-mensal --dry-run    # apenas simula
 */
class GerarQuotasMensalCommand extends Command
{
    protected $signature = 'quotas:gerar-mensal
                            {--force : Ignora o dia_geracao configurado e corre para todos}
                            {--dry-run : Apenas simula, não grava}';

    protected $description = 'Cron mensal: gera quotas automaticamente para condomínios elegíveis';

    public function handle(QuotaService $service): int
    {
        $hoje = Carbon::now();
        $force = (bool) $this->option('force');
        $dryRun = (bool) $this->option('dry-run');

        $this->info("=== Geração mensal de quotas — {$hoje->toDateString()} ===");
        $this->newLine();

        $configs = CondominioFacturacaoConfig::query()
            ->where('geracao_automatica', true)
            ->with('condominio:id,nome,empresa_gestora_id')
            ->get();

        if ($configs->isEmpty()) {
            $this->warn('Nenhum condomínio configurado para geração automática.');
            return self::SUCCESS;
        }

        $this->info("Condomínios com geração automática: {$configs->count()}");
        if ($dryRun) {
            $this->warn('MODO DRY-RUN — nada será gravado.');
        }
        $this->newLine();

        $totalGeradas = 0;
        $totalIgnoradas = 0;
        $totalKz = 0.0;
        $linhas = [];

        foreach ($configs as $config) {
            $condominio = $config->condominio;

            if (! $condominio) {
                $linhas[] = [
                    'Config #' . $config->id,
                    'condomínio inexistente',
                    '—',
                    '—',
                    '—',
                ];
                continue;
            }

            // Verificar se hoje é o dia certo (ou --force)
            if (! $force && $hoje->day !== $config->dia_geracao) {
                $linhas[] = [
                    $condominio->nome,
                    "salta — gera dia {$config->dia_geracao}",
                    '—',
                    '—',
                    '—',
                ];
                continue;
            }

            if ($dryRun) {
                $linhas[] = [
                    $condominio->nome,
                    'dry-run',
                    'simulação',
                    '—',
                    '—',
                ];
                continue;
            }

            // Gerar para o mês actual
            $resultado = $service->gerarQuotasParaPeriodo(
                condominioId: $condominio->id,
                empresaGestoraId: $condominio->empresa_gestora_id,
                ano: $hoje->year,
                mes: $hoje->month,
                origem: Quota::ORIGEM_AUTOMATICA,
            );

            $totalGeradas += $resultado['geradas'];
            $totalIgnoradas += $resultado['ignoradas_ja_existem'] + $resultado['ignoradas_sem_contrato'] + $resultado['ignoradas_sem_valores'];
            $totalKz += $resultado['total_kz'];

            $linhas[] = [
                $condominio->nome,
                'OK',
                $resultado['geradas'],
                $resultado['ignoradas_ja_existem'] + $resultado['ignoradas_sem_contrato'] + $resultado['ignoradas_sem_valores'],
                number_format($resultado['total_kz'], 2, ',', '.') . ' Kz',
            ];
        }

        $this->table(
            ['Condomínio', 'Estado', 'Geradas', 'Ignoradas', 'Total'],
            $linhas
        );

        $this->newLine();
        $this->info("Total geradas: {$totalGeradas}");
        $this->info("Total ignoradas: {$totalIgnoradas}");
        $this->info('Total facturado: ' . number_format($totalKz, 2, ',', '.') . ' Kz');

        return self::SUCCESS;
    }
}
