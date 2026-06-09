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

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $configs = CondominioFacturacaoConfig::query()
            ->whereNotNull('iban')
            ->where('iban', '!=', '')
            ->get();

        $criadas = 0;
        $jaExistiam = 0;
        $semDados = 0;

        foreach ($configs as $config) {
            $banco = trim((string) $config->banco_nome);
            $iban = trim((string) $config->iban);
            if ($banco === '' || $iban === '') {
                $semDados++;
                continue;
            }

            $existe = ContaBancaria::where('condominio_id', $config->condominio_id)
                ->where('iban', $iban)
                ->first();

            if ($existe) {
                $jaExistiam++;
                $this->line("  Condominio {$config->condominio_id}: ja tem conta (#{$existe->id}) para IBAN {$iban}");
                continue;
            }

            $this->line("  Condominio {$config->condominio_id}: criar conta '{$banco}' / {$iban}".($dryRun ? ' [DRY-RUN]' : ''));

            if (! $dryRun) {
                ContaBancaria::create([
                    'condominio_id' => $config->condominio_id,
                    'nome' => $config->titular_conta ?: 'Conta do condominio',
                    'banco' => $banco,
                    'iban' => $iban,
                    'tipo' => 'corrente',
                    'moeda' => 'AOA',
                    'activa' => true,
                    'principal' => true,
                    'aceita_manual' => true,
                    'aceita_proxypay' => false,
                ]);
                $criadas++;
            }
        }

        $this->info("Concluido. Criadas: {$criadas} | Ja existiam: {$jaExistiam} | Config sem dados: {$semDados}");

        return self::SUCCESS;
    }
}
