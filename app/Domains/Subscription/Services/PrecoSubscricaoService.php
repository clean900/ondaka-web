<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Services;

use App\Domains\Subscription\Models\EscalaoCore;
use Illuminate\Support\Facades\DB;

/**
 * Calcula preços de subscrições B2B da plataforma ONDAKA.
 * 
 * Fórmula:
 *   SUBTOTAL = NUM × BASE × MESES × (1 - DESC_QTD) × (1 - DESC_PERIODO)
 *   IMPOSTO  = SUBTOTAL × TAXA_IMPOSTO
 *   TOTAL    = SUBTOTAL + IMPOSTO
 * 
 * Configs vêm de plataforma_config (super-admin).
 * Escalões de quantidade vêm de escaloes_core.
 */
class PrecoSubscricaoService
{
    /**
     * Calcula o preço total para uma subscrição.
     * 
     * @param int $numImoveis Número de imóveis
     * @param string $periodicidade 'mensal' | 'semestral' | 'anual'
     * @return array Detalhes completos do cálculo (breakdown)
     */
    public function calcular(int $numImoveis, string $periodicidade): array
    {
        if ($numImoveis < 1) {
            throw new \InvalidArgumentException('Número de imóveis deve ser >= 1');
        }
        if (!in_array($periodicidade, ['mensal', 'semestral', 'anual'])) {
            throw new \InvalidArgumentException('Periodicidade inválida');
        }

        // 1. Configurações globais
        $config = $this->loadConfig();

        // 2. Encontrar escalão para este nº de imóveis
        $escalao = $this->encontrarEscalao($numImoveis);

        // 3. Determinar meses
        $meses = match ($periodicidade) {
            'mensal' => 1,
            'semestral' => 6,
            'anual' => 12,
        };

        // 4. Determinar desconto do período
        $descontoPeriodoPct = match ($periodicidade) {
            'mensal' => $config['desconto_periodo_mensal_pct'],
            'semestral' => $config['desconto_periodo_semestral_pct'],
            'anual' => $config['desconto_periodo_anual_pct'],
        };

        $precoBase = $config['preco_base_imovel_mes'];
        $descontoQtdPct = (float) $escalao->desconto_pct;

        // 5. Cálculo
        $subtotalSemDescontos = $numImoveis * $precoBase * $meses;
        $aposDescQtd = $subtotalSemDescontos * (1 - $descontoQtdPct / 100);
        $subtotal = $aposDescQtd * (1 - $descontoPeriodoPct / 100);

        // 6. Imposto (se aplicável)
        $impostoAplicavel = (bool) $config['imposto_aplicavel'];
        $impostoTipo = $config['imposto_tipo'];
        $impostoTaxaPct = $impostoAplicavel ? $config['imposto_taxa_pct'] : 0;
        $impostoValor = $subtotal * ($impostoTaxaPct / 100);

        // 7. Total
        $total = $subtotal + $impostoValor;

        return [
            'num_imoveis' => $numImoveis,
            'periodicidade' => $periodicidade,
            'meses' => $meses,
            'preco_base_kz' => round($precoBase, 2),
            'escalao' => [
                'id' => $escalao->id,
                'slug' => $escalao->slug,
                'nome' => $escalao->nome,
                'min_imoveis' => $escalao->min_fraccoes,
                'max_imoveis' => $escalao->max_fraccoes,
            ],
            'desconto_qtd_pct' => round($descontoQtdPct, 2),
            'desconto_periodo_pct' => round($descontoPeriodoPct, 2),
            'subtotal_kz' => round($subtotal, 2),
            'imposto_aplicavel' => $impostoAplicavel,
            'imposto_tipo' => $impostoTipo,
            'imposto_taxa_pct' => round($impostoTaxaPct, 2),
            'imposto_valor_kz' => round($impostoValor, 2),
            'total_kz' => round($total, 2),
            // Útil para mostrar ao cliente
            'total_mensal_equivalente_kz' => round($total / $meses, 2),
        ];
    }

    /**
     * Busca configurações globais.
     */
    private function loadConfig(): array
    {
        $rows = DB::table('plataforma_config')->pluck('valor', 'chave')->toArray();

        return [
            'preco_base_imovel_mes' => (float) ($rows['preco_base_imovel_mes'] ?? 0),
            'desconto_periodo_mensal_pct' => (float) ($rows['desconto_periodo_mensal_pct'] ?? 0),
            'desconto_periodo_semestral_pct' => (float) ($rows['desconto_periodo_semestral_pct'] ?? 0),
            'desconto_periodo_anual_pct' => (float) ($rows['desconto_periodo_anual_pct'] ?? 0),
            'trial_duracao_dias' => (int) ($rows['trial_duracao_dias'] ?? 14),
            'imposto_aplicavel' => (bool) ($rows['imposto_aplicavel'] ?? false),
            'imposto_tipo' => $rows['imposto_tipo'] ?? 'IVA',
            'imposto_taxa_pct' => (float) ($rows['imposto_taxa_pct'] ?? 0),
        ];
    }

    /**
     * Encontra o escalão correspondente ao nº de imóveis.
     */
    private function encontrarEscalao(int $numImoveis): EscalaoCore
    {
        $escalao = EscalaoCore::where('activo', true)
            ->where('min_fraccoes', '<=', $numImoveis)
            ->where(function ($q) use ($numImoveis) {
                $q->whereNull('max_fraccoes')
                    ->orWhere('max_fraccoes', '>=', $numImoveis);
            })
            ->orderBy('ordem')
            ->first();

        if (!$escalao) {
            throw new \RuntimeException("Não foi encontrado escalão para {$numImoveis} imóveis");
        }

        return $escalao;
    }

    /**
     * Helper: lista todas as periodicidades com preços calculados.
     * Útil para mostrar comparativo no frontend.
     */
    public function comparativo(int $numImoveis): array
    {
        return [
            'mensal' => $this->calcular($numImoveis, 'mensal'),
            'semestral' => $this->calcular($numImoveis, 'semestral'),
            'anual' => $this->calcular($numImoveis, 'anual'),
        ];
    }
}
