<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Models;

use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Visitante — cadastro reutilizável de pessoas que visitam condomínios.
 *
 * Um visitante é criado/encontrado no momento em que o guarda valida
 * a primeira pré-aprovação. Se o mesmo visitante voltar (mesmo nome +
 * telefone), reutilizamos o registo existente.
 */
class Visitante extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'visitantes';

    protected $fillable = [
        'empresa_gestora_id',
        'nome',
        'telefone',
        'bi_numero',
        'foto_path',
        'notas',
    ];

    // === Relações ===

    public function empresaGestora(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class);
    }

    public function visitas(): HasMany
    {
        return $this->hasMany(Visita::class);
    }
}
