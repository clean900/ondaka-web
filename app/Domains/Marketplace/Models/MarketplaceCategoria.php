<?php

declare(strict_types=1);

namespace App\Domains\Marketplace\Models;

use Illuminate\Database\Eloquent\Model;

class MarketplaceCategoria extends Model
{
    protected $table = 'marketplace_categorias';

    protected $fillable = ['nome', 'slug', 'icone', 'ordem', 'activa'];

    protected $casts = [
        'activa' => 'boolean',
        'ordem' => 'integer',
    ];

    public function scopeActivas($query)
    {
        return $query->where('activa', true)->orderBy('ordem');
    }
}
