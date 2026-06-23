<?php

declare(strict_types=1);

namespace App\Domains\Tickets\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class TicketFoto extends Model
{
    use HasFactory;

    protected $table = 'ticket_fotos';

    protected $fillable = [
        'ticket_id',
        'ticket_comentario_id',
        'uploaded_by_user_id',
        'path',
        'nome_original',
        'mime_type',
        'tamanho_bytes',
    ];

    protected $casts = [
        'tamanho_bytes' => 'integer',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function comentario(): BelongsTo
    {
        return $this->belongsTo(TicketComentario::class, 'ticket_comentario_id');
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }

    /**
     * URL completa para acesso. Servida via /ficheiros/ (não /storage/),
     * porque o LiteSpeed bloqueia os symlinks /storage/ (403).
     */
    public function getUrlAttribute(): string
    {
        return url('ficheiros/'.$this->path);
    }
}
