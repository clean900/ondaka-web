<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Http\Controllers;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Subscription\Models\Subscricao;
use App\Domains\Subscription\Services\SubscriptionService;
use App\Domains\Subscription\Services\TrialService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubscricoesController extends Controller
{
    public function __construct(
        protected SubscriptionService $subscriptionService,
        protected TrialService $trialService,
    ) {}

    /**
     * Listar todas as subscrições (super-admin).
     */
    public function index(Request $request): Response
    {
        $filtro = $request->input('estado');

        $query = Subscricao::with('empresa')
            ->orderBy('updated_at', 'desc');

        if ($filtro) {
            $query->where('estado', $filtro);
        }

        $subscricoes = $query->paginate(20)->through(fn ($s) => [
            'id' => $s->id,
            'empresa' => [
                'id' => $s->empresa?->id,
                'nome' => $s->empresa?->nome,
                'slug' => $s->empresa?->slug,
                'nif' => $s->empresa?->nif,
            ],
            'estado' => $s->estado,
            'estado_label' => $s->estado_label,
            'ciclo' => $s->ciclo,
            'ciclo_label' => $s->ciclo_label,
            'trial_expira_em' => $s->trial_expira_em?->toIso8601String(),
            'grace_expira_em' => $s->grace_expira_em?->toIso8601String(),
            'periodo_actual_fim' => $s->periodo_actual_fim?->toIso8601String(),
            'dias_restantes_trial' => $s->diasRestantesTrial(),
            'dias_restantes_grace' => $s->diasRestantesGrace(),
            'renovacao_automatica' => $s->renovacao_automatica,
            'preco_customizado_por_fraccao' => $s->preco_customizado_por_fraccao,
            'updated_at' => $s->updated_at->toIso8601String(),
        ]);

        // Contadores por estado
        $contadores = Subscricao::selectRaw('estado, COUNT(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado')
            ->toArray();

        return Inertia::render('Admin/Subscricoes/Index', [
            'subscricoes' => $subscricoes,
            'filtro_estado' => $filtro,
            'contadores' => [
                'total' => array_sum($contadores),
                'trial' => $contadores['trial'] ?? 0,
                'grace' => $contadores['grace'] ?? 0,
                'activa' => $contadores['activa'] ?? 0,
                'em_atraso' => $contadores['em_atraso'] ?? 0,
                'suspensa' => $contadores['suspensa'] ?? 0,
                'cancelada' => $contadores['cancelada'] ?? 0,
            ],
        ]);
    }

    /**
     * Detalhe de uma subscrição.
     */
    public function show(Subscricao $subscricao): Response
    {
        $subscricao->load('empresa', 'periodos');

        $empresa = $subscricao->empresa;
        $mensal = $empresa ? $this->subscriptionService->calcularPrecoMensal($empresa) : null;
        $anual = $empresa ? $this->subscriptionService->calcularPrecoAnual($empresa) : null;

        return Inertia::render('Admin/Subscricoes/Show', [
            'subscricao' => [
                'id' => $subscricao->id,
                'estado' => $subscricao->estado,
                'estado_label' => $subscricao->estado_label,
                'ciclo' => $subscricao->ciclo,
                'ciclo_label' => $subscricao->ciclo_label,
                'dia_aniversario' => $subscricao->dia_aniversario,
                'trial_inicia_em' => $subscricao->trial_inicia_em?->toIso8601String(),
                'trial_expira_em' => $subscricao->trial_expira_em?->toIso8601String(),
                'grace_expira_em' => $subscricao->grace_expira_em?->toIso8601String(),
                'activa_desde' => $subscricao->activa_desde?->toIso8601String(),
                'periodo_actual_inicio' => $subscricao->periodo_actual_inicio?->toIso8601String(),
                'periodo_actual_fim' => $subscricao->periodo_actual_fim?->toIso8601String(),
                'cancelada_em' => $subscricao->cancelada_em?->toIso8601String(),
                'motivo_cancelamento' => $subscricao->motivo_cancelamento,
                'preco_customizado_por_fraccao' => $subscricao->preco_customizado_por_fraccao,
                'nota_preco_customizado' => $subscricao->nota_preco_customizado,
                'desconto_anual_pct' => $subscricao->desconto_anual_pct,
                'renovacao_automatica' => $subscricao->renovacao_automatica,
                'converteu_do_trial' => $subscricao->converteu_do_trial,
                'created_at' => $subscricao->created_at->toIso8601String(),
            ],
            'empresa' => $empresa?->only(['id', 'nome', 'slug', 'nif', 'email_contacto', 'telefone']),
            'periodos' => $subscricao->periodos->map(fn ($p) => [
                'id' => $p->id,
                'inicio_em' => $p->inicio_em?->toIso8601String(),
                'fim_em' => $p->fim_em?->toIso8601String(),
                'ciclo' => $p->ciclo,
                'fraccoes_cobradas' => $p->fraccoes_cobradas,
                'preco_por_fraccao' => $p->preco_por_fraccao,
                'valor_total' => $p->valor_total,
                'escalao_nome' => $p->escalao_nome,
                'estado' => $p->estado,
                'pago_em' => $p->pago_em?->toIso8601String(),
            ]),
            'preco_mensal' => $mensal,
            'preco_anual' => $anual,
        ]);
    }

    /**
     * Estender trial manualmente (acção de super-admin).
     */
    public function estenderTrial(Request $request, Subscricao $subscricao): RedirectResponse
    {
        $request->validate([
            'dias' => 'required|integer|min:1|max:90',
        ]);

        $ok = $this->trialService->estenderTrial($subscricao, (int) $request->input('dias'));

        return $ok
            ? back()->with('success', "Trial estendido em {$request->input('dias')} dias.")
            : back()->with('error', 'Não foi possível estender o trial.');
    }

    /**
     * Reactivar subscrição suspensa.
     */
    public function reactivar(Subscricao $subscricao): RedirectResponse
    {
        $ok = $this->trialService->reactivar($subscricao);

        return $ok
            ? back()->with('success', 'Subscrição reactivada.')
            : back()->with('error', 'Não foi possível reactivar (só funciona se estiver suspensa).');
    }

    /**
     * Definir preço customizado (Enterprise).
     */
    public function definirPrecoCustomizado(Request $request, Subscricao $subscricao): RedirectResponse
    {
        $validated = $request->validate([
            'preco_customizado_por_fraccao' => 'nullable|numeric|min:0|max:100000',
            'nota_preco_customizado' => 'nullable|string|max:500',
        ]);

        $subscricao->update($validated);

        return back()->with('success', 'Preço customizado actualizado.');
    }
}
