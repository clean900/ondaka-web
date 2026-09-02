<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domains\Afiliados\Http\Middleware\CapturarCodigoAfiliado;
use App\Domains\Afiliados\Services\AfiliadoService;
use App\Domains\Empresa\Services\RegistoEmpresaService;
use App\Http\Requests\RegistoRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
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
    public function index(Request $request): Response
    {
        return Inertia::render('Registo/Index', [
            'ref_afiliado' => $this->refAfiliado($request),
        ]);
    }

    /**
     * Afiliado que indicou este visitante (query ?ref= tem prioridade sobre o cookie).
     * Só devolve afiliados activos; nunca expõe dados sensíveis.
     */
    private function refAfiliado(Request $request): ?array
    {
        $codigo = $request->query('ref') ?: $request->cookie(CapturarCodigoAfiliado::COOKIE);
        if (! is_string($codigo) || $codigo === '') {
            return null;
        }
        $af = app(AfiliadoService::class)->porCodigo($codigo);

        return $af ? ['codigo' => $af->codigo, 'nome' => $af->nome] : null;
    }

    /**
     * Processa submissão final do wizard.
     */
    public function store(RegistoRequest $request): RedirectResponse
    {
        $dados = $request->validated();
        // Código de afiliado: campo do formulário (vindo do ?ref=) ou cookie guardado numa visita anterior
        if (empty($dados['codigo_afiliado'])) {
            $cookie = $request->cookie(CapturarCodigoAfiliado::COOKIE);
            $dados['codigo_afiliado'] = is_string($cookie) && $cookie !== '' ? $cookie : null;
        }

        $resultado = $this->service->registar($dados);
        Cookie::queue(Cookie::forget(CapturarCodigoAfiliado::COOKIE));

        // Login automático após registo
        Auth::login($resultado['user']);

        $request->session()->regenerate();

        return redirect()->route('dashboard')->with('success', sprintf(
            'Conta criada com sucesso! Tem 30 dias de trial gratuito.'
        ));
    }
}
