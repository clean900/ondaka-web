<?php

namespace App\Domains\Turnos\Http\Controllers\Web;

use App\Domains\Turnos\Models\TurnoModelo;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TurnosModeloController extends Controller
{
    public function index(Request $request): Response
    {
        $empresaId = $request->user()->empresa_gestora_id;
        $turnos = TurnoModelo::paraEmpresa($empresaId)
            ->orderBy('ordem')
            ->orderBy('hora_inicio')
            ->get();

        return Inertia::render('Turnos/Modelos', [
            'turnos' => $turnos,
        ]);
    }

    public function criar(Request $request): RedirectResponse
    {
        $request->validate([
            'nome' => 'required|string|min:2|max:60',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fim' => 'required|date_format:H:i',
            'cor_hex' => 'nullable|string|max:7',
            'descricao' => 'nullable|string',
        ]);

        // Detectar se atravessa meia-noite
        $atravessa = $request->hora_fim < $request->hora_inicio;

        TurnoModelo::create([
            'empresa_gestora_id' => $request->user()->empresa_gestora_id,
            'nome' => $request->nome,
            'hora_inicio' => $request->hora_inicio,
            'hora_fim' => $request->hora_fim,
            'atravessa_meia_noite' => $atravessa,
            'cor_hex' => $request->cor_hex ?? '#06B6D4',
            'descricao' => $request->descricao,
            'ativo' => true,
            'ordem' => TurnoModelo::paraEmpresa($request->user()->empresa_gestora_id)->max('ordem') + 1,
        ]);

        return back()->with('success', 'Turno criado.');
    }

    public function actualizar(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'nome' => 'required|string|min:2|max:60',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fim' => 'required|date_format:H:i',
            'cor_hex' => 'nullable|string|max:7',
            'descricao' => 'nullable|string',
            'ativo' => 'required|boolean',
        ]);

        $t = TurnoModelo::where('id', $id)
            ->where('empresa_gestora_id', $request->user()->empresa_gestora_id)
            ->firstOrFail();

        $atravessa = $request->hora_fim < $request->hora_inicio;

        $t->update([
            'nome' => $request->nome,
            'hora_inicio' => $request->hora_inicio,
            'hora_fim' => $request->hora_fim,
            'atravessa_meia_noite' => $atravessa,
            'cor_hex' => $request->cor_hex ?? '#06B6D4',
            'descricao' => $request->descricao,
            'ativo' => $request->ativo,
        ]);

        return back()->with('success', 'Turno actualizado.');
    }

    public function eliminar(Request $request, int $id): RedirectResponse
    {
        $t = TurnoModelo::where('id', $id)
            ->where('empresa_gestora_id', $request->user()->empresa_gestora_id)
            ->firstOrFail();
        $t->delete();
        return back()->with('success', 'Turno removido.');
    }
}
