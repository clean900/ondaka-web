<?php

declare(strict_types=1);

namespace App\Domains\Avisos\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AvisoComentario extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'aviso_comentarios';

    protected $fillable = [
        'aviso_id',
        'user_id',
        'parent_id',
        'mensagem',
        'destaque',
    ];

    protected $casts = [
        'destaque' => 'boolean',
    ];

    public function aviso(): BelongsTo
    {
        return $this->belongsTo(Aviso::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(AvisoComentario::class, 'parent_id');
    }

    public function respostas(): HasMany
    {
        return $this->hasMany(AvisoComentario::class, 'parent_id');
    }

    public function eResposta(): bool
    {
        return ! is_null($this->parent_id);
    }
}
