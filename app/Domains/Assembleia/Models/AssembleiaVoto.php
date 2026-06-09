<?php

namespace App\Domains\Assembleia\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssembleiaVoto extends Model
{
    use HasFactory;

    protected $table = 'assembleia_votos';

    protected $fillable = [
        'ponto_votacao_id',
        'participante_id',
        'opcao',
        'peso_permilagem',
        'votou_como_procurador',
        'procuracao_de_participante_id',
        'votado_em',
    ];

    protected $casts = [
        'votado_em' => 'datetime',
        'peso_permilagem' => 'decimal:3',
        'votou_como_procurador' => 'boolean',
    ];

    public function ponto(): BelongsTo
    {
        return $this->belongsTo(AssembleiaPontoVotacao::class, 'ponto_votacao_id');
    }

    public function participante(): BelongsTo
    {
        return $this->belongsTo(AssembleiaParticipante::class, 'participante_id');
    }

    public function procuradoDe(): BelongsTo
    {
        return $this->belongsTo(AssembleiaParticipante::class, 'procuracao_de_participante_id');
    }
}
