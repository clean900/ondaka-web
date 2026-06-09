<?php

declare(strict_types=1);

namespace App\Domains\Empresa\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmpresaGestora extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'empresas_gestoras';

    protected $fillable = [
        'nome', 'tipo_cliente', 'nif', 'documento_tipo', 'nome_completo_responsavel', 'slug', 'email_contacto', 'telefone',
        'morada', 'provincia', 'municipio', 'logotipo_path',
        'whatsapp_suporte', 'horario_atendimento',
        'licenca_alvara', 'licenca_validade', 'plano',
        'trial_termina_em', 'activa', 'configuracoes',
    ];

    protected $casts = [
        'licenca_validade' => 'date',
        'trial_termina_em' => 'datetime',
        'activa' => 'boolean',
        'configuracoes' => 'array',
    ];

    public const TIPO_EMPRESA_GESTORA = 'empresa_gestora';
    public const TIPO_ADMIN_INDEPENDENTE = 'admin_independente';

    public function isEmpresaGestora(): bool
    {
        return $this->tipo_cliente === self::TIPO_EMPRESA_GESTORA;
    }

    public function isAdminIndependente(): bool
    {
        return $this->tipo_cliente === self::TIPO_ADMIN_INDEPENDENTE;
    }

    public function getTipoClienteLabelAttribute(): string
    {
        return match ($this->tipo_cliente) {
            self::TIPO_ADMIN_INDEPENDENTE => 'Administrador Independente',
            default => 'Empresa Gestora',
        };
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function condominios(): HasMany
    {
        return $this->hasMany(\App\Domains\Condominio\Models\Condominio::class);
    }

    /**
     * Subscrição actual (nova Fase 1).
     */
    public function subscricao(): HasOne
    {
        return $this->hasOne(\App\Domains\Subscription\Models\Subscricao::class, 'empresa_gestora_id');
    }

    /**
     * Configuração de cobrança.
     */
    public function configuracaoCobranca(): HasOne
    {
        return $this->hasOne(\App\Domains\Subscription\Models\ConfiguracaoCobranca::class, 'empresa_gestora_id');
    }

    /**
     * Email de contacto (accessor compatível com 'email' usado em Mail::to).
     */
    public function getEmailAttribute(): ?string
    {
        return $this->email_contacto ?? null;
    }

    public function estaAtiva(): bool
    {
        return $this->activa === true;
    }

    public function trialExpirou(): bool
    {
        return $this->plano === 'trial'
            && $this->trial_termina_em !== null
            && $this->trial_termina_em->isPast();
    }
}
