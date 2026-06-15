<?php

namespace App\Domains\Tickets\Http\Controllers\Web;

use App\Domains\Tickets\Models\EmpresaPrestadora;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmpresasPrestadorasController extends Controller
{
    public function index(Request $request): Response
    {
        $empresaId = $request->user()->empresa_gestora_id;

        $empresas = EmpresaPrestadora::paraEmpresa($empresaId)
            ->orderBy('ativa', 'desc')
            ->orderBy('nome')
            ->get();

        return Inertia::render('Configuracoes/EmpresasPrestadoras', [
            'empresas' => $empresas,
        ]);
    }

    public function criar(Request $request): RedirectResponse
    {
        $request->validate([
            'nome' => 'required|string|min:2|max:150',
            'nif' => 'nullable|string|max:30',
            'telefone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:150',
            'especialidades' => 'nullable|string',
            'observacoes' => 'nullable|string',
            'logo' => 'nullable|image|max:2048',
        ]);

        EmpresaPrestadora::create([
            'empresa_gestora_id' => $request->user()->empresa_gestora_id,
            'nome' => $request->nome,
            'nif' => $request->nif,
            'telefone' => $request->telefone,
            'email' => $request->email,
            'especialidades' => $request->especialidades,
            'observacoes' => $request->observacoes,
            'foto_path' => $request->hasFile('logo')
                ? $request->file('logo')->store('prestadores', 'public')
                : null,
            'ativa' => true,
        ]);

        return back()->with('success', 'Empresa prestadora criada.');
    }

    public function actualizar(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'nome' => 'required|string|min:2|max:150',
            'nif' => 'nullable|string|max:30',
            'telefone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:150',
            'especialidades' => 'nullable|string',
            'observacoes' => 'nullable|string',
            'ativa' => 'required|boolean',
            'logo' => 'nullable|image|max:2048',
        ]);

        $emp = EmpresaPrestadora::where('id', $id)
            ->where('empresa_gestora_id', $request->user()->empresa_gestora_id)
            ->firstOrFail();

        $emp->update($request->only(['nome', 'nif', 'telefone', 'email', 'especialidades', 'observacoes', 'ativa']));

        if ($request->hasFile('logo')) {
            $emp->update(['foto_path' => $request->file('logo')->store('prestadores', 'public')]);
        }

        return back()->with('success', 'Empresa actualizada.');
    }

    public function eliminar(Request $request, int $id): RedirectResponse
    {
        $emp = EmpresaPrestadora::where('id', $id)
            ->where('empresa_gestora_id', $request->user()->empresa_gestora_id)
            ->firstOrFail();
        $emp->delete();
        return back()->with('success', 'Empresa removida.');
    }
    /**
     * GET /api/empresas-prestadoras
     */
    public function apiIndex(Request $request): \Illuminate\Http\JsonResponse
    {
        $empresaId = $request->user()->empresa_gestora_id;
        $empresas = EmpresaPrestadora::paraEmpresa($empresaId)
            ->orderBy('ativa', 'desc')
            ->orderBy('nome')
            ->get();
        return response()->json([
            'empresas' => $empresas,
        ]);
    }
    /**
     * POST /api/empresas-prestadoras
     */
    public function apiCriar(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'nome' => 'required|string|min:2|max:150',
            'nif' => 'nullable|string|max:30',
            'telefone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:150',
            'especialidades' => 'nullable|string',
            'observacoes' => 'nullable|string',
        ]);
        $emp = EmpresaPrestadora::create([
            'empresa_gestora_id' => $request->user()->empresa_gestora_id,
            'nome' => $request->nome,
            'nif' => $request->nif,
            'telefone' => $request->telefone,
            'email' => $request->email,
            'especialidades' => $request->especialidades,
            'observacoes' => $request->observacoes,
            'ativa' => true,
        ]);
        return response()->json([
            'message' => 'Empresa prestadora criada.',
            'data' => $emp,
        ], 201);
    }
    /**
     * PATCH /api/empresas-prestadoras/{id}
     */
    public function apiActualizar(Request $request, int $id): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'nome' => 'required|string|min:2|max:150',
            'nif' => 'nullable|string|max:30',
            'telefone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:150',
            'especialidades' => 'nullable|string',
            'observacoes' => 'nullable|string',
            'ativa' => 'required|boolean',
        ]);
        $emp = EmpresaPrestadora::where('id', $id)
            ->where('empresa_gestora_id', $request->user()->empresa_gestora_id)
            ->firstOrFail();
        $emp->update($request->only(['nome', 'nif', 'telefone', 'email', 'especialidades', 'observacoes', 'ativa']));
        return response()->json([
            'message' => 'Empresa actualizada.',
            'data' => $emp->fresh(),
        ]);
    }
    /**
     * DELETE /api/empresas-prestadoras/{id}
     */
    public function apiEliminar(Request $request, int $id): \Illuminate\Http\JsonResponse
    {
        $emp = EmpresaPrestadora::where('id', $id)
            ->where('empresa_gestora_id', $request->user()->empresa_gestora_id)
            ->firstOrFail();
        $emp->delete();
        return response()->json([
            'message' => 'Empresa removida.',
        ]);
    }
}
