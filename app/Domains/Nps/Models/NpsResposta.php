<?php

declare(strict_types=1);

namespace App\Domains\Nps\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NpsResposta extends Model
{
    protected $table = 'nps_respostas';

    protected $fillable = [
        'user_id',
        'tipo_avaliador',
        'alvo',
        'condominio_id',
        'empresa_gestora_id',
        'nota',
        'categoria',
        'comentario',
        'seguimento',
    ];

    protected $casts = [
        'nota' => 'integer',
    ];

    public function autor(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    /**
     * Classifica uma nota 0-10 em detractor/passivo/promotor.
     */
    public static function classificar(int $nota): string
    {
        if ($nota <= 6) {
            return 'detractor';
        }
        if ($nota <= 8) {
            return 'passivo';
        }
        return 'promotor';
    }
}
