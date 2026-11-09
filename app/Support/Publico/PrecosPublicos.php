<?php

declare(strict_types=1);

namespace App\Support\Publico;

use Illuminate\Support\Facades\DB;

/**
 * Preços e condições que as páginas públicas mostram (landing, catálogo, loja).
 *
 * Lê tudo da BD (plataforma_config + escaloes_core), como o super-admin os
 * configurou: nada de preços escritos à mão nas páginas.
 */
final class PrecosPublicos
{
    /** @var array<string, string>|null */
    private ?array $config = null;

    /**
     * Escalões activos com o preço unitário (Kz por imóvel/mês) nos 3 períodos.
     *
     * @return array{escaloes: list<array<string, mixed>>, config: array<string, mixed>}
     */
    public function pricing(): array
    {
        $c = $this->condicoes();
        $precoBase = $c['preco_base_kz'];

        $escaloes = DB::table('escaloes_core')
            ->where('activo', true)
            ->orderBy('ordem', 'asc')
            ->get()
            ->map(function ($e) use ($precoBase, $c) {
                $descontoQtd = (float) ($e->desconto_pct ?? 0);
                $unit = fn (float $descPeriodo): float => round($precoBase * (1 - $descontoQtd / 100) * (1 - $descPeriodo / 100), 2);

                return [
                    'nome' => (string) $e->nome,
                    'slug' => (string) $e->slug,
                    'descricao' => (string) ($e->descricao ?? ''),
                    'imoveis_min' => (int) $e->min_fraccoes,
                    'imoveis_max' => $e->max_fraccoes !== null ? (int) $e->max_fraccoes : null,
                    'desconto_qtd_pct' => $descontoQtd,
                    'preco_unit_mensal_kz' => $unit($c['desconto_mensal_pct']),
                    'preco_unit_semestral_kz' => $unit($c['desconto_semestral_pct']),
                    'preco_unit_anual_kz' => $unit($c['desconto_anual_pct']),
                    'destaque' => str_contains(strtolower((string) $e->nome), 'prata'), // PRATA é o popular
                ];
            })
            ->values()
            ->all();

        return ['escaloes' => $escaloes, 'config' => $c];
    }

    /**
     * Condições gerais: preço base, descontos por período, trial e imposto.
     *
     * @return array{preco_base_kz: float, desconto_mensal_pct: float, desconto_semestral_pct: float, desconto_anual_pct: float, trial_dias: int, imposto_aplicavel: bool, imposto_tipo: string, imposto_taxa_pct: float}
     */
    public function condicoes(): array
    {
        $this->config ??= DB::table('plataforma_config')
            ->whereIn('chave', [
                'preco_base_imovel_mes',
                'desconto_periodo_mensal_pct',
                'desconto_periodo_semestral_pct',
                'desconto_periodo_anual_pct',
                'trial_duracao_dias',
                'imposto_aplicavel',
                'imposto_tipo',
                'imposto_taxa_pct',
            ])
            ->pluck('valor', 'chave')
            ->toArray();

        $cfg = $this->config;

        return [
            'preco_base_kz' => (float) ($cfg['preco_base_imovel_mes'] ?? 1350),
            'desconto_mensal_pct' => (float) ($cfg['desconto_periodo_mensal_pct'] ?? 0),
            'desconto_semestral_pct' => (float) ($cfg['desconto_periodo_semestral_pct'] ?? 5),
            'desconto_anual_pct' => (float) ($cfg['desconto_periodo_anual_pct'] ?? 10),
            'trial_dias' => (int) ($cfg['trial_duracao_dias'] ?? 30),
            'imposto_aplicavel' => (bool) ($cfg['imposto_aplicavel'] ?? false),
            'imposto_tipo' => (string) ($cfg['imposto_tipo'] ?? 'IVA'),
            'imposto_taxa_pct' => (float) ($cfg['imposto_taxa_pct'] ?? 0),
        ];
    }

    /**
     * Formata um valor em Kz como na página (até 2 casas, espaço nos milhares,
     * vírgula decimal). O JavaScript da calculadora usa a mesma regra.
     */
    public static function kz(float $valor): string
    {
        $txt = number_format($valor, 2, ',', "\u{00A0}");

        return rtrim(rtrim($txt, '0'), ',');
    }

    /** Percentagem sem zeros inúteis: 6.5 → "6,5", 10.0 → "10". */
    public static function pct(float $valor): string
    {
        return self::kz($valor);
    }
}
