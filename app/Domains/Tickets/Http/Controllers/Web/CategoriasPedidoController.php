<?php

namespace App\Domains\Tickets\Http\Controllers\Web;

use App\Domains\Tickets\Models\CategoriaPedido;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoriasPedidoController extends Controller
{
    public function index(Request $request): Response
    {
        $empresaId = $request->user()->empresa_gestora_id;

        $categorias = CategoriaPedido::paraEmpresa($empresaId)
            ->orderBy('tipo')
            ->orderBy('ordem')
            ->orderBy('nome')
            ->get();

        return Inertia::render('Configuracoes/CategoriasPedidos', [
            'categorias' => $categorias,
        ]);
    }

    public function criar(Request $request): RedirectResponse
    {
        $request->validate([
            'nome' => 'required|string|min:2|max:100',
            'tipo' => 'required|in:particular,publico',
            'icone' => 'nullable|string|max:30',
            'ordem' => 'nullable|integer|min:0',
        ]);

        $empresaId = $request->user()->empresa_gestora_id;
        $slug = Str::slug($request->nome);

        // Garantir slug unico por empresa+tipo
        $base = $slug;
        $i = 1;
        while (CategoriaPedido::where('empresa_gestora_id', $empresaId)
            ->where('tipo', $request->tipo)
            ->where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        CategoriaPedido::create([
            'empresa_gestora_id' => $empresaId,
            'nome' => $request->nome,
            'slug' => $slug,
            'tipo' => $request->tipo,
            'icone' => $request->icone ?? 'Tag',
            'ordem' => $request->ordem ?? 50,
            'ativo' => true,
        ]);

        return back()->with('success', 'Categoria criada.');
    }

    public function actualizar(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'nome' => 'required|string|min:2|max:100',
            'icone' => 'nullable|string|max:30',
            'ordem' => 'nullable|integer|min:0',
            'ativo' => 'required|boolean',
        ]);

        $empresaId = $request->user()->empresa_gestora_id;
        $cat = CategoriaPedido::where('id', $id)
            ->where('empresa_gestora_id', $empresaId)
            ->firstOrFail();

        $cat->update([
            'nome' => $request->nome,
            'icone' => $request->icone ?? $cat->icone,
            'ordem' => $request->ordem ?? $cat->ordem,
            'ativo' => $request->ativo,
        ]);

        return back()->with('success', 'Categoria actualizada.');
    }

    public function eliminar(Request $request, int $id): RedirectResponse
    {
        $empresaId = $request->user()->empresa_gestora_id;
        $cat = CategoriaPedido::where('id', $id)
            ->where('empresa_gestora_id', $empresaId)
            ->firstOrFail();
        $cat->delete();
        return back()->with('success', 'Categoria removida.');
    }
}
