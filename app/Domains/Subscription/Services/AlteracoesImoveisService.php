<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Services;

use App\Domains\Subscription\Models\Subscricao;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Gere alterações ao nº de imóveis numa subscrição activa.
 * 
 * Lógica:
 *  - Trial / sem subscrição activa: actualização directa, sem ajuste
 *  - Activa: regista alteração + calcula ajuste para próxima factura
 *      • Aumento: cobra valor proporcional aos dias restantes
 *      • Diminuição: cria crédito a abater (valor negativo)
 */
class AlteracoesImoveisService
{
    public function __construct(
        protected PrecoSubscricaoService $precoService,
    ) {}

    /**
     * Altera o nº de imóveis de uma subscrição.
     * Devolve detalhes da alteração + ajuste calculado.
     */
    public function alterar(Subscricao $sub, int $novoNumImoveis, ?int $userId = null, ?string $motivo = null): array
    {
        if ($novoNumImoveis < 1) {
            throw new \InvalidArgumentException('Número de imóveis tem de ser >= 1');
        }

        $imoveisAntes = (int) ($sub->num_imoveis ?? 0);

        if ($novoNumImoveis === $imoveisAntes) {
            throw new \InvalidArgumentException('Sem alteração: nº de imóveis igual ao actual.');
        }

        $diferenca = $novoNumImoveis - $imoveisAntes;
        $agora = now();

        return DB::transaction(function () use ($sub, $imoveisAntes, $novoNumImoveis, $diferenca, $userId, $motivo, $agora) {

            // Calcular ajuste proporcional só se subscrição activa e tiver período definido
            $valorProRata = 0.0;
            $diasRestantes = 0;
            $aplicarProRata = false;

            if ($sub->estado === 'activa'
                && $sub->periodo_actual_inicio
                && $sub->periodo_actual_fim
            ) {
                $totalDiasPeriodo = $sub->periodo_actual_inicio->diffInDays($sub->periodo_actual_fim);
                $diasRestantes = max(0, (int) $agora->diffInDays($sub->periodo_actual_fim, false));

                if ($diasRestantes > 0 && $totalDiasPeriodo > 0) {
                    $aplicarProRata = true;

                    // Calcula preço unitário diário (preço base com escalão e período actuais)
                    $calcAntes = $this->precoService->calcular(max(1, $imoveisAntes), $sub->ciclo);
                    $calcDepois = $this->precoService->calcular($novoNumImoveis, $sub->ciclo);

                    // Ajuste = diferença total × proporção dias restantes
                    $diferencaTotal = $calcDepois['total_kz'] - $calcAntes['total_kz'];
                    $proporcao = $diasRestantes / $totalDiasPeriodo;
                    $valorProRata = round($diferencaTotal * $proporcao, 2);
                }
            }

            // Registar alteração no histórico
            $alteracaoId = DB::table('plataforma_alteracoes_imoveis')->insertGetId([
                'subscricao_id' => $sub->id,
                'imoveis_antes' => $imoveisAntes,
                'imoveis_depois' => $novoNumImoveis,
                'diferenca' => $diferenca,
                'data_alteracao' => $agora,
                'valor_pro_rata_kz' => $valorProRata,
                'dias_periodo_restantes' => $diasRestantes,
                'factura_id' => null, // será preenchido quando aplicado em factura
                'motivo' => $motivo,
                'user_id' => $userId,
                'created_at' => $agora,
                'updated_at' => $agora,
            ]);

            // Actualizar subscrição
            $sub->update(['num_imoveis' => $novoNumImoveis]);

            // Audit trail
            DB::table('plataforma_subscricao_eventos')->insert([
                'subscricao_id' => $sub->id,
                'tipo' => 'imoveis_alterados',
                'descricao' => "Imóveis: {$imoveisAntes} → {$novoNumImoveis} (Δ{$diferenca})"
                    . ($aplicarProRata
                        ? ', ' . ($valorProRata >= 0 ? 'acréscimo' : 'crédito') . ' de ' . number_format(abs($valorProRata), 2) . ' Kz por ' . $diasRestantes . ' dias'
                        : ''),
                'meta_json' => json_encode([
                    'alteracao_id' => $alteracaoId,
                    'imoveis_antes' => $imoveisAntes,
                    'imoveis_depois' => $novoNumImoveis,
                    'diferenca' => $diferenca,
                    'valor_pro_rata_kz' => $valorProRata,
                    'dias_restantes' => $diasRestantes,
                    'aplicar_pro_rata' => $aplicarProRata,
                ]),
                'user_id' => $userId,
                'created_at' => $agora,
            ]);

            Log::info('Subscrição imóveis alterados', [
                'subscricao_id' => $sub->id,
                'antes' => $imoveisAntes,
                'depois' => $novoNumImoveis,
                'pro_rata' => $valorProRata,
            ]);

            return [
                'alteracao_id' => $alteracaoId,
                'imoveis_antes' => $imoveisAntes,
                'imoveis_depois' => $novoNumImoveis,
                'diferenca' => $diferenca,
                'valor_pro_rata_kz' => $valorProRata,
                'dias_restantes' => $diasRestantes,
                'aplicar_pro_rata' => $aplicarProRata,
            ];
        });
    }

    /**
     * Lista alterações pendentes (sem factura associada) para uma subscrição.
     * Útil quando emite próxima factura, para juntar pro-rata.
     */
    public function pendentesParaFacturar(int $subscricaoId): array
    {
        return DB::table('plataforma_alteracoes_imoveis')
            ->where('subscricao_id', $subscricaoId)
            ->whereNull('factura_id')
            ->where('valor_pro_rata_kz', '!=', 0)
            ->get()
            ->toArray();
    }

    /**
     * Marca alterações como aplicadas (associa-as à factura emitida).
     */
    public function marcarAplicadasNaFactura(array $alteracaoIds, int $facturaId): void
    {
        if (empty($alteracaoIds)) {
            return;
        }

        DB::table('plataforma_alteracoes_imoveis')
            ->whereIn('id', $alteracaoIds)
            ->update([
                'factura_id' => $facturaId,
                'updated_at' => now(),
            ]);
    }
}
