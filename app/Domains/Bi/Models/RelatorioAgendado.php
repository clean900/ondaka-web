<?php

declare(strict_types=1);

namespace App\Domains\Bi\Models;

use App\Domains\Tenancy\Traits\BelongsToEmpresaGestora;
use Illuminate\Database\Eloquent\Model;

/**
 * Relatório Personalizado agendado para envio recorrente por email (Fase 2 #3).
 */
class RelatorioAgendado extends Model
{
    use BelongsToEmpresaGestora;

    protected $table = 'relatorios_agendados';

    protected $fillable = [
        'empresa_gestora_id',
        'condominio_id',
        'titulo',
        'seccoes',
        'meses',
        'frequencia',
        'dia',
        'destinatarios',
        'ativo',
        'ultimo_envio_em',
    ];

    protected $casts = [
        'seccoes' => 'array',
        'meses' => 'integer',
        'dia' => 'integer',
        'ativo' => 'boolean',
        'ultimo_envio_em' => 'datetime',
    ];

    /** Lista de emails (separados por vírgula/; no campo destinatarios). */
    public function emails(): array
    {
        return collect(preg_split('/[,;\s]+/', (string) $this->destinatarios))
            ->map(fn ($e) => trim($e))
            ->filter(fn ($e) => filter_var($e, FILTER_VALIDATE_EMAIL))
            ->values()
            ->all();
    }

    /** Está em dia de envio? (mensal=dia do mês; semanal=dia da semana ISO 1-7) */
    public function deveEnviarHoje(\Illuminate\Support\Carbon $hoje): bool
    {
        if (! $this->ativo) {
            return false;
        }
        // Evita duplicar no mesmo dia.
        if ($this->ultimo_envio_em && $this->ultimo_envio_em->isSameDay($hoje)) {
            return false;
        }
        return $this->frequencia === 'semanal'
            ? $hoje->dayOfWeekIso === $this->dia
            : min($hoje->day, $hoje->daysInMonth) === min($this->dia, $hoje->daysInMonth);
    }
}
