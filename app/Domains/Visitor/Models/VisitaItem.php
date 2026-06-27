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
        'registado_na_entrada',
        'registado_por',
        'resolvido_por',
        'resolvido_em',
        'autorizado_por',
        'autorizado_em',
        'observacoes',
    ];

    protected $casts = [
        'quantidade' => 'integer',
        'registado_na_entrada' => 'boolean',
        'resolvido_em' => 'datetime',
        'autorizado_em' => 'datetime',
    ];

    public const ESTADO_DENTRO = 'dentro';
    public const ESTADO_SAIU = 'saiu';
    public const ESTADO_FICOU = 'ficou';
    public const ESTADO_AGUARDA_AUTORIZACAO = 'aguarda_autorizacao';
    public const ESTADO_RETIDO = 'retido';

    /** Estados que bloqueiam o fecho da saída (por resolver). */
    public const ESTADOS_POR_RESOLVER = [self::ESTADO_DENTRO, self::ESTADO_AGUARDA_AUTORIZACAO];

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

    public function autorizadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'autorizado_por');
    }

    public function estaDentro(): bool
    {
        return $this->estado === self::ESTADO_DENTRO;
    }

    /** Item detectado na saída sem ter sido declarado à entrada (anomalia). */
    public function eAnomalia(): bool
    {
        return $this->registado_na_entrada === false;
    }
}
