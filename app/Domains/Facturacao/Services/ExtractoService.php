<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Services;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Condomino\Models\ContratoOcupacao;
use App\Domains\Facturacao\Models\Lancamento;
use App\Domains\Facturacao\Models\Pagamento;
use Illuminate\Support\Collection;
use Carbon\Carbon;

/**
 * Service de extracto financeiro do condómino.
 *
 * Responsabilidades:
 * - Calcular saldo total em dívida por condómino
 * - Listar movimentos (lançamentos + pagamentos) ordenados por data
 * - Decompor por tipo (quotas, multas, despesas extras)
 *
 * NÃO faz alterações — só leitura.
 */
class ExtractoService
{
    /**
     * Calcula o saldo total em dívida de um condómino.
     *
     * Considera todos os lançamentos em aberto (em_aberto + pago_parcial)
     * de todas as fracções onde tem contrato activo.
     *
     * @return array{
     *   total_em_divida: float,
     *   total_em_atraso: float,
     *   numero_lancamentos_em_divida: int,
     *   numero_lancamentos_em_atraso: int,
     *   por_tipo: array
     * }
     */
    public function calcularSaldo(Condomino $condomino): array
    {
        // Fracções onde o condómino tem contrato activo
        $fraccoesIds = ContratoOcupacao::where('condomino_id', $condomino->id)
            ->where('estado', 'activo')
            ->pluck('fraccao_id')
            ->toArray();

        if (empty($fraccoesIds)) {
            return $this->saldoVazio();
        }

        $lancamentos = Lancamento::query()
            ->whereIn('fraccao_id', $fraccoesIds)
            ->emAberto()
            ->get();

        $totalEmDivida = '0';
        $totalEmAtraso = '0';
        $numEmDivida = 0;
        $numEmAtraso = 0;
        $porTipo = [];

        foreach ($lancamentos as $l) {
            $emDividaStr = bcsub((string) $l->valor, (string) $l->valor_pago, 2);
            if (bccomp($emDividaStr, '0', 2) <= 0) {
                continue;
            }

            $totalEmDivida = bcadd($totalEmDivida, $emDividaStr, 2);
            $numEmDivida++;

            if ($l->estaEmAtraso()) {
                $totalEmAtraso = bcadd($totalEmAtraso, $emDividaStr, 2);
                $numEmAtraso++;
            }

            $tipoActual = $porTipo[$l->tipo] ?? '0';
            $porTipo[$l->tipo] = bcadd($tipoActual, $emDividaStr, 2);
        }

        return [
            'total_em_divida' => $totalEmDivida,
            'total_em_atraso' => $totalEmAtraso,
            'numero_lancamentos_em_divida' => $numEmDivida,
            'numero_lancamentos_em_atraso' => $numEmAtraso,
            'por_tipo' => $porTipo,
        ];
    }

    /**
     * Lista movimentos do extracto — lançamentos e pagamentos misturados,
     * ordenados por data desc.
     *
     * Cada movimento tem o formato:
     * {
     *   tipo: 'lancamento' | 'pagamento',
     *   id: int,
     *   data: 'YYYY-MM-DD',
     *   descricao: string,
     *   valor: float (positivo para débito, positivo para crédito)
     *   sentido: 'debito' | 'credito',
     *   estado: string,
     *   fraccao_id: int,
     *   ...campos específicos
     * }
     *
     * @return Collection
     */
    public function listarMovimentos(
        Condomino $condomino,
        ?int $limit = 50,
        ?string $desde = null,
        ?string $ate = null,
    ): Collection {
        $fraccoesIds = ContratoOcupacao::where('condomino_id', $condomino->id)
            ->where('estado', 'activo')
            ->pluck('fraccao_id')
            ->toArray();

        if (empty($fraccoesIds)) {
            return collect();
        }

        // 1. Lançamentos
        $queryLancamentos = Lancamento::query()
            ->with(['fraccao:id,identificador'])
            ->whereIn('fraccao_id', $fraccoesIds);

        if ($desde) {
            $queryLancamentos->where('data_lancamento', '>=', $desde);
        }
        if ($ate) {
            $queryLancamentos->where('data_lancamento', '<=', $ate);
        }

        $lancamentos = $queryLancamentos->get()->map(fn ($l) => [
            'tipo_movimento' => 'lancamento',
            'id' => $l->id,
            'data' => $l->data_lancamento->toDateString(),
            'data_vencimento' => $l->data_vencimento?->toDateString(),
            'descricao' => $l->descricao,
            'detalhes' => $l->detalhes,
            'tipo' => $l->tipo,
            'valor' => (string) $l->valor,
            'valor_pago' => (string) $l->valor_pago,
            'valor_em_divida' => bcsub((string) $l->valor, (string) $l->valor_pago, 2),
            'sentido' => 'debito',
            'estado' => $l->estado,
            'em_atraso' => $l->estaEmAtraso(),
            'fraccao' => [
                'id' => $l->fraccao_id,
                'identificador' => $l->fraccao?->identificador,
            ],
        ]);

        // 2. Pagamentos confirmados
        $queryPagamentos = Pagamento::query()
            ->with(['fraccao:id,identificador'])
            ->whereIn('fraccao_id', $fraccoesIds)
            ->confirmados();

        if ($desde) {
            $queryPagamentos->where('data_pagamento', '>=', $desde);
        }
        if ($ate) {
            $queryPagamentos->where('data_pagamento', '<=', $ate);
        }

        $pagamentos = $queryPagamentos->get()->map(fn ($p) => [
            'tipo_movimento' => 'pagamento',
            'id' => $p->id,
            'data' => $p->data_pagamento->toDateString(),
            'descricao' => 'Pagamento ' . $p->referencia,
            'metodo' => $p->metodo,
            'valor' => (string) $p->valor,
            'sentido' => 'credito',
            'estado' => $p->estado,
            'fraccao' => [
                'id' => $p->fraccao_id,
                'identificador' => $p->fraccao?->identificador,
            ],
        ]);

        // Misturar e ordenar por data desc
        return $lancamentos
            ->concat($pagamentos)
            ->sortByDesc('data')
            ->values()
            ->take($limit ?? 50);
    }

    private function saldoVazio(): array
    {
        return [
            'total_em_divida' => '0.00',
            'total_em_atraso' => '0.00',
            'numero_lancamentos_em_divida' => 0,
            'numero_lancamentos_em_atraso' => 0,
            'por_tipo' => [],
        ];
    }

    /**
     * Devolve agregado mensal (últimos 12 meses) para o gráfico de barras
     * do Dashboard mobile.
     *
     * Para cada mês:
     *  - pago: SUM(valor_pago) dos lançamentos cuja data_lancamento cai no mês
     *  - em_aberto: SUM(valor - valor_pago) dos mesmos lançamentos
     *
     * @return array<int, array{mes: string, mes_curto: string, ano: int, pago: float, em_aberto: float}>
     */
    public function graficoMensal(Condomino $condomino): array
    {
        $fraccoesIds = ContratoOcupacao::where('condomino_id', $condomino->id)
            ->where('estado', 'activo')
            ->pluck('fraccao_id')
            ->toArray();

        if (empty($fraccoesIds)) {
            return $this->graficoMensalVazio();
        }

        $inicio = Carbon::now()->subMonths(11)->startOfMonth();
        $fim = Carbon::now()->endOfMonth();

        $lancamentos = Lancamento::query()
            ->whereIn('fraccao_id', $fraccoesIds)
            ->whereBetween('data_lancamento', [$inicio, $fim])
            ->get();

        $mesesCurtos = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

        // Inicializar 12 meses (do mais antigo para o mais recente)
        $resultado = [];
        for ($i = 11; $i >= 0; $i--) {
            $data = Carbon::now()->subMonths($i);
            $key = sprintf('%d-%02d', $data->year, $data->month);
            $resultado[$key] = [
                'mes' => $data->locale('pt')->isoFormat('MMMM'),
                'mes_curto' => $mesesCurtos[$data->month - 1],
                'ano' => $data->year,
                'pago' => 0.0,
                'em_aberto' => 0.0,
            ];
        }

        // Agregar
        foreach ($lancamentos as $l) {
            $key = sprintf('%d-%02d', $l->data_lancamento->year, $l->data_lancamento->month);
            if (! isset($resultado[$key])) {
                continue;
            }

            $pago = (float) $l->valor_pago;
            $emDivida = max(0, (float) $l->valor - $pago);

            $resultado[$key]['pago'] += $pago;
            $resultado[$key]['em_aberto'] += $emDivida;
        }

        return array_values($resultado);
    }

    /**
     * Helper: 12 meses vazios (zeros) — usado quando o condómino não tem fracções.
     */
    private function graficoMensalVazio(): array
    {
        $mesesCurtos = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        $resultado = [];
        for ($i = 11; $i >= 0; $i--) {
            $data = Carbon::now()->subMonths($i);
            $resultado[] = [
                'mes' => $data->locale('pt')->isoFormat('MMMM'),
                'mes_curto' => $mesesCurtos[$data->month - 1],
                'ano' => $data->year,
                'pago' => 0.0,
                'em_aberto' => 0.0,
            ];
        }
        return $resultado;
    }
}
