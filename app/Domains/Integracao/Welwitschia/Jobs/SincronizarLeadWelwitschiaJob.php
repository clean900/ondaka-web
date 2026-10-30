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
 * Empresa gestora acabada de registar no ONDAKA → lead no CRM da Welwitschia,
 * com as boas-vindas da ONDAKA a seguir.
 *
 * Em fila e resiliente, como o sync de cliente: o CRM é um extra e uma falha dele
 * nunca pode estragar um registo.
 */
class SincronizarLeadWelwitschiaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public string $nome,
        public ?string $email = null,
        public ?string $telefone = null,
        public ?int $empresaGestoraId = null,
        public ?string $notas = null,
    ) {}

    public function handle(WelwitschiaClient $welw): void
    {
        if (! $welw->configurado()) {
            Log::info('[Welwitschia] token não configurado — lead ignorado.', [
                'empresa_gestora_id' => $this->empresaGestoraId,
            ]);

            return;
        }

        $resp = $welw->criarLead([
            'nome' => $this->nome,
            'empresa' => $this->nome,
            'email' => $this->email,
            'telefone' => $this->telefone,
            // A chave da idempotência: o mesmo registo é sempre o mesmo lead.
            'origem_ref' => 'empresa:'.$this->empresaGestoraId,
            'notas' => $this->notas,
            'boas_vindas' => true,
        ]);

        if ($resp->successful()) {
            Log::info('[Welwitschia] lead registado.', [
                'empresa_gestora_id' => $this->empresaGestoraId,
                'status' => $resp->status(),
                'lead' => $resp->json('data.lead_id'),
                'boas_vindas' => $resp->json('data.boas_vindas'),
            ]);

            return;
        }

        Log::warning('[Welwitschia] registo de lead falhou.', [
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
