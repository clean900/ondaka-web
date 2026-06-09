<?php

declare(strict_types=1);

namespace App\Http\Controllers\Webhooks;

use App\Domains\Payment\Services\ProxyPayService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

/**
 * Recebe webhooks da ProxyPay quando um pagamento é confirmado.
 *
 * Fluxo:
 * 1. ProxyPay envia POST com X-Signature header
 * 2. Validamos HMAC-SHA256 contra o raw body
 * 3. Se válido → processamos o pagamento
 * 4. Devolvemos 204 para ProxyPay não fazer retry
 *
 * IMPORTANTE: Esta rota NÃO usa CSRF nem auth.
 * A autenticação é feita via assinatura HMAC.
 */
class ProxyPayWebhookController extends Controller
{
    public function __construct(
        protected ProxyPayService $proxyPay,
    ) {}

    public function __invoke(Request $request): Response
    {
        $rawBody = $request->getContent();
        $signature = (string) $request->header('X-Signature', '');

        // 1. Validar assinatura HMAC
        if (! $this->proxyPay->validarAssinaturaWebhook($rawBody, $signature)) {
            Log::warning('ProxyPay webhook: assinatura inválida', [
                'signature_recebida' => $signature,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response('Invalid signature', 400);
        }

        // 2. Parsear JSON
        $payload = json_decode($rawBody, true);

        if (! is_array($payload)) {
            Log::warning('ProxyPay webhook: body não é JSON válido', [
                'body' => $rawBody,
            ]);

            return response('Invalid payload', 400);
        }

        // 3. Processar pagamento
        try {
            $this->proxyPay->processarPagamentoWebhook($payload);
        } catch (\Throwable $e) {
            Log::error('ProxyPay webhook: exceção ao processar', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $payload,
            ]);

            // Devolver 500 para ProxyPay tentar de novo
            return response('Processing error', 500);
        }

        // 4. ACK para ProxyPay
        return response('', 204);
    }
}