<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Models;

use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Visita — registo efectivo de entrada/saída de um visitante.
 *
 * Criada pelo guarda quando valida uma pré-aprovação na portaria.
 * Marca entrou_em ao validar; saiu_em quando guarda marca saída.
 * Se saiu_em for NULL, o visitante ainda está dentro do condomínio.
 */
class Visita extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'visitas';

    protected $fillable = [
        'empresa_gestora_id',
        'pre_aprovacao_id',
        'visitante_id',
        'fraccao_id',
        'guarda_entrada_id',
        'guarda_saida_id',
        'entrou_em',
        'saiu_em',
        'metodo_validacao',
        'foto_entrada_path',
        'observacoes',
    ];

    protected $casts = [
        'entrou_em' => 'datetime',
        'saiu_em' => 'datetime',
    ];

    // === Constantes do método de validação ===

    public const METODO_QR = 'qr';
    public const METODO_OTP = 'otp';
    public const METODO_MANUAL = 'manual';

    // === Relações ===

    public function empresaGestora(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class);
    }

    public function preAprovacao(): BelongsTo
    {
        return $this->belongsTo(PreAprovacao::class);
    }

    public function visitante(): BelongsTo
    {
        return $this->belongsTo(Visitante::class);
    }

    public function fraccao(): BelongsTo
    {
        return $this->belongsTo(Fraccao::class);
    }

    public function guardaEntrada(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guarda_entrada_id');
    }

    public function guardaSaida(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guarda_saida_id');
    }

    // === Scopes ===

    /**
     * Visitantes que ainda estão dentro (entraram mas não saíram).
     */
    public function scopeDentroAgora(Builder $query): Builder
    {
        return $query->whereNull('saiu_em');
    }

    public function scopeParaEmpresa(Builder $query, int $empresaId): Builder
    {
        return $query->where('empresa_gestora_id', $empresaId);
    }

    // === Helpers ===

    public function aindaDentro(): bool
    {
        return $this->saiu_em === null;
    }

    public function duracao(): ?int
    {
        if ($this->saiu_em === null) {
            return null;
        }

        return (int) $this->entrou_em->diffInMinutes($this->saiu_em);
    }
}
