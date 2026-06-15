<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Http\Controllers;

use App\Domains\Condominio\Models\ComissaoMembro;
use App\Domains\Condominio\Models\Condominio;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * F-03 (camada 2): gestão da comissão de moradores de um condomínio.
 * O gestor liga/desliga a regra e designa quais condóminos são membros.
 */
class ComissaoController extends Controller
{
    public function show(Request $request, Condominio $condominio): Response
    {
        $this->autorizar($request, $condominio);

        $membros = $condominio->membrosComissao()
            ->with('user:id,name,email')
            ->get()
            ->map(fn (ComissaoMembro $m) => [
                'id' => $m->id,
                'user_id' => $m->user_id,
                'nome' => $m->user?->name,
                'email' => $m->user?->email,
            ]);

        $idsMembros = $membros->pluck('user_id')->all();

        $condominos = User::where('condominio_activo_id', $condominio->id)
            ->role('condomino')
            ->whereNotIn('id', $idsMembros)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Condominio/Comissao', [
            'condominio' => [
                'id' => $condominio->id,
                'nome' => $condominio->nome,
                'exige_aprovacao_comissao' => (bool) $condominio->exige_aprovacao_comissao,
            ],
            'membros' => $membros,
            'condominosDisponiveis' => $condominos,
        ]);
    }

    public function actualizarRegra(Request $request, Condominio $condominio): RedirectResponse
    {
        $this->autorizar($request, $condominio);
        $request->validate(['exige_aprovacao_comissao' => 'required|boolean']);

        $condominio->update(['exige_aprovacao_comissao' => $request->boolean('exige_aprovacao_comissao')]);

        return back()->with('success', 'Regra de aprovação da comissão actualizada.');
    }

    public function adicionarMembro(Request $request, Condominio $condominio): RedirectResponse
    {
        $this->autorizar($request, $condominio);
        $request->validate(['user_id' => 'required|integer|exists:users,id']);

        // O utilizador tem de ser um condómino deste condomínio.
        $eCondomino = User::where('id', $request->integer('user_id'))
            ->where('condominio_activo_id', $condominio->id)
            ->role('condomino')
            ->exists();

        if (! $eCondomino) {
            return back()->with('error', 'Só condóminos deste condomínio podem ser membros da comissão.');
        }

        ComissaoMembro::firstOrCreate(
            ['condominio_id' => $condominio->id, 'user_id' => $request->integer('user_id')],
            ['designado_por_user_id' => $request->user()->id],
        );

        return back()->with('success', 'Membro adicionado à comissão.');
    }

    public function removerMembro(Request $request, Condominio $condominio, ComissaoMembro $membro): RedirectResponse
    {
        $this->autorizar($request, $condominio);

        if ($membro->condominio_id !== $condominio->id) {
            abort(404);
        }

        $membro->delete();

        return back()->with('success', 'Membro removido da comissão.');
    }

    private function autorizar(Request $request, Condominio $condominio): void
    {
        $empresaId = $request->user()->empresa_gestora_id;
        if (! $empresaId || $condominio->empresa_gestora_id !== $empresaId) {
            abort(403);
        }
    }
}
