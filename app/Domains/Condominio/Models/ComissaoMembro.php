<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Membro da comissão de moradores de um condomínio (condómino designado pelo gestor).
 * Só estes podem aprovar despesas quando o condomínio exige aprovação da comissão.
 */
class ComissaoMembro extends Model
{
    protected $table = 'comissao_membros';

    protected $fillable = [
        'condominio_id',
        'user_id',
        'designado_por_user_id',
    ];

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class, 'condominio_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
