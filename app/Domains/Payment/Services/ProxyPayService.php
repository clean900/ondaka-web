<?php

declare(strict_types=1);

namespace App\Domains\Payment\Services;

use App\Domains\Payment\Models\OrdemCompra;
use App\Domains\Payment\Models\PagamentoReferencia;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProxyPayService
{
    private const VALIDADE_DEFAULT_DIAS = 7;

    public function __construct(
        protected PaymentService $paymentService,
    ) {}

    public function gerarReferenceId(): int
    {
        $entity = (int) $this->entityId();
        $prefix = $entity > 0 ? $entity % 1000 : 0;
        $suffix = random_int(100000, 999999);
        $id = ($prefix * 1000000) + $suffix;

        if ($id > 999999999) {
            $id = random_int(100000000, 999999999);
        }

        return $id;
    }

    public function criarReferenciaParaOrdem(
        OrdemCompra $ordem,
        ?int $validadeDias = null,
    ): PagamentoReferencia {
        $validadeDias ??= self::VALIDADE_DEFAULT_DIAS;

        if ($ordem->estado === 'aprovada') {
            throw new \RuntimeException('Ordem ja foi aprovada.');
        }

        if (in_array($ordem->estado, ['rejeitada', 'cancelada', 'expirada'])) {
            throw new \RuntimeException('Ordem esta '.$ordem->estado.', nao pode gerar referencia.');
        }

        $this->cancelarReferenciasActivasDaOrdem($ordem);

        return DB::transaction(function () use ($ordem, $validadeDias) {
            $referenceId = $this->gerarReferenceId();
            $expiraEm = now()->addDays($validadeDias);

            $customFields = [
                'ordem_id' => (string) $ordem->id,
                'ordem_numero' => (string) $ordem->numero,
                'empresa_id' => (string) $ordem->owner_id,
                'callback_url' => route('webhooks.proxypay'),
            ];

            $payload = [
                'amount' => number_format((float) $ordem->valor_total, 2, '.', ''),
                'end_datetime' => $expiraEm->format('Y-m-d'),
                'custom_fields' => $customFields,
            ];

            $response = $this->http()->put('/references/'.$referenceId, $payload);

            if (! $response->successful()) {
                $this->logErro('criarReferencia PUT', $response, [
                    'reference_id' => $referenceId,
                    'payload' => $payload,
                ]);
                throw new \RuntimeException('Falha ao criar referencia ProxyPay: HTTP '.$response->status());
            }

            return PagamentoReferencia::create([
                'empresa_gestora_id' => $ordem->owner_id,
                'ordem_compra_id' => $ordem->id,
                'reference_id' => $referenceId,
                'entity_id' => $this->entityId(),
                'amount' => $ordem->valor_total,
                'status' => 'activa',
                'expira_em' => $expiraEm,
                'custom_fields' => $customFields,
            ]);
        });
    }

    public function cancelarReferencia(PagamentoReferencia $ref): void
    {
        if ($ref->status !== 'activa') {
            return;
        }

        $response = $this->httpNoBody()->delete('/references/'.$ref->reference_id);

        if (! $response->successful() && $response->status() !== 404) {
            $this->logErro('cancelarReferencia', $response, ['reference_id' => $ref->reference_id]);
            throw new \RuntimeException('Falha ao cancelar referencia ProxyPay: HTTP '.$response->status());
        }

        $ref->update(['status' => 'cancelada']);
    }

    protected function cancelarReferenciasActivasDaOrdem(OrdemCompra $ordem): void
    {
        $activas = PagamentoReferencia::where('ordem_compra_id', $ordem->id)
            ->where('status', 'activa')
            ->get();

        foreach ($activas as $ref) {
            try {
                $this->cancelarReferencia($ref);
            } catch (\Throwable $e) {
                Log::warning('ProxyPay: falha a cancelar ref '.$ref->reference_id, ['error' => $e->getMessage()]);
            }
        }
    }

    public function processarPagamentoWebhook(array $payload): void
    {
        $referenceId = $payload['reference_id'] ?? null;

        if (! $referenceId) {
            throw new \InvalidArgumentException('Webhook sem reference_id');
        }

        $ref = PagamentoReferencia::where('reference_id', $referenceId)->first();

        if (! $ref) {
            Log::warning('ProxyPay webhook: reference_id desconhecido', [
                'reference_id' => $referenceId,
                'payload' => $payload,
            ]);
            return;
        }

        if ($ref->status === 'paga') {
            Log::info('ProxyPay webhook: referencia ja estava paga (duplicado)', ['reference_id' => $referenceId]);
            return;
        }

        DB::transaction(function () use ($ref, $payload) {
            $ref->update([
                'status' => 'paga',
                'pago_em' => $payload['datetime'] ?? now(),
                'payment_id' => $payload['id'] ?? null,
                'transaction_id' => $payload['transaction_id'] ?? null,
                'terminal_type' => $payload['terminal_type'] ?? null,
                'terminal_id' => (string) ($payload['terminal_id'] ?? ''),
                'fee' => $payload['fee'] ?? null,
                'webhook_payload' => $payload,
            ]);

            $ordem = $ref->ordem;

            // ============================================
            // Pagamento de CONDOMINO (B2C) — confirma + atribui conta + concilia
            // ============================================
            if ($ref->pagamento_condomino_id) {
                $this->confirmarPagamentoCondominoB2C((int) $ref->pagamento_condomino_id, $payload);
                return; // B2C tratado, nao continua para fluxo B2B
            }

            if ($ordem) {
                $pagamento = $this->paymentService->registarPagamento(
                    ordem: $ordem,
                    dados: [
                        'metodo' => 'proxypay_rps',
                        'valor' => (float) $payload['amount'],
                        'moeda' => 'AOA',
                        'referencia_externa' => (string) $payload['id'],
                        'data_transacao' => substr($payload['datetime'] ?? now()->toDateString(), 0, 10),
                        'banco_origem' => 'ProxyPay - '.($payload['terminal_type'] ?? 'unknown'),
                        'notas' => 'Pagamento automatico via ProxyPay',
                    ],
                    comprovativo: null,
                    userId: null,
                );

                // Confirmar pagamento imediatamente — ProxyPay ja validou na rede Multicaixa
                $this->paymentService->confirmarPagamento(
                    pagamento: $pagamento,
                    adminUserId: null,
                    notas: 'Confirmacao automatica via webhook ProxyPay',
                );
            }

            // ============================================
            // Factura plataforma (subscrição B2B ONDAKA)
            // ============================================
            $customFields = $ref->custom_fields ?? [];
            if (($customFields['tipo'] ?? null) === 'factura_plataforma') {
                $facturaId = (int) ($customFields['factura_id'] ?? 0);
                if ($facturaId > 0) {
                    $factura = DB::table('plataforma_facturas')->where('id', $facturaId)->first();

                    if ($factura && $factura->estado === 'pendente') {
                        $agora = now();

                        // Marcar factura como paga
                        DB::table('plataforma_facturas')
                            ->where('id', $facturaId)
                            ->update([
                                'estado' => 'paga',
                                'data_pagamento' => $agora,
                                'updated_at' => $agora,
                            ]);

                        // Activar/renovar subscrição
                        $subscricao = \App\Domains\Subscription\Models\Subscricao::find($factura->subscricao_id);
                        if ($subscricao) {
                            $estadoAnterior = $subscricao->estado;
                            $subscricao->estado = 'activa';
                            $subscricao->activa_desde = $subscricao->activa_desde ?? $agora;
                            $subscricao->periodo_actual_inicio = $factura->periodo_referencia_inicio;
                            $subscricao->periodo_actual_fim = $factura->periodo_referencia_fim;
                            $subscricao->save();

                            // Audit trail: pagamento + activação
                            DB::table('plataforma_subscricao_eventos')->insert([
                                [
                                    'subscricao_id' => $subscricao->id,
                                    'tipo' => 'pagamento_recebido',
                                    'descricao' => "Pagamento recebido para factura {$factura->numero}: " . number_format((float) $factura->valor_total_kz, 2) . ' Kz',
                                    'meta_json' => json_encode([
                                        'factura_id' => $facturaId,
                                        'numero' => $factura->numero,
                                        'amount' => (float) $factura->valor_total_kz,
                                    ]),
                                    'user_id' => null,
                                    'created_at' => $agora,
                                ],
                                [
                                    'subscricao_id' => $subscricao->id,
                                    'tipo' => $estadoAnterior === 'activa' ? 'factura_emitida' : 'activada',
                                    'descricao' => $estadoAnterior === 'activa'
                                        ? "Subscrição renovada (período: {$subscricao->periodo_actual_inicio} -> {$subscricao->periodo_actual_fim})"
                                        : "Subscrição ACTIVADA (estado anterior: {$estadoAnterior})",
                                    'meta_json' => json_encode([
                                        'estado_anterior' => $estadoAnterior,
                                        'periodo_inicio' => (string) $subscricao->periodo_actual_inicio,
                                        'periodo_fim' => (string) $subscricao->periodo_actual_fim,
                                    ]),
                                    'user_id' => null,
                                    'created_at' => $agora,
                                ],
                            ]);

                            Log::info('Factura plataforma paga e subscrição activada', [
                                'factura_id' => $facturaId,
                                'subscricao_id' => $subscricao->id,
                                'estado_anterior' => $estadoAnterior,
                            ]);

                            // Notificacao Email + SMS pagamento confirmado
                            try {
                                $empresa = \App\Domains\Empresa\Models\EmpresaGestora::find($subscricao->empresa_gestora_id);
                                $userNotif = \App\Models\User::where('empresa_gestora_id', $subscricao->empresa_gestora_id)
                                    ->whereHas('roles', fn($q) => $q->where('name', 'admin-empresa'))
                                    ->first();
                                if ($empresa && $userNotif) {
                                    app(\App\Domains\Subscription\Services\NotificacaoB2BService::class)
                                        ->pagamentoConfirmado($userNotif, [
                                            'id' => $facturaId,
                                            'numero' => $factura->numero,
                                            'valor_total_kz' => (float) $factura->valor_total_kz,
                                        ], $empresa);
                                }
                            } catch (\Throwable $e) {
                                Log::error('Notificacao pagamento confirmado falhou: '.$e->getMessage());
                            }

                            // Notificar super-admins do pagamento B2B (sino + email)
                            try {
                                if (isset($empresa) && $empresa) {
                                    $ehConversao = ($estadoAnterior !== 'activa');
                                    $sasNotif = \App\Models\User::role('super-admin')->get();
                                    foreach ($sasNotif as $saNotif) {
                                        $saNotif->notify(new \App\Domains\Empresa\Notifications\PagamentoB2BSuperAdminNotification(
                                            $empresa,
                                            $factura->numero,
                                            (float) $factura->valor_total_kz,
                                            $ehConversao
                                        ));
                                    }
                                }
                            } catch (\Throwable $e) {
                                Log::error('Notificacao pagamento super-admin falhou: '.$e->getMessage());
                            }
                        }
                    }
                }
            }
        });

        Log::info('ProxyPay: pagamento processado com sucesso', [
            'reference_id' => $referenceId,
            'ordem_id' => $ref->ordem_compra_id,
        ]);
    }

    public function validarAssinaturaWebhook(string $rawBody, string $signature): bool
    {
        if (empty($signature) || empty($rawBody)) {
            return false;
        }

        $expected = hash_hmac('sha256', $rawBody, $this->apiKey());

        return hash_equals($expected, $signature);
    }

    protected function http()
    {
        return Http::withHeaders([
            'Authorization' => 'Token '.$this->apiKey(),
            'Accept' => 'application/vnd.proxypay.v2+json',
            'Content-Type' => 'application/json',
        ])->baseUrl($this->baseUrl())->timeout(30);
    }

    protected function httpNoBody()
    {
        return Http::withHeaders([
            'Authorization' => 'Token '.$this->apiKey(),
            'Accept' => 'application/vnd.proxypay.v2+json',
        ])->baseUrl($this->baseUrl())->timeout(30);
    }

    protected function apiKey(): string
    {
        return (string) config('services.proxypay.api_key');
    }

    protected function baseUrl(): string
    {
        return (string) config('services.proxypay.base_url');
    }

    protected function entityId(): string
    {
        return (string) config('services.proxypay.entity_id');
    }

    protected function modo(): string
    {
        return (string) config('services.proxypay.mode', 'sandbox');
    }

    protected function logErro(string $contexto, Response $response, array $extra = []): void
    {
        Log::error('ProxyPay error: '.$contexto, array_merge([
            'status' => $response->status(),
            'body' => $response->body(),
            'modo' => $this->modo(),
        ], $extra));
    }

    /**
     * Cria referência ProxyPay para uma factura plataforma (subscrição B2B).
     * Diferente do método criarReferenciaParaOrdem (legado) que era para ordens de loja.
     */
    public function criarReferenciaParaFacturaPlataforma(int $facturaId, ?int $validadeDias = null): array
    {
        $validadeDias ??= self::VALIDADE_DEFAULT_DIAS;

        $factura = DB::table('plataforma_facturas')->where('id', $facturaId)->first();
        if (!$factura) {
            throw new \RuntimeException('Factura não encontrada.');
        }

        if ($factura->estado !== 'pendente') {
            throw new \RuntimeException('Factura está ' . $factura->estado . ', não pode gerar referência.');
        }

        if ($factura->proxypay_referencia_id) {
            throw new \RuntimeException('Factura já tem referência associada.');
        }

        return DB::transaction(function () use ($factura, $validadeDias) {
            $referenceId = $this->gerarReferenceId();
            $expiraEm = now()->addDays($validadeDias);

            $customFields = [
                'tipo' => 'factura_plataforma',
                'factura_id' => (string) $factura->id,
                'factura_numero' => (string) $factura->numero,
                'subscricao_id' => (string) $factura->subscricao_id,
                'callback_url' => route('webhooks.proxypay'),
            ];

            $payload = [
                'amount' => number_format((float) $factura->valor_total_kz, 2, '.', ''),
                'end_datetime' => $expiraEm->format('Y-m-d'),
                'custom_fields' => $customFields,
            ];

            $response = $this->http()->put('/references/' . $referenceId, $payload);

            if (! $response->successful()) {
                $this->logErro('criarReferenciaFacturaPlataforma PUT', $response, [
                    'reference_id' => $referenceId,
                    'payload' => $payload,
                ]);
                throw new \RuntimeException('Falha ao criar referência ProxyPay: HTTP ' . $response->status());
            }

            // Cria registo em pagamento_referencias (sem ordem_compra_id)
            $refRow = \App\Domains\Payment\Models\PagamentoReferencia::create([
                'empresa_gestora_id' => DB::table('subscricoes')->where('id', $factura->subscricao_id)->value('empresa_gestora_id'),
                'ordem_compra_id' => null,
                'reference_id' => $referenceId,
                'entity_id' => $this->entityId(),
                'amount' => (float) $factura->valor_total_kz,
                'status' => 'activa',
                'expira_em' => $expiraEm,
                'custom_fields' => $customFields,
            ]);

            // Liga factura à referência
            DB::table('plataforma_facturas')
                ->where('id', $factura->id)
                ->update([
                    'proxypay_referencia_id' => $refRow->id,
                    'updated_at' => now(),
                ]);

            // Audit trail
            DB::table('plataforma_subscricao_eventos')->insert([
                'subscricao_id' => $factura->subscricao_id,
                'tipo' => 'factura_emitida',
                'descricao' => "Referência ProxyPay {$referenceId} gerada para factura {$factura->numero}",
                'meta_json' => json_encode([
                    'factura_id' => $factura->id,
                    'reference_id' => $referenceId,
                    'amount' => (float) $factura->valor_total_kz,
                ]),
                'user_id' => auth()->id(),
                'created_at' => now(),
            ]);

            return [
                'referencia_id' => $refRow->id,
                'reference_id' => $referenceId,
                'entity_id' => $this->entityId(),
                'amount' => (float) $factura->valor_total_kz,
                'expira_em' => $expiraEm->toIso8601String(),
            ];
        });
    }

    /**
     * Confirma um pagamento B2C (condomino) recebido via ProxyPay.
     * Resolve a conta bancaria (aceita_proxypay -> fallback conta principal do condominio),
     * atribui ao pagamento e confirma (disparando a conciliacao bancaria automatica).
     */
    private function confirmarPagamentoCondominoB2C(int $pagamentoId, array $payload): void
    {
        $pagamento = \App\Domains\Facturacao\Models\Pagamento::find($pagamentoId);

        if (! $pagamento) {
            \Log::warning('ProxyPay B2C: pagamento_condomino nao encontrado', ['pagamento_id' => $pagamentoId]);
            return;
        }

        if ($pagamento->estado === \App\Domains\Facturacao\Models\Pagamento::ESTADO_CONFIRMADO) {
            \Log::info('ProxyPay B2C: pagamento ja confirmado (duplicado)', ['pagamento_id' => $pagamentoId]);
            return;
        }

        // Defesa-em-profundidade: o montante do webhook tem de bater com o
        // valor devido. A referencia ProxyPay tem valor fixo, mas validamos
        // para nunca dar baixa de um montante divergente.
        if (isset($payload['amount'])
            && bccomp((string) $payload['amount'], (string) $pagamento->valor, 2) !== 0) {
            \Log::error('ProxyPay B2C: montante do webhook diverge do pagamento — NAO confirmado', [
                'pagamento_id' => $pagamentoId,
                'amount_webhook' => $payload['amount'],
                'valor_pagamento' => $pagamento->valor,
            ]);
            return;
        }

        // Resolver conta bancaria do condominio: aceita_proxypay -> fallback principal
        $conta = \App\Domains\Financas\Models\ContaBancaria::where('condominio_id', $pagamento->condominio_id)
            ->where('activa', true)
            ->where('aceita_proxypay', true)
            ->first();

        if (! $conta) {
            $conta = \App\Domains\Financas\Models\ContaBancaria::where('condominio_id', $pagamento->condominio_id)
                ->where('activa', true)
                ->orderByDesc('principal')
                ->first();
        }

        if ($conta) {
            $pagamento->conta_bancaria_id = $conta->id;
            $pagamento->save();
        } else {
            \Log::warning('ProxyPay B2C: condominio sem conta bancaria activa — pagamento confirmado sem conciliacao', [
                'pagamento_id' => $pagamentoId,
                'condominio_id' => $pagamento->condominio_id,
            ]);
        }

        // User Sistema (confirmacao automatica)
        $userSistema = \App\Models\User::where('email', 'sistema@ondaka.ao')->first();

        if (! $userSistema) {
            \Log::error('ProxyPay B2C: user sistema@ondaka.ao nao existe. Correr migration.', ['pagamento_id' => $pagamentoId]);
            return;
        }

        // Confirmar (automatico=true salta validacao de tenancy; dispara conciliacao bancaria)
        app(\App\Domains\Facturacao\Services\PagamentoService::class)
            ->confirmarPagamento($pagamento, $userSistema, null, true);

        \Log::info('ProxyPay B2C: pagamento condomino confirmado automaticamente', [
            'pagamento_id' => $pagamentoId,
            'conta_bancaria_id' => $conta->id ?? null,
        ]);
    }
}
