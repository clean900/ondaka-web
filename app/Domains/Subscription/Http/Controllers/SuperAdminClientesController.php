<?php

declare(strict_types=1);

namespace App\Domains\Subscription\Http\Controllers;

use App\Domains\Subscription\Services\ClientesB2BService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminClientesController extends Controller
{
    public function __construct(
        protected ClientesB2BService $service,
    ) {}

    /**
     * Lista paginada de clientes B2B.
     */
    public function index(Request $request): Response
    {
        $filtros = $request->only(['busca', 'estado', 'tipo', 'order_by', 'order_dir']);
        $clientes = $this->service->listar($filtros);

        return Inertia::render('SuperAdmin/Clientes/Index', [
            'clientes' => $clientes,
            'filtros' => $filtros,
        ]);
    }

    /**
     * Detalhe de um cliente.
     */
    public function show(int $id): Response
    {
        $detalhe = $this->service->detalhar($id);

        if (empty($detalhe)) {
            abort(404, 'Cliente não encontrado.');
        }

        return Inertia::render('SuperAdmin/Clientes/Show', [
            'detalhe' => $detalhe,
        ]);
    }

    /**
     * Estende trial.
     */
    public function extenderTrial(Request $request, int $subscricaoId): RedirectResponse
    {
        $request->validate([
            'dias' => 'required|integer|min:1|max:365',
            'motivo' => 'nullable|string|max:500',
        ]);

        $this->service->extenderTrial(
            $subscricaoId,
            (int) $request->input('dias'),
            Auth::id(),
            $request->input('motivo'),
        );

        return back()->with('success', "Trial estendido em {$request->dias} dias.");
    }

    /**
     * Cancela subscrição.
     */
    public function cancelar(Request $request, int $subscricaoId): RedirectResponse
    {
        $request->validate([
            'motivo' => 'required|string|max:500',
        ]);

        $this->service->cancelar(
            $subscricaoId,
            Auth::id(),
            $request->input('motivo'),
        );

        return back()->with('success', 'Subscrição cancelada (termina no fim do período pago).');
    }

    /**
     * Muda plano.
     */
    public function mudarPlano(Request $request, int $subscricaoId): RedirectResponse
    {
        $request->validate([
            'ciclo' => 'required|in:mensal,semestral,anual',
        ]);

        $this->service->mudarPlano(
            $subscricaoId,
            $request->input('ciclo'),
            Auth::id(),
        );

        return back()->with('success', "Plano alterado para {$request->ciclo}.");
    }

    /**
     * Login as — super-admin entra como utilizador da empresa.
     * Guarda super-admin original na sessão para regressar.
     */
    public function loginAs(Request $request, int $empresaId): RedirectResponse
    {
        // Encontrar primeiro user admin-empresa da empresa
        $targetUser = User::where('empresa_gestora_id', $empresaId)
            ->whereHas('roles', function ($q) {
                $q->whereIn('name', ['admin-empresa', 'gestor']);
            })
            ->first();

        if (! $targetUser) {
            return back()->with('error', 'Esta empresa não tem utilizadores activos.');
        }

        // Guardar super-admin original
        $request->session()->put('super_admin_original_id', Auth::id());

        // Trocar de user
        Auth::login($targetUser);

        return redirect()->route('dashboard')->with('success', sprintf(
            'Entrou como %s. Use "Voltar para Super-Admin" no menu para regressar.',
            $targetUser->name
        ));
    }

    /**
     * Volta ao super-admin original.
     */
    public function voltarSuperAdmin(Request $request): RedirectResponse
    {
        $originalId = $request->session()->pull('super_admin_original_id');

        if (! $originalId) {
            return redirect()->route('dashboard');
        }

        $original = User::find($originalId);
        if ($original) {
            Auth::login($original);
        }

        return redirect()->route('super-admin.clientes.index')->with('success', 'Voltou ao super-admin.');
    }
}
