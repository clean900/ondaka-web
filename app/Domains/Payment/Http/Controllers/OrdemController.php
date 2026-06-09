<?php

declare(strict_types=1);

namespace App\Domains\Payment\Http\Controllers;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Feature\Models\Feature;
use App\Domains\Feature\Models\FeaturePacote;
use App\Domains\Payment\Models\OrdemCompra;
use App\Domains\Payment\Models\Pagamento;
use App\Domains\Payment\Services\OrderService;
use App\Domains\Payment\Services\PaymentService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrdemController extends Controller
{
    public function __construct(
        protected OrderService $orderService,
        protected PaymentService $paymentService,
        protected \App\Domains\Payment\Services\ProxyPayService $proxyPay,
    ) {}

    /**
     * Listagem "As minhas ordens" (cliente).
     */
    public function index(Request $request): Response
    {
        $empresa = $this->empresaActual($request);

        $ordens = OrdemCompra::where('owner_type', EmpresaGestora::class)
            ->where('owner_id', $empresa->id)
            ->with(['feature:id,slug,nome,unidade', 'pacote:id,nome,quantidade', 'pagamentos'])
            ->orderByDesc('created_at')
            ->paginate(15);

        $ordens->getCollection()->transform(fn (OrdemCompra $o) => [
            'id' => $o->id,
            'numero' => $o->numero,
            'tipo_item' => $o->tipo_item,
            'tipo_item_label' => $o->tipo_item_label,
            'descricao_item' => $o->descricao_item,
            'valor_total' => (float) $o->valor_total,
            'valor_iva' => (float) $o->valor_iva,
            'estado' => $o->estado,
            'estado_label' => $o->estado_label,
            'total_pago' => $o->totalPago(),
            'saldo_em_falta' => $o->saldoEmFalta(),
            'tem_pagamentos' => $o->pagamentos->isNotEmpty(),
            'pagamentos_count' => $o->pagamentos->count(),
            'prazo_pagamento' => $o->prazo_pagamento?->toIso8601String(),
            'expirou' => $o->expirou(),
            'pode_cancelar' => $o->podeSerCancelada(),
            'created_at' => $o->created_at->toIso8601String(),
            'aprovada_em' => $o->aprovada_em?->toIso8601String(),
        ]);

        // Contadores
        $base = OrdemCompra::where('owner_type', EmpresaGestora::class)
            ->where('owner_id', $empresa->id);

        return Inertia::render('Ordens/Minhas', [
            'ordens' => $ordens,
            'contadores' => [
                'total' => (clone $base)->count(),
                'pendentes' => (clone $base)->whereIn('estado', ['pendente', 'em_revisao'])->count(),
                'aprovadas' => (clone $base)->where('estado', 'aprovada')->count(),
                'expiradas' => (clone $base)->where('estado', 'expirada')->count(),
            ],
        ]);
    }

    /**
     * Página de confirmação antes de criar ordem.
     * Mostra resumo com IVA, total, prazo, dados bancários.
     */
    public function confirmar(Request $request): Response|RedirectResponse
    {
        $data = $request->validate([
            'tipo_item' => 'required|in:pacote_consumivel,feature',
            'feature_id' => 'required|exists:features,id',
            'pacote_id' => 'nullable|exists:feature_pacotes,id',
            'meses' => 'nullable|integer|min:1|max:24',
        ]);

        $empresa = $this->empresaActual($request);
        $feature = Feature::findOrFail($data['feature_id']);

        if ($feature->em_breve) {
            return redirect()->route('funcionalidades.show', $feature->slug)
                ->with('error', 'Esta funcionalidade ainda não está disponível.');
        }

        // Calcular valores (simula mas não cria)
        $pacote = null;
        $valorBase = 0.0;
        $valorActivacao = 0.0;
        $descricao = $feature->nome;
        $meses = null;

        $primeira = ! \App\Domains\Feature\Models\FeatureSubscription::where('feature_id', $feature->id)
            ->where('owner_type', EmpresaGestora::class)
            ->where('owner_id', $empresa->id)
            ->exists();

        if ($data['tipo_item'] === 'pacote_consumivel') {
            if (empty($data['pacote_id'])) {
                return back()->with('error', 'Pacote não selecionado.');
            }
            $pacote = FeaturePacote::findOrFail($data['pacote_id']);
            $valorBase = (float) $pacote->preco;
            $valorActivacao = $primeira ? (float) $feature->preco_activacao : 0.0;
            $descricao = $feature->nome.' — '.$pacote->nome.' ('.$pacote->quantidade.' '.$feature->unidade.')';
        } else {
            $meses = (int) ($data['meses'] ?? 1);
            $valorBase = (float) $feature->preco_base * $meses;
            $valorActivacao = $primeira ? (float) $feature->preco_activacao : 0.0;
            $descricao = $feature->nome.' — Subscrição '.$meses.' '.($meses === 1 ? 'mês' : 'meses');
        }

        $subtotal = $valorBase + $valorActivacao;
        $iva = round($subtotal * (OrderService::TAXA_IVA / 100), 2);
        $total = round($subtotal + $iva, 2);

        return Inertia::render('Ordens/Confirmar', [
            'feature' => [
                'id' => $feature->id,
                'slug' => $feature->slug,
                'nome' => $feature->nome,
                'descricao_curta' => $feature->descricao_curta,
                'unidade' => $feature->unidade,
            ],
            'pacote' => $pacote ? [
                'id' => $pacote->id,
                'slug' => $pacote->slug,
                'nome' => $pacote->nome,
                'quantidade' => $pacote->quantidade,
                'preco' => (float) $pacote->preco,
            ] : null,
            'resumo' => [
                'tipo_item' => $data['tipo_item'],
                'descricao' => $descricao,
                'meses' => $meses,
                'primeira_compra' => $primeira,
                'valor_base' => $valorBase,
                'valor_activacao' => $valorActivacao,
                'subtotal' => $subtotal,
                'valor_iva' => $iva,
                'taxa_iva' => OrderService::TAXA_IVA,
                'valor_total' => $total,
                'prazo_pagamento_dias' => OrderService::PRAZO_PAGAMENTO_DIAS,
            ],
            'dados_bancarios' => $this->dadosBancariosOndaka(),
        ]);
    }

    /**
     * Criar efectivamente a ordem (POST do ecrã de confirmação).
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'tipo_item' => 'required|in:pacote_consumivel,feature',
            'feature_id' => 'required|exists:features,id',
            'pacote_id' => 'nullable|exists:feature_pacotes,id',
            'meses' => 'nullable|integer|min:1|max:24',
            'notas_cliente' => 'nullable|string|max:500',
        ]);

        $empresa = $this->empresaActual($request);
        $feature = Feature::findOrFail($data['feature_id']);

        if ($feature->em_breve) {
            return back()->with('error', 'Esta funcionalidade ainda não está disponível.');
        }

        try {
            if ($data['tipo_item'] === 'pacote_consumivel') {
                $pacote = FeaturePacote::findOrFail($data['pacote_id']);
                $ordem = $this->orderService->criarOrdemPacote(
                    $empresa,
                    $pacote,
                    auth()->id(),
                    $data['notas_cliente'] ?? null,
                );
            } else {
                $ordem = $this->orderService->criarOrdemSubscricao(
                    $empresa,
                    $feature,
                    (int) ($data['meses'] ?? 1),
                    auth()->id(),
                    $data['notas_cliente'] ?? null,
                );
            }
        } catch (\Throwable $e) {
            return back()->with('error', 'Erro ao criar ordem: '.$e->getMessage());
        }

        return redirect()
            ->route('ordens.show', $ordem->id)
            ->with('success', 'Ordem '.$ordem->numero.' criada. Por favor submeta o comprovativo de pagamento.');
    }

    /**
     * Ver detalhe de ordem (cliente).
     */
    public function show(Request $request, OrdemCompra $ordem): Response|RedirectResponse
    {
        $empresa = $this->empresaActual($request);

        // Garantir que esta ordem pertence à empresa
        if ($ordem->owner_type !== EmpresaGestora::class || $ordem->owner_id !== $empresa->id) {
            abort(403, 'Esta ordem não pertence à sua empresa.');
        }

        $ordem->load(['feature', 'pacote', 'factura', 'pagamentos' => fn ($q) => $q->orderByDesc('created_at')]);

        return Inertia::render('Ordens/Show', [
            'ordem' => [
                'id' => $ordem->id,
                'numero' => $ordem->numero,
                'tipo_item' => $ordem->tipo_item,
                'tipo_item_label' => $ordem->tipo_item_label,
                'descricao_item' => $ordem->descricao_item,
                'meses_contratados' => $ordem->meses_contratados,
                'valor_base' => (float) $ordem->valor_base,
                'valor_activacao' => (float) $ordem->valor_activacao,
                'valor_iva' => (float) $ordem->valor_iva,
                'valor_total' => (float) $ordem->valor_total,
                'estado' => $ordem->estado,
                'estado_label' => $ordem->estado_label,
                'prazo_pagamento' => $ordem->prazo_pagamento?->toIso8601String(),
                'aprovada_em' => $ordem->aprovada_em?->toIso8601String(),
                'rejeitada_em' => $ordem->rejeitada_em?->toIso8601String(),
                'cancelada_em' => $ordem->cancelada_em?->toIso8601String(),
                'motivo_rejeicao' => $ordem->motivo_rejeicao,
                'notas_cliente' => $ordem->notas_cliente,
                'total_pago' => $ordem->totalPago(),
                'saldo_em_falta' => $ordem->saldoEmFalta(),
                'expirou' => $ordem->expirou(),
                'pode_cancelar' => $ordem->podeSerCancelada(),
                'esta_aprovada' => $ordem->estaAprovada(),
                'esta_totalmente_paga' => $ordem->estaTotalmentePaga(),
                'created_at' => $ordem->created_at->toIso8601String(),
                'feature' => $ordem->feature ? [
                    'slug' => $ordem->feature->slug,
                    'nome' => $ordem->feature->nome,
                    'unidade' => $ordem->feature->unidade,
                ] : null,
                'pacote' => $ordem->pacote ? [
                    'nome' => $ordem->pacote->nome,
                    'quantidade' => $ordem->pacote->quantidade,
                ] : null,
                'factura' => $ordem->factura ? [
                    'id' => $ordem->factura->id,
                    'numero' => $ordem->factura->numero,
                    'tipo_documento_label' => $ordem->factura->tipo_documento_label,
                    'data_emissao' => $ordem->factura->data_emissao?->format('Y-m-d'),
                ] : null,
                'pagamentos' => $ordem->pagamentos->map(fn (Pagamento $p) => [
                    'id' => $p->id,
                    'referencia' => $p->referencia,
                    'metodo_label' => $p->metodo_label,
                    'valor' => (float) $p->valor,
                    'moeda' => $p->moeda,
                    'estado' => $p->estado,
                    'estado_label' => $p->estado_label,
                    'data_transacao' => $p->data_transacao?->format('Y-m-d'),
                    'tem_comprovativo' => $p->temComprovativo(),
                    'comprovativo_nome' => $p->comprovativo_original_name,
                    'comprovativo_tamanho' => $p->comprovativo_tamanho_formatado,
                    'motivo_rejeicao' => $p->motivo_rejeicao,
                    'created_at' => $p->created_at->toIso8601String(),
                ]),
            ],
            'dados_bancarios' => $this->dadosBancariosOndaka(),
            'referencia_proxypay' => (function () use ($ordem) {
                $ref = \App\Domains\Payment\Models\PagamentoReferencia::where('ordem_compra_id', $ordem->id)
                    ->whereIn('status', ['activa', 'paga'])
                    ->latest()
                    ->first();
                if (! $ref) {
                    return null;
                }
                return [
                    'id' => $ref->id,
                    'reference_id' => $ref->reference_id,
                    'reference_formatada' => $ref->reference_formatada,
                    'entity_id' => $ref->entity_id,
                    'entity_formatada' => $ref->entity_formatada,
                    'amount' => (float) $ref->amount,
                    'status' => $ref->status,
                    'status_label' => $ref->status_label,
                    'expira_em' => $ref->expira_em->toIso8601String(),
                    'expirada' => $ref->estaExpirada(),
                    'pago_em' => $ref->pago_em?->toIso8601String(),
                    'terminal_type' => $ref->terminal_type,
                ];
            })(),
        ]);
    }

    /**
     * Cancelar ordem (cliente).
     */
    public function cancelar(Request $request, OrdemCompra $ordem): RedirectResponse
    {
        $empresa = $this->empresaActual($request);

        if ($ordem->owner_type !== EmpresaGestora::class || $ordem->owner_id !== $empresa->id) {
            abort(403);
        }

        if (! $ordem->podeSerCancelada()) {
            return back()->with('error', 'Esta ordem não pode ser cancelada no estado actual.');
        }

        $motivo = $request->input('motivo', 'Cancelada pelo cliente');

        try {
            $this->orderService->cancelar($ordem, $motivo);
        } catch (\Throwable $e) {
            return back()->with('error', 'Erro ao cancelar: '.$e->getMessage());
        }

        return redirect()
            ->route('ordens.minhas')
            ->with('success', 'Ordem '.$ordem->numero.' cancelada.');
    }

    /* ============================================
       HELPERS
       ============================================ */


    /**
     * Gera uma referência ProxyPay RPS para uma ordem pendente.
     * Chamado por POST /ordens/{ordem}/gerar-referencia.
     */
    public function gerarReferenciaProxyPay(Request $request, OrdemCompra $ordem): RedirectResponse
    {
        $empresa = $this->empresaActual($request);

        if ($ordem->owner_type !== EmpresaGestora::class || $ordem->owner_id !== $empresa->id) {
            abort(403, 'Esta ordem não pertence à sua empresa.');
        }

        if ($ordem->estado === 'aprovada') {
            return back()->with('error', 'Esta ordem já foi aprovada.');
        }

        if (in_array($ordem->estado, ['rejeitada', 'cancelada', 'expirada'])) {
            return back()->with('error', "Esta ordem está {$ordem->estado_label}.");
        }

        try {
            $ref = $this->proxyPay->criarReferenciaParaOrdem($ordem);

            return back()->with(
                'success',
                "Referência gerada: {$ref->reference_formatada} (entity {$ref->entity_formatada}). Válida até {$ref->expira_em->format('d/m/Y')}."
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Erro a gerar referência ProxyPay UI', [
                'ordem_id' => $ordem->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Não foi possível gerar a referência. Tenta novamente em alguns minutos ou contacta o suporte.');
        }
    }
    private function empresaActual(Request $request): EmpresaGestora
    {
        $user = $request->user();
        $empresa = $user?->empresaGestora;

        if (! $empresa) {
            abort(403, 'Sem empresa associada.');
        }

        return $empresa;
    }

    /**
     * Dados bancários para transferência (apresentados ao cliente).
     * Configuráveis depois em settings.
     */
    private function dadosBancariosOndaka(): array
    {
        return [
            'beneficiario' => 'Soluções Simples, Lda',
            'nif' => config('ondaka.nif', '5417012345'),
            'banco' => config('ondaka.banco_nome', 'Banco de Fomento Angola (BFA)'),
            'iban' => config('ondaka.iban', 'AO06 0006 0000 0000 0000 0000 0'),
            'moeda' => 'AOA',
            'observacao' => 'Por favor indicar o número da ordem (ex: ORD-2026-000001) na descrição da transferência.',
        ];
    }
}
