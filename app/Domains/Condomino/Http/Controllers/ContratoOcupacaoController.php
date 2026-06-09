<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Http\Controllers;

use App\Domains\Condomino\Http\Requests\GuardarContratoRequest;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Condomino\Models\ContratoOcupacao;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContratoOcupacaoController extends Controller
{
    public function create(Request $request, Condomino $condomino): Response
    {
        $this->authorize('update', $condomino);

        // Opcional: pode vir já com fraccao_id pré-seleccionada
        $fraccaoId = $request->integer('fraccao_id');

        return Inertia::render('Contratos/Form', [
            'condomino' => $condomino,
            'fraccaoId' => $fraccaoId,
            // Lista fracções da empresa para o select (só relevantes)
            'fraccoes' => \App\Domains\Condominio\Models\Fraccao::query()
                ->with([
                    'edificio:id,nome,codigo,condominio_id',
                    'edificio.condominio:id,nome,codigo',
                ])
                ->orderBy('identificador')
                ->get()
                ->map(fn ($f) => [
                    'id' => $f->id,
                    'identificador' => $f->identificador,
                    'area_privativa_m2' => $f->area_privativa_m2,
                    'edificio_nome' => $f->edificio?->nome,
                    'condominio_nome' => $f->edificio?->condominio?->nome,
                ])
                ->values(),
            // Outros condóminos para seleccionar como proprietário (caso tipo=inquilino)
            'proprietarios' => Condomino::query()
                ->where('id', '!=', $condomino->id)
                ->where('estado', 'activo')
                ->orderBy('nome_completo')
                ->get(['id', 'nome_completo', 'tipo'])
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'nome' => $c->nome_exibicao,
                ]),
        ]);
    }

    public function store(GuardarContratoRequest $request, Condomino $condomino): RedirectResponse
    {
        $this->authorize('update', $condomino);

        $dados = $request->validated();
        $dados['condomino_id'] = $condomino->id;

        $contrato = ContratoOcupacao::create($dados);

        // Propagar o condomínio para o utilizador do condómino (opção A: só se vazio)
        if ($condomino->user_id) {
            $user = \App\Models\User::find($condomino->user_id);
            if ($user && empty($user->condominio_activo_id)) {
                $condominioId = \App\Domains\Condominio\Models\Fraccao::where('id', $contrato->fraccao_id)->value('condominio_id');
                if ($condominioId) {
                    $user->condominio_activo_id = $condominioId;
                    $user->save();
                }
            }
        }

        return redirect()
            ->route('condominos.show', $condomino)
            ->with('success', 'Contrato de ocupação criado com sucesso.');
    }

    public function terminar(Request $request, ContratoOcupacao $contrato): RedirectResponse
    {
        $this->authorize('update', $contrato->condomino);

        $dados = $request->validate([
            'data_fim' => ['required', 'date', 'after_or_equal:' . $contrato->data_inicio->format('Y-m-d')],
            'motivo_fim' => ['nullable', 'string', 'max:500'],
        ]);

        $contrato->update([
            'estado' => 'terminado',
            'data_fim' => $dados['data_fim'],
            'motivo_fim' => $dados['motivo_fim'] ?? null,
        ]);

        return back()->with('success', 'Contrato terminado.');
    }

    public function destroy(ContratoOcupacao $contrato): RedirectResponse
    {
        $this->authorize('update', $contrato->condomino);

        $contrato->delete();

        return back()->with('success', 'Contrato removido.');
    }
}
