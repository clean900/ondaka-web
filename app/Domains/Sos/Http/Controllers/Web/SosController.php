<?php

declare(strict_types=1);

namespace App\Domains\Sos\Http\Controllers\Web;

use App\Domains\Sos\Catalog\TiposSos;
use App\Domains\Sos\Models\SosAlerta;
use App\Domains\Sos\Services\SosEstadoChangeNotificationService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SosController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Sos/Index', [
            'stats' => $this->statsParaUser($request),
        ]);
    }

    public function data(Request $request): JsonResponse
    {
        $empresaId = $request->user()->empresa_gestora_id;

        $alertas = SosAlerta::query()
            ->whereHas('condominio', fn ($q) => $q->where('empresa_gestora_id', $empresaId))
            ->with(['condominio:id,nome', 'user:id,name', 'fotos'])
            ->orderByRaw("CASE estado WHEN 'aberto' THEN 1 WHEN 'atendido' THEN 2 ELSE 3 END")
            ->orderByDesc('created_at')
            ->limit(100)
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
                    'condominio_nome' => $a->condominio?->nome,
                    'autor_nome' => $a->user?->name,
                    'created_at' => $a->created_at?->toIso8601String(),
                    'atendido_em' => $a->atendido_em?->toIso8601String(),
                    'resolvido_em' => $a->resolvido_em?->toIso8601String(),
                    'fotos_count' => $a->fotos->count(),
                ];
            });

        return response()->json([
            'data' => $alertas,
            'stats' => $this->statsParaUser($request),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    private function statsParaUser(Request $request): array
    {
        $empresaId = $request->user()->empresa_gestora_id;
        $base = SosAlerta::query()
            ->whereHas('condominio', fn ($q) => $q->where('empresa_gestora_id', $empresaId));

        return [
            'abertos' => (clone $base)->where('estado', 'aberto')->count(),
            'criticos_abertos' => (clone $base)->where('estado', 'aberto')->where('gravidade', 'critico')->count(),
            'hoje' => (clone $base)->whereDate('created_at', today())->count(),
            'total' => (clone $base)->count(),
        ];
    }

    public function show(Request $request, int $id): Response
    {
        $empresaId = $request->user()->empresa_gestora_id;

        $alerta = SosAlerta::with(['condominio:id,nome,empresa_gestora_id', 'user:id,name', 'atendidoPor:id,name', 'fotos'])
            ->find($id);

        abort_if(! $alerta, 404);
        abort_if($alerta->condominio?->empresa_gestora_id !== $empresaId, 403);

        $tipoInfo = TiposSos::todos()[$alerta->tipo] ?? null;

        return Inertia::render('Sos/Show', [
            'alerta' => [
                'id' => $alerta->id,
                'tipo' => $alerta->tipo,
                'tipo_label' => $tipoInfo['label'] ?? $alerta->tipo,
                'gravidade' => $alerta->gravidade,
                'estado' => $alerta->estado,
                'descricao' => $alerta->descricao,
                'localizacao' => $alerta->localizacao,
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

    public function atualizarEstado(Request $request, int $id): \Illuminate\Http\RedirectResponse
    {
        $empresaId = $request->user()->empresa_gestora_id;

        $alerta = SosAlerta::whereHas('condominio', fn ($q) => $q->where('empresa_gestora_id', $empresaId))->find($id);
        abort_if(! $alerta, 404);

        $validated = $request->validate([
            'acao' => 'required|in:atender,resolver,falso_alarme,reabrir',
            'notas' => 'nullable|string|max:1000',
        ]);

        $agora = now();
        $userId = $request->user()->id;

        match ($validated['acao']) {
            'atender' => $alerta->update([
                'estado' => SosAlerta::ESTADO_ATENDIDO,
                'atendido_por_user_id' => $userId,
                'atendido_em' => $agora,
            ]),
            'resolver' => $alerta->update([
                'estado' => SosAlerta::ESTADO_RESOLVIDO,
                'resolvido_em' => $agora,
                'resolucao_notas' => $validated['notas'] ?? null,
                'atendido_por_user_id' => $alerta->atendido_por_user_id ?? $userId,
                'atendido_em' => $alerta->atendido_em ?? $agora,
            ]),
            'falso_alarme' => $alerta->update([
                'estado' => SosAlerta::ESTADO_FALSO_ALARME,
                'resolvido_em' => $agora,
                'resolucao_notas' => $validated['notas'] ?? 'Falso alarme.',
                'atendido_por_user_id' => $userId,
                'atendido_em' => $alerta->atendido_em ?? $agora,
            ]),
            'reabrir' => $alerta->update([
                'estado' => SosAlerta::ESTADO_ABERTO,
                'atendido_por_user_id' => null,
                'atendido_em' => null,
                'resolvido_em' => null,
                'resolucao_notas' => null,
            ]),
        };

        $msg = match ($validated['acao']) {
            'atender' => 'Alerta marcado como atendido.',
            'resolver' => 'Alerta resolvido.',
            'falso_alarme' => 'Marcado como falso alarme.',
            'reabrir' => 'Alerta reaberto.',
        };

        // === Notificar autor do SOS sobre mudança de estado ===
        if (in_array($validated['acao'], ['atender', 'resolver', 'falso_alarme'], true)) {
            $estadoMap = ['atender' => 'atendido', 'resolver' => 'resolvido', 'falso_alarme' => 'falso_alarme'];
            app(SosEstadoChangeNotificationService::class)->notificarAutor(
                $alerta->fresh(),
                $estadoMap[$validated['acao']],
                $request->user(),
            );
        }

        return back()->with('success', $msg);
    }
}
