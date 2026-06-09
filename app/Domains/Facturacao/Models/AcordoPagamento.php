<?php
declare(strict_types=1);

namespace App\Domains\Facturacao\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcordoPagamento extends Model
{
    use SoftDeletes;

    protected $table = 'acordos_pagamento';

    protected $fillable = [
        'condomino_id', 'condominio_id', 'empresa_gestora_id',
        'valor_total', 'num_prestacoes', 'estado',
        'proposto_por_user_id', 'aprovado_por_user_id',
        'decidido_em', 'observacoes', 'motivo_recusa',
        'rondas_condomino', 'rondas_gestor', 'valor_entrada', 'valor_com_juro',
    ];

    protected $casts = [
        'valor_total' => 'decimal:2',
        'valor_entrada' => 'decimal:2',
        'valor_com_juro' => 'decimal:2',
        'decidido_em' => 'datetime',
    ];

    public function prestacoes(): HasMany
    {
        return $this->hasMany(AcordoPrestacao::class, 'acordo_id')->orderBy('numero');
    }

    public function propostas(): HasMany
    {
        return $this->hasMany(AcordoProposta::class, 'acordo_id')->orderBy('id');
    }
}
