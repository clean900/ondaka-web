<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Models;

use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AfiliadoComissao extends Model
{
    protected $table = 'afiliado_comissoes';

    public const ESTADO_PENDENTE = 'pendente';
    public const ESTADO_APROVADA = 'aprovada';
    public const ESTADO_PAGA = 'paga';
    public const ESTADO_ANULADA = 'anulada';

    public const ORIGEM_FACTURA_PLATAFORMA = 'plataforma_factura';
    public const ORIGEM_ORDEM_COMPRA = 'ordem_compra';

    protected $fillable = [
        'afiliado_id', 'empresa_gestora_id', 'origem_type', 'origem_id', 'origem_numero', 'descricao',
        'valor_pago_total_kz', 'valor_imposto_kz', 'valor_base_kz', 'taxa_pct', 'valor_comissao_kz', 'nivel',
        'estado', 'pago_pelo_cliente_em', 'disponivel_em', 'aprovada_em', 'afiliado_pagamento_id',
        'paga_em', 'anulada_em', 'motivo_anulacao', 'meta_json',
    ];

    protected $casts = [
        'valor_pago_total_kz' => 'decimal:2',
        'valor_imposto_kz' => 'decimal:2',
        'valor_base_kz' => 'decimal:2',
        'taxa_pct' => 'decimal:2',
        'valor_comissao_kz' => 'decimal:2',
        'pago_pelo_cliente_em' => 'datetime',
        'disponivel_em' => 'date',
        'aprovada_em' => 'datetime',
        'paga_em' => 'datetime',
        'anulada_em' => 'datetime',
        'meta_json' => 'array',
    ];

    public function afiliado(): BelongsTo
    {
        return $this->belongsTo(Afiliado::class);
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class, 'empresa_gestora_id');
    }

    public function pagamento(): BelongsTo
    {
        return $this->belongsTo(AfiliadoPagamento::class, 'afiliado_pagamento_id');
    }

    public function scopeNaoAnuladas(Builder $q): Builder
    {
        return $q->where('estado', '!=', self::ESTADO_ANULADA);
    }

    public function scopeEstado(Builder $q, string $estado): Builder
    {
        return $q->where('estado', $estado);
    }

    public function getOrigemLabelAttribute(): string
    {
        return match ($this->origem_type) {
            self::ORIGEM_FACTURA_PLATAFORMA => 'Subscrição',
            self::ORIGEM_ORDEM_COMPRA => 'Loja / add-on',
            default => $this->origem_type,
        };
    }

    public function getEstadoLabelAttribute(): string
    {
        return match ($this->estado) {
            self::ESTADO_PENDENTE => 'Em carência',
            self::ESTADO_APROVADA => 'Aprovada (a pagar)',
            self::ESTADO_PAGA => 'Paga',
            self::ESTADO_ANULADA => 'Anulada',
            default => $this->estado,
        };
    }
}
