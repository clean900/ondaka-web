<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Models;

use App\Domains\Tenancy\Traits\BelongsToEmpresaGestora;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Condominio extends Model
{
    use HasFactory, SoftDeletes, BelongsToEmpresaGestora;

    protected $table = 'condominios';

    protected $fillable = [
        'empresa_gestora_id', 'nome', 'codigo', 'tipo', 'numero_blocos_previsto', 'tem_area_comercial', 'nif',
        'morada', 'provincia', 'municipio', 'distrito_urbano', 'bairro',
        'latitude', 'longitude',
        'data_constituicao', 'numero_matricula', 'conservatoria',
        'acta_constituicao_path', 'iban', 'banco', 'moeda',
        'ucf_valor_actual', 'percentagem_fundo_reserva',
        'administrador_actual_id', 'administrador_mandato_inicio',
        'administrador_mandato_fim', 'estado', 'configuracoes',
    ];

    protected $casts = [
        'data_constituicao' => 'date',
        'administrador_mandato_inicio' => 'date',
        'administrador_mandato_fim' => 'date',
        'ucf_valor_actual' => 'decimal:2',
        'percentagem_fundo_reserva' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'configuracoes' => 'array',
        'tem_area_comercial' => 'boolean',
    ];

    /* ============================================
       HELPERS DE TIPO
       ============================================ */

    public function ehVertical(): bool
    {
        return $this->tipo === 'vertical';
    }

    public function ehHorizontal(): bool
    {
        return $this->tipo === 'horizontal';
    }

    public function ehMisto(): bool
    {
        return $this->tipo === 'misto';
    }

    public function ehLoteamento(): bool
    {
        return $this->tipo === 'loteamento';
    }

    /**
     * Label humano para o tipo de condomínio
     */
    public function getTipoLabelAttribute(): string
    {
        return match ($this->tipo) {
            'vertical' => 'Prédios (Vertical)',
            'horizontal' => 'Vivendas (Horizontal)',
            'misto' => 'Misto',
            'loteamento' => 'Loteamento',
            default => ucfirst((string) $this->tipo),
        };
    }

    /**
     * Label do conceito "bloco" conforme o tipo
     * - Vertical: Edifícios/Torres
     * - Horizontal: Conjuntos/Grupos
     * - Misto: Blocos
     * - Loteamento: Fases
     */
    public function getLabelBlocosAttribute(): string
    {
        return match ($this->tipo) {
            'vertical' => 'Edifícios',
            'horizontal' => 'Conjuntos',
            'misto' => 'Blocos',
            'loteamento' => 'Fases',
            default => 'Blocos',
        };
    }

    /**
     * Label singular de "bloco"
     */
    public function getLabelBlocoAttribute(): string
    {
        return match ($this->tipo) {
            'vertical' => 'Edifício',
            'horizontal' => 'Conjunto',
            'misto' => 'Bloco',
            'loteamento' => 'Fase',
            default => 'Bloco',
        };
    }

    /**
     * Label do conceito "fracção" conforme o tipo
     */
    public function getLabelFraccoesAttribute(): string
    {
        return match ($this->tipo) {
            'vertical' => 'Apartamentos',
            'horizontal' => 'Vivendas',
            'misto' => 'Fracções',
            'loteamento' => 'Lotes',
            default => 'Fracções',
        };
    }

    public function getLabelFraccaoAttribute(): string
    {
        return match ($this->tipo) {
            'vertical' => 'Apartamento',
            'horizontal' => 'Vivenda',
            'misto' => 'Fracção',
            'loteamento' => 'Lote',
            default => 'Fracção',
        };
    }

    public function edificios(): HasMany
    {
        return $this->hasMany(Edificio::class);
    }

    public function fraccoes(): HasMany
    {
        return $this->hasMany(Fraccao::class);
    }

    public function empresaGestora(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Domains\Empresa\Models\EmpresaGestora::class, "empresa_gestora_id");
    }

    public function administrador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'administrador_actual_id');
    }

    /**
     * Valida conformidade com DP 141/15 Art. 20 — fundo reserva >= 10%
     */
    public function fundoReservaConforme(): bool
    {
        return (float) $this->percentagem_fundo_reserva >= 10.00;
    }

    /**
     * Valida DP 141/15 Art. 22 — quotas <= 6 UCF/m²
     */
    public function quotaConforme(float $quota, float $areaM2): bool
    {
        if (! $this->ucf_valor_actual || $this->ucf_valor_actual <= 0) {
            return true; // sem UCF definida, não valida
        }
        $limite = (float) $this->ucf_valor_actual * 6 * $areaM2;
        return $quota <= $limite;
    }
}
