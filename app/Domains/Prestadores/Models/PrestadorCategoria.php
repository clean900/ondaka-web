<?php

declare(strict_types=1);

namespace App\Domains\Prestadores\Models;

use Illuminate\Database\Eloquent\Model;

class PrestadorCategoria extends Model
{
    protected $table = 'prestador_categorias';

    protected $fillable = ['nome', 'slug', 'icone', 'ordem', 'activa'];

    protected $casts = [
        'activa' => 'boolean',
        'ordem' => 'integer',
    ];

    public function scopeActivas($q)
    {
        return $q->where('activa', true)->orderBy('ordem');
    }
}
