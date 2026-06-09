<?php

declare(strict_types=1);

namespace App\Domains\Financas\Models;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Despesa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'despesas';

    protected $fillable = [
        'empresa_gestora_id',
        'tipo',
        'condominio_id',
        'categoria_id',
        'conta_bancaria_id',
        'data_despesa',
        'valor',
        'descricao',
        'fornecedor',
        'estado',
        'criada_por_user_id',
        'aprovada_por_user_id',
        'aprovada_em',
        'paga_em',
        'metodo_pagamento',
        'paga_por_user_id',
        'cancelada_em',
        'cancelada_por_user_id',
        'motivo_cancelamento',
        'movimento_id',
        'comprovativo_path',
        'notas',
    ];

    protected $casts = [
        'data_despesa' => 'date',
        'valor' => 'decimal:2',
        'aprovada_em' => 'datetime',
        'paga_em' => 'datetime',
        'cancelada_em' => 'datetime',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class, 'empresa_gestora_id');
    }

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(DespesaCategoria::class, 'categoria_id');
    }

    public function contaBancaria(): BelongsTo
    {
        return $this->belongsTo(ContaBancaria::class, 'conta_bancaria_id');
    }

    public function movimento(): BelongsTo
    {
        return $this->belongsTo(ContaBancariaMovimento::class, 'movimento_id');
    }

    public function criadaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criada_por_user_id');
    }

    public function aprovadaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'aprovada_por_user_id');
    }

    public function pagaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paga_por_user_id');
    }

    public function canceladaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelada_por_user_id');
    }
}
