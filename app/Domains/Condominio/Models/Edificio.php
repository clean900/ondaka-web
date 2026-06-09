<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Models;

use App\Domains\Tenancy\Traits\BelongsToEmpresaGestora;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Edificio extends Model
{
    use HasFactory, SoftDeletes, BelongsToEmpresaGestora;

    protected $table = 'edificios';

    protected $fillable = [
        'empresa_gestora_id', 'condominio_id', 'nome', 'codigo', 'tipo_bloco',
        'numero_pisos', 'pisos_subsolo', 'numero_fraccoes',
        'tem_elevador', 'numero_elevadores', 'descricao', 'foto_path',
    ];

    protected $casts = [
        'tem_elevador' => 'boolean',
        'numero_pisos' => 'integer',
        'pisos_subsolo' => 'integer',
        'numero_fraccoes' => 'integer',
        'numero_elevadores' => 'integer',
    ];

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    public function fraccoes(): HasMany
    {
        return $this->hasMany(Fraccao::class);
    }

    /* ============================================
       HELPERS DE TIPO
       ============================================ */

    public function ehTorre(): bool
    {
        return $this->tipo_bloco === 'torre';
    }

    public function ehConjunto(): bool
    {
        return $this->tipo_bloco === 'conjunto';
    }

    public function ehComercial(): bool
    {
        return $this->tipo_bloco === 'comercial';
    }

    public function ehEmpresarial(): bool
    {
        return $this->tipo_bloco === 'empresarial';
    }

    public function ehLoteamento(): bool
    {
        return $this->tipo_bloco === 'loteamento';
    }

    public function getTipoBlocoLabelAttribute(): string
    {
        return match ($this->tipo_bloco) {
            'torre' => 'Torre/Edifício',
            'conjunto' => 'Conjunto de Vivendas',
            'comercial' => 'Galeria Comercial',
            'empresarial' => 'Empresarial',
            'loteamento' => 'Fase de Loteamento',
            default => 'Bloco',
        };
    }
}
