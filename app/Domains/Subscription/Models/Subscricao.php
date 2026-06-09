<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Models;

use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscricao extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'subscricoes';

    protected $fillable = [
        'empresa_gestora_id', 'estado', 'ciclo', 'dia_aniversario',
        'trial_inicia_em', 'trial_expira_em', 'grace_expira_em',
        'activa_desde', 'periodo_actual_inicio', 'periodo_actual_fim',
        'cancelada_em', 'cancela_no_fim_periodo', 'motivo_cancelamento',
        'preco_customizado_por_fraccao', 'nota_preco_customizado',
        'desconto_anual_pct', 'renovacao_automatica', 'converteu_do_trial',
        'num_imoveis', 'administrador_user_id',
    ];

    protected $casts = [
        'trial_inicia_em' => 'datetime',
        'trial_expira_em' => 'datetime',
        'grace_expira_em' => 'datetime',
        'activa_desde' => 'datetime',
        'periodo_actual_inicio' => 'datetime',
        'periodo_actual_fim' => 'datetime',
        'cancelada_em' => 'datetime',
        'cancela_no_fim_periodo' => 'datetime',
        'proximo_ciclo_aplica_em' => 'datetime',
        'preco_customizado_por_fraccao' => 'decimal:2',
        'desconto_anual_pct' => 'decimal:2',
        'renovacao_automatica' => 'boolean',
        'converteu_do_trial' => 'boolean',
        'dia_aniversario' => 'integer',
        'num_imoveis' => 'integer',
    ];

    /* ============================================
       RELAÇÕES
       ============================================ */

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class, 'empresa_gestora_id');
    }

    public function periodos(): HasMany
    {
        return $this->hasMany(SubscricaoPeriodo::class)->orderBy('inicio_em', 'desc');
    }

    public function periodoActual(): ?SubscricaoPeriodo
    {
        return $this->periodos()
            ->where('estado', 'pago')
            ->where('inicio_em', '<=', now())
            ->where('fim_em', '>=', now())
            ->first();
    }

    /* ============================================
       VERIFICAÇÕES DE ESTADO
       ============================================ */

    public function emTrial(): bool
    {
        return $this->estado === 'trial';
    }

    public function emGrace(): bool
    {
        return $this->estado === 'grace';
    }

    public function activa(): bool
    {
        return $this->estado === 'activa';
    }

    public function suspensa(): bool
    {
        return in_array($this->estado, ['suspensa', 'arquivada']);
    }

    public function cancelada(): bool
    {
        return $this->estado === 'cancelada';
    }

    /**
     * Cliente tem acesso ao sistema?
     * Trial, grace, activa, em_atraso, cancelada (até fim período): sim.
     * Suspensa, arquivada: não.
     */
    public function temAcesso(): bool
    {
        // Suspensa ou arquivada: bloqueado
        if ($this->suspensa()) {
            return false;
        }

        // Cancelada mas ainda no período pago: tem acesso
        if ($this->cancelada() && $this->periodo_actual_fim && $this->periodo_actual_fim->isFuture()) {
            return true;
        }

        // Activa e em_atraso: tem acesso
        if (in_array($this->estado, ['activa', 'em_atraso'])) {
            return true;
        }

        // Trial: acesso se ainda não expirou
        if ($this->emTrial() && $this->trial_expira_em && $this->trial_expira_em->isFuture()) {
            return true;
        }

        // Grace: acesso até grace expirar
        if ($this->emGrace() && $this->grace_expira_em && $this->grace_expira_em->isFuture()) {
            return true;
        }

        return false;
    }

    /**
     * Dias restantes do trial
     */
    public function diasRestantesTrial(): ?int
    {
        if (! $this->emTrial() || ! $this->trial_expira_em) {
            return null;
        }
        return max(0, (int) now()->diffInDays($this->trial_expira_em, false));
    }

    /**
     * Dias restantes do grace period
     */
    public function diasRestantesGrace(): ?int
    {
        if (! $this->emGrace() || ! $this->grace_expira_em) {
            return null;
        }
        return max(0, (int) now()->diffInDays($this->grace_expira_em, false));
    }

    /* ============================================
       LABELS
       ============================================ */

    public function getEstadoLabelAttribute(): string
    {
        return match ($this->estado) {
            'trial' => 'Período de teste',
            'grace' => 'Período de graça',
            'activa' => 'Activa',
            'em_atraso' => 'Em atraso',
            'suspensa' => 'Suspensa',
            'cancelada' => 'Cancelada',
            'arquivada' => 'Arquivada',
            default => ucfirst($this->estado),
        };
    }

    public function getCicloLabelAttribute(): string
    {
        return match ($this->ciclo) {
            'mensal' => 'Mensal',
            'anual' => 'Anual',
            default => ucfirst($this->ciclo),
        };
    }
}
