<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Http\Controllers;

use App\Domains\Condominio\Http\Requests\GuardarEdificioRequest;
use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condominio\Models\Edificio;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EdificioController extends Controller
{
    public function create(Condominio $condominio): Response
    {
        $this->authorize('create', Edificio::class);

        return Inertia::render('Edificios/Form', [
            'condominio' => $condominio->only(['id', 'nome', 'codigo', 'tipo']),
        ]);
    }

    public function store(GuardarEdificioRequest $request, Condominio $condominio): RedirectResponse
    {
        $edificio = Edificio::create([
            ...$request->validated(),
            'condominio_id' => $condominio->id,
        ]);

        return redirect()
            ->route('edificios.show', $edificio)
            ->with('success', "Edifício «{$edificio->nome}» adicionado.");
    }

    public function show(Edificio $edificio): Response
    {
        $this->authorize('view', $edificio);

        $edificio->load([
            'condominio:id,nome,codigo',
            'fraccoes' => fn ($q) => $q->with('tipo:id,nome,codigo')
                ->orderBy('piso')
                ->orderBy('letra'),
        ]);

        return Inertia::render('Edificios/Show', [
            'edificio' => $edificio,
            'estatisticas' => [
                'total_fraccoes' => $edificio->fraccoes->count(),
                'fraccoes_ocupadas' => $edificio->fraccoes->where('estado', 'ocupada')->count(),
                'fraccoes_vagas' => $edificio->fraccoes->where('estado', 'vaga')->count(),
                'area_total_m2' => $edificio->fraccoes->sum('area_privativa_m2'),
            ],
        ]);
    }

    public function edit(Edificio $edificio): Response
    {
        $this->authorize('update', $edificio);

        $edificio->load('condominio:id,nome,codigo,tipo');

        return Inertia::render('Edificios/Form', [
            'edificio' => $edificio,
            'condominio' => $edificio->condominio,
        ]);
    }

    public function update(GuardarEdificioRequest $request, Edificio $edificio): RedirectResponse
    {
        $edificio->update($request->validated());

        return redirect()
            ->route('edificios.show', $edificio)
            ->with('success', 'Edifício actualizado.');
    }

    public function destroy(Edificio $edificio): RedirectResponse
    {
        $this->authorize('delete', $edificio);

        if ($edificio->fraccoes()->exists()) {
            return back()->with(
                'error',
                'Não é possível eliminar um edifício que tem fracções. Elimine as fracções primeiro.'
            );
        }

        $condominioId = $edificio->condominio_id;
        $edificio->delete();

        return redirect()
            ->route('condominios.show', $condominioId)
            ->with('success', 'Edifício eliminado.');
    }
}
