<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Http\Controllers;

use App\Domains\Condominio\Models\TipoFraccao;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TipoFraccaoController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', TipoFraccao::class);

        return Inertia::render('TiposFraccao/Index', [
            'tipos' => TipoFraccao::withCount('fraccoes')->orderBy('nome')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', TipoFraccao::class);

        $data = $request->validate([
            'nome' => ['required', 'string', 'max:50'],
            'codigo' => ['required', 'string', 'max:10', 'regex:/^[A-Z0-9]+$/'],
            'descricao' => ['nullable', 'string', 'max:500'],
            'paga_quota' => ['boolean'],
        ]);

        TipoFraccao::create($data);

        return back()->with('success', 'Tipo de fracção criado.');
    }

    public function update(Request $request, TipoFraccao $tipoFraccao): RedirectResponse
    {
        $this->authorize('update', $tipoFraccao);

        $data = $request->validate([
            'nome' => ['required', 'string', 'max:50'],
            'codigo' => [
                'required', 'string', 'max:10',
                Rule::unique('tipos_fraccao', 'codigo')
                    ->where('empresa_gestora_id', $tipoFraccao->empresa_gestora_id)
                    ->ignore($tipoFraccao->id),
            ],
            'descricao' => ['nullable', 'string', 'max:500'],
            'paga_quota' => ['boolean'],
        ]);

        $tipoFraccao->update($data);

        return back()->with('success', 'Tipo actualizado.');
    }

    public function destroy(TipoFraccao $tipoFraccao): RedirectResponse
    {
        $this->authorize('delete', $tipoFraccao);

        if ($tipoFraccao->fraccoes()->exists()) {
            return back()->with('error', 'Este tipo está a ser usado por fracções.');
        }

        $tipoFraccao->delete();

        return back()->with('success', 'Tipo eliminado.');
    }
}
