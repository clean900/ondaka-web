<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Domains\Condomino\Models\Condomino;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestão do perfil do user logado (qualquer role).
 *
 * - GET /perfil → página com formulário de edição
 * - PATCH /perfil → actualiza nome/telefone/email/locale
 * - PATCH /perfil/password → muda password
 */
class PerfilController extends Controller
{
    /**
     * Página de perfil.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Perfil/Index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'telefone' => $user->telefone,
                'locale' => $user->locale ?? 'pt_AO',
                'roles' => $user->roles->pluck('name'),
                'must_change_password' => (bool) $user->must_change_password,
                'foto_path' => $user->foto_path,
            ],
        ]);
    }

    /**
     * Actualiza dados básicos do perfil.
     * Sincroniza com condominos.nome_completo se for condómino.
     */
    public function updatePerfil(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'telefone' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($user->id)],
            'locale' => ['nullable', 'string', 'in:pt_AO,pt_PT,en'],
        ]);

        $user->update($data);

        // SYNC: se for condómino, sincronizar condominos.nome_completo
        $condomino = Condomino::where('user_id', $user->id)->first();
        if ($condomino) {
            $condomino->update(['nome_completo' => $data['name']]);
        }

        return back()->with('success', 'Perfil actualizado com sucesso.');
    }

    /**
     * Muda a password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'password_actual' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'max:60', 'confirmed'],
        ], [
            'password.confirmed' => 'A confirmação da nova password não coincide.',
        ]);

        if (!Hash::check($data['password_actual'], $user->password)) {
            return back()->withErrors(['password_actual' => 'A password actual está incorrecta.']);
        }

        $user->update([
            'password' => Hash::make($data['password']),
            'must_change_password' => false,
        ]);

        return back()->with('success', 'Password actualizada com sucesso.');
    }
}
