<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Console;

use App\Domains\Facturacao\Models\CondominioFacturacaoConfig;
use App\Domains\Payment\Models\PagamentoReferencia;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cron diário de expiração de referências ProxyPay.
 *
 * Schedule: diariamente às 03:00 (definido em routes/console.php)
 *
 * Lógica:
 * - Procura refs com status='activa' e expira_em < hoje
 * - Tenta apagá-las no lado do ProxyPay (best-effort)
 * - Marca como status='expirada' localmente
 *
 * Idempotente — refs já expiradas não são reprocessadas.
 *
 * Uso manual:
 *   php artisan proxypay:expirar-refs
 *   php artisan proxypay:expirar-refs --dry-run
 */
class ExpirarReferenciasCommand extends Command
{
    protected $signature = 'proxypay:expirar-refs
                            {--dry-run : Apenas simula, não actualiza}';

    protected $description = 'Expira referências ProxyPay activas que passaram da data de validade';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $hoje = now()->toDateString();

        $this->info("=== Expiração de referências ProxyPay — {$hoje} ===");
        if ($dryRun) {
            $this->warn('MODO DRY-RUN — nada será gravado.');
        }
        $this->newLine();

        // Buscar refs expiradas: activas + expira_em no passado
        $refs = PagamentoReferencia::query()
            ->where('status', 'activa')
            ->where('expira_em', '<', $hoje)
            ->get();

        if ($refs->isEmpty()) {
            $this->info('Nenhuma referência para expirar.');
            return self::SUCCESS;
        }

        $this->info("Encontradas {$refs->count()} referências expiradas.");
        $this->newLine();

        $expiradas = 0;
        $erros = 0;
        $linhas = [];

        foreach ($refs as $ref) {
            $tipo = $ref->pagamento_condomino_id ? 'B2C' : 'B2B';
            $detalhes = $ref->pagamento_condomino_id
                ? "Pag #{$ref->pagamento_condomino_id}"
                : "Ordem #{$ref->ordem_compra_id}";

            if ($dryRun) {
                $linhas[] = [
                    $ref->reference_id,
                    $tipo,
                    $detalhes,
                    $ref->expira_em?->toDateString(),
                    'dry-run',
                ];
                continue;
            }

            try {
                // Best-effort: tentar apagar no lado ProxyPay
                $this->apagarReferenciaProxyPay($ref);

                // Marcar como expirada localmente
                $ref->update(['status' => 'expirada']);

                $expiradas++;
                $linhas[] = [
                    $ref->reference_id,
                    $tipo,
                    $detalhes,
                    $ref->expira_em?->toDateString(),
                    'expirada',
                ];
            } catch (\Throwable $e) {
                $erros++;
                $linhas[] = [
                    $ref->reference_id,
                    $tipo,
                    $detalhes,
                    $ref->expira_em?->toDateString(),
                    'erro: ' . substr($e->getMessage(), 0, 30),
                ];

                Log::warning('proxypay:expirar-refs — erro ao expirar', [
                    'reference_id' => $ref->reference_id,
                    'erro' => $e->getMessage(),
                ]);
            }
        }

        $this->table(
            ['Reference ID', 'Tipo', 'Detalhes', 'Expirou em', 'Estado'],
            $linhas
        );

        $this->newLine();
        $this->info("Expiradas: {$expiradas}");
        if ($erros > 0) {
            $this->warn("Erros: {$erros}");
        }

        return self::SUCCESS;
    }

    /**
     * Tenta apagar referência no lado do ProxyPay.
     * B2B usa credenciais env, B2C usa credenciais do condomínio.
     */
    private function apagarReferenciaProxyPay(PagamentoReferencia $ref): void
    {
        if ($ref->pagamento_condomino_id) {
            // B2C — buscar credenciais do condomínio
            $pagamento = \App\Domains\Facturacao\Models\Pagamento::find($ref->pagamento_condomino_id);
            if (! $pagamento) {
                return;
            }

            $config = CondominioFacturacaoConfig::where('condominio_id', $pagamento->condominio_id)->first();
            if (! $config || ! $config->proxypay_api_token) {
                return;
            }

            $baseUrl = $config->proxypay_sandbox
                ? 'https://api.sandbox.proxypay.co.ao'
                : 'https://api.proxypay.co.ao';

            Http::withHeaders([
                'Authorization' => 'Token ' . $config->proxypay_api_token,
                'Accept' => 'application/vnd.proxypay.v2+json',
            ])->baseUrl($baseUrl)->timeout(10)
                ->delete('/references/' . $ref->reference_id);

            return;
        }

        // B2B — usar credenciais do .env (via service existente)
        if ($ref->ordem_compra_id) {
            $apiKey = (string) config('services.proxypay.api_key');
            $baseUrl = (string) config('services.proxypay.base_url');

            if (empty($apiKey) || empty($baseUrl)) {
                return;
            }

            Http::withHeaders([
                'Authorization' => 'Token ' . $apiKey,
                'Accept' => 'application/vnd.proxypay.v2+json',
            ])->baseUrl($baseUrl)->timeout(10)
                ->delete('/references/' . $ref->reference_id);
        }
    }
}
