<?php

declare(strict_types=1);

namespace App\Domains\Permissoes\Http\Controllers;

use App\Domains\Permissoes\Services\PermissoesService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminPermissoesController extends Controller
{
    public function __construct(protected PermissoesService $service) {}

    public function index(): Response
    {
        return Inertia::render('SuperAdmin/Permissoes/Index', [
            'matriz' => $this->service->obterMatriz(),
        ]);
    }

    public function toggle(Request $request): RedirectResponse
    {
        $request->validate([
            'role_id' => 'required|integer|exists:roles,id',
            'permission_id' => 'required|integer|exists:permissions,id',
            'atribuir' => 'required|boolean',
        ]);

        $this->service->togglePermissao(
            (int) $request->input('role_id'),
            (int) $request->input('permission_id'),
            (bool) $request->input('atribuir'),
        );

        return back();
    }

    public function criar(Request $request): RedirectResponse
    {
        $request->validate([
            'nome' => 'required|string|min:3|max:80|unique:permissions,name',
        ]);

        $this->service->criarPermissao($request->input('nome'));
        return back()->with('success', 'Permissão criada.');
    }
}
