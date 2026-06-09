<?php

declare(strict_types=1);

namespace App\Domains\Tickets\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TicketComentario extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'ticket_comentarios';

    protected $fillable = [
        'ticket_id',
        'user_id',
        'mensagem',
        'publico',
        'mudanca_estado_de',
        'mudanca_estado_para',
    ];

    protected $casts = [
        'publico' => 'boolean',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fotos(): HasMany
    {
        return $this->hasMany(TicketFoto::class);
    }

    public function eMudancaDeEstado(): bool
    {
        return $this->mudanca_estado_para !== null;
    }
}
