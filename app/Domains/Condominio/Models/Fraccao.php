<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Models;

use App\Domains\Tenancy\Traits\BelongsToEmpresaGestora;
use App\Domains\Condomino\Models\ContratoOcupacao;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Fraccao extends Model
{
    use HasFactory, SoftDeletes, BelongsToEmpresaGestora;

    protected $table = 'fraccoes';

    protected $fillable = [
        'empresa_gestora_id', 'condominio_id', 'edificio_id', 'tipo_fraccao_id',
        'identificador', 'piso', 'letra', 'numero_pisos', 'tipo_habitacao',
        'area_privativa_m2', 'area_terreno_m2', 'permilagem', 'orientacao',
        'quota_mensal_base', 'quota_mensal_fundo_reserva',
        'numero_quartos', 'numero_casas_banho',
        'tem_lugar_garagem', 'numero_lugares_garagem', 'tem_arrecadacao',
        'tem_piscina_privativa', 'tem_jardim_privativo', 'tem_anexo',
        'estado', 'observacoes',
    ];

    protected $casts = [
        'piso' => 'integer',
        'numero_pisos' => 'integer',
        'area_privativa_m2' => 'decimal:2',
        'area_terreno_m2' => 'decimal:2',
        'permilagem' => 'decimal:4',
        'quota_mensal_base' => 'decimal:2',
        'quota_mensal_fundo_reserva' => 'decimal:2',
        'numero_quartos' => 'integer',
        'numero_casas_banho' => 'integer',
        'tem_lugar_garagem' => 'boolean',
        'numero_lugares_garagem' => 'integer',
        'tem_arrecadacao' => 'boolean',
        'tem_piscina_privativa' => 'boolean',
        'tem_jardim_privativo' => 'boolean',
        'tem_anexo' => 'boolean',
    ];

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    public function edificio(): BelongsTo
    {
        return $this->belongsTo(Edificio::class);
    }

    public function tipo(): BelongsTo
    {
        return $this->belongsTo(TipoFraccao::class, 'tipo_fraccao_id');
    }

    public function quotaMensalTotal(): float
    {
        return (float) $this->quota_mensal_base + (float) $this->quota_mensal_fundo_reserva;
    }

    /* ============================================
       CONTRATOS DE OCUPAÇÃO
       ============================================ */

    public function contratos(): HasMany
    {
        return $this->hasMany(ContratoOcupacao::class);
    }

    public function contratosActivos(): HasMany
    {
        return $this->hasMany(ContratoOcupacao::class)
            ->where('estado', 'activo');
    }

    /**
     * Obter o proprietário actual (ou comproprietários) da fracção
     */
    public function proprietarios()
    {
        return $this->hasMany(ContratoOcupacao::class)
            ->where('tipo', 'proprietario')
            ->where('estado', 'activo')
            ->with('condomino');
    }

    /**
     * Obter o inquilino actual (se houver)
     */
    public function inquilinoActual(): ?ContratoOcupacao
    {
        return $this->contratosActivos()
            ->where('tipo', 'inquilino')
            ->with('condomino')
            ->latest('data_inicio')
            ->first();
    }

    /**
     * Quem é o responsável pela facturação do condomínio?
     * Por defeito: o proprietário.
     * Excepção: quando há um inquilino com flag `responsavel_facturacao`
     */
    public function responsavelFacturacao(): ?ContratoOcupacao
    {
        $inquilinoResponsavel = $this->contratosActivos()
            ->where('tipo', 'inquilino')
            ->where('responsavel_facturacao', true)
            ->with('condomino')
            ->first();

        if ($inquilinoResponsavel) {
            return $inquilinoResponsavel;
        }

        return $this->contratosActivos()
            ->where('tipo', 'proprietario')
            ->with('condomino')
            ->first();
    }
}
