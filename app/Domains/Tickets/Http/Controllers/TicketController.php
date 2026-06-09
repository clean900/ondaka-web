<?php

declare(strict_types=1);

namespace App\Domains\Tickets\Http\Controllers;

use App\Domains\Tickets\Http\Requests\ComentarTicketRequest;
use App\Domains\Tickets\Http\Requests\CriarTicketRequest;
use App\Domains\Tickets\Http\Requests\MudarEstadoTicketRequest;
use App\Domains\Tickets\Models\Ticket;
use App\Domains\Tickets\Services\TicketService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * API — Tickets do condomínio.
 *
 * Permissões:
 *   - Condomino: cria, vê só os seus, comenta thread pública
 *   - Admin/Gestor: vê todos do condomínio, gere estado/atribuição/notas internas
 */
class TicketController extends Controller
{
    public function __construct(protected TicketService $service) {}

    /**
     * GET /api/tickets
     * Lista tickets visíveis ao user (condomino vê só os seus).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Ticket::with(['abertoPor:id,name', 'fraccao:id,identificador', 'atribuidoA:id,name'])
            ->paraEmpresa($user->empresa_gestora_id)
            ->orderBy('created_at', 'desc');

        // Condomino vê apenas os seus
        if ($user->hasRole('condomino')) {
            $query->where('aberto_por_user_id', $user->id);
        }

        // Filtros opcionais
        if ($estado = $request->query('estado')) {
            $query->where('estado', $estado);
        }
        if ($categoria = $request->query('categoria')) {
            $query->where('categoria', $categoria);
        }
        if ($prioridade = $request->query('prioridade')) {
            $query->where('prioridade', $prioridade);
        }

        $perPage = min((int) $request->query('per_page', 20), 100);
        $paginada = $query->paginate($perPage);

        return response()->json([
            'data' => $paginada->items(),
            'meta' => [
                'current_page' => $paginada->currentPage(),
                'last_page'    => $paginada->lastPage(),
                'total'        => $paginada->total(),
                'per_page'     => $paginada->perPage(),
            ],
        ]);
    }

    /**
     * GET /api/tickets/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $ticket = Ticket::with([
            'abertoPor:id,name',
            'atribuidoA:id,name',
            'fraccao:id,identificador',
            'condominio:id,nome',
            'fotos',
        ])
            ->paraEmpresa($user->empresa_gestora_id)
            ->findOrFail($id);

        // Condomino só vê os seus
        if ($user->hasRole('condomino') && $ticket->aberto_por_user_id !== $user->id) {
            abort(403, 'Sem acesso a este ticket.');
        }

        // Comentários: condomino vê só públicos
        $comentarios = $user->hasRole('condomino')
            ? $ticket->comentariosPublicos()->with('user:id,name')->get()
            : $ticket->comentarios()->with('user:id,name')->get();

        return response()->json([
            'data' => array_merge($ticket->toArray(), [
                'comentarios' => $comentarios,
            ]),
        ]);
    }

    /**
     * POST /api/tickets
     */
    public function store(CriarTicketRequest $request): JsonResponse
    {
        $user = $request->user();
        $ticket = $this->service->criar($request->validated(), $user);

        // Upload de fotos (se houver)
        if ($request->hasFile('fotos')) {
            foreach ($request->file('fotos') as $foto) {
                $path = $foto->store("tickets/{$ticket->id}", 'public');
                $ticket->fotos()->create([
                    'uploaded_by_user_id' => $user->id,
                    'path'                => $path,
                    'nome_original'       => $foto->getClientOriginalName(),
                    'mime_type'           => $foto->getMimeType(),
                    'tamanho_bytes'       => $foto->getSize(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Ticket criado com sucesso.',
            'data'    => $ticket->fresh(['fotos', 'abertoPor:id,name', 'fraccao:id,identificador']),
        ], 201);
    }

    /**
     * POST /api/tickets/{id}/comentarios
     */
    public function comentar(ComentarTicketRequest $request, int $id): JsonResponse
    {
        $user = $request->user();
        $ticket = Ticket::paraEmpresa($user->empresa_gestora_id)->findOrFail($id);

        $comentario = $this->service->comentar(
            ticket: $ticket,
            autor: $user,
            mensagem: $request->input('mensagem'),
            publico: (bool) $request->input('publico', true),
        );

        return response()->json([
            'message' => 'Comentário adicionado.',
            'data'    => $comentario->fresh(['user:id,name']),
        ], 201);
    }

    /**
     * PATCH /api/tickets/{id}/estado
     */
    public function mudarEstado(MudarEstadoTicketRequest $request, int $id): JsonResponse
    {
        $user = $request->user();
        $ticket = Ticket::paraEmpresa($user->empresa_gestora_id)->findOrFail($id);

        $ticket = $this->service->mudarEstado(
            ticket: $ticket,
            novoEstado: $request->input('estado'),
            por: $user,
            observacao: $request->input('observacao'),
        );

        return response()->json([
            'message' => 'Estado actualizado.',
            'data'    => $ticket,
        ]);
    }

    /**
     * POST /api/tickets/{id}/cancelar
     */
    public function cancelar(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $ticket = Ticket::paraEmpresa($user->empresa_gestora_id)->findOrFail($id);

        try {
            $ticket = $this->service->cancelar($ticket, $user, $request->input('motivo'));
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }

        return response()->json([
            'message' => 'Ticket cancelado.',
            'data'    => $ticket,
        ]);
    }
    /**
     * POST /api/tickets/{id}/apoiar
     * Toggle apoio (heart) em pedido publico.
     */
    public function apoiar(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $ticket = Ticket::where('id', $id)
            ->where('empresa_gestora_id', $user->empresa_gestora_id)
            ->where('tipo', 'publico')
            ->firstOrFail();
        $existente = \DB::table('pedidos_apoios')
            ->where('ticket_id', $ticket->id)
            ->where('user_id', $user->id)
            ->first();
        if ($existente) {
            \DB::table('pedidos_apoios')
                ->where('ticket_id', $ticket->id)
                ->where('user_id', $user->id)
                ->delete();
            $apoiado = false;
        } else {
            \DB::table('pedidos_apoios')->insert([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'created_at' => now(),
            ]);
            $apoiado = true;
        }
        $total = \DB::table('pedidos_apoios')->where('ticket_id', $ticket->id)->count();
        return response()->json([
            'apoiado' => $apoiado,
            'total_apoios' => $total,
        ]);
    }
    /**
     * PATCH /api/tickets/{id}/atribuir
     * Atribui a colaborador (modo=user) ou empresa prestadora (modo=empresa) ou remove (modo=remover).
     */
    public function atribuir(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'modo' => ['nullable', 'in:user,empresa,remover'],
            'atribuido_a_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'atribuido_a_empresa_id' => ['nullable', 'integer', 'exists:empresas_prestadoras,id'],
        ]);
        $user = $request->user();
        $ticket = Ticket::paraEmpresa($user->empresa_gestora_id)->findOrFail($id);
        $modo = $request->input('modo');
        if (! $modo) {
            if ($request->filled('atribuido_a_user_id')) $modo = 'user';
            elseif ($request->filled('atribuido_a_empresa_id')) $modo = 'empresa';
            else $modo = 'remover';
        }
        if ($modo === 'user') {
            $userId = $request->input('atribuido_a_user_id');
            if (! $userId) {
                return response()->json(['message' => 'User obrigatorio.'], 422);
            }
            $userAtribuido = \App\Models\User::find($userId);
            if (! $userAtribuido || $userAtribuido->empresa_gestora_id !== $user->empresa_gestora_id) {
                return response()->json(['message' => 'User invalido.'], 422);
            }
            $ticket->update([
                'atribuido_a_user_id' => $userId,
                'atribuido_a_empresa_id' => null,
                'atribuido_em' => now(),
            ]);
            return response()->json([
                'message' => 'Pedido atribuido ao utilizador.',
                'data' => $ticket->fresh(),
            ]);
        }
        if ($modo === 'empresa') {
            $empId = $request->input('atribuido_a_empresa_id');
            if (! $empId) {
                return response()->json(['message' => 'Empresa obrigatoria.'], 422);
            }
            $empAtr = \App\Domains\Tickets\Models\EmpresaPrestadora::where('id', $empId)
                ->where('empresa_gestora_id', $user->empresa_gestora_id)
                ->first();
            if (! $empAtr) {
                return response()->json(['message' => 'Empresa invalida.'], 422);
            }
            $ticket->update([
                'atribuido_a_empresa_id' => $empId,
                'atribuido_a_user_id' => null,
                'atribuido_em' => now(),
            ]);
            return response()->json([
                'message' => 'Pedido atribuido a empresa prestadora.',
                'data' => $ticket->fresh(),
            ]);
        }
        $ticket->update([
            'atribuido_a_user_id' => null,
            'atribuido_a_empresa_id' => null,
            'atribuido_em' => null,
        ]);
        return response()->json([
            'message' => 'Atribuicao removida.',
            'data' => $ticket->fresh(),
        ]);
    }
    /**
     * GET /api/tickets/categorias
     * Lista categorias da empresa do user (para o wizard mobile).
     */
    public function categorias(Request $request): JsonResponse
    {
        $user = $request->user();
        $categorias = \App\Domains\Tickets\Models\CategoriaPedido::paraEmpresa($user->empresa_gestora_id)
            ->where('ativo', true)->orderBy('ordem')->orderBy('nome')
            ->get(['id', 'nome', 'slug', 'icone', 'tipo', 'ordem']);
        return response()->json([
            'categorias' => $categorias,
        ]);
    }
}
