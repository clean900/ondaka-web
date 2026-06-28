<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Ocorrência de portaria (add-on livro_ocorrencias) — registo do guarda durante o turno.
 */
class OcorrenciaPortaria extends Model
{
    use SoftDeletes;

    protected $table = 'ocorrencias_portaria';

    protected $fillable = [
        'empresa_gestora_id',
        'condominio_id',
        'guarda_id',
        'tipo',
        'descricao',
        'foto_path',
        'latitude',
        'longitude',
        'resolvida_em',
        'resolvida_por',
        'notas_resolucao',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'resolvida_em' => 'datetime',
    ];

    public const TIPOS = ['observacao', 'incidente', 'alerta'];

    public function guarda(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guarda_id');
    }

    public function resolvidaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolvida_por');
    }

    public function estaAberta(): bool
    {
        return $this->resolvida_em === null;
    }
}
