<?php

namespace App\Domains\Turnos\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TurnoModelo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'turnos_modelo';

    protected $fillable = [
        'empresa_gestora_id',
        'nome',
        'hora_inicio',
        'hora_fim',
        'atravessa_meia_noite',
        'cor_hex',
        'descricao',
        'ativo',
        'ordem',
    ];

    protected $casts = [
        'atravessa_meia_noite' => 'boolean',
        'ativo' => 'boolean',
        'ordem' => 'integer',
    ];

    public function scopeAtivos($q) { return $q->where('ativo', true); }
    public function scopeParaEmpresa($q, int $empresaId) { return $q->where('empresa_gestora_id', $empresaId); }
}
