<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Domains\Auth\Services\SmsDoisFactoresService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoisFactoresController extends Controller
{
    public function __construct(
        private readonly SmsDoisFactoresService $servico,
    ) {}

    public function desafio(Request $request): Response
    {
        $user = $request->user();

        $temCodigoValido = $user->codigosVerificacao()
            ->where('proposito', 'login_2fa')
            ->whereNull('usado_em')
            ->where('expira_em', '>=', now())
            ->exists();

        if (! $temCodigoValido) {
            $this->servico->gerarEEnviar($user);
        }

        return Inertia::render('Auth/DoisFactores', [
            'telefoneMascarado' => $this->mascararTelefone($user->telefone ?? ''),
        ]);
    }

    public function verificar(Request $request): RedirectResponse
    {
        $request->validate([
            'codigo' => ['required', 'string', 'size:6', 'regex:/^[0-9]+$/'],
        ]);

        $user = $request->user();

        if (! $this->servico->verificar($user, $request->string('codigo')->toString())) {
            return back()->withErrors(['codigo' => 'Código inválido ou expirado.']);
        }

        session(['sms_2fa_verificado' => true]);
        $user->update([
            'ultimo_login_em' => now(),
            'ultimo_login_ip' => $request->ip(),
        ]);

        return redirect()->intended(route('dashboard'));
    }

    public function reenviar(Request $request): RedirectResponse
    {
        $enviado = $this->servico->gerarEEnviar($request->user());

        return back()->with(
            $enviado ? 'success' : 'error',
            $enviado ? 'Novo código enviado.' : 'Aguarde alguns minutos antes de pedir novo código.'
        );
    }

    private function mascararTelefone(string $telefone): string
    {
        if (strlen($telefone) < 6) {
            return '***';
        }
        return substr($telefone, 0, 4) . '****' . substr($telefone, -2);
    }
}
