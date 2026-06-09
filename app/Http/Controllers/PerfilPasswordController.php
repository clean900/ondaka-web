<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pagina onde o utilizador define/altera a sua propria password.
 * Tambem usada como destino do middleware ForcarTrocaPassword.
 */
class PerfilPasswordController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('Perfil/Password', [
            'forcar_troca' => (bool) $request->user()->forcar_troca_password,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $forcarTroca = (bool) $user->forcar_troca_password;

        $regras = [
            'password' => 'required|string|min:8|confirmed',
        ];

        // Se NAO esta no fluxo "forcar troca", exigir password actual para confirmar
        if (! $forcarTroca) {
            $regras['password_actual'] = ['required', 'string', function ($attr, $value, $fail) use ($user) {
                if (! Hash::check($value, $user->password)) {
                    $fail('A password actual nao confere.');
                }
            }];
        }

        $request->validate($regras, [
            'password.confirmed' => 'A confirmacao nao coincide.',
            'password.min' => 'A password deve ter pelo menos 8 caracteres.',
        ]);

        $user->update([
            'password' => Hash::make($request->input('password')),
            'forcar_troca_password' => false,
        ]);

        return redirect()->route('dashboard')->with('success', 'Password alterada com sucesso.');
    }
}
