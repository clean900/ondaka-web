<?php

declare(strict_types=1);

namespace App\Domains\Manutencao\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Equipamento extends Model
{
    use SoftDeletes;

    protected $table = 'equipamentos';

    protected $fillable = [
        'empresa_gestora_id', 'condominio_id', 'nome', 'tipo', 'localizacao',
        'marca', 'modelo', 'numero_serie', 'observacoes', 'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function planos(): HasMany
    {
        return $this->hasMany(ManutencaoPlano::class);
    }

    public function intervencoes(): HasMany
    {
        return $this->hasMany(ManutencaoIntervencao::class)->latest('data_realizada');
    }

    public function getTipoLabelAttribute(): string
    {
        return match ($this->tipo) {
            'elevador' => 'Elevador',
            'avac' => 'AVAC (climatização)',
            'gerador' => 'Gerador',
            'bomba' => 'Bomba de água',
            'incendio' => 'Combate a incêndio',
            'portao' => 'Portão / cancela',
            default => 'Outro',
        };
    }
}
