<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Controllers;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Familiar\Support\CondominoResolver;
use App\Domains\Visitor\Http\Requests\CriarPreAprovacaoRequest;
use App\Domains\Visitor\Models\PreAprovacao;
use App\Domains\Visitor\Services\PreAprovacaoService;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

/**
 * API — acções do CONDÓMINO sobre pré-aprovações.
 *
 * Todas as rotas são protegidas por auth:sanctum.
 * O user autenticado (via token) deve ser um Condómino.
 */
class PreAprovacaoController extends Controller
{
    public function __construct(
        protected PreAprovacaoService $service,
    ) {}

    /**
     * Lista pré-aprovações do condómino autenticado.
     *
     * GET /api/pre-aprovacoes
     * Query params (opcionais):
     *   ?estado=pendente|usada|expirada|cancelada
     *   ?per_page=20 (default 20)
     */
    public function index(Request $request): JsonResponse
    {
        $condomino = $this->condominoOuAbort($request);

        $query = PreAprovacao::with(['fraccao', 'visitas'])
            ->where('condomino_id', $condomino->id)
            ->orderBy('created_at', 'desc');

        if ($estado = $request->query('estado')) {
            $query->where('estado', $estado);
        }

        $perPage = (int) $request->query('per_page', 20);
        $perPage = min($perPage, 100); // limitar max 100

        $paginada = $query->paginate($perPage);

        return response()->json([
            'data' => $paginada->items(),
            'meta' => [
                'current_page' => $paginada->currentPage(),
                'last_page' => $paginada->lastPage(),
                'total' => $paginada->total(),
                'per_page' => $paginada->perPage(),
            ],
        ]);
    }

    /**
     * Detalhe de uma pré-aprovação (incluindo QR token para mostrar QR code).
     *
     * GET /api/pre-aprovacoes/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $condomino = $this->condominoOuAbort($request);

        $pa = PreAprovacao::with(['fraccao', 'visitas.visitante'])
            ->where('id', $id)
            ->where('condomino_id', $condomino->id)
            ->first();

        if ($pa === null) {
            return response()->json([
                'message' => 'Pré-aprovação não encontrada.',
            ], 404);
        }

        return response()->json(['data' => $pa]);
    }

    /**
     * Cria nova pré-aprovação.
     *
     * POST /api/pre-aprovacoes
     * Body: CriarPreAprovacaoRequest
     */
    public function store(CriarPreAprovacaoRequest $request): JsonResponse
    {
        $condomino = $this->condominoOuAbort($request);

        try {
            $pa = $this->service->criar(
                condomino: $condomino,
                fraccaoId: (int) $request->input('fraccao_id'),
                nomeVisitante: $request->input('nome_visitante'),
                telefoneVisitante: $request->input('telefone_visitante'),
                validaAte: Carbon::parse($request->input('valida_ate')),
                validaDesde: $request->filled('valida_desde')
                    ? Carbon::parse($request->input('valida_desde'))
                    : null,
                observacoes: $request->input('observacoes'),
            );

            return response()->json([
                'message' => 'Pré-aprovação criada com sucesso.',
                'data' => $pa->load(['fraccao']),
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }


    /**
     * Cria pre-aprovacao em nome de um condomino especifico (admin/gestor).
     * Difere de store(): aqui o user actual NAO precisa ser condomino;
     * recebe condomino_id explicito e valida que pertence a empresa.
     */
    public function storeAdmin(Request $request): JsonResponse
    {
        $request->validate([
            'condomino_id' => 'required|integer|exists:condominos,id',
            'fraccao_id' => 'required|integer|exists:fraccoes,id',
            'nome_visitante' => 'required|string|min:2|max:150',
            'telefone_visitante' => 'required|string|max:20',
            'valida_ate' => 'required|date|after:now',
            'valida_desde' => 'nullable|date|before:valida_ate',
            'observacoes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $empresaId = $user->empresa_gestora_id;

        // Confirmar que o condomino pertence a empresa
        $condomino = \App\Domains\Condomino\Models\Condomino::where('id', $request->input('condomino_id'))
            ->where('empresa_gestora_id', $empresaId)
            ->firstOrFail();

        try {
            $pa = $this->service->criar(
                condomino: $condomino,
                fraccaoId: (int) $request->input('fraccao_id'),
                nomeVisitante: $request->input('nome_visitante'),
                telefoneVisitante: $request->input('telefone_visitante'),
                validaAte: \Carbon\Carbon::parse($request->input('valida_ate')),
                validaDesde: $request->filled('valida_desde')
                    ? \Carbon\Carbon::parse($request->input('valida_desde'))
                    : null,
                observacoes: $request->input('observacoes'),
            );

            return response()->json([
                'message' => 'Pre-aprovacao criada com sucesso (admin).',
                'data' => $pa->load(['fraccao', 'condomino.user']),
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Cancela uma pré-aprovação pendente.
     *
     * POST /api/pre-aprovacoes/{id}/cancelar
     */
    public function cancelar(Request $request, int $id): JsonResponse
    {
        $condomino = $this->condominoOuAbort($request);

        $pa = PreAprovacao::where('id', $id)
            ->where('condomino_id', $condomino->id)
            ->first();

        if ($pa === null) {
            return response()->json([
                'message' => 'Pré-aprovação não encontrada.',
            ], 404);
        }

        try {
            $this->service->cancelar($pa, $condomino);

            return response()->json([
                'message' => 'Pré-aprovação cancelada.',
                'data' => $pa->fresh(),
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }


    /**
     * Lista histórico de visitas das fracções do condomino.
     *
     * GET /api/pre-aprovacoes/visitas-historico
     * Query params (opcionais):
     *   ?desde=YYYY-MM-DD
     *   ?ate=YYYY-MM-DD
     *   ?nome=texto (LIKE no nome do visitante)
     *   ?metodo=qr|otp|manual
     *   ?per_page=20 (default 20, max 100)
     */
    public function historicoVisitas(Request $request): JsonResponse
    {
        $condomino = $this->condominoOuAbort($request);

        // Obter IDs das fracções onde o condomino tem contrato activo
        $fraccaoIds = $condomino->contratosActivos()->pluck('fraccao_id')->toArray();

        if (empty($fraccaoIds)) {
            return response()->json([
                'data' => [],
                'meta' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'total' => 0,
                    'per_page' => 20,
                ],
            ]);
        }

        $query = \App\Domains\Visitor\Models\Visita::with([
                'visitante',
                'fraccao',
                'guardaEntrada',
                'guardaSaida',
            ])
            ->whereIn('fraccao_id', $fraccaoIds)
            ->orderBy('entrou_em', 'desc');

        // Filtro: data desde
        if ($desde = $request->query('desde')) {
            try {
                $query->where('entrou_em', '>=', Carbon::parse($desde)->startOfDay());
            } catch (\Exception) {
                // ignora data inválida
            }
        }

        // Filtro: data ate
        if ($ate = $request->query('ate')) {
            try {
                $query->where('entrou_em', '<=', Carbon::parse($ate)->endOfDay());
            } catch (\Exception) {
                // ignora data inválida
            }
        }

        // Filtro: nome do visitante (LIKE)
        if ($nome = $request->query('nome')) {
            $nome = trim($nome);
            if (strlen($nome) >= 2) {
                $query->whereHas('visitante', function ($q) use ($nome) {
                    $q->where('nome', 'LIKE', '%' . $nome . '%');
                });
            }
        }

        // Filtro: método de validação
        if ($metodo = $request->query('metodo')) {
            if (in_array($metodo, ['qr', 'otp', 'manual'], true)) {
                $query->where('metodo_validacao', $metodo);
            }
        }

        $perPage = (int) $request->query('per_page', 20);
        $perPage = min(max($perPage, 1), 100);
        $paginada = $query->paginate($perPage);

        return response()->json([
            'data' => $paginada->items(),
            'meta' => [
                'current_page' => $paginada->currentPage(),
                'last_page' => $paginada->lastPage(),
                'total' => $paginada->total(),
                'per_page' => $paginada->perPage(),
            ],
        ]);
    }
    /* ======================================================
       PRIVADOS
       ====================================================== */

    /**
     * Obtém o Condomino associado ao user autenticado, ou aborta com 403.
     */
    private function condominoOuAbort(Request $request): Condomino
    {
        $user = $request->user();

        $condomino = CondominoResolver::paraUser($user);

        if ($condomino === null) {
            abort(403, 'Apenas condóminos podem aceder a pré-aprovações.');
        }

        return $condomino;
    }
}
