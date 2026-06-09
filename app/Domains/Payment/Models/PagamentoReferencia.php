<?php

declare(strict_types=1);

namespace App\Domains\Payment\Models;

use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PagamentoReferencia extends Model
{
    protected $table = 'pagamento_referencias';

    protected $fillable = [
        'empresa_gestora_id',
        'ordem_compra_id',
        'pagamento_condomino_id',
        'reference_id',
        'entity_id',
        'amount',
        'status',
        'expira_em',
        'pago_em',
        'payment_id',
        'transaction_id',
        'terminal_type',
        'terminal_id',
        'fee',
        'custom_fields',
        'webhook_payload',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'expira_em' => 'datetime',
        'pago_em' => 'datetime',
        'custom_fields' => 'array',
        'webhook_payload' => 'array',
        'reference_id' => 'integer',
        'payment_id' => 'integer',
        'transaction_id' => 'integer',
    ];

    /* ============================================
       RELAÇÕES
       ============================================ */

    public function empresaGestora(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class, 'empresa_gestora_id');
    }

    public function ordem(): BelongsTo
    {
        return $this->belongsTo(OrdemCompra::class, 'ordem_compra_id');
    }

    /* ============================================
       VERIFICAÇÕES DE ESTADO
       ============================================ */

    public function estaActiva(): bool
    {
        return $this->status === 'activa'
            && $this->expira_em->isFuture();
    }

    public function estaPaga(): bool
    {
        return $this->status === 'paga';
    }

    public function estaExpirada(): bool
    {
        return $this->status === 'expirada'
            || ($this->status === 'activa' && $this->expira_em->isPast());
    }

    public function estaCancelada(): bool
    {
        return $this->status === 'cancelada';
    }

    /* ============================================
       FORMATAÇÃO PARA UI
       ============================================ */

    /**
     * Formata a reference_id como "111 111 139" (blocos de 3).
     */
    public function getReferenceFormatadaAttribute(): string
    {
        return trim(chunk_split((string) $this->reference_id, 3, ' '));
    }

    /**
     * Formata a entity_id como "99 897" se tiver 5 dígitos.
     */
    public function getEntityFormatadaAttribute(): string
    {
        $entity = (string) $this->entity_id;

        return strlen($entity) === 5
            ? substr($entity, 0, 2).' '.substr($entity, 2)
            : $entity;
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'activa' => 'Activa',
            'paga' => 'Paga',
            'expirada' => 'Expirada',
            'cancelada' => 'Cancelada',
            default => $this->status,
        };
    }
}