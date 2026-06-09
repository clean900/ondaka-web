<?php

namespace App\Domains\Encomenda\Http\Controllers;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Encomenda\Models\CondominioEncomendaConfig;
use App\Domains\Encomenda\Models\Encomenda;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EncomendaWebController extends Controller
{
    /**
     * Lista de encomendas do condomínio activo.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if (! $user->condominio_activo_id) {
            return Inertia::render('Encomendas/Index', [
                'encomendas' => ['data' => [], 'total' => 0, 'links' => [], 'last_page' => 1, 'current_page' => 1, 'per_page' => 20],
                'filtros' => ['estado' => '', 'pesquisa' => ''],
                'stats' => $this->statsVazias(),
                'precisaCondominio' => true,
                'config' => null,
            ]);
        }

        $condominioId = $user->condominio_activo_id;

        $query = Encomenda::query()
            ->doCondominio($condominioId)
            ->with([
                'condomino:id,nome_completo',
                'fraccao:id,identificador',
                'recebidaPor:id,name',
                'entreguePor:id,name',
            ])
            ->orderByDesc('created_at');

        if ($estado = $request->query('estado')) {
            $query->where('estado', $estado);
        }

        if ($pesquisa = $request->query('pesquisa')) {
            $query->where(function ($q) use ($pesquisa) {
                $q->where('descricao', 'LIKE', "%$pesquisa%")
                  ->orWhereHas('condomino', fn ($cq) => $cq->where('nome_completo', 'LIKE', "%$pesquisa%"));
            });
        }

        $encomendas = $query->paginate(20)->withQueryString();

        $stats = [
            'total' => Encomenda::doCondominio($condominioId)->count(),
            'na_portaria' => Encomenda::doCondominio($condominioId)->naPortaria()->count(),
            'multa_pendente' => Encomenda::doCondominio($condominioId)->comMultaPendente()->count(),
            'entregues_mes' => Encomenda::doCondominio($condominioId)
                ->where('estado', Encomenda::ESTADO_ENTREGUE)
                ->whereMonth('levantada_em', now()->month)
                ->whereYear('levantada_em', now()->year)
                ->count(),
        ];

        $config = CondominioEncomendaConfig::paraCondominio($condominioId);

        return Inertia::render('Encomendas/Index', [
            'encomendas' => $encomendas,
            'filtros' => [
                'estado' => $request->query('estado', ''),
                'pesquisa' => $request->query('pesquisa', ''),
            ],
            'stats' => $stats,
            'precisaCondominio' => false,
            'config' => $config,
        ]);
    }

    /**
     * POST /encomendas/{id}/cobrar-multa
     */
    public function cobrarMulta(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $encomenda = $this->encomendaDoCondominioActivo($user, $id);

        if (! $encomenda) {
            return back()->with('erro', 'Encomenda não encontrada.');
        }

        if ($encomenda->estado !== Encomenda::ESTADO_MULTA_APLICADA) {
            return back()->with('erro', 'Encomenda não tem multa aplicada.');
        }

        if ($encomenda->multa_estado !== Encomenda::MULTA_PENDENTE) {
            return back()->with('erro', 'Multa já foi paga ou desbloqueada.');
        }

        $validated = $request->validate([
            'valor_kz' => ['nullable', 'numeric', 'min:0'],
            'via' => ['required', Rule::in([
                Encomenda::PAGO_VIA_PROXYPAY,
                Encomenda::PAGO_VIA_EXTRACTO,
                Encomenda::PAGO_VIA_DINHEIRO,
            ])],
            'observacoes' => ['nullable', 'string', 'max:1000'],
        ]);

        $valor = $validated['valor_kz'] ?? $encomenda->multa_valor_kz;

        $encomenda->update([
            'multa_estado' => Encomenda::MULTA_PAGA,
            'multa_valor_kz' => $valor,
            'multa_pago_via' => $validated['via'],
            'multa_pago_em' => now(),
            'multa_pago_observacoes' => $validated['observacoes'] ?? null,
            'estado' => Encomenda::ESTADO_AGUARDA_LEVANTAMENTO,
            'local_atual' => Encomenda::LOCAL_PORTARIA,
        ]);

        return back()->with('sucesso', 'Multa registada como paga. Encomenda volta a estar disponível.');
    }

    /**
     * POST /encomendas/{id}/desbloquear
     */
    public function desbloquear(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $encomenda = $this->encomendaDoCondominioActivo($user, $id);

        if (! $encomenda) {
            return back()->with('erro', 'Encomenda não encontrada.');
        }

        if ($encomenda->estado !== Encomenda::ESTADO_MULTA_APLICADA) {
            return back()->with('erro', 'Encomenda não tem multa aplicada.');
        }

        $validated = $request->validate([
            'observacoes' => ['nullable', 'string', 'max:1000'],
        ]);

        $encomenda->update([
            'multa_estado' => Encomenda::MULTA_DESBLOQUEADA,
            'multa_pago_em' => now(),
            'multa_pago_observacoes' => $validated['observacoes']
                ?? 'Desbloqueada sem cobrança pelo gestor.',
            'estado' => Encomenda::ESTADO_AGUARDA_LEVANTAMENTO,
            'local_atual' => Encomenda::LOCAL_PORTARIA,
        ]);

        return back()->with('sucesso', 'Encomenda desbloqueada sem cobrança.');
    }

    /**
     * PUT /encomendas/config
     */
    public function actualizarConfig(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (! $user->condominio_activo_id) {
            return back()->with('erro', 'Selecciona um condomínio activo.');
        }

        $validated = $request->validate([
            'multa_valor_padrao_kz' => ['required', 'numeric', 'min:0'],
            'dias_aviso' => ['required', 'integer', 'min:1', 'max:30'],
            'dias_multa' => ['required', 'integer', 'min:1', 'max:60'],
            'permite_pagamento_proxypay' => ['required', 'boolean'],
            'permite_pagamento_extracto' => ['required', 'boolean'],
            'permite_pagamento_dinheiro' => ['required', 'boolean'],
        ]);

        if ($validated['dias_aviso'] >= $validated['dias_multa']) {
            return back()->withErrors(['dias_aviso' => 'Dias de aviso deve ser menor que dias de multa.']);
        }

        $config = CondominioEncomendaConfig::paraCondominio($user->condominio_activo_id);
        $config->update($validated);

        return back()->with('sucesso', 'Configuração actualizada.');
    }

    /**
     * POST /encomendas/registar
     * Admin regista encomenda manual (Fluxo A — sem aviso).
     */
    public function registar(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (! $user->condominio_activo_id) {
            return back()->with('erro', 'Selecciona um condomínio activo.');
        }

        $validated = $request->validate([
            'condomino_id' => ['required', 'integer', 'exists:condominos,id'],
            'fraccao_id' => ['required', 'integer', 'exists:fraccoes,id'],
            'descricao' => ['required', 'string', 'max:500'],
            'remetente' => ['nullable', 'string', 'max:255'],
            'notas_guarda' => ['nullable', 'string', 'max:1000'],
        ]);

        $condomino = Condomino::find($validated['condomino_id']);
        if (! $condomino || $condomino->empresa_gestora_id !== $user->empresa_gestora_id) {
            return back()->with('erro', 'Condómino inválido.');
        }

        Encomenda::create([
            'condominio_id' => $user->condominio_activo_id,
            'fraccao_id' => $validated['fraccao_id'],
            'condomino_id' => $validated['condomino_id'],
            'descricao' => $validated['descricao'],
            'remetente' => $validated['remetente'] ?? null,
            'notas_guarda' => $validated['notas_guarda'] ?? null,
            'estado' => Encomenda::ESTADO_AGUARDA_LEVANTAMENTO,
            'origem' => Encomenda::ORIGEM_SEM_AVISO,
            'local_atual' => Encomenda::LOCAL_PORTARIA,
            'chegou_em' => now(),
            'recebida_por_user_id' => $user->id,
        ]);

        return back()->with('sucesso', 'Encomenda registada na portaria.');
    }

    /**
     * GET /encomendas/condominos?q=...
     * Pesquisa de condóminos para autocomplete (admin a registar encomenda manual).
     * Retorna condóminos com a sua fracção activa.
     */
    public function pesquisarCondominos(Request $request)
    {
        $user = $request->user();
        if (! $user->condominio_activo_id) {
            return response()->json(['data' => []]);
        }

        $q = $request->query('q', '');
        if (strlen($q) < 2) {
            return response()->json(['data' => []]);
        }

        // Buscar condóminos da empresa que tenham contrato activo numa fracção
        // do condomínio activo do user
        $condominos = \App\Domains\Condomino\Models\Condomino::query()
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->where('nome_completo', 'LIKE', "%$q%")
            ->whereHas('contratosActivos', function ($cq) use ($user) {
                $cq->whereHas('fraccao', fn ($fq) => $fq->where('condominio_id', $user->condominio_activo_id));
            })
            ->with([
                'contratosActivos' => function ($cq) use ($user) {
                    $cq->whereHas('fraccao', fn ($fq) => $fq->where('condominio_id', $user->condominio_activo_id))
                       ->with('fraccao:id,identificador');
                }
            ])
            ->limit(20)
            ->get(['id', 'nome_completo']);

        $resultado = $condominos->map(function ($c) {
            $contrato = $c->contratosActivos->first();
            return [
                'id' => $c->id,
                'nome_completo' => $c->nome_completo,
                'fraccao_id' => $contrato?->fraccao?->id,
                'fraccao_identificador' => $contrato?->fraccao?->identificador,
            ];
        })->filter(fn ($c) => $c['fraccao_id'] !== null)->values();

        return response()->json(['data' => $resultado]);
    }

    // ===== Helpers =====

    protected function encomendaDoCondominioActivo($user, int $id): ?Encomenda
    {
        if (! $user->condominio_activo_id) return null;
        return Encomenda::where('id', $id)
            ->where('condominio_id', $user->condominio_activo_id)
            ->first();
    }

    protected function statsVazias(): array
    {
        return [
            'total' => 0,
            'na_portaria' => 0,
            'multa_pendente' => 0,
            'entregues_mes' => 0,
        ];
    }
}
