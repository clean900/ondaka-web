<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Http\Controllers;

use App\Domains\Afiliados\Models\Afiliado;
use App\Domains\Afiliados\Models\AfiliadoComissao;
use App\Domains\Afiliados\Models\AfiliadoPagamento;
use App\Domains\Afiliados\Services\AfiliadoComissaoService;
use App\Domains\Afiliados\Services\AfiliadoConfigService;
use App\Domains\Afiliados\Services\AfiliadoEstatisticasService;
use App\Domains\Afiliados\Services\AfiliadoService;
use App\Domains\Empresa\Models\EmpresaGestora;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Super-admin: gestão do Programa de Afiliados.
 */
class SuperAdminAfiliadosController extends Controller
{
    public function __construct(
        protected AfiliadoService $service,
        protected AfiliadoComissaoService $comissoes,
        protected AfiliadoEstatisticasService $stats,
        protected AfiliadoConfigService $config,
    ) {}

    // -----------------------------------------------------------------
    // Afiliados
    // -----------------------------------------------------------------

    public function index(Request $request): Response
    {
        $filtros = $request->only(['busca', 'estado']);

        return Inertia::render('SuperAdmin/Afiliados/Index', [
            'afiliados' => $this->stats->listaAfiliados($filtros),
            'resumo' => $this->stats->resumoGlobal(),
            'filtros' => $filtros,
            'config' => $this->config->publico(),
        ]);
    }

    public function show(Afiliado $afiliado): Response
    {
        $comissoesAprovadas = AfiliadoComissao::where('afiliado_id', $afiliado->id)
            ->where('estado', AfiliadoComissao::ESTADO_APROVADA)
            ->with('empresa:id,nome')
            ->orderBy('aprovada_em')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'descricao' => $c->descricao,
                'origem_numero' => $c->origem_numero,
                'empresa' => $c->empresa?->nome,
                'valor_comissao_kz' => $this->stats->dec($c->valor_comissao_kz),
                'aprovada_em' => $c->aprovada_em?->toDateString(),
            ])->values()->all();

        $pagamentos = AfiliadoPagamento::where('afiliado_id', $afiliado->id)
            ->with('registadoPor:id,name')
            ->orderByDesc('pago_em')->orderByDesc('id')
            ->get()
            ->map(fn ($p) => $this->stats->serializarPagamento($p))->values()->all();

        $empresasDisponiveis = EmpresaGestora::whereNull('afiliado_id')
            ->orderBy('nome')
            ->get(['id', 'nome', 'nif', 'tipo_cliente'])
            ->map(fn ($e) => ['id' => $e->id, 'nome' => $e->nome, 'nif' => $e->nif, 'tipo_cliente' => $e->tipo_cliente])
            ->values()->all();

        return Inertia::render('SuperAdmin/Afiliados/Show', [
            'afiliado' => $this->stats->serializarAfiliado($afiliado),
            'resumo' => $this->stats->resumoAfiliado($afiliado),
            'clientes' => $this->stats->clientesDoAfiliado($afiliado),
            'comissoes' => $this->stats->comissoesQuery($afiliado)->limit(100)->get()->map(fn ($c) => $this->stats->serializarComissao($c))->values()->all(),
            'comissoes_aprovadas' => $comissoesAprovadas,
            'pagamentos' => $pagamentos,
            'empresas_disponiveis' => $empresasDisponiveis,
            'config' => $this->config->publico(),
        ]);
    }

    public function aprovar(Afiliado $afiliado): RedirectResponse
    {
        $this->service->aprovar($afiliado, (int) Auth::id());

        return back()->with('success', "Afiliado {$afiliado->nome} aprovado. Código {$afiliado->codigo}.");
    }

    public function recusar(Request $request, Afiliado $afiliado): RedirectResponse
    {
        $request->validate(['motivo' => 'required|string|min:3|max:255']);
        $this->service->recusar($afiliado, (int) Auth::id(), (string) $request->input('motivo'));

        return back()->with('success', 'Candidatura recusada.');
    }

    public function suspender(Request $request, Afiliado $afiliado): RedirectResponse
    {
        $request->validate(['motivo' => 'required|string|min:3|max:255']);
        $this->service->suspender($afiliado, (int) Auth::id(), (string) $request->input('motivo'));

        return back()->with('success', 'Afiliado suspenso. Deixa de gerar comissões até ser reactivado.');
    }

    public function reactivar(Afiliado $afiliado): RedirectResponse
    {
        $this->service->aprovar($afiliado, (int) Auth::id());

        return back()->with('success', 'Afiliado reactivado.');
    }

    public function taxa(Request $request, Afiliado $afiliado): RedirectResponse
    {
        $request->validate(['taxa_manual_pct' => 'nullable|numeric|min:0|max:100']);
        try {
            $this->service->definirTaxaManual($afiliado, $request->input('taxa_manual_pct') !== null ? (string) $request->input('taxa_manual_pct') : null);
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', $afiliado->fresh()->taxa_manual_pct !== null
            ? 'Taxa manual definida: '.$afiliado->fresh()->taxa_actual_pct.'%.'
            : 'Taxa manual removida — volta ao nível automático ('.$afiliado->fresh()->taxa_actual_pct.'%).');
    }

    public function notas(Request $request, Afiliado $afiliado): RedirectResponse
    {
        $request->validate(['notas_admin' => 'nullable|string|max:2000']);
        $this->service->actualizarNotasAdmin($afiliado, $request->input('notas_admin'));

        return back()->with('success', 'Notas guardadas.');
    }

    public function atribuirCliente(Request $request, Afiliado $afiliado): RedirectResponse
    {
        $request->validate([
            'empresa_id' => 'required|integer|exists:empresas_gestoras,id',
            'notificar' => 'nullable|boolean',
        ]);
        $empresa = EmpresaGestora::findOrFail((int) $request->input('empresa_id'));
        try {
            $this->service->atribuirCliente($empresa, $afiliado, 'manual', (int) Auth::id(), $request->boolean('notificar', true));
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "{$empresa->nome} atribuído a {$afiliado->nome}.");
    }

    public function removerCliente(Request $request, Afiliado $afiliado): RedirectResponse
    {
        $request->validate(['empresa_id' => 'required|integer|exists:empresas_gestoras,id']);
        $empresa = EmpresaGestora::findOrFail((int) $request->input('empresa_id'));
        if ((int) $empresa->afiliado_id !== (int) $afiliado->id) {
            return back()->with('error', 'Este cliente não está atribuído a este afiliado.');
        }
        $this->service->removerAtribuicao($empresa, (int) Auth::id());

        return back()->with('success', "Atribuição de {$empresa->nome} removida. As comissões já geradas mantêm-se.");
    }

    // -----------------------------------------------------------------
    // Pagamentos
    // -----------------------------------------------------------------

    public function registarPagamento(Request $request, Afiliado $afiliado): RedirectResponse
    {
        $dados = $request->validate([
            'comissoes' => 'required|array|min:1',
            'comissoes.*' => 'integer',
            'retencao_pct' => 'nullable|numeric|min:0|max:100',
            'metodo' => 'required|in:transferencia_bancaria,deposito,multicaixa_express,outro',
            'referencia_bancaria' => 'nullable|string|max:100',
            'iban_destino' => 'nullable|string|max:40',
            'pago_em' => 'required|date',
            'notas' => 'nullable|string|max:1000',
            'comprovativo' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:5120',
        ], [
            'comissoes.required' => 'Seleccione pelo menos uma comissão aprovada.',
            'comprovativo.mimes' => 'Comprovativo: apenas PDF, JPG, PNG ou WEBP.',
        ]);

        try {
            $p = $this->comissoes->registarPagamento(
                $afiliado,
                $dados['comissoes'],
                $dados,
                (int) Auth::id(),
                $request->file('comprovativo'),
            );
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Pagamento {$p->numero} registado: ".number_format((float) $p->valor_liquido_kz, 2, ',', '.').' Kz líquidos.');
    }

    public function pagamentos(Request $request): Response
    {
        $filtros = $request->only(['afiliado_id', 'de', 'ate']);
        $q = AfiliadoPagamento::with(['afiliado:id,nome,codigo', 'registadoPor:id,name'])->orderByDesc('pago_em')->orderByDesc('id');
        if (! empty($filtros['afiliado_id'])) {
            $q->where('afiliado_id', (int) $filtros['afiliado_id']);
        }
        if (! empty($filtros['de'])) {
            $q->whereDate('pago_em', '>=', $filtros['de']);
        }
        if (! empty($filtros['ate'])) {
            $q->whereDate('pago_em', '<=', $filtros['ate']);
        }
        $totais = (clone $q)->reorder()->selectRaw('COUNT(*) as n, COALESCE(SUM(valor_bruto_kz),0) as bruto, COALESCE(SUM(retencao_valor_kz),0) as retencao, COALESCE(SUM(valor_liquido_kz),0) as liquido, COALESCE(SUM(num_comissoes),0) as comissoes')->first();

        return Inertia::render('SuperAdmin/Afiliados/Pagamentos', [
            'pagamentos' => $q->paginate(30)->withQueryString()->through(fn ($p) => $this->stats->serializarPagamento($p)),
            'totais' => [
                'n' => (int) ($totais->n ?? 0),
                'comissoes' => (int) ($totais->comissoes ?? 0),
                'bruto_kz' => $this->stats->dec($totais->bruto ?? 0),
                'retencao_kz' => $this->stats->dec($totais->retencao ?? 0),
                'liquido_kz' => $this->stats->dec($totais->liquido ?? 0),
            ],
            'filtros' => $filtros,
            'afiliados' => Afiliado::orderBy('nome')->get(['id', 'nome', 'codigo'])->map(fn ($a) => ['id' => $a->id, 'nome' => $a->nome, 'codigo' => $a->codigo])->values()->all(),
        ]);
    }

    public function comprovativo(AfiliadoPagamento $pagamento): HttpResponse
    {
        if (! $pagamento->comprovativo_path || ! Storage::disk('local')->exists($pagamento->comprovativo_path)) {
            abort(404, 'Comprovativo não encontrado.');
        }

        return response(Storage::disk('local')->get($pagamento->comprovativo_path), 200, [
            'Content-Type' => $pagamento->comprovativo_mime ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="'.($pagamento->comprovativo_nome ?: basename($pagamento->comprovativo_path)).'"',
            'Cache-Control' => 'private, max-age=0',
        ]);
    }

    // -----------------------------------------------------------------
    // Comissões (livro-razão global)
    // -----------------------------------------------------------------

    public function comissoes(Request $request): Response
    {
        $filtros = $request->only(['afiliado_id', 'empresa_id', 'estado', 'origem', 'de', 'ate', 'busca']);
        $query = $this->stats->comissoesQuery(null, $filtros);
        $totais = $this->stats->totaisComissoes($query);

        return Inertia::render('SuperAdmin/Afiliados/Comissoes', [
            'comissoes' => $query->paginate(30)->withQueryString()->through(fn ($c) => $this->stats->serializarComissao($c)),
            'totais' => $totais,
            'filtros' => $filtros,
            'afiliados' => Afiliado::orderBy('nome')->get(['id', 'nome', 'codigo'])->map(fn ($a) => ['id' => $a->id, 'nome' => $a->nome, 'codigo' => $a->codigo])->values()->all(),
            'config' => $this->config->publico(),
        ]);
    }

    public function exportarComissoes(Request $request): StreamedResponse
    {
        $filtros = $request->only(['afiliado_id', 'empresa_id', 'estado', 'origem', 'de', 'ate', 'busca']);
        $query = $this->stats->comissoesQuery(null, $filtros);
        $nome = 'comissoes-afiliados-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fprintf($out, "\xEF\xBB\xBF"); // BOM para Excel
            fputcsv($out, ['ID', 'Data', 'Afiliado', 'Código', 'Cliente', 'Origem', 'Documento', 'Descrição', 'Valor pago (c/ imposto)', 'Imposto', 'Base (s/ imposto)', 'Taxa %', 'Comissão', 'Nível', 'Estado', 'Disponível em', 'Aprovada em', 'Paga em', 'Pagamento'], ';');
            $query->chunk(500, function ($lote) use ($out) {
                foreach ($lote as $c) {
                    fputcsv($out, [
                        $c->id,
                        $c->created_at?->format('Y-m-d H:i'),
                        $c->afiliado?->nome,
                        $c->afiliado?->codigo,
                        $c->empresa?->nome,
                        $c->origem_label,
                        $c->origem_numero,
                        $c->descricao,
                        number_format((float) $c->valor_pago_total_kz, 2, ',', ''),
                        number_format((float) $c->valor_imposto_kz, 2, ',', ''),
                        number_format((float) $c->valor_base_kz, 2, ',', ''),
                        number_format((float) $c->taxa_pct, 2, ',', ''),
                        number_format((float) $c->valor_comissao_kz, 2, ',', ''),
                        $c->nivel,
                        $c->estado_label,
                        $c->disponivel_em?->format('Y-m-d'),
                        $c->aprovada_em?->format('Y-m-d'),
                        $c->paga_em?->format('Y-m-d'),
                        $c->pagamento?->numero,
                    ], ';');
                }
            });
            fclose($out);
        }, $nome, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function anularComissao(Request $request, AfiliadoComissao $comissao): RedirectResponse
    {
        $request->validate(['motivo' => 'required|string|min:3|max:255']);
        try {
            $this->comissoes->anular($comissao, (string) $request->input('motivo'), (int) Auth::id());
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Comissão anulada.');
    }

    public function aprovarComissao(AfiliadoComissao $comissao): RedirectResponse
    {
        if ($comissao->estado !== AfiliadoComissao::ESTADO_PENDENTE) {
            return back()->with('error', 'Só comissões em carência podem ser aprovadas manualmente.');
        }
        $this->comissoes->aprovar($comissao, (int) Auth::id());

        return back()->with('success', 'Comissão aprovada antes do fim da carência.');
    }

    // -----------------------------------------------------------------
    // Configuração
    // -----------------------------------------------------------------

    public function configForm(): Response
    {
        return Inertia::render('SuperAdmin/Afiliados/Config', [
            'valores' => $this->config->all(),
            'descricoes' => AfiliadoConfigService::DESCRICOES,
            'config' => $this->config->publico(),
        ]);
    }

    public function guardarConfig(Request $request): RedirectResponse
    {
        $dados = $request->validate([
            'afiliado_programa_activo' => 'required|boolean',
            'afiliado_taxa_base_pct' => 'required|numeric|min:0|max:100',
            'afiliado_taxa_prata_pct' => 'required|numeric|min:0|max:100',
            'afiliado_taxa_ouro_pct' => 'required|numeric|min:0|max:100',
            'afiliado_nivel_prata_clientes' => 'required|integer|min:1|max:10000',
            'afiliado_nivel_ouro_clientes' => 'required|integer|min:1|max:10000|gte:afiliado_nivel_prata_clientes',
            'afiliado_carencia_dias' => 'required|integer|min:0|max:365',
            'afiliado_pagamento_minimo_kz' => 'required|numeric|min:0',
            'afiliado_cookie_dias' => 'required|integer|min:1|max:730',
            'afiliado_duracao_meses' => 'required|integer|min:0|max:600',
            'afiliado_retencao_pct' => 'required|numeric|min:0|max:100',
            'afiliado_aprovacao_automatica' => 'required|boolean',
        ], [
            'afiliado_nivel_ouro_clientes.gte' => 'O nível Ouro exige pelo menos tantos clientes como o Prata.',
        ]);

        $this->config->guardar($dados);

        // Taxas mudaram → recalcular níveis/taxas de todos os afiliados activos
        Afiliado::where('estado', Afiliado::ESTADO_ACTIVO)->orderBy('id')->chunkById(100, function ($lote) {
            foreach ($lote as $af) {
                $this->service->recalcularNivel($af);
            }
        });

        return back()->with('success', 'Configuração do programa guardada e taxas recalculadas.');
    }
}
