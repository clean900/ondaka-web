<?php

declare(strict_types=1);

namespace App\Domains\Bi\Services;

use Illuminate\Support\Facades\DB;

class AlertasService
{
    public function __construct(
        protected ReceitasDespesasService $receitas = new ReceitasDespesasService(),
        protected CobrancaService $cobranca = new CobrancaService(),
        protected SaudeFinanceiraService $saude = new SaudeFinanceiraService(),
        protected OperacionalService $operacional = new OperacionalService(),
    ) {}

    /** Defaults dos limites (usados se a gestora ainda não tiver config própria). */
    public const DEFAULT_TAXA_COBRANCA_MIN = 50.0;
    public const DEFAULT_DIVIDA_IMOVEL_LIMITE = 100000.0;


    /** Lê os limites da BD (ou devolve os defaults se nao houver config). */
    private function limites(int $empresaGestoraId): array
    {
        $row = DB::table('bi_alertas_config')->where('empresa_gestora_id', $empresaGestoraId)->first();
        return [
            'taxa_cobranca_min' => $row ? (float) $row->taxa_cobranca_min : self::DEFAULT_TAXA_COBRANCA_MIN,
            'divida_imovel_limite' => $row ? (float) $row->divida_imovel_limite : self::DEFAULT_DIVIDA_IMOVEL_LIMITE,
        ];
    }

    public function calcular(int $empresaGestoraId, ?int $condominioId): array
    {
        $alertas = [];
        $L = $this->limites($empresaGestoraId);

        // 1. Fundo de reserva abaixo do mínimo legal
        $saude = $this->saude->calcular($empresaGestoraId, $condominioId);
        if (! $saude['fundo_reserva']['cumpre']) {
            $alertas[] = [
                'nivel' => 'critico',
                'titulo' => 'Fundo de reserva abaixo do mínimo legal',
                'detalhe' => 'O fundo está em ' . $saude['fundo_reserva']['pct'] . '% (mínimo ' . $saude['fundo_reserva']['min_legal'] . '% — DP 141/15).',
            ];
        }

        // 2. Taxa de cobrança baixa
        $cobranca = $this->cobranca->calcular($empresaGestoraId, $condominioId);
        if ($cobranca['taxa_cobranca'] < $L['taxa_cobranca_min']) {
            $alertas[] = [
                'nivel' => 'aviso',
                'titulo' => 'Taxa de cobrança baixa',
                'detalhe' => 'A taxa de cobrança é de ' . $cobranca['taxa_cobranca'] . '% (abaixo de ' . (int) $L['taxa_cobranca_min'] . '%).',
            ];
        }

        // 3. Imóveis com dívida elevada
        $devedores = $this->cobranca->devedoresDetalhados($empresaGestoraId, $condominioId);
        $elevados = array_filter($devedores, fn ($d) => $d['divida'] >= $L['divida_imovel_limite']);
        if (count($elevados) > 0) {
            $alertas[] = [
                'nivel' => 'aviso',
                'titulo' => count($elevados) . ' imóvel(eis) com dívida elevada',
                'detalhe' => 'Há ' . count($elevados) . ' imóvel(eis) com dívida acima de ' . number_format($L['divida_imovel_limite'], 0, ',', '.') . ' Kz.',
            ];
        }

        // 4. Saldo negativo (despesas > receitas)
        $rec = $this->receitas->calcular($empresaGestoraId, $condominioId, 12);
        if ($rec['totais']['saldo'] < 0) {
            $alertas[] = [
                'nivel' => 'critico',
                'titulo' => 'Saldo negativo no período',
                'detalhe' => 'As despesas superam as receitas em ' . number_format(abs($rec['totais']['saldo']), 0, ',', '.') . ' Kz.',
            ];
        }

        // 5. Pedidos urgentes em aberto
        $op = $this->operacional->calcular($empresaGestoraId, $condominioId, 12);
        $urgentes = (int) ($op['por_prioridade']['urgente'] ?? 0);
        $abertos = (int) ($op['por_estado']['aberto'] ?? 0) + (int) ($op['por_estado']['em_analise'] ?? 0);
        if ($urgentes > 0 && $abertos > 0) {
            $alertas[] = [
                'nivel' => 'aviso',
                'titulo' => $urgentes . ' pedido(s) urgente(s)',
                'detalhe' => 'Há pedidos de prioridade urgente que podem precisar de atenção.',
            ];
        }

        return [
            'total' => count($alertas),
            'alertas' => $alertas,
        ];
    }
}
