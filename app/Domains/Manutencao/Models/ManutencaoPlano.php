<?php

declare(strict_types=1);

namespace App\Domains\Manutencao\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ManutencaoPlano extends Model
{
    use SoftDeletes;

    protected $table = 'manutencao_planos';

    protected $fillable = [
        'equipamento_id', 'titulo', 'descricao', 'periodicidade_dias',
        'proxima_data', 'prestador_empresa_id', 'activo',
    ];

    protected $casts = [
        'proxima_data' => 'date',
        'periodicidade_dias' => 'integer',
        'activo' => 'boolean',
    ];

    public function equipamento(): BelongsTo
    {
        return $this->belongsTo(Equipamento::class);
    }

    public function intervencoes(): HasMany
    {
        return $this->hasMany(ManutencaoIntervencao::class, 'plano_id')->latest('data_realizada');
    }

    /** Dias até à próxima manutenção (negativo = em atraso). */
    public function getDiasParaProximaAttribute(): int
    {
        return (int) now()->startOfDay()->diffInDays($this->proxima_data, false);
    }
}
