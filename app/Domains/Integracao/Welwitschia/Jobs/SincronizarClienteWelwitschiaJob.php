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
 * Empurra uma empresa gestora do ONDAKA para a Welwitschia como cliente.
 * Em fila e resiliente: falhas não afectam o fluxo do ONDAKA.
 */
class SincronizarClienteWelwitschiaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public string $nome,
        public ?string $email = null,
        public ?int $empresaGestoraId = null,
    ) {}

    public function handle(WelwitschiaClient $welw): void
    {
        if (! $welw->configurado()) {
            Log::info('[Welwitschia] token não configurado — sync de cliente ignorado.', [
                'empresa_gestora_id' => $this->empresaGestoraId,
            ]);
            return;
        }

        $resp = $welw->criarCliente($this->nome, $this->email);

        if ($resp->successful()) {
            Log::info('[Welwitschia] cliente sincronizado.', [
                'empresa_gestora_id' => $this->empresaGestoraId,
                'nome' => $this->nome,
                'status' => $resp->status(),
            ]);
            return;
        }

        Log::warning('[Welwitschia] sync de cliente falhou.', [
            'empresa_gestora_id' => $this->empresaGestoraId,
            'status' => $resp->status(),
            'body' => $resp->body(),
        ]);

        // 4xx (ex.: validação) não vale a pena repetir; 5xx/timeout → retry.
        if ($resp->status() >= 500 || $resp->status() === 0) {
            $this->release($this->backoff);
        }
    }
}
