<?php

declare(strict_types=1);

namespace App\Domains\Bi\Http\Controllers\Api;

use App\Domains\Bi\Services\CobrancaService;
use App\Domains\Bi\Services\DespesasService;
use App\Domains\Bi\Services\ReceitasDespesasService;
use App\Domains\Bi\Services\SaudeFinanceiraService;
use App\Domains\Condominio\Models\Condominio;
use App\Domains\Familiar\Support\CondominoResolver;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Relatório financeiro de TRANSPARÊNCIA do condomínio, dirigido ao CONDÓMINO.
 * Mostra apenas AGREGADOS do condomínio (receitas/despesas, fundo de reserva,
 * cobrança global, despesas por categoria) — NUNCA a lista de devedores com
 * nomes (isso é exclusivo do gestor no BI). Reutiliza os serviços do BI.
 *
 * GET /api/condomino/relatorio-financeiro?meses=12
 */
class RelatorioCondominoController extends Controller
{
    public function financeiro(Request $request): JsonResponse
    {
        $condomino = CondominoResolver::paraUser($request->user());
        if (! $condomino) {
            return response()->json(['ok' => false, 'erro' => 'Condómino não encontrado.'], 404);
        }

        $contrato = $condomino->contratosActivos()->with('fraccao:id,condominio_id')->first();
        $condominioId = $contrato?->fraccao?->condominio_id;
        if (! $condominioId) {
            return response()->json(['ok' => false, 'erro' => 'Sem imóvel activo.'], 404);
        }

        // Toggle do gestor: publicar/ocultar a transparência (default: publicado).
        $config = \App\Domains\Facturacao\Models\CondominioFacturacaoConfig::where('condominio_id', $condominioId)->first();
        $publicado = $config === null ? true : ($config->transparencia_financeira === null ? true : (bool) $config->transparencia_financeira);
        if (! $publicado) {
            return response()->json([
                'ok' => true,
                'publicado' => false,
                'mensagem' => 'A gestão ainda não publicou a transparência financeira deste condomínio.',
            ]);
        }

        $condominio = Condominio::find($condominioId);
        $empresaId = (int) ($condominio?->empresa_gestora_id ?? $condomino->empresa_gestora_id);
        $meses = (int) $request->integer('meses', 12);
        if (! in_array($meses, [3, 6, 12, 24], true)) {
            $meses = 12;
        }

        $receitas = (new ReceitasDespesasService())->calcular($empresaId, (int) $condominioId, $meses);
        $cobranca = (new CobrancaService())->calcular($empresaId, (int) $condominioId);
        $despesas = (new DespesasService())->calcular($empresaId, (int) $condominioId, $meses);
        $saude = (new SaudeFinanceiraService())->calcular($empresaId, (int) $condominioId);

        return response()->json([
            'ok' => true,
            'publicado' => true,
            'condominio' => $condominio?->nome,
            'meses' => $meses,
            'gerado_em' => now()->toIso8601String(),
            // Receitas vs despesas do condomínio (agregado).
            'financeiro' => [
                'receita' => (float) $receitas['totais']['receita'],
                'despesa' => (float) $receitas['totais']['despesa'],
                'saldo' => (float) $receitas['totais']['saldo'],
            ],
            // Cobrança GLOBAL — sem nomes de devedores.
            'cobranca' => [
                'taxa_cobranca' => $cobranca['taxa_cobranca'],
                'divida_total' => (float) $cobranca['divida_total'],
            ],
            // Fundo de reserva (conformidade DP 141/15).
            'fundo_reserva' => [
                'pct' => $saude['fundo_reserva']['pct'],
                'min_legal' => $saude['fundo_reserva']['min_legal'],
                'cumpre' => (bool) $saude['fundo_reserva']['cumpre'],
            ],
            'liquidez' => [
                'saldo_disponivel' => (float) $saude['liquidez']['saldo_disponivel'],
                'divida_aberto' => (float) $saude['liquidez']['divida_aberto'],
            ],
            // Transparência: para onde vai o dinheiro.
            'despesas_por_categoria' => collect($despesas['por_categoria'] ?? [])
                ->map(fn ($c) => ['categoria' => $c['categoria'], 'total' => (float) $c['total']])
                ->values(),
            'despesas_total' => (float) ($despesas['total'] ?? 0),
        ]);
    }
}
