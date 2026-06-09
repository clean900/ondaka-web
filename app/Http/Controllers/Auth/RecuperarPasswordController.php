<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Domains\Auth\Services\SmsDoisFactoresService;
use App\Domains\Integracao\Sms\Support\NumeroAngola;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RecuperarPasswordController extends Controller
{
    private const PROPOSITO = 'recuperar_password';
    private const MSG_GENERICA = 'Se existir uma conta associada a este número, enviámos um código por SMS.';

    public function __construct(
        private readonly SmsDoisFactoresService $servico,
    ) {}

    // Página única — gere as 3 fases no frontend
    public function mostrar(): Response
    {
        return Inertia::render('Auth/RecuperarPassword');
    }

    // Fase 1 → envia OTP. Resposta SEMPRE genérica (anti-enumeração).
    public function enviarCodigo(Request $request): RedirectResponse
    {
        $request->validate(['telefone' => ['required', 'string', 'max:30']]);

        $entrada = $request->string('telefone')->toString();

        if (NumeroAngola::ehValido($entrada)) {
            $telefone = NumeroAngola::normalizar($entrada);

            $users = User::whereNotNull('telefone')->get()
                ->filter(fn ($u) => NumeroAngola::ehValido($u->telefone)
                    && NumeroAngola::normalizar($u->telefone) === $telefone)
                ->values();

            // D5 = 5b: número ambíguo → recusa (mas mensagem ainda genérica via flash de erro)
            if ($users->count() > 1) {
                return back()->withErrors([
                    'telefone' => 'Este número está associado a várias contas. Contacte o seu gestor.',
                ]);
            }

            $user = $users->first();
            if ($user) {
                $this->servico->gerarEEnviar($user, self::PROPOSITO);
                // Guarda o telefone normalizado para o passo de verificação (NÃO o user_id ainda)
                $request->session()->put('reset_telefone', $telefone);
            }
        }

        // Avança de fase via flash; a página lê e mostra o ecrã do código
        return back()
            ->with('fase', 'codigo')
            ->with('status', self::MSG_GENERICA);
    }

    // Fase 2 → verifica OTP
    public function verificarCodigo(Request $request): RedirectResponse
    {
        $request->validate(['codigo' => ['required', 'string', 'size:6', 'regex:/^[0-9]+$/']]);

        $telefone = (string) $request->session()->get('reset_telefone', '');
        if ($telefone === '') {
            return back()->withErrors(['codigo' => 'Sessão expirada. Recomece o processo.']);
        }

        $user = User::whereNotNull('telefone')->get()
            ->first(fn ($u) => NumeroAngola::ehValido($u->telefone)
                && NumeroAngola::normalizar($u->telefone) === $telefone);

        if (! $user || ! $this->servico->verificar($user, $request->string('codigo')->toString(), self::PROPOSITO)) {
            return back()->withErrors(['codigo' => 'Código inválido ou expirado.'])->with('fase', 'codigo');
        }

        // OTP validado → AGORA sim autoriza o passo final
        $request->session()->put('reset_user_id', $user->id);
        $request->session()->put('reset_otp_ok', true);

        return back()->with('fase', 'nova');
    }

    // Fase 3 → redefine a senha
    public function redefinir(Request $request): RedirectResponse
    {
        if (! $request->session()->get('reset_otp_ok')) {
            return redirect()->route('recuperar-password')->withErrors([
                'password' => 'Sessão expirada. Recomece o processo.',
            ]);
        }

        $request->validate(['password' => ['required', 'string', 'min:8', 'confirmed']]);

        $userId = $request->session()->get('reset_user_id');
        $user = $userId ? User::find($userId) : null;

        if (! $user) {
            $request->session()->forget(['reset_user_id', 'reset_telefone', 'reset_otp_ok']);
            return redirect()->route('recuperar-password');
        }

        $user->update(['password' => Hash::make($request->string('password')->toString())]);
        $request->session()->forget(['reset_user_id', 'reset_telefone', 'reset_otp_ok']);

        // NÃO faz login automático (segurança)
        return redirect()->route('login')
            ->with('status', 'Palavra-passe alterada com sucesso. Inicie sessão com a nova palavra-passe.');
    }
}
