<?php

declare(strict_types=1);

namespace App\Domains\Visitor\Http\Controllers\Web;

use App\Domains\Visitor\Models\VisitanteBanido;
use App\Domains\Visitor\Services\ListaNegraService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestão da Lista Negra de Visitantes (gestor/admin da empresa).
 */
class ListaNegraController extends Controller
{
    public function __construct(protected ListaNegraService $service) {}

    public function index(Request $request): Response
    {
        $empresaId = (int) $request->user()->empresa_gestora_id;

        $itens = $this->service->listar($empresaId)
            ->map(fn (VisitanteBanido $b) => [
                'id' => $b->id,
                'tipo' => $b->tipo,
                'valor' => $b->valor,
                'motivo' => $b->motivo,
                'condominio_id' => $b->condominio_id,
                'partilhar_empresa' => $b->partilhar_empresa,
                'criado_em' => $b->created_at?->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Visitantes/ListaNegra', [
            'itens' => $itens,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $dados = $request->validate([
            'tipo' => ['required', 'in:bi,matricula,nome'],
            'valor' => ['required', 'string', 'max:150'],
            'motivo' => ['nullable', 'string', 'max:1000'],
            'condominio_id' => ['nullable', 'integer'],
            'partilhar_empresa' => ['sometimes', 'boolean'],
        ]);

        $this->service->adicionar(
            $dados,
            (int) $request->user()->empresa_gestora_id,
            (int) $request->user()->id,
        );

        return back()->with('success', 'Visitante adicionado à lista negra.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $banido = VisitanteBanido::where('empresa_gestora_id', $request->user()->empresa_gestora_id)
            ->findOrFail($id);
        $banido->delete();

        return back()->with('success', 'Removido da lista negra.');
    }
}
