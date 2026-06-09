<?php

declare(strict_types=1);

namespace App\Domains\Utilizadores\Http\Controllers\Web;

use App\Domains\Utilizadores\Services\ConviteService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Página pública /convite/{token}
 * Permite ao utilizador convidado definir a sua password e activar a conta.
 */
class ConvitePublicoController extends Controller
{
    public function __construct(
        protected ConviteService $service,
    ) {}

    public function mostrar(string $token): Response
    {
        $convite = $this->service->obterPorToken($token);

        if (! $convite) {
            return Inertia::render('Convite/Invalido');
        }

        return Inertia::render('Convite/Aceitar', [
            'convite' => [
                'token' => $convite->token,
                'nome' => $convite->nome,
                'email' => $convite->email,
                'role_name' => $convite->role_name,
                'empresa_nome' => $convite->empresaGestora->nome ?? null,
                'condominio_nome' => $convite->condominio->nome ?? null,
                'expira_em' => $convite->expira_em->toIso8601String(),
            ],
        ]);
    }

    public function aceitar(Request $request, string $token): RedirectResponse
    {
        $convite = $this->service->obterPorToken($token);
        if (! $convite) {
            return redirect()->route('login')->with('error', 'Convite inválido ou expirado.');
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8|confirmed',
        ], [
            'password.confirmed' => 'A confirmação da password não coincide.',
            'password.min' => 'A password deve ter pelo menos 8 caracteres.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        try {
            $user = $this->service->aceitar($convite, $request->input('password'));
        } catch (\DomainException $e) {
            return redirect()->route('login')->with('error', $e->getMessage());
        }

        Auth::login($user);
        return redirect()->route('dashboard')->with('success', 'Conta activada com sucesso. Bem-vindo ao ONDAKA!');
    }
}
