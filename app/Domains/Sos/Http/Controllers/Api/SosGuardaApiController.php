<?php

declare(strict_types=1);

namespace App\Domains\Sos\Http\Controllers\Api;

use App\Domains\Sos\Catalog\TiposSos;
use App\Domains\Sos\Models\SosAlerta;
use App\Domains\Sos\Services\SosEstadoChangeNotificationService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API mobile dedicada para guardas/funcionários.
 *
 * Acesso: role 'guarda' ou 'funcionario'.
 * Filtragem: só vê alertas dos condomínios em `condominios_atribuidos`.
 *           Se vazio/null, usa fallback condominio_activo_id.
 */
class SosGuardaApiController extends Controller
{
    /**
     * GET /api/guarda/sos/alertas — lista dos alertas dos condomínios atribuídos.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        $condominios = $this->resolveCondominios($user);
        if (empty($condominios)) {
            return response()->json([
                'data' => [],
                'message' => 'Sem condomínios atribuídos.',
            ]);
        }

        $alertas = SosAlerta::query()
            ->whereIn('condominio_id', $condominios)
            ->with(['condominio:id,nome', 'user:id,name', 'fotos'])
            ->orderByRaw("CASE estado WHEN 'aberto' THEN 1 WHEN 'atendido' THEN 2 ELSE 3 END")
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
                    'descricao' => $a->descricao,
                    'condominio_id' => $a->condominio_id,
                    'condominio_nome' => $a->condominio?->nome,
                    'autor_nome' => $a->user?->name,
                    'created_at' => $a->created_at?->toIso8601String(),
                    'fotos_count' => $a->fotos->count(),
                ];
            });

        return response()->json(['data' => $alertas]);
    }

    /**
     * GET /api/guarda/sos/alertas/{id} — detalhe.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (! $user) return response()->json(['message' => 'Não autenticado.'], 401);

        $condominios = $this->resolveCondominios($user);
        $alerta = SosAlerta::with(['fotos', 'condominio:id,nome', 'user:id,name', 'atendidoPor:id,name'])
            ->whereIn('condominio_id', $condominios)
            ->find($id);

        if (! $alerta) {
            return response()->json(['message' => 'Alerta não encontrado.'], 404);
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
                'condominio_nome' => $alerta->condominio?->nome,
                'autor_nome' => $alerta->user?->name,
                'atendido_por_nome' => $alerta->atendidoPor?->name,
                'created_at' => $alerta->created_at?->toIso8601String(),
                'atendido_em' => $alerta->atendido_em?->toIso8601String(),
                'resolvido_em' => $alerta->resolvido_em?->toIso8601String(),
                'resolucao_notas' => $alerta->resolucao_notas,
                'fotos' => $alerta->fotos->map(fn ($f) => ['id' => $f->id, 'url' => $f->url])->values(),
            ],
        ]);
    }

    /**
     * PATCH /api/guarda/sos/alertas/{id}/estado — atender/resolver/falso_alarme.
     */
    public function atualizarEstado(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (! $user) return response()->json(['message' => 'Não autenticado.'], 401);

        $validated = $request->validate([
            'acao' => 'required|in:atender,resolver,falso_alarme',
            'notas' => 'nullable|string|max:1000',
        ]);

        $condominios = $this->resolveCondominios($user);
        $alerta = SosAlerta::whereIn('condominio_id', $condominios)->find($id);
        if (! $alerta) {
            return response()->json(['message' => 'Alerta não encontrado.'], 404);
        }

        $agora = now();
        match ($validated['acao']) {
            'atender' => $alerta->update([
                'estado' => SosAlerta::ESTADO_ATENDIDO,
                'atendido_por_user_id' => $user->id,
                'atendido_em' => $agora,
            ]),
            'resolver' => $alerta->update([
                'estado' => SosAlerta::ESTADO_RESOLVIDO,
                'resolvido_em' => $agora,
                'resolucao_notas' => $validated['notas'] ?? null,
                'atendido_por_user_id' => $alerta->atendido_por_user_id ?? $user->id,
                'atendido_em' => $alerta->atendido_em ?? $agora,
            ]),
            'falso_alarme' => $alerta->update([
                'estado' => SosAlerta::ESTADO_FALSO_ALARME,
                'resolvido_em' => $agora,
                'resolucao_notas' => $validated['notas'] ?? 'Falso alarme.',
                'atendido_por_user_id' => $user->id,
                'atendido_em' => $alerta->atendido_em ?? $agora,
            ]),
        };

        // === Notificar autor do SOS sobre mudança de estado ===
        $estadoMap = ['atender' => 'atendido', 'resolver' => 'resolvido', 'falso_alarme' => 'falso_alarme'];
        app(SosEstadoChangeNotificationService::class)->notificarAutor(
            $alerta->fresh(),
            $estadoMap[$validated['acao']],
            $user,
        );

        return response()->json([
            'data' => [
                'id' => $alerta->id,
                'estado' => $alerta->fresh()->estado,
            ],
            'message' => 'Estado actualizado.',
        ]);
    }

    /**
     * Resolve condomínios visíveis para este user.
     * Prioridade: condominios_atribuidos > condominio_activo_id.
     */
    private function resolveCondominios($user): array
    {
        $atribuidos = $user->condominios_atribuidos ?? [];
        if (is_array($atribuidos) && count($atribuidos) > 0) {
            return $atribuidos;
        }
        if ($user->condominio_activo_id) {
            return [$user->condominio_activo_id];
        }
        return [];
    }
}
