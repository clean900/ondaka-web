<?php

declare(strict_types=1);

namespace App\Domains\Feature\Http\Controllers;

use App\Domains\Feature\Models\Feature;
use App\Domains\Feature\Models\FeatureSubscription;
use App\Domains\Feature\Services\FeatureGate;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FuncionalidadesController extends Controller
{
    /**
     * Loja: catálogo completo de add-ons agrupado por categoria.
     */
    public function index(Request $request): Response
    {
        $empresa = app('empresa_gestora_actual');

        // Catálogo completo (activas ou em breve)
        $features = Feature::query()
            ->where('activa', true)
            ->orderBy('ordem_listagem')
            ->get()
            ->map(fn (Feature $f) => $this->formatarFeature($f, $empresa));

        // Agrupar por categoria para display
        $porCategoria = $features->groupBy('categoria')->map(fn ($items, $cat) => [
            'slug' => $cat,
            'nome' => $this->categoriaLabel($cat),
            'features' => $items->values(),
        ])->values();

        // Contadores
        $totais = [
            'total' => $features->count(),
            'disponivel' => $features->where('em_breve', false)->count(),
            'em_breve' => $features->where('em_breve', true)->count(),
            'activas_empresa' => $features->where('activa_para_empresa', true)->count(),
        ];

        return Inertia::render('Funcionalidades/Index', [
            'categorias' => $porCategoria,
            'totais' => $totais,
        ]);
    }

    /**
     * Detalhe de uma feature.
     */
    public function show(string $slug): Response
    {
        $empresa = app('empresa_gestora_actual');

        $feature = Feature::where('slug', $slug)
            ->with('pacotes')
            ->firstOrFail();

        $subscription = FeatureGate::getSubscription($empresa, $slug);

        $template = $feature->comercial_json ? 'Funcionalidades/ShowComercial' : 'Funcionalidades/Show';

        return Inertia::render($template, [
            'feature' => [
                'id' => $feature->id,
                'slug' => $feature->slug,
                'nome' => $feature->nome,
                'descricao' => $feature->descricao,
                'icone' => $feature->icone,
                'categoria' => $feature->categoria,
                'categoria_label' => $feature->categoria_label,
                'comprador' => $feature->comprador,
                'comprador_label' => $feature->comprador_label,
                'modelo_cobranca' => $feature->modelo_cobranca,
                'modelo_cobranca_label' => $feature->modelo_cobranca_label,
                'unidade' => $feature->unidade,
                'preco_base' => $feature->preco_base,
                'preco_activacao' => $feature->preco_activacao,
                'duracao_dias' => $feature->duracao_dias,
                'configuracao_schema' => $feature->configuracao_schema,
                'em_breve' => $feature->em_breve,
                'requer_aprovacao_manual' => $feature->requer_aprovacao_manual,
                'comercial' => $feature->comercial_json ? json_decode($feature->comercial_json, true) : null,
                'requer_hardware' => $feature->requer_hardware,
                'pacotes' => $feature->pacotes->map(fn ($p) => [
                    'id' => $p->id,
                    'slug' => $p->slug,
                    'nome' => $p->nome,
                    'quantidade' => $p->quantidade,
                    'preco' => (float) $p->preco,
                    'preco_formatado' => $p->preco_formatado,
                    'valor_unitario' => (float) $p->valor_unitario,
                    'destaque' => $p->destaque,
                    'descricao' => $p->descricao,
                ])->values(),
            ],
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'estado' => $subscription->estado,
                'estado_label' => $subscription->estado_label,
                'saldo_actual' => $subscription->saldo_actual,
                'saldo_inicial' => $subscription->saldo_inicial,
                'saldo_utilizado' => $subscription->saldo_utilizado,
                'activada_em' => $subscription->activada_em?->toIso8601String(),
                'expira_em' => $subscription->expira_em?->toIso8601String(),
                'esta_activa' => $subscription->estaActiva(),
                'saldo_baixo' => $subscription->saldoBaixo(),
                'configuracao' => $subscription->configuracao,
                'renovacao_automatica' => $subscription->renovacao_automatica,
                'recarga_automatica' => $subscription->recarga_automatica,
            ] : null,
        ]);
    }

    /**
     * As minhas funcionalidades (activas).
     */
    public function minhas(Request $request): Response
    {
        $empresa = app('empresa_gestora_actual');

        if (! $empresa) {
            return Inertia::render('Funcionalidades/Minhas', [
                'features_activas' => [],
                'totais' => ['activas' => 0, 'saldo_baixo' => 0, 'expiram_breve' => 0],
            ]);
        }

        $subs = FeatureSubscription::with('feature')
            ->where('owner_type', get_class($empresa))
            ->where('owner_id', $empresa->getKey())
            ->whereIn('estado', ['activa', 'pendente', 'expirada', 'esgotada'])
            ->orderBy('estado')
            ->orderByDesc('activada_em')
            ->get();

        $mapeadas = $subs->map(fn (FeatureSubscription $s) => [
            'id' => $s->id,
            'slug' => $s->feature?->slug,
            'nome' => $s->feature?->nome,
            'icone' => $s->feature?->icone,
            'categoria' => $s->feature?->categoria,
            'categoria_label' => $s->feature?->categoria_label,
            'modelo_cobranca' => $s->feature?->modelo_cobranca,
            'unidade' => $s->feature?->unidade,
            'estado' => $s->estado,
            'estado_label' => $s->estado_label,
            'saldo_actual' => $s->saldo_actual,
            'saldo_inicial' => $s->saldo_inicial,
            'saldo_utilizado' => $s->saldo_utilizado,
            'percentagem_usada' => $s->saldo_inicial > 0
                ? (int) round(($s->saldo_utilizado / $s->saldo_inicial) * 100)
                : 0,
            'activada_em' => $s->activada_em?->toIso8601String(),
            'expira_em' => $s->expira_em?->toIso8601String(),
            'esta_activa' => $s->estaActiva(),
            'saldo_baixo' => $s->saldoBaixo(),
            'renovacao_automatica' => $s->renovacao_automatica,
            'recarga_automatica' => $s->recarga_automatica,
        ]);

        $activas = $mapeadas->where('esta_activa', true);
        $saldoBaixo = $mapeadas->where('saldo_baixo', true)->where('esta_activa', true);
        $expiramBreve = $mapeadas
            ->where('expira_em', '!=', null)
            ->filter(function ($f) {
                if (! $f['expira_em']) return false;
                return \Carbon\Carbon::parse($f['expira_em'])->diffInDays(now(), false) > -7;
            });

        return Inertia::render('Funcionalidades/Minhas', [
            'features' => $mapeadas->values(),
            'totais' => [
                'activas' => $activas->count(),
                'saldo_baixo' => $saldoBaixo->count(),
                'expiram_breve' => $expiramBreve->count(),
                'total' => $mapeadas->count(),
            ],
        ]);
    }
    /**
     * Inicia trial de 7 dias da feature {slug} para a empresa actual.
     * POST /funcionalidades/{slug}/trial
     */
    public function iniciarTrial(string $slug, \App\Domains\Feature\Services\TrialService $service)
    {
        $feature = Feature::where('slug', $slug)->where('activa', true)->firstOrFail();
        $empresa = app('empresa_gestora_actual');
        if (! $empresa) {
            return back()->with('error', 'Empresa não identificada.');
        }
        try {
            $sub = $service->iniciar($empresa, $feature, auth()->id());
            return redirect()
                ->route('funcionalidades.show', $slug)
                ->with('success', "Trial de 7 dias activado! Expira em " . $sub->expira_em->format('d/m/Y'));
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Solicita activação de um add-on pago.
     * Cria OrdemCompra + referência ProxyPay e redireciona o cliente
     * para a página da ordem onde pode ver entidade/referência/valor.
     */
    public function solicitarActivacao(
        string $slug,
        \App\Domains\Payment\Services\OrderService $orderService,
        \App\Domains\Payment\Services\ProxyPayService $proxyPayService
    ) {
        $feature = Feature::where('slug', $slug)->where('activa', true)->firstOrFail();
        $empresa = app('empresa_gestora_actual');
        if (! $empresa) {
            return back()->with('error', 'Empresa não identificada.');
        }

        $jaTem = FeatureSubscription::query()
            ->where('feature_id', $feature->id)
            ->where('owner_type', get_class($empresa))
            ->where('owner_id', $empresa->id)
            ->where('estado', 'activa')
            ->exists();

        if ($jaTem) {
            return back()->with('error', 'Esta funcionalidade já está activa.');
        }

        try {
            $pacote = $feature->pacotes()->first();
            if (! $pacote) {
                return back()->with('error', 'Esta funcionalidade não tem pacote configurado.');
            }
            $ordem = $orderService->criarOrdemPacote($empresa, $pacote, auth()->id());
            $proxyPayService->criarReferenciaParaOrdem($ordem);

            return redirect()->route('ordens.show', $ordem);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Erro ao criar ordem de activação', [
                'slug' => $slug,
                'empresa_id' => $empresa->id,
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'Erro ao iniciar activação: '.$e->getMessage());
        }
    }

    /* ============================================
       HELPERS
       ============================================ */

    private function formatarFeature(Feature $f, $empresa): array
    {
        // Verificar se empresa tem esta feature activa
        $activa = $empresa ? FeatureGate::has($empresa, $f->slug) : false;

        $saldo = null;
        if ($activa && $f->ehConsumivel()) {
            $saldo = FeatureGate::balance($empresa, $f->slug);
        }

        return [
            'slug' => $f->slug,
            'nome' => $f->nome,
            'descricao' => $f->descricao,
            'icone' => $f->icone,
            'categoria' => $f->categoria,
            'categoria_label' => $f->categoria_label,
            'comprador' => $f->comprador,
            'comprador_label' => $f->comprador_label,
            'modelo_cobranca' => $f->modelo_cobranca,
            'modelo_cobranca_label' => $f->modelo_cobranca_label,
            'unidade' => $f->unidade,
            'preco_base' => $f->preco_base ? (float) $f->preco_base : null,
            'preco_activacao' => (float) $f->preco_activacao,
            'em_breve' => $f->em_breve,
            'requer_hardware' => $f->requer_hardware,
            'ordem_listagem' => $f->ordem_listagem,
            'activa_para_empresa' => $activa,
            'saldo_actual' => $saldo,
        ];
    }

    private function categoriaLabel(string $cat): string
    {
        return match ($cat) {
            'comunicacao' => 'Comunicação',
            'pagamentos' => 'Pagamentos',
            'seguranca' => 'Segurança',
            'gestao' => 'Gestão avançada',
            'personalizacao' => 'Personalização',
            default => 'Outros',
        };
    }
}
