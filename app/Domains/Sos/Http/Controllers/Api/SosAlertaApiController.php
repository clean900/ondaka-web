<?php

declare(strict_types=1);

namespace App\Domains\Sos\Http\Controllers\Api;

use App\Domains\Sos\Catalog\TiposSos;
use App\Domains\Sos\Models\SosAlerta;
use App\Domains\Sos\Services\CriarAlertaSosService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

/**
 * Endpoints públicos (autenticados) para alertas SOS.
 *
 * - GET  /api/sos/tipos      Catálogo dos 13 tipos para o mobile montar UI
 * - POST /api/sos/alertas    Accionar um alerta SOS
 */
class SosAlertaApiController extends Controller
{
    public function __construct(protected CriarAlertaSosService $service) {}

    /**
     * GET /api/sos/tipos
     * Lista pública dos 13 tipos com gravidade, ícone e cor.
     */
    public function tipos(): JsonResponse
    {
        return response()->json([
            'data' => TiposSos::todos(),
        ]);
    }

    /**
     * POST /api/sos/alertas
     * Body: { tipo: string, descricao?: string, localizacao?: string }
     *
     * Devolve o alerta criado.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tipo' => 'required|string',
            'descricao' => 'nullable|string|max:500',
            'localizacao' => 'nullable|string|max:255',
            'fotos' => 'nullable|array|max:3',
            'fotos.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120', // max 5MB cada
        ]);

        if (! TiposSos::existe($validated['tipo'])) {
            return response()->json([
                'message' => 'Tipo de SOS inválido.',
                'tipos_validos' => TiposSos::tipos(),
            ], 422);
        }

        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        $fotos = $request->file('fotos', []);
        if (! is_array($fotos)) {
            $fotos = [$fotos];
        }

        try {
            $alerta = $this->service->executar(
                $user,
                $validated['tipo'],
                $validated['descricao'] ?? null,
                $validated['localizacao'] ?? null,
                $fotos,
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        } catch (Throwable $e) {
            Log::error('SOS: falha ao criar alerta', [
                'user_id' => $user->id,
                'tipo' => $validated['tipo'],
                'erro' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Erro ao processar SOS. Por favor contacte directamente o seu condomínio.',
            ], 500);
        }

        return response()->json([
            'data' => [
                'id' => $alerta->id,
                'tipo' => $alerta->tipo,
                'gravidade' => $alerta->gravidade,
                'estado' => $alerta->estado,
                'condominio_id' => $alerta->condominio_id,
                'created_at' => $alerta->created_at?->toIso8601String(),
                'message' => 'Alerta recebido. Será notificada a segurança e administração.',
            ],
        ], 201);
    }

    /**
     * GET /api/sos/alertas/{id}
     * Detalhe completo (com fotos). Só o próprio user pode ver os seus alertas.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        $alerta = SosAlerta::with('fotos')->find($id);
        if (! $alerta) {
            return response()->json(['message' => 'Alerta não encontrado.'], 404);
        }

        // Autorização: só o user que criou pode ver (ou admins/gestores futuros)
        if ($alerta->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $tipoInfo = TiposSos::todos()[$alerta->tipo] ?? null;

        return response()->json([
            'data' => [
                'id' => $alerta->id,
                'tipo' => $alerta->tipo,
                'tipo_label' => $tipoInfo['label'] ?? $alerta->tipo,
                'gravidade' => $alerta->gravidade,
                'estado' => $alerta->estado,
                'descricao' => $alerta->descricao,
                'localizacao' => $alerta->localizacao,
                'condominio_id' => $alerta->condominio_id,
                'created_at' => $alerta->created_at?->toIso8601String(),
                'atendido_em' => $alerta->atendido_em?->toIso8601String(),
                'resolvido_em' => $alerta->resolvido_em?->toIso8601String(),
                'resolucao_notas' => $alerta->resolucao_notas,
                'fotos' => $alerta->fotos->map(fn ($f) => [
                    'id' => $f->id,
                    'url' => $f->url,
                ])->values(),
            ],
        ]);
    }

    /**
     * GET /api/sos/alertas
     * Lista dos alertas do user autenticado (mais recentes primeiro).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        $alertas = SosAlerta::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(function (SosAlerta $a) {
                $tipoInfo = TiposSos::todos()[$a->tipo] ?? null;
                return [
                    'id' => $a->id,
                    'tipo' => $a->tipo,
                    'tipo_label' => $tipoInfo['label'] ?? $a->tipo,
                    'gravidade' => $a->gravidade,
                    'estado' => $a->estado,
                    'localizacao' => $a->localizacao,
                    'created_at' => $a->created_at?->toIso8601String(),
                ];
            });

        return response()->json(['data' => $alertas]);
    }
}
