<?php

declare(strict_types=1);

namespace App\Domains\Tickets\Http\Controllers\Web;

use App\Domains\Tickets\Models\Ticket;
use App\Domains\Tickets\Models\CategoriaPedido;
use App\Domains\Tickets\Services\TicketService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TicketsWebController extends Controller
{
    public function __construct(protected TicketService $service) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Ticket::with([
            'abertoPor:id,name',
            'fraccao:id,identificador',
            'atribuidoA:id,name',
            'condominio:id,nome',
        ])
            ->paraEmpresa($user->empresa_gestora_id)
            ->orderBy('created_at', 'desc');

        if ($estado = $request->query('estado')) {
            $query->where('estado', $estado);
        }
        if ($categoria = $request->query('categoria')) {
            $query->where('categoria', $categoria);
        }
        if ($prioridade = $request->query('prioridade')) {
            $query->where('prioridade', $prioridade);
        }
        if ($busca = $request->query('busca')) {
            $query->where(function ($q) use ($busca) {
                $q->where('titulo', 'LIKE', "%$busca%")
                    ->orWhere('descricao', 'LIKE', "%$busca%");
            });
        }

        $tickets = $query->paginate(20)->withQueryString();

        $categoriasParticulares = CategoriaPedido::paraEmpresa($user->empresa_gestora_id)
            ->where('tipo', 'particular')->where('ativo', true)
            ->orderBy('ordem')->orderBy('nome')
            ->get(['id', 'nome', 'slug', 'icone', 'tipo', 'ordem']);

        $categoriasPublicas = CategoriaPedido::paraEmpresa($user->empresa_gestora_id)
            ->where('tipo', 'publico')->where('ativo', true)
            ->orderBy('ordem')->orderBy('nome')
            ->get(['id', 'nome', 'slug', 'icone', 'tipo', 'ordem']);

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
            'filtros' => $request->only(['estado', 'categoria', 'prioridade', 'busca']),
            'categoriasParticulares' => $categoriasParticulares,
            'categoriasPublicas' => $categoriasPublicas,
        ]);
    }

    public function show(Request $request, string $id): Response
    {
        $user = $request->user();

        $ticket = Ticket::with([
            'abertoPor:id,name,email',
            'atribuidoA:id,name,email',
            'fraccao:id,identificador,piso',
            'condominio:id,nome',
            'fotos',
            'comentarios.user:id,name',
        ])
            ->paraEmpresa($user->empresa_gestora_id)
            ->findOrFail($id);

        return Inertia::render('Tickets/Show', [
            'ticket' => $ticket,
        ]);
    }

    /**
     * POST /tickets/{id}/comentarios
     */
    public function comentar(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'mensagem' => ['required', 'string', 'min:2', 'max:5000'],
            'publico'  => ['nullable', 'boolean'],
        ]);

        $user = $request->user();
        $ticket = Ticket::paraEmpresa($user->empresa_gestora_id)->findOrFail($id);

        $this->service->comentar(
            ticket: $ticket,
            autor: $user,
            mensagem: $request->input('mensagem'),
            publico: (bool) $request->input('publico', true),
        );

        return back()->with('success', 'Comentário adicionado.');
    }

    /**
     * PATCH /tickets/{id}/estado
     */
    public function mudarEstado(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'estado' => ['required', 'string', 'in:aberto,em_analise,em_curso,resolvido,fechado,cancelado'],
            'observacao' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $request->user();
        $ticket = Ticket::paraEmpresa($user->empresa_gestora_id)->findOrFail($id);

        $this->service->mudarEstado(
            ticket: $ticket,
            novoEstado: $request->input('estado'),
            por: $user,
            observacao: $request->input('observacao'),
        );

        return back()->with('success', 'Estado actualizado.');
    }

    public function pesquisarCondominos(Request $request)
    {
        $user = $request->user();
        if (! $user->condominio_activo_id) {
            return response()->json(['data' => []]);
        }

        // Carregar TODOS os condominos com contrato activo neste condominio
        $condominos = \App\Domains\Condomino\Models\Condomino::query()
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->whereHas('contratosActivos', function ($cq) use ($user) {
                $cq->whereHas('fraccao', fn ($fq) => $fq->where('condominio_id', $user->condominio_activo_id));
            })
            ->with([
                'contratosActivos' => function ($cq) use ($user) {
                    $cq->whereHas('fraccao', fn ($fq) => $fq->where('condominio_id', $user->condominio_activo_id))
                       ->with('fraccao:id,identificador,edificio_id');
                }
            ])
            ->orderBy('nome_completo')
            ->get(['id', 'nome_completo']);

        // Devolver uma entrada por (condomino + fraccao) — um condomino pode ter varios imoveis
        $resultado = [];
        foreach ($condominos as $c) {
            foreach ($c->contratosActivos as $contrato) {
                if ($contrato->fraccao) {
                    $resultado[] = [
                        'id' => $c->id,
                        'nome_completo' => $c->nome_completo,
                        'fraccao_id' => $contrato->fraccao->id,
                        'fraccao_identificador' => $contrato->fraccao->identificador,
                    ];
                }
            }
        }

        return response()->json(['data' => $resultado]);
    }

}
