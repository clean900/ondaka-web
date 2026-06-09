<?php

namespace App\Domains\Tickets\Http\Controllers\Web;

use App\Domains\Tickets\Models\EmpresaPrestadora;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EquipaController extends Controller
{
    /**
     * Página pública para condóminos verem a equipa.
     */
    public function index(Request $request): Response
    {
        $empresaId = $request->user()->empresa_gestora_id;

        // Users com roles relevantes
        $rolesRelevantes = ['admin-empresa', 'gestor', 'administrador-condominio', 'funcionario', 'guarda'];

        $users = User::where('empresa_gestora_id', $empresaId)
            ->whereHas('roles', fn ($q) => $q->whereIn('name', $rolesRelevantes))
            ->with('roles:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'telefone'])
            ->map(function ($u) {
                $primeiroRole = $u->roles->first()->name ?? '';
                return [
                    'id' => $u->id,
                    'tipo' => 'user',
                    'nome' => $u->name,
                    'cargo' => $this->labelDoRole($primeiroRole),
                    'role_slug' => $primeiroRole,
                    'telefone' => $u->telefone,
                    'inicial' => mb_strtoupper(mb_substr($u->name, 0, 1)),
                ];
            });

        // Empresas prestadoras activas
        $empresas = EmpresaPrestadora::paraEmpresa($empresaId)
            ->ativas()
            ->orderBy('nome')
            ->get(['id', 'nome', 'telefone', 'especialidades'])
            ->map(function ($e) {
                return [
                    'id' => $e->id,
                    'tipo' => 'empresa',
                    'nome' => $e->nome,
                    'cargo' => $e->especialidades ?: 'Empresa prestadora',
                    'role_slug' => 'empresa-prestadora',
                    'telefone' => $e->telefone,
                    'inicial' => mb_strtoupper(mb_substr($e->nome, 0, 1)),
                ];
            });

        $equipa = $users->concat($empresas)->values();

        return Inertia::render('Condominio/Equipa', [
            'equipa' => $equipa,
        ]);
    }

    private function labelDoRole(string $role): string
    {
        $map = [
            'super-admin' => 'Super-Administrador',
            'admin-empresa' => 'Administrador',
            'gestor' => 'Gestor',
            'administrador-condominio' => 'Administrador do Condomínio',
            'funcionario' => 'Funcionário',
            'guarda' => 'Guarda',
            'condomino' => 'Condómino',
            'prestador' => 'Prestador',
        ];
        return $map[$role] ?? ucfirst($role);
    }
    /**
     * GET /api/condominio/equipa
     * Versão API do index() — mesma lógica, devolve JSON em vez de Inertia.
     */
    public function apiIndex(Request $request): \Illuminate\Http\JsonResponse
    {
        $empresaId = $request->user()->empresa_gestora_id;
        $rolesRelevantes = ['admin-empresa', 'gestor', 'administrador-condominio', 'funcionario', 'guarda'];
        $users = User::where('empresa_gestora_id', $empresaId)
            ->whereHas('roles', fn ($q) => $q->whereIn('name', $rolesRelevantes))
            ->with('roles:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'telefone'])
            ->map(function ($u) use ($rolesRelevantes) {
                // Filtrar apenas roles relevantes (excluir super-admin)
                $roleRelevante = $u->roles->pluck('name')->intersect($rolesRelevantes)->first() ?? '';
                return [
                    'id' => $u->id,
                    'tipo' => 'user',
                    'nome' => $u->name,
                    'cargo' => $this->labelDoRole($roleRelevante),
                    'role_slug' => $roleRelevante,
                    'telefone' => $u->telefone,
                    'inicial' => mb_strtoupper(mb_substr($u->name, 0, 1)),
                ];
            });
        $empresas = EmpresaPrestadora::paraEmpresa($empresaId)
            ->ativas()
            ->orderBy('nome')
            ->get(['id', 'nome', 'telefone', 'especialidades'])
            ->map(function ($e) {
                return [
                    'id' => $e->id,
                    'tipo' => 'empresa',
                    'nome' => $e->nome,
                    'cargo' => $e->especialidades ?: 'Empresa prestadora',
                    'role_slug' => 'empresa-prestadora',
                    'telefone' => $e->telefone,
                    'inicial' => mb_strtoupper(mb_substr($e->nome, 0, 1)),
                ];
            });
        $equipa = $users->concat($empresas)->values();
        return response()->json([
            'equipa' => $equipa,
        ]);
    }
}
