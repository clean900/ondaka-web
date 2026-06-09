<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Adapters;

use App\Domains\Integracao\Sms\Contracts\SmsProviderInterface;
use App\Domains\Integracao\Sms\Contracts\SmsResult;
use App\Domains\Integracao\Sms\Exceptions\SmsException;
use App\Domains\Integracao\Sms\Support\NumeroAngola;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Adapter para TelcoSMS Angola (API v2).
 *
 * Documentação: https://documenter.getpostman.com/view/9777660/2sAXjDeayT
 *
 * Endpoints usados:
 *   POST /api/v2/send_message
 *   GET  /api/v2/check_balance?api_key_app=...
 *
 * Autenticação: via "api_key_app" no body (não header).
 *
 * Sender ID: configurado na conta TelcoSMS (ex: "ONDAKA").
 * Não é passado por request — todos os SMS da mesma API key saem com o mesmo sender.
 */
class TelcoSmsAdapter implements SmsProviderInterface
{
    private const URL_BASE = 'https://www.telcosms.co.ao/api/v2';
    private const ENDPOINT_ENVIO = '/send_message';
    private const ENDPOINT_SALDO = '/check_balance';
    private const TIMEOUT_SEGUNDOS = 15;

    public function __construct(
        private readonly string $apiKey,
        private readonly ?string $urlBase = null,
    ) {
        if (empty($apiKey)) {
            throw new \RuntimeException('TelcoSMS API key não configurada.');
        }
    }

    public function nome(): string
    {
        return 'Serviço SMS ONDAKA';
    }

    /**
     * Envia SMS via TelcoSMS.
     *
     * @throws SmsException
     */
    public function enviar(string $numero, string $mensagem): SmsResult
    {
        // Normalizar número para formato 9 dígitos
        try {
            $numeroNormalizado = NumeroAngola::normalizar($numero);
        } catch (\InvalidArgumentException $e) {
            throw new SmsException($e->getMessage());
        }

        // Validar mensagem
        $mensagem = trim($mensagem);
        if (empty($mensagem)) {
            throw new SmsException('Mensagem não pode ser vazia.');
        }

        // GSM-7 tem limite de 160 caracteres, Unicode 70.
        // Truncar preventivamente a 800 para cobrir multi-part (5 segmentos).
        if (mb_strlen($mensagem) > 800) {
            throw new SmsException('Mensagem excede 800 caracteres ('.mb_strlen($mensagem).').');
        }

        $payload = [
            'message' => [
                'api_key_app' => $this->apiKey,
                'phone_number' => $numeroNormalizado,
                'message_body' => $mensagem,
            ],
        ];

        $url = ($this->urlBase ?? self::URL_BASE).self::ENDPOINT_ENVIO;

        try {
            $resposta = Http::timeout(self::TIMEOUT_SEGUNDOS)
                ->acceptJson()
                ->asJson()
                ->post($url, $payload);
        } catch (\Throwable $e) {
            Log::error('[TelcoSMS] Falha de rede', [
                'erro' => $e->getMessage(),
                'url' => $url,
                'numero' => $this->mascararNumero($numeroNormalizado),
            ]);
            throw new SmsException('Falha de comunicação com TelcoSMS: '.$e->getMessage());
        }

        $corpo = $this->decodificarResposta($resposta);
        $http = $resposta->status();

        Log::info('[TelcoSMS] Resposta envio', [
            'http' => $http,
            'numero' => $this->mascararNumero($numeroNormalizado),
            'tamanho_mensagem' => mb_strlen($mensagem),
            'corpo' => $corpo,
        ]);

        // HTTP 2xx + status sucesso
        if ($resposta->successful() && $this->respostaIndicaSucesso($corpo)) {
            return SmsResult::sucesso(
                idMensagem: $this->extrairIdMensagem($corpo),
                status: 'sent',
                creditosUsados: 1, // TelcoSMS debita 1 crédito por SMS
                saldoRestante: $this->extrairSaldo($corpo),
                respostaBruta: $corpo,
            );
        }

        // Erro: extrair mensagem do corpo ou usar HTTP
        $erro = $this->extrairErro($corpo, $http);

        throw new SmsException(
            message: "TelcoSMS rejeitou envio: {$erro}",
            codigoHttp: $http,
            respostaBruta: $corpo,
        );
    }

    /**
     * Consulta saldo de SMS restantes na conta TelcoSMS.
     */
    public function saldo(): ?int
    {
        $url = ($this->urlBase ?? self::URL_BASE).self::ENDPOINT_SALDO;

        try {
            $resposta = Http::timeout(self::TIMEOUT_SEGUNDOS)
                ->acceptJson()
                ->get($url, ['api_key_app' => $this->apiKey]);
        } catch (\Throwable $e) {
            Log::warning('[TelcoSMS] Falha ao consultar saldo: '.$e->getMessage());
            return null;
        }

        if (! $resposta->successful()) {
            Log::warning('[TelcoSMS] HTTP '.$resposta->status().' ao consultar saldo.');
            return null;
        }

        $corpo = $this->decodificarResposta($resposta);
        return $this->extrairSaldo($corpo);
    }

    /* =========================================================
       HELPERS
       ========================================================= */

    /**
     * A API TelcoSMS pode devolver JSON ou texto plano.
     * Tenta decodificar como JSON, se falhar devolve array com o body bruto.
     */
    private function decodificarResposta($resposta): array
    {
        $body = $resposta->body();
        $json = json_decode($body, true);
        if (is_array($json)) {
            return $json;
        }
        return ['_raw' => $body];
    }

    /**
     * Determina se a resposta indica sucesso.
     *
     * TelcoSMS API v2 devolve:
     *   Sucesso: {"status": 200, "message": "Sucess", ...}
     *   Erro:    {"status": "401 - ...", ...}
     */
    private function respostaIndicaSucesso(array $corpo): bool
    {
        // Status numérico 2xx
        if (isset($corpo['status']) && is_int($corpo['status'])) {
            if ($corpo['status'] >= 200 && $corpo['status'] < 300) return true;
            return false;
        }

        // Status string
        if (isset($corpo['status'])) {
            $s = strtolower((string) $corpo['status']);
            // TelcoSMS devolve "200" ou "Sucess" em caso de sucesso
            if (in_array($s, ['200', '201', 'ok', 'success', 'sucess', 'sent', 'queued'])) {
                return true;
            }
            // Se começa com código de erro (4xx, 5xx), é falha
            if (preg_match('/^(4\d\d|5\d\d)/', $s)) return false;
            if (in_array($s, ['error', 'failed', 'invalid'])) return false;
        }

        if (isset($corpo['success']) && $corpo['success'] === true) return true;

        // Se tem company_info ou message_id, assume sucesso
        if (! empty($corpo['company_info']) || ! empty($corpo['message_id']) || ! empty($corpo['id'])) {
            return true;
        }

        return false;
    }

    private function extrairIdMensagem(array $corpo): ?string
    {
        foreach (['message_id', 'id', 'msg_id', 'transaction_id'] as $chave) {
            if (! empty($corpo[$chave])) {
                return (string) $corpo[$chave];
            }
        }
        return null;
    }

    private function extrairSaldo(array $corpo): ?int
    {
        // TelcoSMS v2: company_info.sms_available
        if (isset($corpo['company_info']['sms_available']) && is_numeric($corpo['company_info']['sms_available'])) {
            return (int) $corpo['company_info']['sms_available'];
        }

        // Alternativas genéricas
        foreach (['balance', 'credits', 'credits_remaining', 'saldo', 'sms_balance'] as $chave) {
            if (isset($corpo[$chave]) && is_numeric($corpo[$chave])) {
                return (int) $corpo[$chave];
            }
        }
        return null;
    }

    /**
     * Devolve informação adicional da conta (plan expirad, sms_sent, etc).
     */
    public function infoConta(): array
    {
        $url = ($this->urlBase ?? self::URL_BASE).self::ENDPOINT_SALDO;

        try {
            $resposta = \Illuminate\Support\Facades\Http::timeout(self::TIMEOUT_SEGUNDOS)
                ->acceptJson()
                ->get($url, ['api_key_app' => $this->apiKey]);
        } catch (\Throwable) {
            return [];
        }

        if (! $resposta->successful()) return [];

        $corpo = $this->decodificarResposta($resposta);
        return $corpo['company_info'] ?? [];
    }

    private function extrairErro(array $corpo, int $http): string
    {
        foreach (['error', 'message', 'error_message', 'detail'] as $chave) {
            if (! empty($corpo[$chave]) && is_string($corpo[$chave])) {
                return $corpo[$chave];
            }
        }
        if (isset($corpo['_raw'])) {
            return 'HTTP '.$http.' — '.substr((string) $corpo['_raw'], 0, 200);
        }
        return 'HTTP '.$http;
    }

    private function mascararNumero(string $numero): string
    {
        if (strlen($numero) < 4) return '***';
        return substr($numero, 0, 3).'****'.substr($numero, -2);
    }
}
