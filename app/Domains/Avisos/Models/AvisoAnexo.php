<?php

declare(strict_types=1);

namespace App\Domains\Avisos\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class AvisoAnexo extends Model
{
    use HasFactory;

    protected $table = 'aviso_anexos';

    protected $fillable = [
        'aviso_id',
        'uploaded_by_user_id',
        'path',
        'nome_original',
        'mime_type',
        'tamanho_bytes',
    ];

    protected $casts = [
        'tamanho_bytes' => 'integer',
    ];

    public function aviso(): BelongsTo
    {
        return $this->belongsTo(Aviso::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }

    public function getUrlAttribute(): string
    {
        return '/ficheiros/' . $this->path;
    }

    public function eImagem(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    public function ePdf(): bool
    {
        return $this->mime_type === 'application/pdf';
    }
}
