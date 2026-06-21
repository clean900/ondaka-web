<?php

declare(strict_types=1);

namespace App\Domains\Manutencao\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManutencaoIntervencao extends Model
{
    protected $table = 'manutencao_intervencoes';

    protected $fillable = [
        'plano_id', 'equipamento_id', 'data_realizada', 'descricao',
        'custo', 'realizado_por', 'relatorio_path', 'registado_por_user_id',
    ];

    protected $casts = [
        'data_realizada' => 'date',
        'custo' => 'decimal:2',
    ];

    public function plano(): BelongsTo
    {
        return $this->belongsTo(ManutencaoPlano::class, 'plano_id');
    }

    public function equipamento(): BelongsTo
    {
        return $this->belongsTo(Equipamento::class);
    }
}
