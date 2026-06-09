<?php

declare(strict_types=1);

namespace App\Domains\Marketplace\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarketplaceDenuncia extends Model
{
    protected $table = 'marketplace_denuncias';

    protected $fillable = ['anuncio_id', 'user_id', 'motivo', 'detalhe', 'estado'];

    public function anuncio(): BelongsTo
    {
        return $this->belongsTo(MarketplaceAnuncio::class, 'anuncio_id');
    }
}
