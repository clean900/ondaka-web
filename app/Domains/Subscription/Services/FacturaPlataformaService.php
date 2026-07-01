<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Services;

use App\Domains\Subscription\Models\Subscricao;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Serviço de geração de facturas da plataforma ONDAKA.
 * 
 * Facturas são emitidas:
 *  - Quando trial expira (1ª factura)
 *  - No fim do período corrente (renovação)
 *  - Quando há alteração de imóveis (com ajuste proporcional)
 */
class FacturaPlataformaService
{
    public function __construct(
        protected PrecoSubscricaoService $precoService,
    ) {}

    /**
     * Emite factura para uma subscrição com base no período actual.
     * Calcula tudo, cria registo, devolve a factura criada.
     */
    public function emitir(Subscricao $subscricao, ?string $periodicidade = null): array
    {
        $periodicidade = $periodicidade ?? $subscricao->ciclo;
        $numImoveis = (int) ($subscricao->num_imoveis ?? 0);

        if ($numImoveis < 1) {
            throw new \RuntimeException('Subscrição sem nº de imóveis definido.');
        }

        // Calcula preços usando o service
        $calc = $this->precoService->calcular($numImoveis, $periodicidade);

        // Ajustes pendentes de alterações de imóveis (acréscimos positivos / créditos negativos)
        $alteracoesPendentes = DB::table('plataforma_alteracoes_imoveis')
            ->where('subscricao_id', $subscricao->id)
            ->whereNull('factura_id')
            ->where('valor_pro_rata_kz', '!=', 0)
            ->get();

        $proRataTotal = 0.0;
        $proRataIds = [];
        foreach ($alteracoesPendentes as $a) {
            $proRataTotal += (float) $a->valor_pro_rata_kz;
            $proRataIds[] = $a->id;
        }

        // Adiciona ajuste ao breakdown
        if ($proRataTotal !== 0.0) {
            $calc['pro_rata_kz'] = round($proRataTotal, 2);
            $calc['pro_rata_alteracoes_count'] = count($alteracoesPendentes);
            $calc['subtotal_kz'] = round($calc['subtotal_kz'] + $proRataTotal, 2);

            // Recalcular imposto com base no novo subtotal
            if ($calc['imposto_aplicavel']) {
                $calc['imposto_valor_kz'] = round($calc['subtotal_kz'] * ($calc['imposto_taxa_pct'] / 100), 2);
            }
            $calc['total_kz'] = round($calc['subtotal_kz'] + $calc['imposto_valor_kz'], 2);
            $calc['total_mensal_equivalente_kz'] = round($calc['total_kz'] / $calc['meses'], 2);
        }

        // Determina datas do período
        $agora = now();
        $inicio = $agora->copy();
        $fim = match ($periodicidade) {
            'mensal' => $agora->copy()->addMonth(),
            'semestral' => $agora->copy()->addMonths(6),
            'anual' => $agora->copy()->addYear(),
        };

        // Vencimento: 7 dias após emissão
        $vencimento = $agora->copy()->addDays(7);

        // Numeração: PLAT/{YEAR}/{SEQ}
        $numero = $this->gerarNumero($agora->year);

        // Cria factura via insert (sem Model por enquanto)
        $facturaId = DB::table('plataforma_facturas')->insertGetId([
            'subscricao_id' => $subscricao->id,
            'numero' => $numero,
            'periodo_referencia_inicio' => $inicio->toDateString(),
            'periodo_referencia_fim' => $fim->toDateString(),
            'num_imoveis_facturado' => $numImoveis,
            'preco_base_kz' => $calc['preco_base_kz'],
            'desconto_qtd_pct' => $calc['desconto_qtd_pct'],
            'desconto_periodo_pct' => $calc['desconto_periodo_pct'],
            'subtotal_kz' => $calc['subtotal_kz'],
            'imposto_tipo' => $calc['imposto_tipo'],
            'imposto_taxa_pct' => $calc['imposto_taxa_pct'],
            'imposto_valor_kz' => $calc['imposto_valor_kz'],
            'valor_total_kz' => $calc['total_kz'],
            'breakdown_json' => json_encode($calc),
            'estado' => 'pendente',
            'data_emissao' => $agora,
            'data_vencimento' => $vencimento,
            'created_at' => $agora,
            'updated_at' => $agora,
        ]);

        // Marcar alterações de imóveis como aplicadas nesta factura
        if (!empty($proRataIds)) {
            DB::table('plataforma_alteracoes_imoveis')
                ->whereIn('id', $proRataIds)
                ->update([
                    'factura_id' => $facturaId,
                    'updated_at' => $agora,
                ]);
        }

        // Audit trail
        DB::table('plataforma_subscricao_eventos')->insert([
            'subscricao_id' => $subscricao->id,
            'tipo' => 'factura_emitida',
            'descricao' => "Factura {$numero} emitida: " . number_format($calc['total_kz'], 2) . ' Kz',
            'meta_json' => json_encode([
                'factura_id' => $facturaId,
                'numero' => $numero,
                'valor_total_kz' => $calc['total_kz'],
                'periodicidade' => $periodicidade,
            ]),
            'user_id' => null,
            'created_at' => $agora,
        ]);

        Log::info("Factura plataforma emitida: {$numero} para subscrição {$subscricao->id}");

        // Empurra a factura para o ERP Welwitschia (venda). Em fila e resiliente.
        \App\Domains\Integracao\Welwitschia\FacturaWelwitschiaSync::sincronizar((int) $facturaId);

        // Notificação Email + SMS para o admin-empresa
        try {
            $empresa = \App\Domains\Empresa\Models\EmpresaGestora::find($subscricao->empresa_gestora_id);
            $user = \App\Models\User::where('empresa_gestora_id', $subscricao->empresa_gestora_id)
                ->whereHas('roles', fn($q) => $q->where('name', 'admin-empresa'))
                ->first();
            if ($empresa && $user) {
                app(\App\Domains\Subscription\Services\NotificacaoB2BService::class)
                    ->facturaEmitida($user, [
                        'id' => $facturaId,
                        'numero' => $numero,
                        'valor_total_kz' => $calc['total_kz'],
                    ], $empresa);
            }
        } catch (\Throwable $e) {
            Log::error('Notificacao factura emitida falhou: '.$e->getMessage());
        }

        return [
            'id' => $facturaId,
            'numero' => $numero,
            'valor_total_kz' => $calc['total_kz'],
            'data_vencimento' => $vencimento->toIso8601String(),
        ];
    }

    /**
     * Gera o próximo número de factura para o ano dado.
     * Formato: PLAT/{YEAR}/{SEQ:5}  ex: PLAT/2026/00001
     */
    private function gerarNumero(int $ano): string
    {
        $prefix = "PLAT/{$ano}/";

        $ultima = DB::table('plataforma_facturas')
            ->where('numero', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->value('numero');

        $seq = 1;
        if ($ultima) {
            $partes = explode('/', $ultima);
            $seq = ((int) end($partes)) + 1;
        }

        return $prefix . str_pad((string) $seq, 5, '0', STR_PAD_LEFT);
    }
}
