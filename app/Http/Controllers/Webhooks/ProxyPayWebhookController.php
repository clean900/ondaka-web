<?php

declare(strict_types=1);

namespace App\Http\Controllers\Webhooks;

use App\Domains\Payment\Models\ProxyPayPagamentoRecebido;
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
 * 3. REGISTAMOS o pagamento na caixa de entrada — sem julgar de quem é
 * 4. Processamos o que é do ONDAKA
 * 5. Devolvemos 204 para ProxyPay não fazer retry
 *
 * PORQUE EXISTE O PASSO 3 (a caixa de entrada):
 * A conta ProxyPay é PARTILHADA por vários sistemas (ONDAKA, Welwitschia,
 * Academia Digital, BWEFACIL) e a ProxyPay só permite UM webhook — este. Até
 * 4 Set 2026, quando chegava um pagamento que não era do ONDAKA, o serviço
 * fazia o correcto (devolvia false, com o comentário "não dar ACK") mas este
 * controlador respondia 204 na mesma. Para a ProxyPay, 204 quer dizer "entregue
 * e tratado": o pagamento saía da fila. Os outros sistemas sondavam a fila, não
 * encontravam nada, e o pagamento perdia-se em silêncio — dinheiro recebido do
 * cliente que nunca era creditado.
 *
 * A regra passa a ser: a porta de entrada REGISTA, não julga. Cada sistema
 * procura na caixa as SUAS referências e marca-as como consumidas.
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

        // 3. REGISTAR ANTES DE INTERPRETAR.
        //
        // Se não se conseguir gravar, devolve-se 500 DE PROPÓSITO: a ProxyPay
        // repete a entrega e o pagamento fica na fila. É preferível uma repetição
        // (o registo é idempotente pelo payment_id, e o processamento do ONDAKA
        // já verificava se a referência estava paga) a um 204 que faria o
        // pagamento desaparecer sem ficar em lado nenhum.
        try {
            $recebido = ProxyPayPagamentoRecebido::registar($payload);
        } catch (\Throwable $e) {
            Log::error('ProxyPay webhook: NÃO foi possível registar o pagamento na caixa de entrada', [
                'error' => $e->getMessage(),
                'payload' => $payload,
            ]);

            return response('Could not record', 500);
        }

        // 4. Processar o que é do ONDAKA. O retorno diz se a referência era nossa
        //    — antes era ignorado, e é por isso que ninguém dava pelo problema.
        try {
            $doOndaka = $this->proxyPay->processarPagamentoWebhook($payload);

            if ($doOndaka) {
                $recebido->marcarConsumido('ondaka');
            } else {
                Log::info('ProxyPay webhook: pagamento de OUTRO sistema — guardado na caixa de entrada', [
                    'reference_id' => $payload['reference_id'] ?? null,
                    'sistema' => $recebido->sistema,
                    'recebido_id' => $recebido->id,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('ProxyPay webhook: exceção ao processar', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $payload,
            ]);

            // Devolver 500 para ProxyPay tentar de novo
            return response('Processing error', 500);
        }

        // 5. ACK para ProxyPay. Agora é seguro: mesmo que o pagamento não seja
        //    do ONDAKA, ficou registado na caixa e não se perde.
        return response('', 204);
    }
}