<?php

namespace App\Domains\Chatbot\Http\Controllers;

use App\Domains\Chatbot\Services\ChatbotService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function __construct(private readonly ChatbotService $service)
    {
    }

    public function ondaka(Request $request): JsonResponse
    {
        $user = $request->user();
        $termo = $request->query('q');
        $perguntas = $this->service->listarPerguntasOndaka($user, $termo);

        return response()->json([
            'data' => $perguntas->map(fn($p) => [
                'id' => $p->id,
                'pergunta' => $p->pergunta,
                'resposta' => $p->resposta,
                'formato' => $p->formato ?? 'texto',
            ])->values(),
            'total' => $perguntas->count(),
        ]);
    }

    public function condominio(Request $request): JsonResponse
    {
        $user = $request->user();
        $condominioId = $user->condominio_activo_id;

        if (!$condominioId) {
            return response()->json([
                'data' => [],
                'total' => 0,
                'message' => 'Sem condomínio activo.',
            ]);
        }

        $termo = $request->query('q');
        $faqs = $this->service->listarFaqsCondominio($condominioId, $termo);

        return response()->json([
            'data' => $faqs->map(fn($f) => [
                'id' => $f->id,
                'categoria' => $f->categoria,
                'pergunta' => $f->pergunta,
                'resposta' => $f->resposta,
                'formato' => $f->formato ?? 'texto',
            ])->values(),
            'total' => $faqs->count(),
        ]);
    }

    public function perguntar(Request $request): JsonResponse
    {
        $user = $request->user();
        $texto = $request->input('texto', '');

        if (empty(trim($texto))) {
            return response()->json([
                'resposta' => null,
                'relacionadas' => [],
                'message' => 'Pergunta vazia.',
            ], 422);
        }

        $r = $this->service->procurarMelhorResposta($texto, $user);

        if (!empty($r['saudacao'])) {
            $nome = $user->primeiro_nome ?? explode(' ', $user->name)[0] ?? '';
            $cumprimento = $nome ? "Olá {$nome}! 👋" : 'Olá! 👋';
            return response()->json([
                'resposta' => [
                    'id' => 0,
                    'pergunta' => null,
                    'resposta' => "{$cumprimento} Estou aqui para ajudar. Pode perguntar sobre taxas, visitas, pedidos, assembleias ou qualquer funcionalidade do ONDAKA.",
                    'formato' => 'markdown',
                ],
                'relacionadas' => [],
            ]);
        }

        $thresholdMin = 3;
        if (!$r['melhor'] || $r['score'] < $thresholdMin) {
            return response()->json([
                'resposta' => null,
                'relacionadas' => [],
                'message' => 'Não encontrei resposta. Tenta reformular ou contacta o suporte: suporte@ondaka.ao',
            ]);
        }

        return response()->json([
            'resposta' => [
                'id' => $r['melhor']->id,
                'pergunta' => $r['melhor']->pergunta,
                'resposta' => $r['melhor']->resposta,
                'formato' => $r['melhor']->formato ?? 'texto',
            ],
            'relacionadas' => array_map(fn($p) => [
                'id' => $p->id,
                'pergunta' => $p->pergunta,
                'resposta' => $p->resposta,
                'formato' => $p->formato ?? 'texto',
            ], $r['relacionadas']),
            'score' => $r['score'],
        ]);
    }
}
