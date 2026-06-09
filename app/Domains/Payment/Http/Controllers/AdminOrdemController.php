<?php

declare(strict_types=1);

namespace App\Domains\Payment\Http\Controllers;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Payment\Models\OrdemCompra;
use App\Domains\Payment\Models\Pagamento;
use App\Domains\Payment\Services\OrderService;
use App\Domains\Payment\Services\PaymentService;
use App\Domains\Payment\Notifications\OrdemAprovadaNotification;
use App\Domains\Payment\Notifications\OrdemRejeitadaNotification;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class AdminOrdemController extends Controller
{
    public function __construct(
        protected OrderService $orderService,
        protected PaymentService $paymentService,
    ) {}

    /**
     * Listagem de ordens (super-admin vê todas).
     */
    public function index(Request $request): Response
    {
        $query = OrdemCompra::query()
            ->with([
                'feature:id,slug,nome',
                'pagamentos' => fn ($q) => $q->orderByDesc('created_at'),
            ])
            ->orderByDesc('created_at');

        // Filtros
        if ($estado = $request->input('estado')) {
            $query->where('estado', $estado);
        }

        if ($busca = $request->input('busca')) {
            $query->where(function ($q) use ($busca) {
                $q->where('numero', 'LIKE', "%{$busca}%")
                    ->orWhere('descricao_item', 'LIKE', "%{$busca}%");
            });
        }

        if ($request->input('apenas_pendentes')) {
            $query->whereIn('estado', ['pendente', 'em_revisao']);
        }

        $ordens = $query->paginate(20)->withQueryString();

        // Hidratar owner manualmente (polimórfico precisa de load extra)
        $ordens->getCollection()->load('owner');

        $ordens->getCollection()->transform(fn (OrdemCompra $o) => [
            'id' => $o->id,
            'numero' => $o->numero,
            'tipo_item' => $o->tipo_item,
            'tipo_item_label' => $o->tipo_item_label,
            'descricao_item' => $o->descricao_item,
            'valor_total' => (float) $o->valor_total,
            'estado' => $o->estado,
            'estado_label' => $o->estado_label,
            'owner' => [
                'tipo' => $o->owner_type === EmpresaGestora::class ? 'empresa' : 'condominio',
                'id' => $o->owner_id,
                'nome' => $o->owner?->nome ?? '—',
            ],
            'total_pago' => $o->totalPago(),
            'saldo_em_falta' => $o->saldoEmFalta(),
            'pagamentos_count' => $o->pagamentos->count(),
            'pagamentos_pendentes' => $o->pagamentos->whereIn('estado', ['registado', 'em_analise'])->count(),
            'prazo_pagamento' => $o->prazo_pagamento?->toIso8601String(),
            'expirou' => $o->expirou(),
            'created_at' => $o->created_at->toIso8601String(),
        ]);

        // Contadores globais
        $contadores = [
            'total' => OrdemCompra::count(),
            'pendentes' => OrdemCompra::whereIn('estado', ['pendente', 'em_revisao'])->count(),
            'em_analise' => OrdemCompra::where('estado', 'em_revisao')->count(),
            'aprovadas' => OrdemCompra::where('estado', 'aprovada')->count(),
            'rejeitadas' => OrdemCompra::where('estado', 'rejeitada')->count(),
            'valor_aprovado_total' => (float) OrdemCompra::where('estado', 'aprovada')->sum('valor_total'),
            'comprovativos_a_validar' => Pagamento::whereIn('estado', ['registado', 'em_analise'])->count(),
        ];

        return Inertia::render('Admin/Ordens/Index', [
            'ordens' => $ordens,
            'contadores' => $contadores,
            'filtros' => [
                'estado' => $request->input('estado'),
                'busca' => $request->input('busca'),
                'apenas_pendentes' => (bool) $request->input('apenas_pendentes'),
            ],
        ]);
    }

    /**
     * Ver detalhe de ordem (super-admin).
     */
    public function show(OrdemCompra $ordem): Response
    {
        $ordem->load(['feature', 'pacote', 'owner', 'factura', 'criadaPor', 'aprovadaPor', 'pagamentos' => fn ($q) => $q->orderByDesc('created_at')]);

        return Inertia::render('Admin/Ordens/Show', [
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
                'notas_admin' => $ordem->notas_admin,
                'total_pago' => $ordem->totalPago(),
                'saldo_em_falta' => $ordem->saldoEmFalta(),
                'expirou' => $ordem->expirou(),
                'pode_cancelar' => $ordem->podeSerCancelada(),
                'esta_aprovada' => $ordem->estaAprovada(),
                'esta_totalmente_paga' => $ordem->estaTotalmentePaga(),
                'created_at' => $ordem->created_at->toIso8601String(),
                'owner' => [
                    'tipo' => $ordem->owner_type === EmpresaGestora::class ? 'empresa' : 'condominio',
                    'id' => $ordem->owner_id,
                    'nome' => $ordem->owner?->nome ?? '—',
                    'nif' => $ordem->owner?->nif ?? null,
                    'email' => $ordem->owner?->email_contacto ?? $ordem->owner?->email ?? null,
                ],
                'feature' => $ordem->feature ? [
                    'slug' => $ordem->feature->slug,
                    'nome' => $ordem->feature->nome,
                    'unidade' => $ordem->feature->unidade,
                ] : null,
                'pacote' => $ordem->pacote ? [
                    'nome' => $ordem->pacote->nome,
                    'quantidade' => $ordem->pacote->quantidade,
                ] : null,
                'criada_por' => $ordem->criadaPor?->name,
                'aprovada_por' => $ordem->aprovadaPor?->name,
                'feature_subscription_id' => $ordem->feature_subscription_id,
                'factura' => $ordem->factura ? [
                    'id' => $ordem->factura->id,
                    'numero' => $ordem->factura->numero,
                    'tipo_documento_label' => $ordem->factura->tipo_documento_label,
                    'data_emissao' => $ordem->factura->data_emissao?->format('Y-m-d'),
                ] : null,
                'pagamentos' => $ordem->pagamentos->map(fn (Pagamento $p) => [
                    'id' => $p->id,
                    'referencia' => $p->referencia,
                    'metodo' => $p->metodo,
                    'metodo_label' => $p->metodo_label,
                    'valor' => (float) $p->valor,
                    'moeda' => $p->moeda,
                    'estado' => $p->estado,
                    'estado_label' => $p->estado_label,
                    'data_transacao' => $p->data_transacao?->format('Y-m-d'),
                    'referencia_externa' => $p->referencia_externa,
                    'banco_origem' => $p->banco_origem,
                    'nome_ordenante' => $p->nome_ordenante,
                    'tem_comprovativo' => $p->temComprovativo(),
                    'comprovativo_nome' => $p->comprovativo_original_name,
                    'comprovativo_tamanho' => $p->comprovativo_tamanho_formatado,
                    'notas' => $p->notas,
                    'motivo_rejeicao' => $p->motivo_rejeicao,
                    'confirmado_em' => $p->confirmado_em?->toIso8601String(),
                    'rejeitado_em' => $p->rejeitado_em?->toIso8601String(),
                    'created_at' => $p->created_at->toIso8601String(),
                ]),
            ],
        ]);
    }

    /**
     * Confirmar pagamento (super-admin). Se ordem fica totalmente paga, aprova automaticamente.
     */
    public function confirmarPagamento(Request $request, OrdemCompra $ordem, Pagamento $pagamento): RedirectResponse
    {
        if ($pagamento->ordem_compra_id !== $ordem->id) {
            abort(404);
        }

        $data = $request->validate([
            'notas' => 'nullable|string|max:500',
        ]);

        try {
            $pagamentoConfirmado = $this->paymentService->confirmarPagamento(
                $pagamento,
                (int) auth()->id(),
                $data['notas'] ?? null,
            );
        } catch (\Throwable $e) {
            return back()->with('error', 'Erro ao confirmar: '.$e->getMessage());
        }

        // Se ordem foi aprovada automaticamente, enviar email ao cliente
        $ordemFresh = $ordem->fresh();
        if ($ordemFresh && $ordemFresh->estaAprovada() && ! $request->session()->has('email_aprovacao_enviado_'.$ordemFresh->id)) {
            $this->enviarEmailAprovacao($ordemFresh);
            $request->session()->put('email_aprovacao_enviado_'.$ordemFresh->id, true);
        }

        return back()->with('success', 'Pagamento '.$pagamentoConfirmado->referencia.' confirmado. '
            .($ordemFresh?->estaAprovada() ? 'Ordem aprovada e funcionalidade activada.' : 'Aguarda pagamento completo.'));
    }

    /**
     * Rejeitar pagamento.
     */
    public function rejeitarPagamento(Request $request, OrdemCompra $ordem, Pagamento $pagamento): RedirectResponse
    {
        if ($pagamento->ordem_compra_id !== $ordem->id) {
            abort(404);
        }

        $data = $request->validate([
            'motivo' => 'required|string|max:500',
        ]);

        try {
            $this->paymentService->rejeitarPagamento(
                $pagamento,
                (int) auth()->id(),
                $data['motivo'],
            );
        } catch (\Throwable $e) {
            return back()->with('error', 'Erro ao rejeitar pagamento: '.$e->getMessage());
        }

        return back()->with('success', 'Pagamento '.$pagamento->referencia.' rejeitado.');
    }

    /**
     * Aprovar directamente (caso excepcional - pagamento feito fora do sistema, etc).
     */
    public function aprovarDirecto(Request $request, OrdemCompra $ordem): RedirectResponse
    {
        $data = $request->validate([
            'notas_admin' => 'required|string|max:500',
        ]);

        try {
            $ordem = $this->orderService->aprovar(
                $ordem,
                (int) auth()->id(),
                '[Aprovação directa] '.$data['notas_admin'],
            );
        } catch (\Throwable $e) {
            return back()->with('error', 'Erro ao aprovar: '.$e->getMessage());
        }

        $this->enviarEmailAprovacao($ordem);

        return back()->with('success', 'Ordem '.$ordem->numero.' aprovada directamente. Cliente notificado.');
    }

    /**
     * Rejeitar ordem.
     */
    public function rejeitarOrdem(Request $request, OrdemCompra $ordem): RedirectResponse
    {
        $data = $request->validate([
            'motivo' => 'required|string|max:500',
        ]);

        try {
            $ordem = $this->orderService->rejeitar(
                $ordem,
                (int) auth()->id(),
                $data['motivo'],
            );
        } catch (\Throwable $e) {
            return back()->with('error', 'Erro ao rejeitar: '.$e->getMessage());
        }

        $this->enviarEmailRejeicao($ordem);

        return back()->with('success', 'Ordem '.$ordem->numero.' rejeitada. Cliente notificado.');
    }

    /* ============================================
       EMAILS
       ============================================ */

    private function enviarEmailAprovacao(OrdemCompra $ordem): void
    {
        $email = $this->resolverEmailOwner($ordem);
        if (! $email) return;

        try {
            Notification::route('mail', $email)
                ->notify(new OrdemAprovadaNotification($ordem));
        } catch (\Throwable $e) {
            \Log::warning("Falha ao enviar email aprovação ordem {$ordem->numero}: ".$e->getMessage());
        }
    }

    private function enviarEmailRejeicao(OrdemCompra $ordem): void
    {
        $email = $this->resolverEmailOwner($ordem);
        if (! $email) return;

        try {
            Notification::route('mail', $email)
                ->notify(new OrdemRejeitadaNotification($ordem));
        } catch (\Throwable $e) {
            \Log::warning("Falha ao enviar email rejeição ordem {$ordem->numero}: ".$e->getMessage());
        }
    }

    private function resolverEmailOwner(OrdemCompra $ordem): ?string
    {
        $owner = $ordem->owner;
        if (! $owner) return null;

        return $owner->email_contacto ?? $owner->email ?? null;
    }
}
