<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domains\Empresa\Services\RegistoEmpresaService;
use App\Http\Requests\RegistoRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Wizard de auto-registo público (3 passos).
 * Cria empresa + user admin + subscrição trial 30 dias.
 */
class RegistoController extends Controller
{
    public function __construct(
        protected RegistoEmpresaService $service,
    ) {}

    /**
     * Mostra a página do wizard.
     */
    public function index(): Response
    {
        return Inertia::render('Registo/Index');
    }

    /**
     * Processa submissão final do wizard.
     */
    public function store(RegistoRequest $request): RedirectResponse
    {
        $resultado = $this->service->registar($request->validated());

        // Login automático após registo
        Auth::login($resultado['user']);

        $request->session()->regenerate();

        return redirect()->route('dashboard')->with('success', sprintf(
            'Conta criada com sucesso! Tem 30 dias de trial gratuito.'
        ));
    }
}
