<?php

namespace App\Domains\Notificacoes\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificacoesController extends Controller
{
    /**
     * GET /api/notificacoes
     * Lista as últimas 20 notificações do user + contador não lidas.
     */
    public function listar(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifs = $user->notifications()
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($n) {
                return [
                    'id' => $n->id,
                    'tipo' => $n->data['tipo'] ?? 'generica',
                    'titulo' => $n->data['titulo'] ?? '',
                    'mensagem' => $n->data['mensagem'] ?? '',
                    'url' => $n->data['url'] ?? null,
                    'lida' => !is_null($n->read_at),
                    'created_at' => $n->created_at->toIso8601String(),
                    'created_human' => $n->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'notificacoes' => $notifs,
            'nao_lidas' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * POST /api/notificacoes/{id}/marcar-lida
     */
    public function marcarLida(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $notif = $user->notifications()->where('id', $id)->first();
        if ($notif && is_null($notif->read_at)) {
            $notif->markAsRead();
        }
        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/notificacoes/marcar-todas-lidas
     */
    public function marcarTodasLidas(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['ok' => true]);
    }
}
