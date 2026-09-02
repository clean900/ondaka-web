<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AfiliadoPagamento extends Model
{
    protected $table = 'afiliado_pagamentos';

    protected $fillable = [
        'afiliado_id', 'numero', 'num_comissoes', 'valor_bruto_kz', 'retencao_pct', 'retencao_valor_kz',
        'valor_liquido_kz', 'metodo', 'referencia_bancaria', 'iban_destino',
        'comprovativo_path', 'comprovativo_nome', 'comprovativo_mime', 'pago_em', 'notas', 'registado_por_user_id',
    ];

    protected $casts = [
        'num_comissoes' => 'integer',
        'valor_bruto_kz' => 'decimal:2',
        'retencao_pct' => 'decimal:2',
        'retencao_valor_kz' => 'decimal:2',
        'valor_liquido_kz' => 'decimal:2',
        'pago_em' => 'date',
    ];

    public function afiliado(): BelongsTo
    {
        return $this->belongsTo(Afiliado::class);
    }

    public function comissoes(): HasMany
    {
        return $this->hasMany(AfiliadoComissao::class, 'afiliado_pagamento_id');
    }

    public function registadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registado_por_user_id');
    }

    public function getMetodoLabelAttribute(): string
    {
        return match ($this->metodo) {
            'transferencia_bancaria' => 'Transferência bancária',
            'deposito' => 'Depósito',
            'multicaixa_express' => 'Multicaixa Express',
            default => 'Outro',
        };
    }
}
