<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Welwitschia\Jobs;

use App\Domains\Integracao\Welwitschia\WelwitschiaClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Empurra uma factura da plataforma ONDAKA para a Welwitschia como venda.
 * Idempotente (a API faz updateOrCreate por invoice_number) — serve para emitir
 * e para actualizar o pagamento. Em fila e resiliente.
 */
class SincronizarFacturaWelwitschiaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    /** @param array<string,mixed> $factura */
    public function __construct(public array $factura)
    {
    }

    public function handle(WelwitschiaClient $welw): void
    {
        if (! $welw->configurado()) {
            return;
        }

        $resp = $welw->criarFactura($this->factura);

        if ($resp->successful()) {
            Log::info('[Welwitschia] factura sincronizada.', [
                'invoice_number' => $this->factura['invoice_number'] ?? null,
                'status' => $resp->status(),
            ]);
            return;
        }

        Log::warning('[Welwitschia] sync de factura falhou.', [
            'invoice_number' => $this->factura['invoice_number'] ?? null,
            'status' => $resp->status(),
            'body' => $resp->body(),
        ]);

        if ($resp->status() >= 500 || $resp->status() === 0) {
            $this->release($this->backoff);
        }
    }
}
