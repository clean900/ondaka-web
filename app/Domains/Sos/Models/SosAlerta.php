<?php

declare(strict_types=1);

namespace App\Domains\Sos\Models;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condomino\Models\Condomino;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SosAlerta extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'sos_alertas';

    protected $fillable = [
        'condominio_id',
        'condomino_id',
        'user_id',
        'tipo',
        'gravidade',
        'descricao',
        'localizacao',
        'estado',
        'atendido_por_user_id',
        'atendido_em',
        'resolvido_em',
        'resolucao_notas',
    ];

    protected $casts = [
        'atendido_em' => 'datetime',
        'resolvido_em' => 'datetime',
    ];

    // Estados possíveis
    public const ESTADO_ABERTO = 'aberto';
    public const ESTADO_ATENDIDO = 'atendido';
    public const ESTADO_RESOLVIDO = 'resolvido';
    public const ESTADO_FALSO_ALARME = 'falso_alarme';

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    public function condomino(): BelongsTo
    {
        return $this->belongsTo(Condomino::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function atendidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atendido_por_user_id');
    }

    public function fotos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SosAlertaFoto::class)->orderBy('ordem');
    }

    public function estaAberto(): bool
    {
        return $this->estado === self::ESTADO_ABERTO;
    }
}
