<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Services;

use App\Domains\Facturacao\Models\CondominioFacturacaoConfig;
use App\Domains\Facturacao\Models\Pagamento;
use App\Domains\Feature\Services\FeatureGate;
use App\Domains\Payment\Models\PagamentoReferencia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Service ProxyPay para pagamentos B2C — Condómino → Condomínio.
 *
 * Diferenças face ao ProxyPayService B2B:
 * - Cada CONDOMÍNIO tem suas próprias credenciais (entity_id + api_token)
 * - Verifica feature `proxypay_rps` antes de gerar referência
 * - Liga referência a `pagamento_condomino_id` em vez de `ordem_compra_id`
 * - Webhook reusa o mesmo handler central (router por owner_type)
 *
 * Credenciais lidas de `condominio_facturacao_config`:
 *   - proxypay_entity_id
 *   - proxypay_api_token
 *   - proxypay_sandbox (boolean: usar sandbox ou produção)
 *   - proxypay_activo (admin liga/desliga)
 */
class ProxyPayB2CService
{
    private const VALIDADE_DEFAULT_DIAS = 7;
    private const SANDBOX_URL = 'https://api.sandbox.proxypay.co.ao';
    private const PROD_URL = 'https://api.proxypay.co.ao';

    /**
     * Gera referência ProxyPay para um pagamento B2C.
     *
     * Cria registo já como Pagamento (estado=pendente, metodo=proxypay_rps)
     * e gera a referência associada.
     *
     * @throws RuntimeException Se feature não activa, config inválida, ou erro HTTP
     */
    public function criarReferenciaParaPagamentoCondomino(
        Pagamento $pagamento,
        ?int $validadeDias = null,
    ): PagamentoReferencia {
        $validadeDias ??= self::VALIDADE_DEFAULT_DIAS;

        // 1. Validar pagamento elegível
        if ($pagamento->metodo !== Pagamento::METODO_PROXYPAY) {
            throw new RuntimeException('Pagamento não é do método ProxyPay.');
        }

        if (! in_array($pagamento->estado, [Pagamento::ESTADO_PENDENTE, Pagamento::ESTADO_EM_REVISAO], true)) {
            throw new RuntimeException("Pagamento esta {$pagamento->estado}, nao pode gerar referencia.");
        }

        // 2. Carregar config do condomínio
        $config = CondominioFacturacaoConfig::where('condominio_id', $pagamento->condominio_id)->first();

        if (! $config) {
            throw new RuntimeException('Condomínio sem configuração de facturação.');
        }

        if (! $config->proxypay_activo) {
            throw new RuntimeException('ProxyPay não está activo para este condomínio. Activa nas configurações.');
        }

        if (! $config->proxypay_entity_id || ! $config->proxypay_api_token) {
            throw new RuntimeException('Credenciais ProxyPay incompletas. Configura entity_id e api_token.');
        }

        // 3. Verificar feature activa para o condomínio
        $condominio = $pagamento->condominio;
        if (! $condominio) {
            throw new RuntimeException('Condomínio não encontrado.');
        }

        if (! FeatureGate::has($condominio, 'proxypay_rps')) {
            throw new RuntimeException(
                'Feature ProxyPay não está activa para este condomínio. ' .
                'Activa na loja de funcionalidades.'
            );
        }

        // 4. Cancelar referências activas anteriores deste pagamento
        $this->cancelarReferenciasActivasDoPagamento($pagamento);

        // 5. Gerar reference_id
        return DB::transaction(function () use ($pagamento, $config, $validadeDias) {
            $referenceId = $this->gerarReferenceId((int) $config->proxypay_entity_id);
            $expiraEm = now()->addDays($validadeDias);

            $customFields = [
                'pagamento_id' => (string) $pagamento->id,
                'pagamento_referencia' => $pagamento->referencia,
                'condominio_id' => (string) $pagamento->condominio_id,
                'fraccao_id' => (string) $pagamento->fraccao_id,
                'tipo' => 'b2c',
            ];

            $payload = [
                'amount' => number_format((float) $pagamento->valor, 2, '.', ''),
                'end_datetime' => $expiraEm->format('Y-m-d'),
                'custom_fields' => $customFields,
            ];

            $response = $this->http($config)->put('/references/' . $referenceId, $payload);

            if (! $response->successful()) {
                Log::warning('ProxyPay B2C — falha ao criar referência', [
                    'pagamento_id' => $pagamento->id,
                    'reference_id' => $referenceId,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new RuntimeException('Falha ao criar referencia ProxyPay: HTTP ' . $response->status());
            }

            // 6. Criar registo PagamentoReferencia
            $ref = PagamentoReferencia::create([
                'empresa_gestora_id' => $pagamento->empresa_gestora_id,
                'ordem_compra_id' => null,
                'pagamento_condomino_id' => $pagamento->id,
                'reference_id' => (string) $referenceId,
                'entity_id' => (string) $config->proxypay_entity_id,
                'amount' => $pagamento->valor,
                'status' => 'activa',
                'expira_em' => $expiraEm,
                'custom_fields' => $customFields,
            ]);

            // 7. Vincular ao pagamento
            $pagamento->update(['pagamento_referencia_id' => $ref->id]);

            return $ref;
        });
    }

    /**
     * Cancela referências activas associadas a um pagamento (antes de gerar nova).
     */
    public function cancelarReferenciasActivasDoPagamento(Pagamento $pagamento): void
    {
        PagamentoReferencia::where('pagamento_condomino_id', $pagamento->id)
            ->where('status', 'activa')
            ->each(function (PagamentoReferencia $ref) use ($pagamento) {
                $config = CondominioFacturacaoConfig::where('condominio_id', $pagamento->condominio_id)->first();
                if (! $config || ! $config->proxypay_api_token) {
                    return;
                }

                try {
                    $this->http($config)->delete('/references/' . $ref->reference_id);
                } catch (\Throwable $e) {
                    Log::warning('ProxyPay B2C — falha ao cancelar ref antiga', [
                        'reference_id' => $ref->reference_id,
                        'erro' => $e->getMessage(),
                    ]);
                }

                $ref->update(['status' => 'cancelada']);
            });
    }

    /**
     * Gera ID de 9 dígitos para referência multicaixa.
     * Replica lógica do ProxyPayService B2B.
     */
    public function gerarReferenceId(int $entityId): int
    {
        $prefix = $entityId > 0 ? $entityId % 1000 : 0;
        $suffix = random_int(100000, 999999);
        $id = ($prefix * 1000000) + $suffix;
        if ($id > 999999999) {
            $id = random_int(100000000, 999999999);
        }
        return $id;
    }

    /**
     * Cliente HTTP autenticado com credenciais do condomínio.
     */
    protected function http(CondominioFacturacaoConfig $config)
    {
        return Http::withHeaders([
            'Authorization' => 'Token ' . $config->proxypay_api_token,
            'Accept' => 'application/vnd.proxypay.v2+json',
            'Content-Type' => 'application/json',
        ])->baseUrl($this->baseUrl($config))->timeout(30);
    }

    protected function baseUrl(CondominioFacturacaoConfig $config): string
    {
        return $config->proxypay_sandbox ? self::SANDBOX_URL : self::PROD_URL;
    }
}
