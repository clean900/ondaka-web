<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Models;

use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * PreAprovacao — autorização futura criada pelo condómino.
 *
 * Quando um condómino pré-aprova uma visita, é gerado um QR token
 * e um código OTP. Um SMS é enviado ao telefone do visitante com
 * estes códigos. O guarda valida (via QR scan ou OTP verbal) no
 * momento da entrada.
 */
class PreAprovacao extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pre_aprovacoes';

    protected $fillable = [
        'empresa_gestora_id',
        'condomino_id',
        'fraccao_id',
        'tipo_acesso',
        'nome_visitante',
        'telefone_visitante',
        'tipo_documento',
        'numero_documento',
        'documento_anexo_path',
        'requer_aprovacao',
        'aprovado_por_user_id',
        'aprovado_em',
        'qr_token',
        'otp_code',
        'valida_desde',
        'valida_ate',
        'estado',
        'observacoes',
        'sms_enviado',
        'sms_enviado_em',
    ];

    protected $casts = [
        'valida_desde' => 'datetime',
        'valida_ate' => 'datetime',
        'aprovado_em' => 'datetime',
        'requer_aprovacao' => 'boolean',
        'sms_enviado' => 'boolean',
        'sms_enviado_em' => 'datetime',
    ];

    // === Constantes dos estados (evita strings mágicas no código) ===

    public const ESTADO_PENDENTE = 'pendente';
    public const ESTADO_APROVADO = 'aprovado';   // passe aprovado pelo gestor (QR activo)
    public const ESTADO_RECUSADO = 'recusado';
    public const ESTADO_USADA = 'usada';
    public const ESTADO_EXPIRADA = 'expirada';
    public const ESTADO_CANCELADA = 'cancelada';

    /** É um passe (prestador/trabalhador), não uma visita pontual. */
    public function ehPasse(): bool
    {
        return $this->tipo_acesso !== 'visita';
    }

    // === Relações ===

    public function empresaGestora(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class);
    }

    public function condomino(): BelongsTo
    {
        return $this->belongsTo(Condomino::class);
    }

    public function fraccao(): BelongsTo
    {
        return $this->belongsTo(Fraccao::class);
    }

    public function visitas(): HasMany
    {
        return $this->hasMany(Visita::class);
    }

    // === Scopes ===

    /**
     * Apenas pré-aprovações activas (pendentes + dentro da janela temporal).
     */
    public function scopeActivas(Builder $query): Builder
    {
        return $query
            ->where('estado', self::ESTADO_PENDENTE)
            ->where('valida_ate', '>=', now());
    }

    public function scopeParaEmpresa(Builder $query, int $empresaId): Builder
    {
        return $query->where('empresa_gestora_id', $empresaId);
    }

    // === Helpers ===

    public function estaActiva(): bool
    {
        return $this->estado === self::ESTADO_PENDENTE
            && $this->valida_ate->isFuture();
    }

    public function expirou(): bool
    {
        return $this->valida_ate->isPast()
            && $this->estado === self::ESTADO_PENDENTE;
    }
}
