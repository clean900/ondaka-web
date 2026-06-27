<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * VisitaItem — bem/objeto registado à entrada de uma visita (add-on Controlo de Bens).
 *
 * Entra com estado 'dentro'; na saída é reconciliado como 'saiu' ou 'ficou'.
 * Só os itens registados na entrada podem sair na portaria.
 */
class VisitaItem extends Model
{
    use SoftDeletes;

    protected $table = 'visita_itens';

    protected $fillable = [
        'empresa_gestora_id',
        'visita_id',
        'descricao',
        'categoria',
        'quantidade',
        'identificador',
        'foto_entrada_path',
        'foto_saida_path',
        'estado',
        'registado_por',
        'resolvido_por',
        'resolvido_em',
        'observacoes',
    ];

    protected $casts = [
        'quantidade' => 'integer',
        'resolvido_em' => 'datetime',
    ];

    public const ESTADO_DENTRO = 'dentro';
    public const ESTADO_SAIU = 'saiu';
    public const ESTADO_FICOU = 'ficou';

    public function visita(): BelongsTo
    {
        return $this->belongsTo(Visita::class);
    }

    public function registadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registado_por');
    }

    public function resolvidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolvido_por');
    }

    public function estaDentro(): bool
    {
        return $this->estado === self::ESTADO_DENTRO;
    }
}
