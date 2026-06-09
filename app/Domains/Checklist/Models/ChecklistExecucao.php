<?php

declare(strict_types=1);

namespace App\Domains\Checklist\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChecklistExecucao extends Model
{
    use HasFactory;
    protected $table = 'checklist_execucoes';
    protected $fillable = [
        'modelo_id', 'user_id', 'escala_turno_id',
        'iniciada_em', 'concluida_em', 'estado', 'respostas', 'observacoes',
    ];
    protected $casts = [
        'iniciada_em' => 'datetime',
        'concluida_em' => 'datetime',
        'respostas' => 'array',
    ];

    public function modelo(): BelongsTo
    {
        return $this->belongsTo(ChecklistModelo::class, 'modelo_id');
    }
}
