<?php

namespace App\Domains\Chatbot\Http\Controllers;

use App\Domains\Chatbot\Models\ChatbotFaqCondominio;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminChatbotFaqController extends Controller
{
    public function index(Request $request): Response
    {
        $condominioId = $request->user()->condominio_activo_id;

        $faqs = ChatbotFaqCondominio::where('condominio_id', $condominioId)
            ->orderBy('ordem')
            ->orderBy('id')
            ->get();

        $categorias = ChatbotFaqCondominio::where('condominio_id', $condominioId)
            ->whereNotNull('categoria')
            ->where('categoria', '!=', '')
            ->distinct()
            ->orderBy('categoria')
            ->pluck('categoria')
            ->values();

        return Inertia::render('Admin/Chatbot/Faqs/Index', [
            'faqs' => $faqs,
            'categoriasExistentes' => $categorias,
        ]);
    }


    /**
     * Lista FAQs em formato JSON (para mobile).
     */
    public function indexJson(Request $request): JsonResponse
    {
        $condominioId = $request->user()->condominio_activo_id;

        $faqs = ChatbotFaqCondominio::where('condominio_id', $condominioId)
            ->orderBy('ordem')
            ->orderBy('id')
            ->get();

        $categorias = ChatbotFaqCondominio::where('condominio_id', $condominioId)
            ->whereNotNull('categoria')
            ->where('categoria', '!=', '')
            ->distinct()
            ->orderBy('categoria')
            ->pluck('categoria')
            ->values();

        return response()->json([
            'faqs' => $faqs,
            'categoriasExistentes' => $categorias,
        ]);
    }
    public function store(Request $request): JsonResponse
    {
        $data = $this->validar($request);

        $condominioId = $request->user()->condominio_activo_id;

        $proximaOrdem = ChatbotFaqCondominio::where('condominio_id', $condominioId)
            ->max('ordem') + 1;

        $faq = ChatbotFaqCondominio::create([
            'condominio_id' => $condominioId,
            'criado_por_user_id' => $request->user()->id,
            'categoria' => $data['categoria'] ?? null,
            'pergunta' => $data['pergunta'],
            'resposta' => $data['resposta'],
            'palavras_chave' => $data['palavras_chave'] ?? [],
            'formato' => $data['formato'] ?? 'markdown',
            'activa' => $data['activa'] ?? true,
            'ordem' => $proximaOrdem,
        ]);

        return response()->json([
            'success' => true,
            'faq' => $faq,
            'message' => 'FAQ criada com sucesso.',
        ]);
    }

    public function update(Request $request, ChatbotFaqCondominio $faq): JsonResponse
    {
        $this->autorizar($request, $faq);

        $data = $this->validar($request);

        $faq->update([
            'categoria' => $data['categoria'] ?? null,
            'pergunta' => $data['pergunta'],
            'resposta' => $data['resposta'],
            'palavras_chave' => $data['palavras_chave'] ?? [],
            'formato' => $data['formato'] ?? 'markdown',
            'activa' => $data['activa'] ?? $faq->activa,
        ]);

        return response()->json([
            'success' => true,
            'faq' => $faq->fresh(),
            'message' => 'FAQ actualizada.',
        ]);
    }

    public function toggle(Request $request, ChatbotFaqCondominio $faq): JsonResponse
    {
        $this->autorizar($request, $faq);

        $faq->activa = !$faq->activa;
        $faq->save();

        return response()->json([
            'success' => true,
            'faq' => $faq,
            'message' => $faq->activa ? 'FAQ activada.' : 'FAQ desactivada.',
        ]);
    }

    public function destroy(Request $request, ChatbotFaqCondominio $faq): JsonResponse
    {
        $this->autorizar($request, $faq);

        $faq->delete();

        return response()->json([
            'success' => true,
            'message' => 'FAQ eliminada.',
        ]);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:chatbot_faqs_condominio,id',
        ]);

        $condominioId = $request->user()->condominio_activo_id;

        foreach ($request->input('ids') as $ordem => $id) {
            ChatbotFaqCondominio::where('id', $id)
                ->where('condominio_id', $condominioId)
                ->update(['ordem' => $ordem + 1]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ordem actualizada.',
        ]);
    }

    private function validar(Request $request): array
    {
        return $request->validate([
            'pergunta' => 'required|string|max:500',
            'resposta' => 'required|string',
            'categoria' => 'nullable|string|max:100',
            'palavras_chave' => 'nullable|array',
            'palavras_chave.*' => 'string|max:50',
            'formato' => 'nullable|in:texto,markdown',
            'activa' => 'nullable|boolean',
        ]);
    }

    private function autorizar(Request $request, ChatbotFaqCondominio $faq): void
    {
        $condominioId = $request->user()->condominio_activo_id;

        if ($faq->condominio_id !== $condominioId) {
            abort(403, 'Não autorizado.');
        }
    }
}
