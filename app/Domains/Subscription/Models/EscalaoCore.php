<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EscalaoCore extends Model
{
    use HasFactory;

    protected $table = 'escaloes_core';

    protected $fillable = [
        'slug', 'nome', 'descricao',
        'min_fraccoes', 'max_fraccoes',
        'preco_por_fraccao_mensal',
        'desconto_anual_pct',
        'desconto_pct',
        'cor_badge', 'ordem', 'activo',
    ];

    protected $casts = [
        'min_fraccoes' => 'integer',
        'max_fraccoes' => 'integer',
        'preco_por_fraccao_mensal' => 'decimal:2',
        'desconto_anual_pct' => 'decimal:2',
        'desconto_pct' => 'decimal:2',
        'ordem' => 'integer',
        'activo' => 'boolean',
    ];

    /**
     * Dado um nº de fracções, retorna o escalão aplicável.
     */
    public static function paraFraccoes(int $numeroFraccoes): ?self
    {
        return self::where('activo', true)
            ->where('min_fraccoes', '<=', $numeroFraccoes)
            ->where(function ($q) use ($numeroFraccoes) {
                $q->whereNull('max_fraccoes')
                    ->orWhere('max_fraccoes', '>=', $numeroFraccoes);
            })
            ->orderBy('min_fraccoes', 'desc')
            ->first();
    }

    /**
     * Calcula o valor mensal para N fracções neste escalão.
     */
    public function calcularValorMensal(int $numeroFraccoes): float
    {
        return round($numeroFraccoes * (float) $this->preco_por_fraccao_mensal, 2);
    }

    /**
     * Calcula o valor anual com desconto.
     */
    public function calcularValorAnual(int $numeroFraccoes): float
    {
        $mensal = $this->calcularValorMensal($numeroFraccoes);
        $totalSemDesconto = $mensal * 12;
        $desconto = $totalSemDesconto * ((float) $this->desconto_anual_pct / 100);
        return round($totalSemDesconto - $desconto, 2);
    }

    public function getIntervaloFormatadoAttribute(): string
    {
        if ($this->max_fraccoes === null) {
            return $this->min_fraccoes . '+ fracções';
        }
        return $this->min_fraccoes . ' – ' . $this->max_fraccoes . ' fracções';
    }
}
