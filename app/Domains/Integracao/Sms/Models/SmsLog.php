<?php

declare(strict_types=1);

namespace App\Domains\Integracao\Sms\Models;

use App\Domains\Feature\Models\FeatureSubscription;
use App\Domains\Payment\Models\OrdemCompra;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SmsLog extends Model
{
    use HasFactory;

    protected $table = 'sms_logs';

    protected $fillable = [
        'owner_type', 'owner_id',
        'numero_destinatario', 'numero_mascarado',
        'mensagem', 'tamanho_chars', 'segmentos',
        'categoria', 'trigger',
        'user_id', 'feature_subscription_id', 'ordem_compra_id',
        'provider', 'provider_id', 'saldo_provider_apos',
        'estado', 'erro_mensagem', 'resposta_bruta',
        'enviado_em', 'entregue_em', 'falhado_em',
        'tentativas',
        'creditos_consumidos_cliente', 'saldo_devolvido',
    ];

    protected $casts = [
        'tamanho_chars' => 'integer',
        'segmentos' => 'integer',
        'saldo_provider_apos' => 'integer',
        'resposta_bruta' => 'array',
        'enviado_em' => 'datetime',
        'entregue_em' => 'datetime',
        'falhado_em' => 'datetime',
        'tentativas' => 'integer',
        'creditos_consumidos_cliente' => 'integer',
        'saldo_devolvido' => 'boolean',
    ];

    /* ============================================
       RELAÇÕES
       ============================================ */

    public function owner(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function featureSubscription(): BelongsTo
    {
        return $this->belongsTo(FeatureSubscription::class);
    }

    public function ordemCompra(): BelongsTo
    {
        return $this->belongsTo(OrdemCompra::class);
    }

    /* ============================================
       HELPERS
       ============================================ */

    public function estaEntregue(): bool
    {
        return in_array($this->estado, ['enviado', 'entregue']);
    }

    public function falhou(): bool
    {
        return in_array($this->estado, ['falhado', 'rejeitado']);
    }

    public function getEstadoLabelAttribute(): string
    {
        return match ($this->estado) {
            'pendente' => 'Pendente',
            'enviado' => 'Enviado',
            'entregue' => 'Entregue',
            'falhado' => 'Falhado',
            'rejeitado' => 'Rejeitado',
            default => ucfirst($this->estado),
        };
    }

    public function getCategoriaLabelAttribute(): string
    {
        return match ($this->categoria) {
            'sistema' => 'Sistema',
            'notificacao' => 'Notificação',
            'manual_cliente' => 'Manual (cliente)',
            'manual_admin' => 'Manual (admin)',
            'teste' => 'Teste',
            default => ucfirst($this->categoria),
        };
    }

    /**
     * Calcula segmentos SMS (GSM-7: 160 chars, Unicode: 70 chars).
     */
    public static function calcularSegmentos(string $mensagem): int
    {
        $comprimento = mb_strlen($mensagem);
        // Assumir GSM-7 por simplicidade
        if ($comprimento <= 160) return 1;
        return (int) ceil($comprimento / 153); // multi-part: 153 chars por segmento
    }
}
