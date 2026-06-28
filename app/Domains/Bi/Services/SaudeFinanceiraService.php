<?php

declare(strict_types=1);

namespace App\Domains\Bi\Services;

use Illuminate\Support\Facades\DB;

class SaudeFinanceiraService
{
    /** Mínimo legal de fundo de reserva (DP 141/15): 10% das contribuições. */
    public const MIN_RESERVA_PCT = 10.0;

    public function calcular(int $empresaGestoraId, ?int $condominioId): array
    {
        $lanc = fn () => DB::table('lancamentos_condomino')
            ->where('empresa_gestora_id', $empresaGestoraId)
            ->whereNull('deleted_at')
            ->where('estado', '!=', 'cancelado')
            ->when($condominioId, fn ($q) => $q->where('condominio_id', $condominioId));

        // Fundo de reserva (opção A): saldo REAL nas contas marcadas como fundo de
        // reserva (e_fundo_reserva), comparado com o mínimo legal de 10% das contribuições.
        $fundoReservaSaldo = (float) DB::table('contas_bancarias')
            ->join('condominios', 'condominios.id', '=', 'contas_bancarias.condominio_id')
            ->where('condominios.empresa_gestora_id', $empresaGestoraId)
            ->when($condominioId, fn ($q) => $q->where('contas_bancarias.condominio_id', $condominioId))
            ->where('contas_bancarias.e_fundo_reserva', true)
            ->sum('contas_bancarias.saldo_actual');

        $quotaBase = (float) (clone $lanc())->where('tipo', 'quota_base')->sum('valor');
        $fundoEmQuotas = (float) (clone $lanc())->where('tipo', 'fundo_reserva')->sum('valor');
        $contribuicoes = $quotaBase + $fundoEmQuotas;
        $pctReserva = $contribuicoes > 0
            ? round(($fundoReservaSaldo / $contribuicoes) * 100, 1)
            : ($fundoReservaSaldo > 0 ? 100.0 : 0.0);
        $cumpreReserva = $pctReserva >= self::MIN_RESERVA_PCT;

        // Liquidez: saldo actual das contas dos condominios (filtrado)
        $saldoQ = DB::table('contas_bancarias')
            ->join('condominios', 'condominios.id', '=', 'contas_bancarias.condominio_id')
            ->where('condominios.empresa_gestora_id', $empresaGestoraId)
            ->when($condominioId, fn ($q) => $q->where('contas_bancarias.condominio_id', $condominioId));
        $saldoDisponivel = (float) $saldoQ->sum('contas_bancarias.saldo_actual');

        // Dívida em aberto (valor - valor_pago, positivo)
        $dividaRows = (clone $lanc())
            ->whereIn('estado', ['em_aberto', 'pago_parcial'])
            ->selectRaw('SUM(GREATEST(valor - valor_pago, 0)) AS divida')
            ->first();
        $divida = (float) ($dividaRows->divida ?? 0);

        // Rácio de cobertura: saldo / dívida (quantas vezes o saldo cobre a dívida)
        $cobertura = $divida > 0 ? round($saldoDisponivel / $divida, 2) : null;

        return [
            'fundo_reserva' => [
                'cobrado' => round($fundoReservaSaldo, 2),
                'contribuicoes' => round($contribuicoes, 2),
                'pct' => $pctReserva,
                'min_legal' => self::MIN_RESERVA_PCT,
                'cumpre' => $cumpreReserva,
            ],
            'liquidez' => [
                'saldo_disponivel' => round($saldoDisponivel, 2),
                'divida_aberto' => round($divida, 2),
                'cobertura' => $cobertura,
            ],
        ];
    }
}
