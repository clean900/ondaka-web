<?php

declare(strict_types=1);

namespace App\Domains\Financas\Console;

use App\Domains\Facturacao\Models\CondominioFacturacaoConfig;
use App\Domains\Financas\Models\ContaBancaria;
use Illuminate\Console\Command;

class SincronizarContasConfigCommand extends Command
{
    protected $signature = 'contas:sincronizar-config {--dry-run : Apenas mostra o que faria, sem gravar}';

    protected $description = 'Sincroniza os dados bancarios de condominio_facturacao_config para contas_bancarias (fonte unica para web e mobile).';

    public function handle(\App\Domains\Financas\Services\SincronizarContaBancariaService $service): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $configs = CondominioFacturacaoConfig::query()
            ->whereNotNull('iban')
            ->where('iban', '!=', '')
            ->get();

        $criadas = 0;
        $completadas = 0;
        $inalteradas = 0;
        $semDados = 0;

        foreach ($configs as $config) {
            if ($dryRun) {
                $this->line("  Condominio {$config->condominio_id}: avaliaria (IBAN {$config->iban}) [DRY-RUN]");
                continue;
            }

            $resultado = $service->sincronizarDeConfig($config);
            switch ($resultado) {
                case 'criada':
                    $criadas++;
                    $this->line("  Condominio {$config->condominio_id}: conta criada");
                    break;
                case 'completada':
                    $completadas++;
                    $this->line("  Condominio {$config->condominio_id}: conta completada (numero_conta)");
                    break;
                case 'inalterada':
                    $inalteradas++;
                    $this->line("  Condominio {$config->condominio_id}: ja completa");
                    break;
                default:
                    $semDados++;
            }
        }

        $this->info("Concluido. Criadas: {$criadas} | Completadas: {$completadas} | Inalteradas: {$inalteradas} | Sem dados: {$semDados}");

        return self::SUCCESS;
    }
}
