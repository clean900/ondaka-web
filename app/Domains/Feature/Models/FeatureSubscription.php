<?php

declare(strict_types=1);

namespace App\Domains\Feature\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class FeatureSubscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'feature_subscriptions';

    protected $fillable = [
        'feature_id', 'owner_type', 'owner_id', 'estado',
        'activada_em', 'expira_em', 'cancelada_em',
        'saldo_inicial', 'saldo_actual', 'saldo_utilizado',
        'renovacao_automatica', 'recarga_automatica',
        'recarga_limite_baixo', 'recarga_pacote_id',
        'configuracao', 'valor_pago_total',
        'activada_por_user_id', 'notas_admin',
    ];

    protected $casts = [
        'activada_em' => 'datetime',
        'expira_em' => 'datetime',
        'cancelada_em' => 'datetime',
        'saldo_inicial' => 'integer',
        'saldo_actual' => 'integer',
        'saldo_utilizado' => 'integer',
        'renovacao_automatica' => 'boolean',
        'recarga_automatica' => 'boolean',
        'recarga_limite_baixo' => 'integer',
        'configuracao' => 'array',
        'valor_pago_total' => 'decimal:2',
    ];

    /* ============================================
       RELAÇÕES
       ============================================ */

    public function feature(): BelongsTo
    {
        return $this->belongsTo(Feature::class);
    }

    public function owner(): MorphTo
    {
        return $this->morphTo();
    }

    public function activadaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'activada_por_user_id');
    }

    public function recargaPacote(): BelongsTo
    {
        return $this->belongsTo(FeaturePacote::class, 'recarga_pacote_id');
    }

    public function usages(): HasMany
    {
        return $this->hasMany(FeatureUsage::class, 'subscription_id');
    }

    /* ============================================
       VERIFICAÇÕES DE ESTADO
       ============================================ */

    public function estaActiva(): bool
    {
        if ($this->estado !== 'activa') {
            return false;
        }

        // Subscrição com expiração
        if ($this->expira_em && $this->expira_em->isPast()) {
            return false;
        }

        // Consumível sem saldo
        if ($this->feature && $this->feature->ehConsumivel() && $this->saldo_actual <= 0) {
            return false;
        }

        return true;
    }

    public function temSaldo(int $quantidade = 1): bool
    {
        return $this->saldo_actual >= $quantidade;
    }

    public function saldoBaixo(): bool
    {
        if (! $this->feature?->ehConsumivel()) {
            return false;
        }
        if ($this->saldo_inicial <= 0) {
            return false;
        }
        $pct = ($this->saldo_actual / max($this->saldo_inicial, 1)) * 100;
        return $pct <= 20; // saldo baixo = <=20% do inicial
    }

    /* ============================================
       CONSUMO DE SALDO (atómico)
       ============================================ */

    public function consumir(
        int $quantidade,
        string $acao,
        ?Model $referenciavel = null,
        ?array $metadata = null,
        ?int $userId = null,
    ): bool {
        if (! $this->temSaldo($quantidade)) {
            return false;
        }

        return DB::transaction(function () use ($quantidade, $acao, $referenciavel, $metadata, $userId) {
            // Lock optimista
            $sub = self::lockForUpdate()->find($this->id);
            if (! $sub || $sub->saldo_actual < $quantidade) {
                return false;
            }

            $sub->decrement('saldo_actual', $quantidade);
            $sub->increment('saldo_utilizado', $quantidade);

            // Se saldo chegou a zero, marcar esgotada (mas estado lógico, feature ainda pode ser comprada de novo)
            if ($sub->fresh()->saldo_actual <= 0 && $sub->feature?->ehConsumivel()) {
                // Não marcar como esgotada automaticamente — deixa cliente controlar
                // Apenas o estaActiva() vai retornar false
            }

            FeatureUsage::create([
                'subscription_id' => $sub->id,
                'quantidade' => $quantidade,
                'acao' => $acao,
                'referenciavel_type' => $referenciavel ? get_class($referenciavel) : null,
                'referenciavel_id' => $referenciavel?->id,
                'user_id' => $userId,
                'saldo_depois' => $sub->fresh()->saldo_actual,
                'metadata' => $metadata,
            ]);

            return true;
        });
    }

    /* ============================================
       GESTÃO DE SALDO (compra/recarga)
       ============================================ */

    public function adicionarSaldo(int|string $quantidade, int|float|string $valorPago = 0): void
    {
        $quantidade = (int) $quantidade;
        $valorPago = (float) $valorPago;

        $this->increment('saldo_inicial', $quantidade);
        $this->increment('saldo_actual', $quantidade);

        if ($valorPago > 0) {
            $this->increment('valor_pago_total', $valorPago);
        }

        // Se estava pendente/esgotada, reactivar
        if (in_array($this->estado, ['pendente', 'esgotada'])) {
            $this->update(['estado' => 'activa']);
        }

        if (! $this->activada_em) {
            $this->update(['activada_em' => now()]);
        }
    }

    public function activar(?int $userId = null, ?string $notas = null): void
    {
        $dados = [
            'estado' => 'activa',
            'activada_em' => now(),
        ];

        if ($userId) {
            $dados['activada_por_user_id'] = $userId;
        }

        if ($notas) {
            $dados['notas_admin'] = $notas;
        }

        // Subscrições têm data de expiração
        if ($this->feature?->ehSubscricao() && $this->feature->duracao_dias) {
            $dados['expira_em'] = now()->addDays($this->feature->duracao_dias);
        }

        $this->update($dados);
    }

    public function suspender(): void
    {
        $this->update(['estado' => 'suspensa']);
    }

    public function cancelar(): void
    {
        $this->update([
            'estado' => 'cancelada',
            'cancelada_em' => now(),
            'renovacao_automatica' => false,
            'recarga_automatica' => false,
        ]);
    }

    /* ============================================
       LABELS
       ============================================ */

    public function getEstadoLabelAttribute(): string
    {
        return match ($this->estado) {
            'pendente' => 'Pendente',
            'activa' => 'Activa',
            'suspensa' => 'Suspensa',
            'expirada' => 'Expirada',
            'esgotada' => 'Saldo esgotado',
            'cancelada' => 'Cancelada',
            default => ucfirst($this->estado),
        };
    }
}
