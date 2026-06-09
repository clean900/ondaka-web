<?php

declare(strict_types=1);

namespace App\Domains\Integracao\TelcoSms;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelcoSmsService
{
    public function __construct(
        private readonly string $apiUrl,
        private readonly string $apiKey,
        private readonly string $senderId,
    ) {}

    public function enviar(string $telefone, string $mensagem): bool
    {
        if (empty($this->apiKey)) {
            Log::channel('sms')->warning('TelcoSMS: API key não configurada, SMS não enviado', [
                'to' => $telefone,
            ]);
            return false;
        }

        $telefone = $this->normalizarAngola($telefone);

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($this->apiUrl, [
                    'sender' => $this->senderId,
                    'to' => $telefone,
                    'message' => $mensagem,
                ]);

            if ($response->successful()) {
                Log::channel('sms')->info('SMS enviado', [
                    'to' => $telefone,
                    'sender' => $this->senderId,
                    'length' => strlen($mensagem),
                ]);
                return true;
            }

            Log::channel('sms')->error('Falha envio SMS', [
                'to' => $telefone,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::channel('sms')->error('Excepção envio SMS', [
                'to' => $telefone,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Normaliza números angolanos para formato internacional.
     * Exemplos: 923000000 → +244923000000
     *           244923000000 → +244923000000
     */
    public function normalizarAngola(string $telefone): string
    {
        $numero = preg_replace('/[^0-9+]/', '', $telefone);

        if (str_starts_with($numero, '+244')) {
            return $numero;
        }

        if (str_starts_with($numero, '244')) {
            return '+' . $numero;
        }

        if (str_starts_with($numero, '9') && strlen($numero) === 9) {
            return '+244' . $numero;
        }

        return $numero;
    }
}
