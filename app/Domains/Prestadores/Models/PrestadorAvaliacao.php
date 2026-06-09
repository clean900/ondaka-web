<?php

declare(strict_types=1);

namespace App\Domains\Prestadores\Models;

use App\Domains\Tickets\Models\EmpresaPrestadora;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrestadorAvaliacao extends Model
{
    protected $table = 'prestador_avaliacoes';

    protected $fillable = [
        'empresa_prestadora_id',
        'user_id',
        'estrelas',
        'comentario',
        'aprovado',
    ];

    protected $casts = [
        'estrelas' => 'integer',
        'aprovado' => 'boolean',
    ];

    public function prestadora(): BelongsTo
    {
        return $this->belongsTo(EmpresaPrestadora::class, 'empresa_prestadora_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function scopeAprovadas($q)
    {
        return $q->where('aprovado', true);
    }
}
