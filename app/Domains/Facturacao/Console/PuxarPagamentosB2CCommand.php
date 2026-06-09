<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Console;

use App\Domains\Facturacao\Models\CondominioFacturacaoConfig;
use App\Domains\Payment\Services\ProxyPayService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Polling fallback B2C — puxa pagamentos pendentes da ProxyPay
 * para CADA condomínio com credenciais activas.
 *
 * Necessário porque:
 * - Sandbox ProxyPay não envia webhooks automaticamente (bug documentado)
 * - Em produção: rede 4G falha, webhook pode perder-se
 *
 * Lógica:
 * 1. Buscar todos condomínios com proxypay_activo=true e credenciais
 * 2. Para cada um: GET /payments com credenciais do condomínio
 * 3. Processar via processarPagamentoWebhook (que já bifurca B2C)
 * 4. ACK ao ProxyPay com DELETE /payments/{id}
 *
 * Schedule: cada 5min (cron) ou manual.
 */
class PuxarPagamentosB2CCommand extends Command
{
    protected $signature = 'proxypay:puxar-b2c
                            {--condominio= : Limitar a um condomínio específico}
                            {--dry-run : Apenas listar, não processar}';

    protected $description = 'Polling fallback ProxyPay B2C — puxa pagamentos pendentes de cada condomínio';

    public function handle(ProxyPayService $service): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $condominioFiltro = $this->option('condominio');

        $this->info('=== Polling ProxyPay B2C — ' . now()->toDateTimeString() . ' ===');
        if ($dryRun) {
            $this->warn('MODO DRY-RUN — nada será gravado.');
        }
        $this->newLine();

        $query = CondominioFacturacaoConfig::query()
            ->where('proxypay_activo', true)
            ->whereNotNull('proxypay_api_token')
            ->whereNotNull('proxypay_entity_id')
            ->with('condominio:id,nome');

        if ($condominioFiltro) {
            $query->where('condominio_id', (int) $condominioFiltro);
        }

        $configs = $query->get();

        if ($configs->isEmpty()) {
            $this->warn('Nenhum condomínio com ProxyPay activo.');
            return self::SUCCESS;
        }

        $this->info("Condomínios com ProxyPay: {$configs->count()}");
        $this->newLine();

        $totalProcessados = 0;
        $totalErros = 0;

        foreach ($configs as $config) {
            $nome = $config->condominio?->nome ?? "#{$config->condominio_id}";
            $this->line("→ {$nome} (entity {$config->proxypay_entity_id})");

            $r = $this->processarCondominio($config, $service, $dryRun);
            $totalProcessados += $r['processados'];
            $totalErros += $r['erros'];

            if ($r['processados'] === 0 && $r['erros'] === 0 && ! $dryRun) {
                $this->line('   sem pagamentos pendentes');
            }
        }

        $this->newLine();
        $this->info("Total: {$totalProcessados} processados, {$totalErros} erros.");

        return $totalErros > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function processarCondominio(
        CondominioFacturacaoConfig $config,
        ProxyPayService $service,
        bool $dryRun,
    ): array {
        $baseUrl = $config->proxypay_sandbox
            ? 'https://api.sandbox.proxypay.co.ao'
            : 'https://api.proxypay.co.ao';

        $http = Http::withHeaders([
            'Authorization' => 'Token ' . $config->proxypay_api_token,
            'Accept' => 'application/vnd.proxypay.v2+json',
        ])->baseUrl($baseUrl)->timeout(30);

        try {
            $response = $http->get('/payments');
        } catch (\Throwable $e) {
            $this->error('   falha de ligação: ' . $e->getMessage());
            return ['processados' => 0, 'erros' => 1];
        }

        if (! $response->successful()) {
            $this->warn('   HTTP ' . $response->status() . ' ao listar pagamentos');
            return ['processados' => 0, 'erros' => 1];
        }

        $payments = $response->json() ?? [];
        if (empty($payments)) {
            return ['processados' => 0, 'erros' => 0];
        }

        $this->info("   " . count($payments) . " pagamento(s) pendentes");

        $processados = 0;
        $erros = 0;

        foreach ($payments as $payment) {
            $id = $payment['id'] ?? 'desconhecido';
            $refId = $payment['reference_id'] ?? '?';
            $amount = $payment['amount'] ?? '0';
            $this->line("   -- id={$id} ref={$refId} amount={$amount}");

            if ($dryRun) {
                $this->line('      [dry-run] saltar');
                continue;
            }

            try {
                // Reutiliza handler central (faz routing B2C automático)
                $service->processarPagamentoWebhook($payment);

                // ACK ProxyPay: DELETE /payments/{id}
                $ack = $http->delete('/payments/' . $id);

                if ($ack->successful()) {
                    $this->info('      processado + ACK');
                    $processados++;
                } else {
                    $this->warn('      processado mas ACK falhou HTTP ' . $ack->status());
                    $erros++;
                }
            } catch (\Throwable $e) {
                $this->error('      erro: ' . $e->getMessage());
                Log::error('ProxyPay B2C polling: falha', [
                    'condominio_id' => $config->condominio_id,
                    'payment_id' => $id,
                    'error' => $e->getMessage(),
                ]);
                $erros++;
            }
        }

        return ['processados' => $processados, 'erros' => $erros];
    }
}
