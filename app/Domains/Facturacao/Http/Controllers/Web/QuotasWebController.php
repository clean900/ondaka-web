<?php

declare(strict_types=1);

namespace App\Domains\Facturacao\Http\Controllers\Web;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Facturacao\Models\Quota;
use App\Domains\Facturacao\Models\Lancamento;
use App\Domains\Facturacao\Services\LancamentoService;
use App\Domains\Facturacao\Services\QuotaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * UI Inertia/React para admin gerir quotas de condomínios.
 *
 * URL base: /quotas (dentro do menu Facturação)
 *
 * Tenancy automática por empresa_gestora_id.
 */
class QuotasWebController extends Controller
{
    public function __construct(protected QuotaService $service) {}

    /**
     * GET /quotas
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $stats = [
            'total' => Quota::where('empresa_gestora_id', $user->empresa_gestora_id)->count(),
            'abertas' => Quota::where('empresa_gestora_id', $user->empresa_gestora_id)
                ->where('estado', Quota::ESTADO_ABERTA)
                ->count(),
            'pagas_parcial' => Quota::where('empresa_gestora_id', $user->empresa_gestora_id)
                ->where('estado', Quota::ESTADO_PAGA_PARCIAL)
                ->count(),
            'pagas' => Quota::where('empresa_gestora_id', $user->empresa_gestora_id)
                ->where('estado', Quota::ESTADO_PAGA)
                ->count(),
            'mes_actual' => Quota::where('empresa_gestora_id', $user->empresa_gestora_id)
                ->where('ano', now()->year)
                ->where('mes', now()->month)
                ->count(),
        ];

        $query = Quota::query()
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->with([
                'fraccao:id,identificador,condominio_id',
                'condominio:id,nome',
            ])
            ->orderByDesc('ano')
            ->orderByDesc('mes')
            ->orderBy('fraccao_id');

        if ($condominioId = $request->query('condominio_id')) {
            $query->where('condominio_id', $condominioId);
        }
        if ($estado = $request->query('estado')) {
            $query->where('estado', $estado);
        }
        if ($ano = $request->query('ano')) {
            $query->where('ano', $ano);
        }
        if ($mes = $request->query('mes')) {
            $query->where('mes', $mes);
        }

        $quotas = $query->paginate(30)->withQueryString();

        // Lista de condomínios para filtro/dropdown
        $condominios = Condominio::query()
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->select('id', 'nome')
            ->orderBy('nome')
            ->get();

        return Inertia::render('Facturacao/Quotas/Index', [
            'quotas' => $quotas,
            'stats' => $stats,
            'condominios' => $condominios,
            'filtros' => [
                'condominio_id' => $request->query('condominio_id'),
                'estado' => $request->query('estado'),
                'ano' => $request->query('ano'),
                'mes' => $request->query('mes'),
            ],
        ]);
    }

    /**
     * POST /quotas/gerar
     * Geração manual de quotas para um condomínio + mês.
     */
    /**
     * GET /quotas/{quota}
     * Detalhe da quota com lançamentos e pagamentos imputados.
     */
    public function show(Request $request, int $id): Response
    {
        $user = $request->user();

        $quota = Quota::query()
            ->where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->with([
                'fraccao:id,identificador,condominio_id',
                'condominio:id,nome',
                'lancamentos.imputacoes.pagamento:id,referencia,estado,valor,data_pagamento',
                'lancamentos.imputacoes.pagamento.condomino:id,nome_completo',
            ])
            ->firstOrFail();

        $temPagamentosImputados = $quota->lancamentos
            ->flatMap(fn ($l) => $l->imputacoes)
            ->isNotEmpty();

        return Inertia::render('Facturacao/Quotas/Show', [
            'quota' => array_merge($quota->toArray(), [
                'tem_pagamentos_imputados' => $temPagamentosImputados,
            ]),
        ]);
    }

    /**
     * POST /quotas/{quota}/cancelar
     * Cancela quota + todos os lançamentos. Recusa se há pagamentos imputados.
     */
    public function cancelar(Request $request, int $id, LancamentoService $lancamentoService): RedirectResponse
    {
        $user = $request->user();

        $quota = Quota::query()
            ->where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->with('lancamentos.imputacoes')
            ->firstOrFail();

        $validated = $request->validate([
            'motivo' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        // Verificar pagamentos imputados
        $temPagamentos = $quota->lancamentos
            ->flatMap(fn ($l) => $l->imputacoes)
            ->isNotEmpty();

        if ($temPagamentos) {
            return back()->withErrors([
                'cancelar' => 'Não é possível cancelar — há pagamentos imputados a esta quota. Trata dos pagamentos primeiro (rejeitar/devolver).',
            ]);
        }

        \DB::transaction(function () use ($quota, $validated, $user, $lancamentoService) {
            // Cancelar todos os lançamentos
            foreach ($quota->lancamentos as $l) {
                if ($l->estado === Lancamento::ESTADO_CANCELADO) continue;
                $lancamentoService->cancelarLancamento($l, $user, $validated['motivo']);
            }

            // Marcar quota como cancelada
            $quota->update(['estado' => Quota::ESTADO_CANCELADA]);
        });

        return redirect()->route('quotas.index')
            ->with('flash.success', "Quota cancelada (#{$quota->id}). Motivo: {$validated['motivo']}");
    }

    public function gerar(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'condominio_id' => ['required', 'integer', 'exists:condominios,id'],
            'ano' => ['required', 'integer', 'min:2024', 'max:2030'],
            'mes' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        // Tenancy
        $condominio = Condominio::findOrFail($validated['condominio_id']);
        if ($condominio->empresa_gestora_id !== $user->empresa_gestora_id) {
            abort(403);
        }

        $r = $this->service->gerarQuotasParaPeriodo(
            $condominio->id,
            $user->id,
            (int) $validated['ano'],
            (int) $validated['mes'],
        );

        $msg = sprintf(
            'Geração concluída: %d quotas geradas, %d já existiam, %d sem contrato. Total facturado: %s Kz',
            $r['geradas'] ?? 0,
            $r['ja_existem'] ?? 0,
            $r['sem_contrato'] ?? 0,
            number_format((float) ($r['total_facturado'] ?? 0), 2, ',', '.')
        );

        return back()->with('flash.success', $msg);
    }
}
