<?php

declare(strict_types=1);

namespace App\Domains\Avisos\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AvisoSegmentacao extends Model
{
    use HasFactory;

    protected $table = 'aviso_segmentacoes';

    protected $fillable = ['aviso_id', 'tipo', 'alvo_id', 'valor_texto'];

    public function aviso(): BelongsTo
    {
        return $this->belongsTo(Aviso::class);
    }
}
