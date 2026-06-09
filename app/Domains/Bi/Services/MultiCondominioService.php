<?php

declare(strict_types=1);

namespace App\Domains\Bi\Services;

use App\Domains\Condominio\Models\Condominio;

class MultiCondominioService
{
    public function __construct(
        protected ReceitasDespesasService $receitas = new ReceitasDespesasService(),
        protected CobrancaService $cobranca = new CobrancaService(),
        protected SaudeFinanceiraService $saude = new SaudeFinanceiraService(),
    ) {}

    /**
     * Comparativo de todos os condomínios de uma gestora.
     */
    public function calcular(int $empresaGestoraId): array
    {
        $condominios = Condominio::where('empresa_gestora_id', $empresaGestoraId)
            ->orderBy('nome')
            ->get(['id', 'nome']);

        $itens = [];
        foreach ($condominios as $co) {
            $rec = $this->receitas->calcular($empresaGestoraId, $co->id, 12);
            $cob = $this->cobranca->calcular($empresaGestoraId, $co->id);
            $sau = $this->saude->calcular($empresaGestoraId, $co->id);

            $itens[] = [
                'condominio_id' => $co->id,
                'nome' => $co->nome,
                'receita' => $rec['totais']['receita'],
                'despesa' => $rec['totais']['despesa'],
                'saldo' => $rec['totais']['saldo'],
                'divida' => $cob['divida_total'],
                'taxa_cobranca' => $cob['taxa_cobranca'],
                'fundo_pct' => $sau['fundo_reserva']['pct'],
                'fundo_cumpre' => $sau['fundo_reserva']['cumpre'],
                'saldo_banco' => $sau['liquidez']['saldo_disponivel'],
            ];
        }

        // Ranking de saúde: pontuação simples (taxa cobrança + fundo cumpre + saldo positivo)
        foreach ($itens as &$it) {
            $score = 0;
            $score += min(40, $it['taxa_cobranca'] * 0.4);      // até 40 pts pela cobrança
            $score += $it['fundo_cumpre'] ? 30 : 0;             // 30 pts se cumpre reserva
            $score += $it['saldo'] >= 0 ? 30 : 0;               // 30 pts se saldo positivo
            $it['score_saude'] = (int) round($score);
        }
        unset($it);

        // Ordenar por score de saúde (melhor primeiro)
        usort($itens, fn ($a, $b) => $b['score_saude'] <=> $a['score_saude']);

        return ['itens' => $itens];
    }
}
