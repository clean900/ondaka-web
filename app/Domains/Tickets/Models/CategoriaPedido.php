<?php

namespace App\Domains\Tickets\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CategoriaPedido extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'categorias_pedido';

    protected $fillable = [
        'empresa_gestora_id',
        'nome',
        'slug',
        'icone',
        'tipo',
        'ordem',
        'ativo',
    ];

    protected $casts = [
        'ordem' => 'integer',
        'ativo' => 'boolean',
    ];

    public function scopeAtivas($q)
    {
        return $q->where('ativo', true);
    }

    public function scopeParticulares($q)
    {
        return $q->where('tipo', 'particular');
    }

    public function scopePublicas($q)
    {
        return $q->where('tipo', 'publico');
    }

    public function scopeParaEmpresa($q, int $empresaId)
    {
        return $q->where('empresa_gestora_id', $empresaId);
    }
}
