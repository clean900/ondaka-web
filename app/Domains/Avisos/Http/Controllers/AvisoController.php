<?php

declare(strict_types=1);

namespace App\Domains\Avisos\Http\Controllers;

use App\Domains\Avisos\Http\Requests\ComentarAvisoRequest;
use App\Domains\Avisos\Http\Requests\CriarAvisoRequest;
use App\Domains\Avisos\Models\Aviso;
use App\Domains\Avisos\Models\AvisoAnexo;
use App\Domains\Avisos\Services\AvisoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AvisoController extends Controller
{
    public function __construct(protected AvisoService $service) {}

    /**
     * GET /api/avisos
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = $this->service->paraUser($user, $request->integer('condominio_id'));

        $avisos = $query
            ->with(['autor:id,name', 'condominio:id,nome', 'anexos'])
            ->withCount('comentarios')
            ->paginate($request->integer('per_page', 20));

        return response()->json($avisos);
    }

    /**
     * GET /api/avisos/{id}
     */
    public function show(Aviso $aviso): JsonResponse
    {
        $aviso->load([
            'autor:id,name',
            'condominio:id,nome',
            'anexos',
            'comentarios.user:id,name',
            'comentarios.respostas.user:id,name',
            'segmentacoes',
        ]);

        // Marcar como lido para este user
        $this->service->marcarLido($aviso, request()->user());

        return response()->json(['data' => $aviso]);
    }

    /**
     * POST /api/avisos (admin)
     */
    public function store(CriarAvisoRequest $request): JsonResponse
    {
        $dados = $request->validated();
        $segmentacoes = $dados['segmentacoes'];
        unset($dados['segmentacoes']);

        $anexos = $request->file('anexos', []);
        unset($dados['anexos']);

        $aviso = $this->service->criar($dados, $segmentacoes, $request->user());

        // Upload de anexos
        foreach ($anexos as $file) {
            $path = $file->store('avisos/' . $aviso->id, 'public');
            AvisoAnexo::create([
                'aviso_id' => $aviso->id,
                'uploaded_by_user_id' => $request->user()->id,
                'path' => $path,
                'nome_original' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'tamanho_bytes' => $file->getSize(),
            ]);
        }

        return response()->json([
            'message' => 'Aviso criado com sucesso.',
            'data' => $aviso->load(['autor', 'condominio', 'anexos', 'segmentacoes']),
        ], 201);
    }

    /**
     * POST /api/avisos/{id}/publicar (admin)
     */
    public function publicar(Aviso $aviso): JsonResponse
    {
        $aviso = $this->service->publicar($aviso);
        return response()->json([
            'message' => 'Aviso publicado.',
            'data' => $aviso,
        ]);
    }

    /**
     * POST /api/avisos/{id}/arquivar (admin)
     */
    public function arquivar(Aviso $aviso): JsonResponse
    {
        $aviso = $this->service->arquivar($aviso);
        return response()->json([
            'message' => 'Aviso arquivado.',
            'data' => $aviso,
        ]);
    }

    /**
     * POST /api/avisos/{id}/marcar-lido
     */
    public function marcarLido(Aviso $aviso, Request $request): JsonResponse
    {
        $confirmar = $request->boolean('confirmar', false);
        $leitura = $this->service->marcarLido($aviso, $request->user(), $confirmar);
        return response()->json([
            'message' => 'Marcado como lido.',
            'data' => $leitura,
        ]);
    }

    /**
     * POST /api/avisos/{id}/comentarios
     */
    public function comentar(Aviso $aviso, ComentarAvisoRequest $request): JsonResponse
    {
        $comentario = $this->service->comentar(
            $aviso,
            $request->user(),
            $request->validated('mensagem'),
            $request->validated('parent_id'),
        );

        return response()->json([
            'message' => 'Comentário adicionado.',
            'data' => $comentario->load('user:id,name'),
        ], 201);
    }

    /**
     * GET /api/avisos/{id}/estatisticas (admin)
     */
    public function estatisticas(Aviso $aviso): JsonResponse
    {
        return response()->json([
            'data' => $this->service->estatisticasLeitura($aviso),
        ]);
    }
}
