<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Http\Controllers;

use App\Domains\Subscription\Models\EscalaoCore;
use App\Domains\Subscription\Models\Subscricao;
use App\Domains\Subscription\Services\PrecoSubscricaoService;
use App\Domains\Subscription\Services\MudancaPlanoService;
use App\Domains\Subscription\Services\SubscricaoSelfService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SubscricaoController extends Controller
{
    public function __construct(
        protected PrecoSubscricaoService $precoService,
    ) {}

    /**
     * Página principal: subscrever / minha subscrição.
     */
    public function index(Request $request): Response
    {
        $empresa = app('empresa_gestora_actual');
        $subscricao = $empresa?->subscricao;

        $config = DB::table('plataforma_config')
            ->orderBy('chave')
            ->pluck('valor', 'chave');

        $escaloes = EscalaoCore::where('activo', true)
            ->orderBy('ordem')
            ->get(['id', 'slug', 'nome', 'descricao', 'min_fraccoes', 'max_fraccoes', 'desconto_pct', 'cor_badge'])
            ->map(fn ($e) => [
                'id' => $e->id,
                'slug' => $e->slug,
                'nome' => $e->nome,
                'descricao' => $e->descricao,
                'min_imoveis' => $e->min_fraccoes,
                'max_imoveis' => $e->max_fraccoes,
                'desconto_pct' => (float) $e->desconto_pct,
                'cor_badge' => $e->cor_badge,
            ]);

        return Inertia::render('Subscricao/Index', [
            'subscricao' => $subscricao ? [
                'id' => $subscricao->id,
                'estado' => $subscricao->estado,
                'ciclo' => $subscricao->ciclo,
                'num_imoveis' => $subscricao->num_imoveis ?? 0,
                'trial_inicia_em' => $subscricao->trial_inicia_em?->toIso8601String(),
                'trial_expira_em' => $subscricao->trial_expira_em?->toIso8601String(),
                'activa_desde' => $subscricao->activa_desde?->toIso8601String(),
                'periodo_actual_inicio' => $subscricao->periodo_actual_inicio?->toIso8601String(),
                'periodo_actual_fim' => $subscricao->periodo_actual_fim?->toIso8601String(),
                'em_trial' => $subscricao->emTrial(),
                'activa' => $subscricao->activa(),
                'tem_acesso' => $subscricao->temAcesso(),
                'cancela_no_fim_periodo' => $subscricao->cancela_no_fim_periodo?->toIso8601String(),
                'cancelada_em' => $subscricao->cancelada_em?->toIso8601String(),
                'motivo_cancelamento' => $subscricao->motivo_cancelamento,
                'proximo_ciclo' => $subscricao->proximo_ciclo,
                'proximo_ciclo_aplica_em' => $subscricao->proximo_ciclo_aplica_em?->toIso8601String(),
            ] : null,
            'empresa' => $empresa?->only(['id', 'nome', 'slug', 'nif']),
            'config' => [
                'preco_base_imovel_mes' => (float) ($config['preco_base_imovel_mes'] ?? 0),
                'desconto_periodo_mensal_pct' => (float) ($config['desconto_periodo_mensal_pct'] ?? 0),
                'desconto_periodo_semestral_pct' => (float) ($config['desconto_periodo_semestral_pct'] ?? 0),
                'desconto_periodo_anual_pct' => (float) ($config['desconto_periodo_anual_pct'] ?? 0),
                'trial_duracao_dias' => (int) ($config['trial_duracao_dias'] ?? 14),
                'imposto_aplicavel' => (bool) ($config['imposto_aplicavel'] ?? false),
                'imposto_tipo' => $config['imposto_tipo'] ?? 'IVA',
                'imposto_taxa_pct' => (float) ($config['imposto_taxa_pct'] ?? 0),
            ],
            'escaloes' => $escaloes,
            'motivos_cancelamento' => SubscricaoSelfService::MOTIVOS,
        ]);
    }

    /**
     * Endpoint AJAX: calcular preço.
     */
    public function calcular(Request $request)
    {
        $request->validate([
            'num_imoveis' => 'required|integer|min:1',
            'periodicidade' => 'required|in:mensal,semestral,anual',
        ]);

        try {
            $resultado = $this->precoService->calcular(
                $request->integer('num_imoveis'),
                $request->string('periodicidade')->value(),
            );
            return response()->json(['success' => true, 'calculo' => $resultado]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    /**
     * Endpoint: activar subscrição (cria/actualiza com trial).
     */
    public function activar(Request $request)
    {
        $request->validate([
            'num_imoveis' => 'required|integer|min:1',
            'periodicidade' => 'required|in:mensal,semestral,anual',
        ]);

        $user = $request->user();
        $empresa = app('empresa_gestora_actual');

        if (!$empresa) {
            return response()->json(['success' => false, 'message' => 'Empresa não encontrada.'], 404);
        }

        $trialDias = (int) DB::table('plataforma_config')->where('chave', 'trial_duracao_dias')->value('valor');
        $agora = now();
        $expiraTrial = $agora->copy()->addDays($trialDias);

        $subscricao = Subscricao::firstOrNew(
            ['empresa_gestora_id' => $empresa->id]
        );

        $jaExistia = $subscricao->exists;

        if (!$jaExistia || $subscricao->estado === 'trial') {
            $subscricao->estado = 'trial';
            $subscricao->trial_inicia_em = $agora;
            $subscricao->trial_expira_em = $expiraTrial;
        }

        $subscricao->ciclo = $request->string('periodicidade')->value();
        $subscricao->num_imoveis = $request->integer('num_imoveis');
        $subscricao->renovacao_automatica = true;
        $subscricao->save();

        DB::table('plataforma_subscricao_eventos')->insert([
            'subscricao_id' => $subscricao->id,
            'tipo' => $jaExistia ? 'imoveis_alterados' : 'trial_iniciado',
            'descricao' => $jaExistia
                ? 'Subscrição actualizada: ' . $subscricao->num_imoveis . ' imóveis, ' . $subscricao->ciclo
                : 'Trial iniciado: ' . $subscricao->num_imoveis . ' imóveis, ' . $subscricao->ciclo,
            'meta_json' => json_encode([
                'num_imoveis' => $subscricao->num_imoveis,
                'ciclo' => $subscricao->ciclo,
            ]),
            'user_id' => $user?->id,
            'created_at' => $agora,
        ]);

        return response()->json([
            'success' => true,
            'subscricao_id' => $subscricao->id,
            'message' => $jaExistia ? 'Subscrição actualizada.' : 'Trial iniciado com sucesso.',
        ]);
    }


    /**
     * Endpoint: alterar nº de imóveis de uma subscrição.
     * Calcula ajuste proporcional se subscrição activa.
     */
    public function alterarImoveis(Request $request)
    {
        $request->validate([
            'num_imoveis' => 'required|integer|min:1',
            'motivo' => 'nullable|string|max:200',
        ]);

        $user = $request->user();
        $empresa = app('empresa_gestora_actual');

        if (!$empresa) {
            return response()->json(['success' => false, 'message' => 'Empresa não encontrada.'], 404);
        }

        $subscricao = $empresa->subscricao;
        if (!$subscricao) {
            return response()->json(['success' => false, 'message' => 'Subscrição não encontrada.'], 404);
        }

        try {
            $service = app(\App\Domains\Subscription\Services\AlteracoesImoveisService::class);
            $resultado = $service->alterar(
                $subscricao,
                $request->integer('num_imoveis'),
                $user?->id,
                $request->string('motivo')->value() ?: null,
            );

            return response()->json([
                'success' => true,
                'alteracao' => $resultado,
                'message' => $resultado['aplicar_pro_rata']
                    ? 'Imóveis alterados. ' . ($resultado['valor_pro_rata_kz'] >= 0 ? 'Acréscimo' : 'Crédito') . ' de ' . number_format(abs($resultado['valor_pro_rata_kz']), 2) . ' Kz será aplicado na próxima factura.'
                    : 'Imóveis alterados.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
    /**
     * Lista facturas plataforma da empresa actual.
     */
    public function facturas(Request $request): Response
    {
        $empresa = app('empresa_gestora_actual');
        $subscricao = $empresa?->subscricao;

        $facturas = [];
        if ($subscricao) {
            $facturas = DB::table('plataforma_facturas')
                ->where('subscricao_id', $subscricao->id)
                ->orderBy('id', 'desc')
                ->get()
                ->map(fn ($f) => [
                    'id' => $f->id,
                    'numero' => $f->numero,
                    'periodo_inicio' => $f->periodo_referencia_inicio,
                    'periodo_fim' => $f->periodo_referencia_fim,
                    'num_imoveis' => $f->num_imoveis_facturado,
                    'subtotal_kz' => (float) $f->subtotal_kz,
                    'imposto_tipo' => $f->imposto_tipo,
                    'imposto_taxa_pct' => (float) $f->imposto_taxa_pct,
                    'imposto_valor_kz' => (float) $f->imposto_valor_kz,
                    'valor_total_kz' => (float) $f->valor_total_kz,
                    'estado' => $f->estado,
                    'data_emissao' => $f->data_emissao,
                    'data_vencimento' => $f->data_vencimento,
                    'data_pagamento' => $f->data_pagamento,
                    'tem_referencia_pagamento' => !empty($f->proxypay_referencia_id),
                ])
                ->toArray();
        }

        return Inertia::render('Subscricao/Facturas', [
            'facturas' => $facturas,
            'subscricao' => $subscricao ? [
                'id' => $subscricao->id,
                'estado' => $subscricao->estado,
                'ciclo' => $subscricao->ciclo,
                'num_imoveis' => $subscricao->num_imoveis,
            ] : null,
        ]);
    }

    /**
     * Detalhe de uma factura específica.
     */
    public function gerarReferenciaPagamento(Request $request, int $id)
    {
        $empresa = app('empresa_gestora_actual');
        $subscricao = $empresa?->subscricao;
        if (!$subscricao) {
            return response()->json(['success' => false, 'message' => 'Subscrição não encontrada.'], 404);
        }

        $factura = DB::table('plataforma_facturas')
            ->where('id', $id)
            ->where('subscricao_id', $subscricao->id)
            ->first();

        if (!$factura) {
            return response()->json(['success' => false, 'message' => 'Factura não encontrada.'], 404);
        }

        try {
            $service = app(\App\Domains\Payment\Services\ProxyPayService::class);
            $resultado = $service->criarReferenciaParaFacturaPlataforma($factura->id);

            return response()->json([
                'success' => true,
                'referencia' => $resultado['reference_id'],
                'entity_id' => $resultado['entity_id'],
                'amount' => $resultado['amount'],
                'expira_em' => $resultado['expira_em'],
                'message' => 'Referência gerada com sucesso.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Endpoint: pagar subscricao (limitado/cancelada).
     * Emite factura do periodo (se nao houver pendente) e gera referencia ProxyPay.
     */
    public function pagar(Request $request)
    {
        $empresa = app('empresa_gestora_actual');
        $subscricao = $empresa?->subscricao;
        if (!$subscricao) {
            return response()->json(['success' => false, 'message' => 'Subscricao nao encontrada.'], 404);
        }

        if (!in_array($subscricao->estado, ['limitado', 'cancelada'])) {
            return response()->json(['success' => false, 'message' => 'A subscricao nao esta em estado de pagamento.'], 422);
        }

        if (($subscricao->num_imoveis ?? 0) < 1) {
            return response()->json(['success' => false, 'message' => 'Defina o numero de imoveis antes de pagar.'], 422);
        }

        try {
            $factura = DB::table('plataforma_facturas')
                ->where('subscricao_id', $subscricao->id)
                ->where('estado', 'pendente')
                ->orderByDesc('id')
                ->first();

            if (!$factura) {
                $facturaService = app(\App\Domains\Subscription\Services\FacturaPlataformaService::class);
                $resultado = $facturaService->emitir($subscricao);
                $factura = DB::table('plataforma_facturas')->where('id', $resultado['id'])->first();
            }

            if (!$factura) {
                return response()->json(['success' => false, 'message' => 'Nao foi possivel gerar a factura.'], 422);
            }

            $service = app(\App\Domains\Payment\Services\ProxyPayService::class);
            $ref = $service->criarReferenciaParaFacturaPlataforma($factura->id);

            return response()->json([
                'success' => true,
                'factura_id' => $factura->id,
                'numero' => $factura->numero,
                'referencia' => $ref['reference_id'],
                'entity_id' => $ref['entity_id'],
                'amount' => $ref['amount'],
                'expira_em' => $ref['expira_em'],
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function facturaShow(Request $request, int $id): Response
    {
        $empresa = app('empresa_gestora_actual');
        $subscricao = $empresa?->subscricao;

        if (!$subscricao) {
            abort(404);
        }

        $factura = DB::table('plataforma_facturas')
            ->where('id', $id)
            ->where('subscricao_id', $subscricao->id)
            ->first();

        if (!$factura) {
            abort(404);
        }

        $breakdown = $factura->breakdown_json ? json_decode($factura->breakdown_json, true) : null;

        return Inertia::render('Subscricao/FacturaShow', [
            'factura' => [
                'id' => $factura->id,
                'numero' => $factura->numero,
                'periodo_inicio' => $factura->periodo_referencia_inicio,
                'periodo_fim' => $factura->periodo_referencia_fim,
                'num_imoveis' => $factura->num_imoveis_facturado,
                'preco_base_kz' => (float) $factura->preco_base_kz,
                'desconto_qtd_pct' => (float) $factura->desconto_qtd_pct,
                'desconto_periodo_pct' => (float) $factura->desconto_periodo_pct,
                'subtotal_kz' => (float) $factura->subtotal_kz,
                'imposto_tipo' => $factura->imposto_tipo,
                'imposto_taxa_pct' => (float) $factura->imposto_taxa_pct,
                'imposto_valor_kz' => (float) $factura->imposto_valor_kz,
                'valor_total_kz' => (float) $factura->valor_total_kz,
                'estado' => $factura->estado,
                'data_emissao' => $factura->data_emissao,
                'data_vencimento' => $factura->data_vencimento,
                'data_pagamento' => $factura->data_pagamento,
                'breakdown' => $breakdown,
                'tem_referencia_pagamento' => !empty($factura->proxypay_referencia_id),
                'proxypay_referencia_id' => $factura->proxypay_referencia_id,
                'referencia_dados' => $factura->proxypay_referencia_id ? \App\Domains\Payment\Models\PagamentoReferencia::find($factura->proxypay_referencia_id)?->only(['reference_id', 'entity_id', 'amount', 'status', 'expira_em']) : null,
            ],
            'empresa' => $empresa?->only(['id', 'nome', 'slug', 'nif']),
        ]);
    }

    /**
     * Página mostrada quando subscrição expirou.
     */
    public function expirada(Request $request): Response
    {
        $empresa = app('empresa_gestora_actual');
        $subscricao = $empresa?->subscricao;

        return Inertia::render('Subscricao/Expirada', [
            'subscricao' => $subscricao,
            'empresa' => $empresa?->only(['id', 'nome', 'slug']),
        ]);
    }

    /**
     * Cancelar subscrição (self-service pelo admin-empresa).
     */
    public function cancelar(Request $request, SubscricaoSelfService $service): RedirectResponse
    {
        $request->validate([
            'motivo_chave' => 'required|string|in:' . implode(',', array_keys(SubscricaoSelfService::MOTIVOS)),
            'detalhes' => 'nullable|string|max:1000',
        ]);

        $empresa = app('empresa_gestora_actual');
        $subscricao = $empresa?->subscricao;
        if (! $subscricao) {
            return back()->with('error', 'Subscrição não encontrada.');
        }

        $service->cancelar(
            (int) $subscricao->id,
            Auth::user(),
            $request->input('motivo_chave'),
            $request->input('detalhes'),
        );

        return back()->with('success', 'Subscrição cancelada. Mantém acesso até ao fim do período pago.');
    }

    /**
     * Reverter cancelamento.
     */
    public function reverterCancelamento(Request $request, SubscricaoSelfService $service): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');
        $subscricao = $empresa?->subscricao;
        if (! $subscricao) {
            return back()->with('error', 'Subscrição não encontrada.');
        }

        $sucesso = $service->reverterCancelamento((int) $subscricao->id, Auth::user());

        if (! $sucesso) {
            return back()->with('error', 'Não foi possível reverter o cancelamento.');
        }

        return back()->with('success', 'Cancelamento revertido. A sua subscrição continua activa.');
    }

    /**
     * Preview AJAX da mudança de plano.
     */
    public function previewMudancaPlano(Request $request, MudancaPlanoService $service)
    {
        $request->validate([
            'ciclo_novo' => 'required|in:mensal,semestral,anual',
        ]);

        $empresa = app('empresa_gestora_actual');
        $subscricao = $empresa?->subscricao;
        if (! $subscricao) {
            return response()->json(['valida' => false, 'erro' => 'Subscrição não encontrada.']);
        }

        return response()->json($service->obterPreview($subscricao, $request->input('ciclo_novo')));
    }

    /**
     * Executa mudança de plano (upgrade imediato ou downgrade agendado).
     */
    public function mudarPlano(Request $request, MudancaPlanoService $service): RedirectResponse
    {
        $request->validate([
            'ciclo_novo' => 'required|in:mensal,semestral,anual',
        ]);

        $empresa = app('empresa_gestora_actual');
        $subscricao = $empresa?->subscricao;
        if (! $subscricao) {
            return back()->with('error', 'Subscrição não encontrada.');
        }

        $resultado = $service->executar($subscricao, $request->input('ciclo_novo'), Auth::user());

        if (! ($resultado['ok'] ?? false)) {
            return back()->with('error', $resultado['erro'] ?? 'Não foi possível mudar de plano.');
        }

        $msg = $resultado['tipo'] === 'upgrade'
            ? 'Plano alterado. Receberá em breve uma factura para concluir.'
            : 'Mudança agendada. O novo plano entra em vigor no fim do período actual.';

        return back()->with('success', $msg);
    }

    /**
     * Cancela downgrade agendado.
     */
    public function cancelarDowngrade(Request $request, MudancaPlanoService $service): RedirectResponse
    {
        $empresa = app('empresa_gestora_actual');
        $subscricao = $empresa?->subscricao;
        if (! $subscricao) {
            return back()->with('error', 'Subscrição não encontrada.');
        }

        $sucesso = $service->cancelarDowngradeAgendado($subscricao, Auth::user());

        if (! $sucesso) {
            return back()->with('error', 'Não há downgrade agendado para cancelar.');
        }

        return back()->with('success', 'Mudança de plano cancelada.');
    }
}
