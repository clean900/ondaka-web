<?php

declare(strict_types=1);

namespace App\Domains\Assembleia\Models;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assembleia extends Model
{
    use HasFactory;

    protected $table = 'assembleias';

    protected $fillable = [
        'empresa_gestora_id', 'condominio_id',
        'numero', 'tipo', 'titulo', 'ordem_do_dia', 'observacoes',
        'data_agendada', 'data_segunda_convocatoria', 'local', 'modo',
        'sala_jitsi', 'password_sala',
        'quorum_minimo_percent', 'total_fraccoes',
        'estado',
        'iniciada_em', 'terminada_em', 'iniciada_por_user_id', 'terminada_por_user_id',
        'acta_gerada', 'acta_path', 'acta_gerada_em',
        'criada_por_user_id', 'convocatorias_enviadas',
    ];

    protected $casts = [
        'data_agendada' => 'datetime',
        'data_segunda_convocatoria' => 'datetime',
        'iniciada_em' => 'datetime',
        'terminada_em' => 'datetime',
        'acta_gerada_em' => 'datetime',
        'acta_gerada' => 'boolean',
        'quorum_minimo_percent' => 'decimal:2',
        'total_fraccoes' => 'integer',
        'convocatorias_enviadas' => 'array',
    ];

    /* Relações */

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class, 'empresa_gestora_id');
    }

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    public function participantes(): HasMany
    {
        return $this->hasMany(AssembleiaParticipante::class);
    }

    public function pontosVotacao(): HasMany
    {
        return $this->hasMany(AssembleiaPontoVotacao::class)->orderBy('ordem');
    }

    public function criadaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criada_por_user_id');
    }

    public function iniciadaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'iniciada_por_user_id');
    }

    public function terminadaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'terminada_por_user_id');
    }

    /* Helpers */

    public function getUrlJitsiAttribute(): string
    {
        return 'https://meet.jit.si/'.$this->sala_jitsi;
    }

    public function getTipoLabelAttribute(): string
    {
        return match ($this->tipo) {
            'ordinaria' => 'Ordinária',
            'extraordinaria' => 'Extraordinária',
            default => ucfirst($this->tipo),
        };
    }

    public function getEstadoLabelAttribute(): string
    {
        return match ($this->estado) {
            'agendada' => 'Agendada',
            'em_curso' => 'Em curso',
            'concluida' => 'Concluída',
            'cancelada' => 'Cancelada',
            'sem_quorum' => 'Sem quórum',
            default => ucfirst($this->estado),
        };
    }

    public function podeIniciar(): bool
    {
        return $this->estado === 'agendada';
    }

    public function podeTerminar(): bool
    {
        return $this->estado === 'em_curso';
    }

    public function estaActiva(): bool
    {
        return $this->estado === 'em_curso';
    }

    public function tempoDecorrido(): ?int
    {
        if (! $this->iniciada_em) return null;
        $fim = $this->terminada_em ?? now();
        return $this->iniciada_em->diffInMinutes($fim);
    }

    /**
     * Calcula se tem quórum com base nos participantes presentes e sua permilagem.
     */
    public function calcularQuorum(): array
    {
        $participantes = $this->participantes()->where('presente', true)->get();

        $fraccoesPresentes = $participantes->sum('numero_fraccoes');
        $permilagemPresente = (float) $participantes->sum('permilagem_total');

        // Por fracções
        $percentFraccoes = $this->total_fraccoes > 0
            ? ($fraccoesPresentes / $this->total_fraccoes) * 100
            : 0;

        $temQuorum = $percentFraccoes >= (float) $this->quorum_minimo_percent;

        return [
            'fraccoes_presentes' => $fraccoesPresentes,
            'total_fraccoes' => $this->total_fraccoes,
            'percent_fraccoes' => round($percentFraccoes, 2),
            'permilagem_presente' => round($permilagemPresente, 4),
            'tem_quorum' => $temQuorum,
            'quorum_minimo' => (float) $this->quorum_minimo_percent,
        ];
    }
}
