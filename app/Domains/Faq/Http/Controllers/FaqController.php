<?php

declare(strict_types=1);

namespace App\Domains\Faq\Http\Controllers;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Faq\Models\Faq;
use App\Domains\Faq\Services\FaqService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    public function __construct(protected FaqService $service) {}

    /**
     * Listagem para gestor (admin).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $empresa = $user->empresaGestora;

        $query = Faq::with(['condominio:id,nome', 'criadaPor:id,name'])
            ->where('empresa_gestora_id', $empresa->id)
            ->orderBy('ordem')
            ->orderByDesc('id');

        if ($request->filled('condominio_id')) {
            $query->where('condominio_id', $request->input('condominio_id'));
        }

        if ($request->filled('categoria')) {
            $query->where('categoria', $request->input('categoria'));
        }

        $faqs = $query->paginate(30)->through(fn ($f) => [
            'id' => $f->id,
            'pergunta' => $f->pergunta,
            'resposta' => \Str::limit($f->resposta, 100),
            'categoria' => $f->categoria,
            'condominio' => $f->condominio ? ['id' => $f->condominio->id, 'nome' => $f->condominio->nome] : null,
            'activa' => $f->activa,
            'vezes_respondida' => $f->vezes_respondida,
            'util_sim' => $f->util_sim,
            'util_nao' => $f->util_nao,
            'ordem' => $f->ordem,
        ]);

        $condominios = Condominio::where('empresa_gestora_id', $empresa->id)
            ->select('id', 'nome')
            ->orderBy('nome')
            ->get();

        return Inertia::render('Faqs/Index', [
            'faqs' => $faqs,
            'condominios' => $condominios,
            'filtros' => [
                'condominio_id' => $request->input('condominio_id'),
                'categoria' => $request->input('categoria'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $empresa = $user->empresaGestora;

        $condominios = Condominio::where('empresa_gestora_id', $empresa->id)
            ->select('id', 'nome')
            ->orderBy('nome')
            ->get();

        return Inertia::render('Faqs/Form', [
            'condominios' => $condominios,
            'categorias' => $this->categorias(),
            'faq' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $empresa = $user->empresaGestora;

        $validated = $request->validate([
            'condominio_id' => 'nullable|exists:condominios,id',
            'categoria' => 'required|string|max:50',
            'pergunta' => 'required|string|max:300',
            'resposta' => 'required|string|max:5000',
            'palavras_chave' => 'nullable|string|max:500',
            'ordem' => 'nullable|integer|min:0',
            'activa' => 'boolean',
        ]);

        Faq::create(array_merge($validated, [
            'empresa_gestora_id' => $empresa->id,
            'criada_por_user_id' => $user->id,
            'ordem' => $validated['ordem'] ?? 0,
            'activa' => $validated['activa'] ?? true,
        ]));

        return redirect()->route('faqs.index')->with('success', 'FAQ criada.');
    }

    public function edit(Faq $faq, Request $request): Response
    {
        $this->autorizar($faq, $request);

        $user = $request->user();
        $empresa = $user->empresaGestora;

        $condominios = Condominio::where('empresa_gestora_id', $empresa->id)
            ->select('id', 'nome')
            ->orderBy('nome')
            ->get();

        return Inertia::render('Faqs/Form', [
            'condominios' => $condominios,
            'categorias' => $this->categorias(),
            'faq' => [
                'id' => $faq->id,
                'condominio_id' => $faq->condominio_id,
                'categoria' => $faq->categoria,
                'pergunta' => $faq->pergunta,
                'resposta' => $faq->resposta,
                'palavras_chave' => $faq->palavras_chave,
                'ordem' => $faq->ordem,
                'activa' => $faq->activa,
            ],
        ]);
    }

    public function update(Faq $faq, Request $request): RedirectResponse
    {
        $this->autorizar($faq, $request);

        $validated = $request->validate([
            'condominio_id' => 'nullable|exists:condominios,id',
            'categoria' => 'required|string|max:50',
            'pergunta' => 'required|string|max:300',
            'resposta' => 'required|string|max:5000',
            'palavras_chave' => 'nullable|string|max:500',
            'ordem' => 'nullable|integer|min:0',
            'activa' => 'boolean',
        ]);

        $faq->update($validated);

        return redirect()->route('faqs.index')->with('success', 'FAQ actualizada.');
    }

    public function destroy(Faq $faq, Request $request): RedirectResponse
    {
        $this->autorizar($faq, $request);

        $faq->delete();

        return redirect()->route('faqs.index')->with('success', 'FAQ removida.');
    }

    /**
     * Endpoint do chatbot — condómino envia pergunta, recebe sugestões.
     */
    public function perguntar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pergunta' => 'required|string|min:3|max:500',
            'condominio_id' => 'nullable|exists:condominios,id',
        ]);

        $user = $request->user();
        $empresa = $user->empresaGestora;

        $faqs = $this->service->procurar(
            $validated['pergunta'],
            $empresa->id,
            $validated['condominio_id'] ?? null,
            3
        );

        // Incrementar contador das devolvidas
        foreach ($faqs as $faq) {
            $faq->incrementarRespondida();
        }

        return response()->json([
            'resultados' => $faqs->map(fn ($f) => [
                'id' => $f->id,
                'pergunta' => $f->pergunta,
                'resposta' => $f->resposta,
                'categoria' => $f->categoria,
            ])->values(),
            'total' => $faqs->count(),
        ]);
    }

    public function marcarUtil(Faq $faq, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'util' => 'required|boolean',
        ]);

        $faq->marcarUtil($validated['util']);

        return response()->json(['ok' => true]);
    }

    protected function autorizar(Faq $faq, Request $request): void
    {
        $user = $request->user();
        $empresa = $user->empresaGestora;

        if ($faq->empresa_gestora_id !== $empresa?->id && ! $user->hasRole('super-admin')) {
            abort(403);
        }
    }

    protected function categorias(): array
    {
        return [
            'geral' => 'Geral',
            'financeiro' => 'Financeiro',
            'manutencao' => 'Manutenção',
            'assembleias' => 'Assembleias',
            'seguranca' => 'Segurança',
            'contactos' => 'Contactos',
        ];
    }
}
