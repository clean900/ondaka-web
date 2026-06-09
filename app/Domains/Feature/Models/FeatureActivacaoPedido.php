<?php

declare(strict_types=1);

namespace App\Domains\Feature\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * ONDAKA — Pedido de Activação de Feature
 *
 * Regista a intenção do cliente em activar um add-on pago.
 * Não cria a subscrição directamente — apenas marca o pedido.
 * Um operador interno processa manualmente (fase placeholder até ProxyPay
 * para add-ons estar pronto).
 *
 * Estados:
 *  - pendente:    aguarda contacto/processamento
 *  - contactado:  operador já contactou o cliente
 *  - activado:    subscrição activada manualmente (FeatureSubscription criada)
 *  - cancelado:   cancelado pelo cliente ou operador
 */
class FeatureActivacaoPedido extends Model
{
    use HasFactory;

    protected $table = 'feature_activacao_pedidos';

    protected $fillable = [
        'feature_id',
        'owner_type',
        'owner_id',
        'user_id',
        'valor_kz_snapshot',
        'estado',
        'processado_em',
        'processado_por_user_id',
        'notas_admin',
    ];

    protected $casts = [
        'valor_kz_snapshot' => 'decimal:2',
        'processado_em' => 'datetime',
    ];

    public function feature(): BelongsTo
    {
        return $this->belongsTo(Feature::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function processadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processado_por_user_id');
    }

    public function owner(): MorphTo
    {
        return $this->morphTo();
    }
}
