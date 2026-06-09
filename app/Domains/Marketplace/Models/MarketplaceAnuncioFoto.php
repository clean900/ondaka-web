<?php

declare(strict_types=1);

namespace App\Domains\Marketplace\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarketplaceAnuncioFoto extends Model
{
    protected $table = 'marketplace_anuncio_fotos';

    protected $fillable = ['anuncio_id', 'path', 'ordem'];

    protected $casts = ['ordem' => 'integer'];

    public function anuncio(): BelongsTo
    {
        return $this->belongsTo(MarketplaceAnuncio::class, 'anuncio_id');
    }
}
