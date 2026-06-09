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

            $numeroConta = trim((string) $config->numero_conta);
            $ibanNorm = $this->normalizarIban($iban);
            $existe = ContaBancaria::where('condominio_id', $config->condominio_id)
                ->get()
                ->first(fn ($c) => $this->normalizarIban((string) $c->iban) === $ibanNorm);

            if ($existe) {
                // Completar dados em falta (ex.: numero_conta) sem duplicar
                if (($existe->numero_conta === null || $existe->numero_conta === '') && $numeroConta !== '') {
                    $this->line("  Condominio {$config->condominio_id}: completar numero_conta na conta #{$existe->id}".($dryRun ? ' [DRY-RUN]' : ''));
                    if (! $dryRun) {
                        $existe->numero_conta = $numeroConta;
                        $existe->save();
                    }
                    $jaExistiam++;
                } else {
                    $jaExistiam++;
                    $this->line("  Condominio {$config->condominio_id}: ja tem conta (#{$existe->id}) completa para IBAN {$iban}");
                }
                continue;
            }

            $this->line("  Condominio {$config->condominio_id}: criar conta '{$banco}' / {$iban}".($dryRun ? ' [DRY-RUN]' : ''));

            if (! $dryRun) {
                ContaBancaria::create([
                    'condominio_id' => $config->condominio_id,
                    'nome' => $config->titular_conta ?: 'Conta do condominio',
                    'banco' => $banco,
                    'iban' => $iban,
                    'numero_conta' => $numeroConta !== '' ? $numeroConta : null,
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
    private function normalizarIban(string $iban): string
    {
        return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $iban) ?? '');
    }
}
