<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Models;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Afiliado extends Model
{
    use SoftDeletes;

    protected $table = 'afiliados';

    public const ESTADO_PENDENTE = 'pendente';
    public const ESTADO_ACTIVO = 'activo';
    public const ESTADO_SUSPENSO = 'suspenso';
    public const ESTADO_RECUSADO = 'recusado';

    public const NIVEL_BRONZE = 'bronze';
    public const NIVEL_PRATA = 'prata';
    public const NIVEL_OURO = 'ouro';

    protected $fillable = [
        'user_id', 'codigo', 'tipo', 'nome', 'email', 'telefone', 'nif',
        'empresa_gestora_id', 'estado', 'nivel', 'taxa_actual_pct', 'taxa_manual_pct',
        'iban', 'banco', 'titular_conta', 'como_divulga', 'notas_admin',
        'motivo_recusa', 'motivo_suspensao', 'aprovado_em', 'aprovado_por_user_id',
        'suspenso_em', 'total_cliques',
    ];

    protected $casts = [
        'taxa_actual_pct' => 'decimal:2',
        'taxa_manual_pct' => 'decimal:2',
        'aprovado_em' => 'datetime',
        'suspenso_em' => 'datetime',
        'total_cliques' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function empresaGestora(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class);
    }

    public function aprovadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'aprovado_por_user_id');
    }

    /** Clientes indicados (empresas gestoras atribuídas a este afiliado). */
    public function clientes(): HasMany
    {
        return $this->hasMany(EmpresaGestora::class, 'afiliado_id');
    }

    public function comissoes(): HasMany
    {
        return $this->hasMany(AfiliadoComissao::class, 'afiliado_id');
    }

    public function pagamentos(): HasMany
    {
        return $this->hasMany(AfiliadoPagamento::class, 'afiliado_id');
    }

    public function cliques(): HasMany
    {
        return $this->hasMany(AfiliadoClique::class, 'afiliado_id');
    }

    public function estaActivo(): bool
    {
        return $this->estado === self::ESTADO_ACTIVO;
    }

    /** Link de indicação público. */
    public function linkReferencia(): string
    {
        return rtrim((string) config('app.url'), '/').'/registo?ref='.$this->codigo;
    }

    public function getEstadoLabelAttribute(): string
    {
        return match ($this->estado) {
            self::ESTADO_PENDENTE => 'Pendente de aprovação',
            self::ESTADO_ACTIVO => 'Activo',
            self::ESTADO_SUSPENSO => 'Suspenso',
            self::ESTADO_RECUSADO => 'Recusado',
            default => $this->estado,
        };
    }

    public function getNivelLabelAttribute(): string
    {
        return match ($this->nivel) {
            self::NIVEL_PRATA => 'Prata',
            self::NIVEL_OURO => 'Ouro',
            default => 'Bronze',
        };
    }
}
