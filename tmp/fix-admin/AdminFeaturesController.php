<?php

declare(strict_types=1);

namespace App\Domains\Feature\Http\Controllers;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Feature\Models\Feature;
use App\Domains\Feature\Models\FeaturePacote;
use App\Domains\Feature\Models\FeatureSubscription;
use App\Domains\Feature\Models\FeatureUsage;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminFeaturesController extends Controller
{
    /**
     * Listagem de todas as FeatureSubscriptions.
     */
    public function index(Request $request): Response
    {
        $query = FeatureSubscription::with(['feature', 'owner'])
            ->orderByDesc('id');

        // Filtros
        if ($estado = $request->input('estado')) {
            $query->where('estado', $estado);
        }

        if ($featureSlug = $request->input('feature')) {
            $feature = Feature::where('slug', $featureSlug)->first();
            if ($feature) {
                $query->where('feature_id', $feature->id);
            }
        }

        if ($tipo = $request->input('tipo_owner')) {
            $class = $tipo === 'empresa' ? EmpresaGestora::class : Condominio::class;
            $query->where('owner_type', $class);
        }

        $subscriptions = $query->paginate(20)->withQueryString();

        // Mapear cada linha
        $subscriptions->getCollection()->transform(fn (FeatureSubscription $s) => [
            'id' => $s->id,
            'estado' => $s->estado,
            'estado_label' => $s->estado_label,
            'feature' => [
                'slug' => $s->feature?->slug,
                'nome' => $s->feature?->nome,
                'categoria_label' => $s->feature?->categoria_label,
                'modelo_cobranca' => $s->feature?->modelo_cobranca,
                'unidade' => $s->feature?->unidade,
            ],
            'owner' => [
                'tipo' => $s->owner_type === EmpresaGestora::class ? 'empresa' : 'condominio',
                'id' => $s->owner_id,
                'nome' => $s->owner?->nome ?? '—',
            ],
            'saldo_actual' => $s->saldo_actual,
            'saldo_inicial' => $s->saldo_inicial,
            'saldo_utilizado' => $s->saldo_utilizado,
            'activada_em' => $s->activada_em?->toIso8601String(),
            'expira_em' => $s->expira_em?->toIso8601String(),
            'valor_pago_total' => (float) $s->valor_pago_total,
            'esta_activa' => $s->estaActiva(),
            'saldo_baixo' => $s->saldoBaixo(),
            'recarga_automatica' => $s->recarga_automatica,
            'renovacao_automatica' => $s->renovacao_automatica,
        ]);

        // Contadores globais
        $contadores = [
            'total' => FeatureSubscription::count(),
            'activa' => FeatureSubscription::where('estado', 'activa')->count(),
            'pendente' => FeatureSubscription::where('estado', 'pendente')->count(),
            'suspensa' => FeatureSubscription::where('estado', 'suspensa')->count(),
            'expirada' => FeatureSubscription::where('estado', 'expirada')->count(),
            'cancelada' => FeatureSubscription::where('estado', 'cancelada')->count(),
            'saldo_baixo' => FeatureSubscription::with('feature')
                ->where('estado', 'activa')
                ->get()
                ->filter(fn ($s) => $s->saldoBaixo())
                ->count(),
        ];

        // Features para filtro
        $featuresDropdown = Feature::orderBy('nome')->get(['slug', 'nome']);

        return Inertia::render('Admin/Features/Index', [
            'subscriptions' => $subscriptions,
            'contadores' => $contadores,
            'features_dropdown' => $featuresDropdown,
            'filtros' => [
                'estado' => $request->input('estado'),
                'feature' => $request->input('feature'),
                'tipo_owner' => $request->input('tipo_owner'),
            ],
        ]);
    }

    /**
     * Detalhe de uma subscription.
     */
    public function show(FeatureSubscription $subscription): Response
    {
        $subscription->load(['feature.pacotes', 'owner', 'activadaPor', 'recargaPacote']);

        // Histórico de consumo (últimas 50)
        $usages = FeatureUsage::where('subscription_id', $subscription->id)
            ->with('user')
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(fn (FeatureUsage $u) => [
                'id' => $u->id,
                'quantidade' => $u->quantidade,
                'acao' => $u->acao,
                'descricao' => $u->descricao,
                'saldo_depois' => $u->saldo_depois,
                'user_nome' => $u->user?->name,
                'created_at' => $u->created_at?->toIso8601String(),
            ]);

        // Agregar consumo por dia (últimos 30 dias)
        $consumoDiario = FeatureUsage::where('subscription_id', $subscription->id)
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as dia, SUM(quantidade) as total')
            ->groupBy('dia')
            ->orderBy('dia')
            ->get()
            ->map(fn ($r) => [
                'dia' => $r->dia,
                'total' => (int) $r->total,
            ]);

        return Inertia::render('Admin/Features/Show', [
            'subscription' => [
                'id' => $subscription->id,
                'estado' => $subscription->estado,
                'estado_label' => $subscription->estado_label,
                'feature' => [
                    'id' => $subscription->feature->id,
                    'slug' => $subscription->feature->slug,
                    'nome' => $subscription->feature->nome,
                    'categoria_label' => $subscription->feature->categoria_label,
                    'modelo_cobranca' => $subscription->feature->modelo_cobranca,
                    'modelo_cobranca_label' => $subscription->feature->modelo_cobranca_label,
                    'unidade' => $subscription->feature->unidade,
                    'pacotes' => $subscription->feature->pacotes->map(fn ($p) => [
                        'id' => $p->id,
                        'slug' => $p->slug,
                        'nome' => $p->nome,
                        'quantidade' => $p->quantidade,
                        'preco' => (float) $p->preco,
                    ])->values(),
                ],
                'owner' => [
                    'tipo' => $subscription->owner_type === EmpresaGestora::class ? 'empresa' : 'condominio',
                    'id' => $subscription->owner_id,
                    'nome' => $subscription->owner?->nome ?? '—',
                    'nif' => $subscription->owner?->nif ?? null,
                ],
                'saldo_actual' => $subscription->saldo_actual,
                'saldo_inicial' => $subscription->saldo_inicial,
                'saldo_utilizado' => $subscription->saldo_utilizado,
                'activada_em' => $subscription->activada_em?->toIso8601String(),
                'expira_em' => $subscription->expira_em?->toIso8601String(),
                'cancelada_em' => $subscription->cancelada_em?->toIso8601String(),
                'valor_pago_total' => (float) $subscription->valor_pago_total,
                'configuracao' => $subscription->configuracao,
                'notas_admin' => $subscription->notas_admin,
                'renovacao_automatica' => $subscription->renovacao_automatica,
                'recarga_automatica' => $subscription->recarga_automatica,
                'activada_por_nome' => $subscription->activadaPor?->name,
                'esta_activa' => $subscription->estaActiva(),
                'saldo_baixo' => $subscription->saldoBaixo(),
            ],
            'usages' => $usages,
            'consumo_diario' => $consumoDiario,
        ]);
    }

    /**
     * Formulário para activar feature manualmente.
     */
    public function create(Request $request): Response
    {
        $features = Feature::where('activa', true)
            ->with('pacotes')
            ->orderBy('ordem_listagem')
            ->get()
            ->map(fn (Feature $f) => [
                'id' => $f->id,
                'slug' => $f->slug,
                'nome' => $f->nome,
                'categoria_label' => $f->categoria_label,
                'comprador' => $f->comprador,
                'modelo_cobranca' => $f->modelo_cobranca,
                'modelo_cobranca_label' => $f->modelo_cobranca_label,
                'unidade' => $f->unidade,
                'preco_base' => $f->preco_base ? (float) $f->preco_base : null,
                'preco_activacao' => (float) $f->preco_activacao,
                'em_breve' => $f->em_breve,
                'pacotes' => $f->pacotes->map(fn ($p) => [
                    'id' => $p->id,
                    'slug' => $p->slug,
                    'nome' => $p->nome,
                    'quantidade' => $p->quantidade,
                    'preco' => (float) $p->preco,
                ])->values(),
            ]);

        $empresas = EmpresaGestora::orderBy('nome')
            ->get(['id', 'nome', 'slug', 'nif']);

        // Condomínios: fazer join manual com empresa_gestora (Condominio não tem slug nem relação directa)
        $condominios = Condominio::query()
            ->leftJoin('empresas_gestoras', 'condominios.empresa_gestora_id', '=', 'empresas_gestoras.id')
            ->orderBy('condominios.nome')
            ->get([
                'condominios.id',
                'condominios.nome',
                'condominios.codigo',
                'condominios.empresa_gestora_id',
                'empresas_gestoras.nome as empresa_gestora_nome',
            ]);

        return Inertia::render('Admin/Features/Nova', [
            'features' => $features,
            'empresas' => $empresas,
            'condominios' => $condominios->map(fn ($c) => [
                'id' => $c->id,
                'nome' => $c->nome,
                'slug' => $c->codigo, // usa codigo como identificador público
                'empresa_gestora_nome' => $c->empresa_gestora_nome,
            ]),
        ]);
    }

    /**
     * Activar feature (chamado pelo form).
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'tipo_owner' => 'required|in:empresa,condominio',
            'owner_id' => 'required|integer',
            'feature_id' => 'required|exists:features,id',
            'pacote_id' => 'nullable|exists:feature_pacotes,id',
            'quantidade' => 'nullable|integer|min:1',
            'meses' => 'nullable|integer|min:1|max:36',
            'notas' => 'nullable|string|max:500',
        ]);

        $class = $data['tipo_owner'] === 'empresa' ? EmpresaGestora::class : Condominio::class;
        $owner = $class::find($data['owner_id']);

        if (! $owner) {
            return back()->withErrors(['owner_id' => 'Owner não encontrado.']);
        }

        $feature = Feature::find($data['feature_id']);

        // Verificar duplicado para não-consumíveis
        $existente = FeatureSubscription::where('feature_id', $feature->id)
            ->where('owner_type', $class)
            ->where('owner_id', $owner->id)
            ->whereIn('estado', ['activa', 'pendente'])
            ->first();

        if ($existente && ! $feature->ehConsumivel()) {
            return back()->withErrors([
                'feature_id' => "Este owner já tem esta feature activa (subscrição ID {$existente->id}).",
            ]);
        }

        DB::beginTransaction();
        try {
            $sub = match ($feature->modelo_cobranca) {
                'consumable' => $this->activarConsumivel($owner, $feature, $data, $existente),
                'subscription' => $this->activarSubscricao($owner, $feature, $data),
                'one_time' => $this->activarUnica($owner, $feature, $data),
            };

            DB::commit();

            return redirect()
                ->route('admin.features.show', $sub->id)
                ->with('success', "Feature '{$feature->nome}' activada para {$owner->nome}.");
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['feature_id' => 'Erro: ' . $e->getMessage()]);
        }
    }

    /**
     * Suspender feature.
     */
    public function suspender(FeatureSubscription $subscription): RedirectResponse
    {
        $subscription->suspender();
        return back()->with('success', 'Feature suspensa.');
    }

    /**
     * Reactivar feature (volta de suspensa a activa).
     */
    public function reactivar(FeatureSubscription $subscription): RedirectResponse
    {
        if (! in_array($subscription->estado, ['suspensa', 'cancelada', 'expirada'])) {
            return back()->withErrors(['estado' => 'Apenas suspensas/canceladas/expiradas podem ser reactivadas.']);
        }

        $subscription->update([
            'estado' => 'activa',
            'cancelada_em' => null,
        ]);

        return back()->with('success', 'Feature reactivada.');
    }

    /**
     * Cancelar feature (soft — mantém registo).
     */
    public function cancelar(FeatureSubscription $subscription): RedirectResponse
    {
        $subscription->cancelar();
        return back()->with('success', 'Feature cancelada.');
    }

    /**
     * Adicionar saldo manualmente (para consumíveis).
     */
    public function adicionarSaldo(Request $request, FeatureSubscription $subscription): RedirectResponse
    {
        if (! $subscription->feature?->ehConsumivel()) {
            return back()->withErrors(['saldo' => 'Apenas consumíveis podem receber saldo.']);
        }

        $data = $request->validate([
            'quantidade' => 'required|integer|min:1',
            'valor_pago' => 'nullable|numeric|min:0',
            'notas' => 'nullable|string|max:500',
        ]);

        $subscription->adicionarSaldo(
            (int) $data['quantidade'],
            (float) ($data['valor_pago'] ?? 0),
        );

        if (! empty($data['notas'])) {
            $subscription->update([
                'notas_admin' => trim(($subscription->notas_admin ?? '') . "\n[" . now()->format('d/m/Y H:i') . "] " . $data['notas']),
            ]);
        }

        return back()->with('success', "{$data['quantidade']} unidades adicionadas. Novo saldo: {$subscription->fresh()->saldo_actual}.");
    }

    /* =======================================================
       MÉTODOS AUXILIARES (activação)
       ======================================================= */

    private function activarConsumivel($owner, Feature $feature, array $data, ?FeatureSubscription $existente): FeatureSubscription
    {
        $quantidade = 0;
        $valorPago = 0.0;

        if (! empty($data['quantidade'])) {
            $quantidade = (int) $data['quantidade'];
        } elseif (! empty($data['pacote_id'])) {
            $pacote = FeaturePacote::find($data['pacote_id']);
            $quantidade = (int) $pacote->quantidade;
            $valorPago = (float) $pacote->preco;
        }

        if ($existente) {
            $existente->adicionarSaldo($quantidade, $valorPago);
            if (! empty($data['notas'])) {
                $existente->update(['notas_admin' => $data['notas']]);
            }
            return $existente;
        }

        return FeatureSubscription::create([
            'feature_id' => $feature->id,
            'owner_type' => get_class($owner),
            'owner_id' => $owner->id,
            'estado' => 'activa',
            'activada_em' => now(),
            'saldo_inicial' => $quantidade,
            'saldo_actual' => $quantidade,
            'saldo_utilizado' => 0,
            'valor_pago_total' => $valorPago,
            'activada_por_user_id' => auth()->id(),
            'notas_admin' => $data['notas'] ?? null,
        ]);
    }

    private function activarSubscricao($owner, Feature $feature, array $data): FeatureSubscription
    {
        $meses = (int) ($data['meses'] ?? 1);
        $valor = (float) $feature->preco_base * $meses + (float) $feature->preco_activacao;

        return FeatureSubscription::create([
            'feature_id' => $feature->id,
            'owner_type' => get_class($owner),
            'owner_id' => $owner->id,
            'estado' => 'activa',
            'activada_em' => now(),
            'expira_em' => now()->addMonths($meses),
            'renovacao_automatica' => true,
            'valor_pago_total' => $valor,
            'activada_por_user_id' => auth()->id(),
            'notas_admin' => $data['notas'] ?? null,
        ]);
    }

    private function activarUnica($owner, Feature $feature, array $data): FeatureSubscription
    {
        $valor = (float) $feature->preco_base + (float) $feature->preco_activacao;

        return FeatureSubscription::create([
            'feature_id' => $feature->id,
            'owner_type' => get_class($owner),
            'owner_id' => $owner->id,
            'estado' => 'activa',
            'activada_em' => now(),
            'valor_pago_total' => $valor,
            'activada_por_user_id' => auth()->id(),
            'notas_admin' => $data['notas'] ?? null,
        ]);
    }
}
