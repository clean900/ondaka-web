<?php

declare(strict_types=1);

namespace App\Domains\Payment\Models;

use App\Domains\Feature\Models\Feature;
use App\Domains\Feature\Models\FeaturePacote;
use App\Domains\Feature\Models\FeatureSubscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrdemCompra extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'ordens_compra';

    protected $fillable = [
        'numero', 'owner_type', 'owner_id',
        'tipo_item', 'feature_id', 'pacote_id', 'meses_contratados', 'descricao_item',
        'valor_base', 'valor_activacao', 'valor_iva', 'valor_total',
        'estado', 'prazo_pagamento',
        'aprovada_em', 'rejeitada_em', 'cancelada_em',
        'motivo_rejeicao', 'notas_cliente', 'notas_admin',
        'numero_factura', 'feature_subscription_id',
        'criada_por_user_id', 'aprovada_por_user_id',
    ];

    protected $casts = [
        'valor_base' => 'decimal:2',
        'valor_activacao' => 'decimal:2',
        'valor_iva' => 'decimal:2',
        'valor_total' => 'decimal:2',
        'prazo_pagamento' => 'datetime',
        'aprovada_em' => 'datetime',
        'rejeitada_em' => 'datetime',
        'cancelada_em' => 'datetime',
    ];

    /* ============================================
       RELAÇÕES
       ============================================ */

    public function owner(): MorphTo
    {
        return $this->morphTo();
    }

    public function feature(): BelongsTo
    {
        return $this->belongsTo(Feature::class);
    }

    public function pacote(): BelongsTo
    {
        return $this->belongsTo(FeaturePacote::class, 'pacote_id');
    }

    public function featureSubscription(): BelongsTo
    {
        return $this->belongsTo(FeatureSubscription::class);
    }

    public function pagamentos(): HasMany
    {
        return $this->hasMany(Pagamento::class, 'ordem_compra_id');
    }

    public function factura(): BelongsTo
    {
        return $this->belongsTo(Factura::class, 'numero_factura', 'numero');
    }

    public function criadaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criada_por_user_id');
    }

    public function aprovadaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'aprovada_por_user_id');
    }

    /* ============================================
       VERIFICAÇÕES
       ============================================ */

    public function estaPendente(): bool
    {
        return $this->estado === 'pendente';
    }

    public function estaEmRevisao(): bool
    {
        return $this->estado === 'em_revisao';
    }

    public function estaAprovada(): bool
    {
        return $this->estado === 'aprovada';
    }

    public function expirou(): bool
    {
        return $this->prazo_pagamento
            && $this->prazo_pagamento->isPast()
            && in_array($this->estado, ['pendente', 'em_revisao']);
    }

    public function podeSerCancelada(): bool
    {
        return in_array($this->estado, ['pendente', 'em_revisao']);
    }

    public function totalPago(): float
    {
        return (float) $this->pagamentos()
            ->where('estado', 'confirmado')
            ->sum('valor');
    }

    public function saldoEmFalta(): float
    {
        return max(0, (float) $this->valor_total - $this->totalPago());
    }

    public function estaTotalmentePaga(): bool
    {
        return $this->totalPago() >= (float) $this->valor_total;
    }

    /* ============================================
       LABELS
       ============================================ */

    public function getEstadoLabelAttribute(): string
    {
        return match ($this->estado) {
            'pendente' => 'Pendente',
            'em_revisao' => 'Em análise',
            'aprovada' => 'Aprovada',
            'rejeitada' => 'Rejeitada',
            'cancelada' => 'Cancelada',
            'expirada' => 'Expirada',
            default => ucfirst($this->estado),
        };
    }

    public function getTipoItemLabelAttribute(): string
    {
        return match ($this->tipo_item) {
            'feature' => 'Funcionalidade (subscrição)',
            'pacote_consumivel' => 'Pacote (consumível)',
            'subscricao_core' => 'Subscrição do Core',
            default => 'Item',
        };
    }
}
