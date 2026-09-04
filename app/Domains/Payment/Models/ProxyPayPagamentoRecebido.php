<?php

namespace App\Domains\Payment\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Um pagamento entregue pela ProxyPay ao webhook, registado ANTES de se saber
 * de quem é.
 *
 * A conta ProxyPay é partilhada por vários sistemas e só há um webhook, que
 * aponta para o ONDAKA. Responder 204 diz à ProxyPay "entregue e tratado" e o
 * pagamento sai da fila — por isso o ONDAKA estava a fazer desaparecer, sem
 * saber, os pagamentos dos outros sistemas.
 *
 * Regra: a porta de entrada REGISTA, não julga. Cada sistema procura aqui as
 * suas próprias referências e chama marcarConsumido().
 */
class ProxyPayPagamentoRecebido extends Model
{
    protected $table = 'proxypay_pagamentos_recebidos';

    protected $fillable = [
        'reference_id',
        'payment_id',
        'amount',
        'sistema',
        'custom_fields',
        'payload',
        'recebido_em',
        'consumido_por',
        'consumido_em',
    ];

    protected $casts = [
        'reference_id' => 'integer',
        'payment_id' => 'integer',
        'amount' => 'decimal:2',
        'custom_fields' => 'array',
        'payload' => 'array',
        'recebido_em' => 'datetime',
        'consumido_em' => 'datetime',
    ];

    /**
     * Grava o que a ProxyPay entregou.
     *
     * Idempotente: a ProxyPay repete a entrega enquanto não receber 204, e uma
     * repetição tem de actualizar a linha existente em vez de criar outra. A
     * chave é o payment_id quando existe; sem ele, a referência.
     *
     * @param  array<string, mixed>  $payload
     */
    public static function registar(array $payload): self
    {
        $referenceId = (int) ($payload['reference_id'] ?? 0);
        $paymentId = isset($payload['id']) ? (int) $payload['id'] : null;

        $campos = $payload['custom_fields'] ?? null;
        $campos = is_array($campos) ? $campos : null;

        $atributos = [
            'reference_id' => $referenceId,
            'amount' => isset($payload['amount']) ? (float) $payload['amount'] : null,
            'sistema' => $campos['sistema'] ?? null,
            'custom_fields' => $campos,
            'payload' => $payload,
            'recebido_em' => now(),
        ];

        if ($paymentId) {
            return static::updateOrCreate(['payment_id' => $paymentId], $atributos);
        }

        // Sem payment_id não há chave estável: procura-se uma entrega recente da
        // mesma referência para não duplicar numa repetição, e só se cria se não
        // houver. Nunca se apaga nem se sobrepõe uma entrega antiga.
        $existente = static::where('reference_id', $referenceId)
            ->whereNull('payment_id')
            ->where('recebido_em', '>=', now()->subDay())
            ->latest('id')
            ->first();

        if ($existente) {
            $existente->fill($atributos)->save();

            return $existente;
        }

        return static::create($atributos + ['payment_id' => null]);
    }

    /** Marca que um sistema reclamou este pagamento. */
    public function marcarConsumido(string $sistema): void
    {
        if ($this->consumido_por) {
            return;
        }

        $this->forceFill([
            'consumido_por' => $sistema,
            'consumido_em' => now(),
        ])->save();
    }

    /** Pagamentos que ainda ninguém reclamou — a lista que interessa vigiar. */
    public function scopePorReclamar($query)
    {
        return $query->whereNull('consumido_por');
    }
}
