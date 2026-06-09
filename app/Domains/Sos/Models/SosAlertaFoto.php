<?php

declare(strict_types=1);

namespace App\Domains\Sos\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class SosAlertaFoto extends Model
{
    protected $table = 'sos_alerta_fotos';

    protected $fillable = [
        'sos_alerta_id',
        'path',
        'ordem',
    ];

    public function alerta(): BelongsTo
    {
        return $this->belongsTo(SosAlerta::class, 'sos_alerta_id');
    }

    /** URL pública para mostrar a foto. */
    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}
