<?php

declare(strict_types=1);

namespace App\Domains\Assembleia\Models;

use App\Domains\Condomino\Models\Condomino;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssembleiaParticipante extends Model
{
    use HasFactory;

    protected $table = 'assembleia_participantes';

    protected $fillable = [
        'assembleia_id', 'condomino_id',
        'nome_snapshot', 'documento_snapshot',
        'numero_fraccoes', 'permilagem_total',
        'convocado_em', 'canal_convocacao',
        'email_convocacao', 'telefone_convocacao',
        'email_enviado', 'sms_enviado',
        'entrou_em', 'saiu_em', 'presente',
        'ip_entrada', 'user_agent_entrada',
        'representado_por_condomino_id',
    ];

    protected $casts = [
        'numero_fraccoes' => 'integer',
        'permilagem_total' => 'decimal:4',
        'convocado_em' => 'datetime',
        'email_enviado' => 'boolean',
        'sms_enviado' => 'boolean',
        'entrou_em' => 'datetime',
        'saiu_em' => 'datetime',
        'presente' => 'boolean',
    ];

    public function assembleia(): BelongsTo
    {
        return $this->belongsTo(Assembleia::class);
    }

    public function condomino(): BelongsTo
    {
        return $this->belongsTo(Condomino::class);
    }

    public function representadoPor(): BelongsTo
    {
        return $this->belongsTo(Condomino::class, 'representado_por_condomino_id');
    }

    public function marcarPresente(?string $ip = null, ?string $userAgent = null): void
    {
        if ($this->presente) return;

        $this->update([
            'presente' => true,
            'entrou_em' => now(),
            'ip_entrada' => $ip,
            'user_agent_entrada' => $userAgent,
        ]);
    }
}
