<?php

declare(strict_types=1);

namespace App\Domains\Financas\Models;

use App\Domains\Condominio\Models\Condominio;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContaBancaria extends Model
{
    use HasFactory;

    protected $table = 'contas_bancarias';

    protected $fillable = [
        'condominio_id',
        'nome',
        'banco',
        'iban',
        'numero_conta',
        'tipo',
        'moeda',
        'saldo_inicial',
        'saldo_actual',
        'notas',
        'activa',
        'principal',
        'aceita_proxypay',
        'aceita_manual',
        'instrucoes_pagamento',
    ];

    protected $casts = [
        'saldo_inicial' => 'decimal:2',
        'saldo_actual' => 'decimal:2',
        'activa' => 'boolean',
        'principal' => 'boolean',
        'aceita_proxypay' => 'boolean',
        'aceita_manual' => 'boolean',
    ];

    public function condominio(): BelongsTo
    {
        return $this->belongsTo(Condominio::class);
    }

    public function movimentos(): HasMany
    {
        return $this->hasMany(ContaBancariaMovimento::class)->orderBy('data', 'desc')->orderBy('id', 'desc');
    }
}
