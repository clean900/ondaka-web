<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscricaoPeriodo extends Model
{
    use HasFactory;

    protected $table = 'subscricao_periodos';

    protected $fillable = [
        'subscricao_id',
        'inicio_em', 'fim_em',
        'ciclo', 'fraccoes_cobradas',
        'preco_por_fraccao', 'subtotal',
        'desconto_pct', 'desconto_valor', 'valor_total',
        'escalao_nome',
        'factura_id', 'estado', 'pago_em',
    ];

    protected $casts = [
        'inicio_em' => 'datetime',
        'fim_em' => 'datetime',
        'pago_em' => 'datetime',
        'fraccoes_cobradas' => 'integer',
        'preco_por_fraccao' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'desconto_pct' => 'decimal:2',
        'desconto_valor' => 'decimal:2',
        'valor_total' => 'decimal:2',
    ];

    public function subscricao(): BelongsTo
    {
        return $this->belongsTo(Subscricao::class);
    }

    public function estaPago(): bool
    {
        return $this->estado === 'pago';
    }

    public function emAtraso(): bool
    {
        if ($this->estaPago()) {
            return false;
        }
        return $this->fim_em && $this->fim_em->isPast();
    }

    public function activo(): bool
    {
        return $this->estaPago()
            && $this->inicio_em?->isPast()
            && $this->fim_em?->isFuture();
    }
}
