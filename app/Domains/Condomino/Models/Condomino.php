<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Models;

use App\Domains\Tenancy\Traits\BelongsToEmpresaGestora;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Condomino extends Model
{
    use HasFactory, SoftDeletes, BelongsToEmpresaGestora;

    protected $table = 'condominos';

    protected $fillable = [
        'empresa_gestora_id',
        'tipo',
        'nome_completo',
        'nome_comercial',
        // Singular
        'numero_bi',
        'data_nascimento',
        'genero',
        'nacionalidade',
        'estado_civil',
        'profissao',
        // Empresa
        'nif',
        'data_constituicao_empresa',
        'numero_registo_comercial',
        // Contactos
        'telefone_principal',
        'telefone_alternativo',
        'email',
        // Morada
        'morada',
        'provincia',
        'municipio',
        'bairro',
        // Representante legal (empresa)
        'representante_nome',
        'representante_bi',
        'representante_cargo',
        'representante_telefone',
        'representante_email',
        // Outros
        'observacoes',
        'foto_path',
        'bi_frente_path',
        'bi_verso_path',
        'estado',
        'user_id',
    ];

    protected $casts = [
        'data_nascimento' => 'date',
        'data_constituicao_empresa' => 'date',
    ];

    /* ============================================
       RELAÇÕES
       ============================================ */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Todos os contratos (activos ou terminados) deste condómino
     */
    public function contratos(): HasMany
    {
        return $this->hasMany(ContratoOcupacao::class);
    }

    /**
     * Apenas contratos activos
     */
    public function contratosActivos(): HasMany
    {
        return $this->hasMany(ContratoOcupacao::class)
            ->where('estado', 'activo');
    }

    /**
     * Contratos em que este condómino é proprietário (activos)
     */
    public function propriedades(): HasMany
    {
        return $this->hasMany(ContratoOcupacao::class)
            ->where('tipo', 'proprietario')
            ->where('estado', 'activo');
    }

    /**
     * Contratos em que este condómino é inquilino (activos)
     */
    public function arrendamentos(): HasMany
    {
        return $this->hasMany(ContratoOcupacao::class)
            ->where('tipo', 'inquilino')
            ->where('estado', 'activo');
    }

    /* ============================================
       HELPERS / ACCESSORS
       ============================================ */

    /**
     * Nome apropriado para exibição consoante o tipo
     */
    public function getNomeExibicaoAttribute(): string
    {
        if ($this->tipo === 'empresa' && $this->nome_comercial) {
            return $this->nome_comercial;
        }
        return $this->nome_completo;
    }

    /**
     * Documento principal (BI para singular, NIF para empresa)
     */
    public function getDocumentoPrincipalAttribute(): ?string
    {
        return $this->tipo === 'empresa' ? $this->nif : $this->numero_bi;
    }

    /**
     * Label do documento principal
     */
    public function getLabelDocumentoAttribute(): string
    {
        return $this->tipo === 'empresa' ? 'NIF' : 'BI';
    }

    /**
     * É pessoa singular?
     */
    public function ehSingular(): bool
    {
        return $this->tipo === 'singular';
    }

    /**
     * É empresa?
     */
    public function ehEmpresa(): bool
    {
        return $this->tipo === 'empresa';
    }

    /**
     * Total de fracções de que é proprietário
     */
    public function totalPropriedades(): int
    {
        return $this->propriedades()->count();
    }

    /**
     * Total de arrendamentos activos
     */
    public function totalArrendamentos(): int
    {
        return $this->arrendamentos()->count();
    }
}
