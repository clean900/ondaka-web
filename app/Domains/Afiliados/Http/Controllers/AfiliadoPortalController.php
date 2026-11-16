<?php

declare(strict_types=1);

namespace App\Domains\Afiliados\Http\Controllers;

use App\Domains\Afiliados\Models\Afiliado;
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
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Portal do afiliado (/afiliado/*): painel, clientes, comissões, pagamentos, dados.
 */
class AfiliadoPortalController extends Controller
{
    public function __construct(
        protected AfiliadoService $service,
        protected AfiliadoComissaoService $comissoes,
        protected AfiliadoEstatisticasService $stats,
        protected AfiliadoConfigService $config,
    ) {}

    protected function resolver(Request $request): Afiliado|RedirectResponse
    {
        $user = $request->user();
        if ($user->hasRole('super-admin')) {
            return redirect()->route('super-admin.afiliados.index');
        }
        $af = $this->service->doUser($user);

        return $af ?: redirect()->route('afiliado.aderir');
    }

    // -----------------------------------------------------------------
    // Adesão (utilizador já autenticado — ex.: gestor de empresa cliente)
    // -----------------------------------------------------------------

    public function aderir(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        if ($user->hasRole('super-admin')) {
            return redirect()->route('super-admin.afiliados.index');
        }
        if ($this->service->doUser($user)) {
            return redirect()->route('afiliado.index');
        }
        $empresa = $user->empresa_gestora_id ? EmpresaGestora::find($user->empresa_gestora_id) : null;

        return Inertia::render('Afiliado/Aderir', [
            'config' => $this->config->publico(),
            'empresa' => $empresa ? ['id' => $empresa->id, 'nome' => $empresa->nome, 'nif' => $empresa->nif] : null,
            'user' => ['name' => $user->name, 'email' => $user->email, 'telefone' => $user->telefone, 'nif' => $user->nif],
        ]);
    }

    public function aderirStore(Request $request): RedirectResponse
    {
        if (! $this->config->programaActivo()) {
            return back()->with('error', 'O programa de afiliados não está a aceitar adesões de momento.');
        }
        $user = $request->user();
        if ($user->hasRole('super-admin')) {
            return back()->with('error', 'O super-admin não pode ser afiliado.');
        }
        $dados = $request->validate([
            'tipo' => 'required|in:particular,empresa',
            'nome' => 'nullable|string|min:3|max:150',
            'nif' => 'nullable|string|max:30',
            'telefone' => 'nullable|string|max:30',
            'iban' => 'nullable|string|max:40',
            'banco' => 'nullable|string|max:100',
            'titular_conta' => 'nullable|string|max:150',
            'como_divulga' => 'nullable|string|max:1000',
            'aceita_termos' => 'required|accepted',
        ], ['aceita_termos.accepted' => 'Deve aceitar as regras do programa.']);

        $af = $this->service->aderir($user, $dados);

        return redirect()->route('afiliado.index')->with('success', $af->estaActivo()
            ? "Adesão concluída! O seu código de afiliado é {$af->codigo}."
            : 'Adesão registada! Avisamos por email assim que for aprovada.');
    }

    // -----------------------------------------------------------------
    // Portal
    // -----------------------------------------------------------------

    public function index(Request $request): Response|RedirectResponse
    {
        $af = $this->resolver($request);
        if ($af instanceof RedirectResponse) {
            return $af;
        }

        return Inertia::render('Afiliado/Index', [
            'afiliado' => $this->stats->serializarAfiliado($af),
            'resumo' => $this->stats->resumoAfiliado($af),
            'config' => $this->config->publico(),
            'ultimas_comissoes' => $this->stats->comissoesQuery($af)->limit(8)->get()->map(fn ($c) => $this->stats->serializarComissao($c))->values()->all(),
            'clientes_recentes' => array_slice($this->stats->clientesDoAfiliado($af), 0, 6),
            'materiais' => $this->materiais($af),
        ]);
    }

    /** Os textos prontos a enviar — ver AfiliadoService::materiais(). */
    protected function materiais(Afiliado $af): array
    {
        return $this->service->materiais($af);
    }

    public function clientes(Request $request): Response|RedirectResponse
    {
        $af = $this->resolver($request);
        if ($af instanceof RedirectResponse) {
            return $af;
        }

        return Inertia::render('Afiliado/Clientes', [
            'afiliado' => $this->stats->serializarAfiliado($af),
            'resumo' => $this->stats->resumoAfiliado($af),
            'clientes' => $this->stats->clientesDoAfiliado($af),
            'config' => $this->config->publico(),
        ]);
    }

    public function comissoes(Request $request): Response|RedirectResponse
    {
        $af = $this->resolver($request);
        if ($af instanceof RedirectResponse) {
            return $af;
        }
        $filtros = $request->only(['estado', 'origem', 'de', 'ate', 'busca']);
        $query = $this->stats->comissoesQuery($af, $filtros);
        $totais = $this->stats->totaisComissoes($query);
        $comissoes = $query->paginate(25)->withQueryString()->through(fn ($c) => $this->stats->serializarComissao($c));

        return Inertia::render('Afiliado/Comissoes', [
            'afiliado' => $this->stats->serializarAfiliado($af),
            'comissoes' => $comissoes,
            'totais' => $totais,
            'filtros' => $filtros,
            'config' => $this->config->publico(),
        ]);
    }

    public function pagamentos(Request $request): Response|RedirectResponse
    {
        $af = $this->resolver($request);
        if ($af instanceof RedirectResponse) {
            return $af;
        }
        $pagamentos = AfiliadoPagamento::where('afiliado_id', $af->id)
            ->with('comissoes:id,afiliado_pagamento_id,descricao,origem_numero,valor_comissao_kz,empresa_gestora_id')
            ->orderByDesc('pago_em')->orderByDesc('id')
            ->get()
            ->map(function (AfiliadoPagamento $p) {
                $d = $this->stats->serializarPagamento($p);
                $d['comissoes'] = $p->comissoes->map(fn ($c) => [
                    'id' => $c->id,
                    'descricao' => $c->descricao,
                    'origem_numero' => $c->origem_numero,
                    'valor_comissao_kz' => $this->stats->dec($c->valor_comissao_kz),
                ])->values()->all();

                return $d;
            })->values()->all();

        return Inertia::render('Afiliado/Pagamentos', [
            'afiliado' => $this->stats->serializarAfiliado($af),
            'resumo' => $this->stats->resumoAfiliado($af),
            'pagamentos' => $pagamentos,
            'config' => $this->config->publico(),
        ]);
    }

    public function comprovativo(Request $request, AfiliadoPagamento $pagamento): HttpResponse
    {
        $user = $request->user();
        $af = $this->service->doUser($user);
        if (! $user->hasRole('super-admin') && (! $af || (int) $pagamento->afiliado_id !== (int) $af->id)) {
            abort(403);
        }
        if (! $pagamento->comprovativo_path || ! Storage::disk('local')->exists($pagamento->comprovativo_path)) {
            abort(404, 'Comprovativo não encontrado.');
        }

        return response(Storage::disk('local')->get($pagamento->comprovativo_path), 200, [
            'Content-Type' => $pagamento->comprovativo_mime ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="'.($pagamento->comprovativo_nome ?: basename($pagamento->comprovativo_path)).'"',
            'Cache-Control' => 'private, max-age=0',
        ]);
    }

    /**
     * A apresentação do programa, DENTRO do painel — para o afiliado a mostrar
     * a quem está a tentar trazer, sem sair do sítio nem andar à procura de um
     * ficheiro no email.
     *
     * Porquê uma moldura e não a apresentação reescrita aqui: ela é um
     * documento autónomo, com estilo próprio, navegação própria e os quatro
     * tutoriais em vídeo lá dentro. Trazê-la para React punha dois estilos a
     * brigar e obrigava a repetir o trabalho de cada vez que a apresentação
     * mudasse. Assim há um só original — o que o construir.py produz.
     */
    public function apresentacao(Request $request): Response|RedirectResponse
    {
        $af = $this->resolver($request);
        if ($af instanceof RedirectResponse) {
            return $af;
        }

        return Inertia::render('Afiliado/Apresentacao', [
            'afiliado' => $this->stats->serializarAfiliado($af),
            'config' => $this->config->publico(),
            'url' => (string) config('ondaka.afiliados.apresentacao_url'),
        ]);
    }

    public function dados(Request $request): Response|RedirectResponse
    {
        $af = $this->resolver($request);
        if ($af instanceof RedirectResponse) {
            return $af;
        }

        return Inertia::render('Afiliado/Dados', [
            'afiliado' => $this->stats->serializarAfiliado($af),
            'config' => $this->config->publico(),
        ]);
    }

    public function dadosGuardar(Request $request): RedirectResponse
    {
        $af = $this->resolver($request);
        if ($af instanceof RedirectResponse) {
            return $af;
        }
        $dados = $request->validate([
            'nome' => 'required|string|min:3|max:150',
            'tipo' => 'required|in:particular,empresa',
            'nif' => 'nullable|string|max:30',
            'telefone' => 'nullable|string|max:30',
            'iban' => 'nullable|string|max:40',
            'banco' => 'nullable|string|max:100',
            'titular_conta' => 'nullable|string|max:150',
            'como_divulga' => 'nullable|string|max:1000',
        ]);
        $this->service->actualizarDados($af, $dados);

        return back()->with('success', 'Dados actualizados.');
    }
}
