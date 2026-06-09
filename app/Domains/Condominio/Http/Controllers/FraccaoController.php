<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Http\Controllers;

use App\Domains\Condominio\Http\Requests\GuardarFraccaoRequest;
use App\Domains\Condominio\Models\Edificio;
use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Condominio\Models\TipoFraccao;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FraccaoController extends Controller
{
    public function create(Edificio $edificio): Response
    {
        $this->authorize('create', Fraccao::class);

        $edificio->load('condominio:id,nome,codigo');

        return Inertia::render('Fraccoes/Form', [
            'edificio' => $edificio,
            'tipos_fraccao' => TipoFraccao::orderBy('nome')->get(['id', 'nome', 'codigo']),
        ]);
    }

    public function store(GuardarFraccaoRequest $request, Edificio $edificio): RedirectResponse
    {
        $fraccao = Fraccao::create([
            ...$request->validated(),
            'edificio_id' => $edificio->id,
            'condominio_id' => $edificio->condominio_id,
        ]);

        return redirect()
            ->route('fraccoes.show', $fraccao)
            ->with('success', "Fracção «{$fraccao->identificador}» adicionada.");
    }

    public function show(Fraccao $fraccao): Response
    {
        $this->authorize('view', $fraccao);

        $fraccao->load([
            'condominio:id,nome,codigo',
            'edificio:id,nome,codigo',
            'tipo:id,nome,codigo',
        ]);

        return Inertia::render('Fraccoes/Show', [
            'fraccao' => $fraccao,
        ]);
    }

    public function edit(Fraccao $fraccao): Response
    {
        $this->authorize('update', $fraccao);

        $fraccao->load([
            'condominio:id,nome,codigo',
            'edificio:id,nome,codigo',
        ]);

        return Inertia::render('Fraccoes/Form', [
            'fraccao' => $fraccao,
            'edificio' => $fraccao->edificio,
            'tipos_fraccao' => TipoFraccao::orderBy('nome')->get(['id', 'nome', 'codigo']),
        ]);
    }

    public function update(GuardarFraccaoRequest $request, Fraccao $fraccao): RedirectResponse
    {
        $fraccao->update($request->validated());

        return redirect()
            ->route('fraccoes.show', $fraccao)
            ->with('success', 'Fracção actualizada.');
    }

    public function destroy(Fraccao $fraccao): RedirectResponse
    {
        $this->authorize('delete', $fraccao);

        if ($fraccao->estado === 'ocupada') {
            return back()->with('error', 'Não é possível eliminar uma fracção ocupada.');
        }

        $edificioId = $fraccao->edificio_id;
        $fraccao->delete();

        return redirect()
            ->route('edificios.show', $edificioId)
            ->with('success', 'Fracção eliminada.');
    }
}
