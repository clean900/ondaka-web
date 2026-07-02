<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Domains\Payment\Services\ProxyPayService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProxyPayPuxarPagamentosCommand extends Command
{
    protected $signature = 'proxypay:puxar-pagamentos {--dry-run : Apenas listar, nao processar}';

    protected $description = 'Puxa pagamentos pendentes da ProxyPay e processa-os localmente';

    public function handle(ProxyPayService $service): int
    {
        $dryRun = $this->option('dry-run');

        $apiKey = config('services.proxypay.api_key');
        $baseUrl = config('services.proxypay.base_url');

        if (empty($apiKey)) {
            $this->error('PROXYPAY_API_KEY nao configurada');
            return self::FAILURE;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Token '.$apiKey,
                'Accept' => 'application/vnd.proxypay.v2+json',
            ])->baseUrl($baseUrl)->timeout(30)->get('/payments');
        } catch (\Throwable $e) {
            $this->error('Falha ao contactar ProxyPay: '.$e->getMessage());
            Log::error('ProxyPay polling: excepcao na chamada', ['error' => $e->getMessage()]);
            return self::FAILURE;
        }

        if (! $response->successful()) {
            $this->error('Erro HTTP '.$response->status().' ao listar pagamentos');
            Log::error('ProxyPay polling: HTTP error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return self::FAILURE;
        }

        $payments = $response->json();
        $total = count($payments);

        if ($total === 0) {
            $this->info('Sem pagamentos pendentes.');
            return self::SUCCESS;
        }

        $this->info("{$total} pagamento(s) pendente(s) na ProxyPay.");

        $processados = 0;
        $erros = 0;

        foreach ($payments as $payment) {
            $id = $payment['id'] ?? 'desconhecido';
            $refId = $payment['reference_id'] ?? 'desconhecido';
            $amount = $payment['amount'] ?? '0';

            $this->line("-- id={$id} ref={$refId} amount={$amount}");

            if ($dryRun) {
                $this->line('   [dry-run] saltar');
                continue;
            }

            try {
                $nosso = $service->processarPagamentoWebhook($payment);

                if (! $nosso) {
                    // Conta ProxyPay partilhada: este pagamento é de outro sistema (ex.: Welwitschia).
                    // NÃO dar ACK — deixar na fila para o poller desse sistema o confirmar.
                    $this->line('   ref não é do ONDAKA — deixado na fila.');

                    continue;
                }

                $ackResponse = Http::withHeaders([
                    'Authorization' => 'Token '.$apiKey,
                    'Accept' => 'application/vnd.proxypay.v2+json',
                ])->baseUrl($baseUrl)->timeout(30)->delete('/payments/'.$id);

                if ($ackResponse->successful()) {
                    $this->info('   processado + ACK');
                    $processados++;
                } else {
                    $this->warn('   processado mas ACK falhou HTTP '.$ackResponse->status());
                    $erros++;
                    Log::warning('ProxyPay polling: ACK falhou', [
                        'payment_id' => $id,
                        'status' => $ackResponse->status(),
                    ]);
                }
            } catch (\Throwable $e) {
                $this->error('   erro: '.$e->getMessage());
                $erros++;
                Log::error('ProxyPay polling: falha a processar payment', [
                    'payment_id' => $id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();
        $this->info("Resumo: {$processados} processados, {$erros} erros.");

        return $erros > 0 ? self::FAILURE : self::SUCCESS;
    }
}