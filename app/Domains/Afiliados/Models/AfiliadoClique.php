<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AfiliadoClique extends Model
{
    protected $table = 'afiliado_cliques';

    public $timestamps = false;

    protected $fillable = ['afiliado_id', 'ip_hash', 'user_agent', 'url_destino', 'referer', 'created_at'];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function afiliado(): BelongsTo
    {
        return $this->belongsTo(Afiliado::class);
    }
}
