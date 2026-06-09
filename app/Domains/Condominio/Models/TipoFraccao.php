<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Models;

use App\Domains\Tenancy\Traits\BelongsToEmpresaGestora;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoFraccao extends Model
{
    use HasFactory, BelongsToEmpresaGestora;

    protected $table = 'tipos_fraccao';

    protected $fillable = [
        'empresa_gestora_id', 'nome', 'codigo', 'descricao', 'paga_quota',
        'categoria', 'tem_pisos_multiplos', 'numero_pisos_tipico', 'eh_residencial',
    ];

    protected $casts = [
        'paga_quota' => 'boolean',
        'tem_pisos_multiplos' => 'boolean',
        'eh_residencial' => 'boolean',
        'numero_pisos_tipico' => 'integer',
    ];

    public function fraccoes(): HasMany
    {
        return $this->hasMany(Fraccao::class);
    }

    /**
     * Label humano da categoria
     */
    public function getCategoriaLabelAttribute(): string
    {
        return match ($this->categoria) {
            'residencial_vertical' => 'Residencial Vertical',
            'residencial_horizontal' => 'Residencial Horizontal',
            'comercial' => 'Comercial',
            'empresarial' => 'Empresarial',
            'auxiliar' => 'Auxiliar',
            'loteamento' => 'Loteamento',
            default => ucfirst((string) $this->categoria),
        };
    }

    /**
     * Categorias aplicáveis a cada tipo de condomínio.
     */
    public static function categoriasParaTipoCondominio(string $tipoCondominio): array
    {
        return match ($tipoCondominio) {
            'vertical' => ['residencial_vertical', 'comercial', 'empresarial', 'auxiliar'],
            'horizontal' => ['residencial_horizontal', 'auxiliar'],
            'misto' => ['residencial_vertical', 'residencial_horizontal', 'comercial', 'empresarial', 'auxiliar'],
            'loteamento' => ['loteamento', 'auxiliar'],
            default => [],
        };
    }
}
