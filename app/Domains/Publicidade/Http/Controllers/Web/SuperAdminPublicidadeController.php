<?php

namespace App\Domains\Publicidade\Http\Controllers\Web;

use App\Domains\Publicidade\Models\PublicidadePopup;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SuperAdminPublicidadeController extends Controller
{
    public function index()
    {
        return Inertia::render('SuperAdmin/Publicidade/Index', [
            'popups' => PublicidadePopup::orderByDesc('id')->get()->map(fn ($p) => [
                'id' => $p->id,
                'titulo' => $p->titulo,
                'mensagem' => $p->mensagem,
                'imagem_url' => $p->imagem_url,
                'botao_texto' => $p->botao_texto,
                'link_url' => $p->link_url,
                'alvo' => $p->alvo,
                'ativo' => $p->ativo,
                'inicio_em' => optional($p->inicio_em)->format('Y-m-d\TH:i'),
                'fim_em' => optional($p->fim_em)->format('Y-m-d\TH:i'),
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $dados = $this->validar($request);
        if ($request->hasFile('imagem')) {
            $dados['imagem_path'] = $request->file('imagem')->store('publicidade', 'public');
        }
        PublicidadePopup::create($dados);
        return back()->with('success', 'Popup criado.');
    }

    public function update(Request $request, PublicidadePopup $popup)
    {
        $dados = $this->validar($request);
        if ($request->hasFile('imagem')) {
            if ($popup->imagem_path) {
                Storage::disk('public')->delete($popup->imagem_path);
            }
            $dados['imagem_path'] = $request->file('imagem')->store('publicidade', 'public');
        }
        $popup->update($dados);
        return back()->with('success', 'Popup atualizado.');
    }

    public function destroy(PublicidadePopup $popup)
    {
        if ($popup->imagem_path) {
            Storage::disk('public')->delete($popup->imagem_path);
        }
        $popup->delete();
        return back()->with('success', 'Popup removido.');
    }

    private function validar(Request $request): array
    {
        return $request->validate([
            'titulo' => 'required|string|max:255',
            'mensagem' => 'nullable|string',
            'botao_texto' => 'nullable|string|max:255',
            'link_url' => 'nullable|string|max:255',
            'alvo' => 'required|in:ambos,mobile,web',
            'ativo' => 'boolean',
            'inicio_em' => 'nullable|date',
            'fim_em' => 'nullable|date',
            'imagem' => 'nullable|image|max:4096',
        ]);
    }
}
