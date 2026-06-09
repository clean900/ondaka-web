<?php

declare(strict_types=1);

namespace App\Domains\Avisos\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AvisoLeitura extends Model
{
    use HasFactory;

    protected $table = 'aviso_leituras';

    protected $fillable = [
        'aviso_id',
        'user_id',
        'lido_em',
        'confirmado_em',
    ];

    protected $casts = [
        'lido_em' => 'datetime',
        'confirmado_em' => 'datetime',
    ];

    public function aviso(): BelongsTo
    {
        return $this->belongsTo(Aviso::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function eConfirmado(): bool
    {
        return ! is_null($this->confirmado_em);
    }
}
