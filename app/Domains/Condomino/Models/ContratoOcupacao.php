<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Models;

use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Tenancy\Traits\BelongsToEmpresaGestora;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContratoOcupacao extends Model
{
    use HasFactory, SoftDeletes, BelongsToEmpresaGestora;

    protected $table = 'contratos_ocupacao';

    protected $fillable = [
        'empresa_gestora_id',
        'condomino_id',
        'fraccao_id',
        'tipo',
        'percentagem_propriedade',
        'data_inicio',
        'data_fim',
        'numero_contrato',
        'data_contrato',
        'contrato_path',
        'valor_renda_mensal',
        'proprietario_id',
        'responsavel_facturacao',
        'recebe_comunicacoes',
        'observacoes',
        'estado',
        'motivo_fim',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date',
        'data_contrato' => 'date',
        'percentagem_propriedade' => 'decimal:2',
        'valor_renda_mensal' => 'decimal:2',
        'responsavel_facturacao' => 'boolean',
        'recebe_comunicacoes' => 'boolean',
    ];

    /* ============================================
       RELAÇÕES
       ============================================ */

    public function condomino(): BelongsTo
    {
        return $this->belongsTo(Condomino::class);
    }

    public function fraccao(): BelongsTo
    {
        return $this->belongsTo(Fraccao::class);
    }

    /**
     * Para inquilinos: quem é o proprietário (senhorio)
     */
    public function proprietario(): BelongsTo
    {
        return $this->belongsTo(Condomino::class, 'proprietario_id');
    }

    /* ============================================
       HELPERS
       ============================================ */

    public function estaActivo(): bool
    {
        return $this->estado === 'activo';
    }

    public function ehProprietario(): bool
    {
        return $this->tipo === 'proprietario';
    }

    public function ehInquilino(): bool
    {
        return $this->tipo === 'inquilino';
    }

    /**
     * Label descritiva do tipo de ocupação
     */
    public function getTipoLabelAttribute(): string
    {
        return match ($this->tipo) {
            'proprietario' => 'Proprietário',
            'inquilino' => 'Inquilino',
            'usufructo' => 'Usufruto',
            'cedencia' => 'Cedência',
            default => ucfirst($this->tipo),
        };
    }

    /**
     * Duração em anos (aproximada) do contrato
     */
    public function getDuracaoAnosAttribute(): float
    {
        $fim = $this->data_fim ?? now();
        return round($this->data_inicio->diffInDays($fim) / 365.25, 1);
    }
}
