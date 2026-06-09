<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Landing page pública de ondaka.ao.
 * Sem autenticação. Lê pricing dinamicamente da BD para reflectir
 * configuração actual do super-admin.
 */
class LandingController extends Controller
{
    public function index(): Response
    {
        // Condominios cadastrados (so os que tem fraccoes), para mostrar na landing
        $condominios = \App\Domains\Condominio\Models\Condominio::query()
            ->withCount('fraccoes')
            ->get()
            ->filter(fn ($c) => $c->fraccoes_count > 0)
            ->map(function ($c) {
                $nCondominos = \App\Domains\Condomino\Models\ContratoOcupacao::whereHas('fraccao', fn ($q) => $q->where('condominio_id', $c->id))
                    ->distinct('condomino_id')
                    ->count('condomino_id');
                return [
                    'nome' => $c->nome,
                    'municipio' => $c->municipio,
                    'provincia' => $c->provincia,
                    'num_condominos' => $nCondominos,
                    'num_fraccoes' => $c->fraccoes_count,
                ];
            })
            ->values();

        return Inertia::render('Landing/Index', [
            'pricing' => $this->obterPricing(),
            'condominios' => $condominios,
            'totais' => [
                'condominios' => $condominios->count(),
                'condominos' => $condominios->sum('num_condominos'),
            ],
        ]);
    }

    /**
     * Devolve pricing dinâmico para os 3 períodos a partir da BD.
     */
    private function obterPricing(): array
    {
        // Configurações globais
        $config = DB::table('plataforma_config')
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

        $precoBase = (float) ($config['preco_base_imovel_mes'] ?? 1350);
        $descMensal = (float) ($config['desconto_periodo_mensal_pct'] ?? 0);
        $descSemestral = (float) ($config['desconto_periodo_semestral_pct'] ?? 5);
        $descAnual = (float) ($config['desconto_periodo_anual_pct'] ?? 10);
        $trialDias = (int) ($config['trial_duracao_dias'] ?? 30);
        $impostoAplicavel = (bool) ($config['imposto_aplicavel'] ?? false);
        $impostoTipo = (string) ($config['imposto_tipo'] ?? 'IVA');
        $impostoTaxa = (float) ($config['imposto_taxa_pct'] ?? 0);

        // Escalões activos
        $escaloes = DB::table('escaloes_core')
            ->where('activo', true)
            ->orderBy('ordem', 'asc')
            ->get();

        $escaloesArray = $escaloes->map(function ($e) use ($precoBase, $descMensal, $descSemestral, $descAnual) {
            $descontoQtd = (float) ($e->desconto_pct ?? 0);
            // Preço unitário aplicado
            $precoUnitMensal = round($precoBase * (1 - $descontoQtd / 100) * (1 - $descMensal / 100), 2);
            $precoUnitSemestral = round($precoBase * (1 - $descontoQtd / 100) * (1 - $descSemestral / 100), 2);
            $precoUnitAnual = round($precoBase * (1 - $descontoQtd / 100) * (1 - $descAnual / 100), 2);

            return [
                'nome' => $e->nome,
                'slug' => $e->slug,
                'descricao' => $e->descricao,
                'imoveis_min' => (int) $e->min_fraccoes,
                'imoveis_max' => $e->max_fraccoes !== null ? (int) $e->max_fraccoes : null,
                'desconto_qtd_pct' => $descontoQtd,
                'preco_unit_mensal_kz' => $precoUnitMensal,
                'preco_unit_semestral_kz' => $precoUnitSemestral,
                'preco_unit_anual_kz' => $precoUnitAnual,
                'cor_badge' => $e->cor_badge,
                'destaque' => str_contains(strtolower($e->nome), 'prata'), // PRATA é o popular
            ];
        })->toArray();

        return [
            'escaloes' => $escaloesArray,
            'config' => [
                'preco_base_kz' => $precoBase,
                'desconto_mensal_pct' => $descMensal,
                'desconto_semestral_pct' => $descSemestral,
                'desconto_anual_pct' => $descAnual,
                'trial_dias' => $trialDias,
                'imposto_aplicavel' => $impostoAplicavel,
                'imposto_tipo' => $impostoTipo,
                'imposto_taxa_pct' => $impostoTaxa,
            ],
        ];
    }
}
