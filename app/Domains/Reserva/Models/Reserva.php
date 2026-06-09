<?php

declare(strict_types=1);

namespace App\Domains\Reserva\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reserva extends Model
{
    use HasFactory;
    protected $table = 'reservas';
    protected $fillable = [
        'espaco_id', 'user_id', 'condominio_id', 'data', 'hora_inicio', 'hora_fim',
        'estado', 'motivo', 'comprovativo_caucao', 'caucao_paga',
        'decidida_em', 'decidida_por_user_id',
    ];
    protected $casts = [
        'data' => 'date',
        'caucao_paga' => 'boolean',
        'decidida_em' => 'datetime',
    ];

    public function espaco(): BelongsTo
    {
        return $this->belongsTo(ReservaEspaco::class, 'espaco_id');
    }
}
