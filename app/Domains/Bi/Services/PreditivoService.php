<?php

declare(strict_types=1);

namespace App\Domains\Bi\Services;

use Illuminate\Support\Facades\DB;

class PreditivoService
{
    /** IPC / inflação anual usada para sugestão de quota (%). */
    public const IPC_PCT = 6.5;

    /** Mínimo legal do fundo de reserva (DP 141/15): 10% da quota base. */
    public const MIN_RESERVA_PCT = 10.0;

    public function calcular(int $empresaGestoraId, ?int $condominioId): array
    {
        return [
            'sugestao_ipc' => $this->sugestaoIpc($empresaGestoraId, $condominioId),
            'anomalias' => $this->anomalias($empresaGestoraId, $condominioId),
            'benchmarking' => $this->benchmarking($empresaGestoraId, $condominioId),
        ];
    }

    /** Sugestão de quota ajustada ao IPC. */
    private function sugestaoIpc(int $empresaGestoraId, ?int $condominioId): array
    {
        $q = DB::table('quotas')
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->whereNull('deleted_at')
            ->where('estado', '!=', 'cancelada')
            ->when($condominioId, fn ($x) => $x->where('condominio_id', $condominioId));

        // Quota base média actual (por imóvel)
        $mediaBase = (float) (clone $q)->avg('valor_quota_base');
        $mediaFundo = (float) (clone $q)->avg('valor_fundo_reserva');

        if ($mediaBase <= 0) {
            return ['disponivel' => false, 'motivo' => 'Sem quotas registadas.'];
        }

        $factor = 1 + (self::IPC_PCT / 100);
        $baseSugerida = round($mediaBase * $factor, 2);

        // Fundo de reserva: ajusta ao IPC, mas nunca abaixo do mínimo legal
        // (10% da quota base — DP 141/15). Assim a sugestão guia para a conformidade
        // mesmo quando o condomínio ainda não cobra componente de fundo.
        $fundoPorInflacao = $mediaFundo * $factor;
        $fundoMinimoLegal = $baseSugerida * (self::MIN_RESERVA_PCT / 100);
        $fundoSugerido = round(max($fundoPorInflacao, $fundoMinimoLegal), 2);
        $fundoAjustadoMinimo = $fundoSugerido > round($fundoPorInflacao, 2);

        return [
            'disponivel' => true,
            'ipc_pct' => self::IPC_PCT,
            'base_actual' => round($mediaBase, 2),
            'base_sugerida' => $baseSugerida,
            'fundo_actual' => round($mediaFundo, 2),
            'fundo_sugerido' => $fundoSugerido,
            'fundo_min_legal_pct' => self::MIN_RESERVA_PCT,
            'fundo_ajustado_minimo' => $fundoAjustadoMinimo,
            'total_actual' => round($mediaBase + $mediaFundo, 2),
            'total_sugerido' => round($baseSugerida + $fundoSugerido, 2),
        ];
    }

    /** Detecção de anomalias em despesas (precisa de histórico). */
    private function anomalias(int $empresaGestoraId, ?int $condominioId): array
    {
        // Despesas pagas por mês
        $porMes = DB::table('despesas')
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->where('estado', 'paga')
            ->when($condominioId, fn ($x) => $x->where('condominio_id', $condominioId))
            ->selectRaw("DATE_FORMAT(data_despesa, '%Y-%m') AS mes, SUM(valor) AS total")
            ->groupBy('mes')
            ->orderBy('mes')
            ->pluck('total', 'mes');

        // Precisa de pelo menos 3 meses para ter base estatística
        if ($porMes->count() < 3) {
            return [
                'disponivel' => false,
                'motivo' => 'Dados históricos insuficientes (mínimo 3 meses) para detectar anomalias com fiabilidade.',
                'meses_disponiveis' => $porMes->count(),
            ];
        }

        $valores = array_map('floatval', $porMes->values()->all());
        $media = array_sum($valores) / count($valores);
        $ultimo = end($valores);
        $desvio = $media > 0 ? round((($ultimo - $media) / $media) * 100, 1) : 0;

        return [
            'disponivel' => true,
            'media_mensal' => round($media, 2),
            'ultimo_mes' => round($ultimo, 2),
            'desvio_pct' => $desvio,
            'anomalia' => abs($desvio) > 30,
        ];
    }

    /** Benchmarking: comparar o condomínio com a média dos outros da gestora. */
    private function benchmarking(int $empresaGestoraId, ?int $condominioId): array
    {
        // Despesa total paga por condomínio
        $porCond = DB::table('despesas')
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->where('estado', 'paga')
            ->selectRaw('condominio_id, SUM(valor) AS total')
            ->groupBy('condominio_id')
            ->pluck('total', 'condominio_id');

        if ($porCond->count() < 2) {
            return [
                'disponivel' => false,
                'motivo' => 'São necessários pelo menos 2 condomínios com despesas para comparar.',
                'condominios_com_dados' => $porCond->count(),
            ];
        }

        $media = $porCond->avg();
        $itens = [];
        foreach ($porCond as $cid => $total) {
            $itens[] = [
                'condominio_id' => $cid,
                'total' => round((float) $total, 2),
                'vs_media_pct' => $media > 0 ? round(((((float) $total) - $media) / $media) * 100, 1) : 0,
            ];
        }

        return [
            'disponivel' => true,
            'media' => round((float) $media, 2),
            'itens' => $itens,
        ];
    }
}
