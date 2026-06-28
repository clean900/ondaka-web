<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Passagem de turno da portaria (add-on livro_ocorrencias) — resumo deixado
 * pelo guarda que sai ao guarda que entra.
 */
class PassagemTurno extends Model
{
    protected $table = 'passagens_turno';

    protected $fillable = [
        'empresa_gestora_id',
        'condominio_id',
        'guarda_id',
        'resumo',
        'total_dentro',
        'ocorrencias_abertas',
    ];

    protected $casts = [
        'total_dentro' => 'integer',
        'ocorrencias_abertas' => 'integer',
    ];

    public function guarda(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guarda_id');
    }
}
