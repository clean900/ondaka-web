<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login por email + password.
     * Devolve token Sanctum + dados do user.
     *
     * POST /api/login
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'       => ['required', 'string'],
            'password'    => ['required', 'string', 'min:6'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $login = trim($data['email']);

        if (str_contains($login, '@')) {
            // Login por email (web e mobile)
            $user = User::where('email', $login)->first();
        } else {
            // Login por telemóvel (mobile) — normaliza prefixo 244
            $tel = preg_replace('/\D/', '', $login);
            $telSem244 = preg_replace('/^244/', '', $tel);
            $user = User::where('telefone', $tel)
                ->orWhere('telefone', $telSem244)
                ->orWhere('telefone', '244' . $telSem244)
                ->first();
        }

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        if ($user->estado !== 'activo') {
            throw ValidationException::withMessages([
                'email' => ['Conta inactiva. Contacte o administrador.'],
            ]);
        }

        $deviceName = $data['device_name'] ?? 'mobile-' . now()->timestamp;
        $token = $user->createToken($deviceName);

        // Actualizar último login
        $user->update([
            'ultimo_login_em' => now(),
            'ultimo_login_ip' => $request->ip(),
        ]);

        return response()->json([
            'token' => $token->plainTextToken,
            'user'  => [
                'id'                 => $user->id,
                'name'               => $user->name,
                'email'              => $user->email,
                'telefone'           => $user->telefone,
                'empresa_gestora_id' => $user->empresa_gestora_id,
                'roles'              => $user->roles->pluck('name'),
                'locale'             => $user->locale ?? 'pt_AO',
            ],
        ], 200);
    }

    /**
     * Devolve dados do user autenticado.
     * Usado pelo mobile para validar sessão e obter perfil.
     *
     * GET /api/user
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        // Condomínio do primeiro contrato activo (para o cabeçalho da app mobile)
        $condominioNome = null;
        $condomino = \App\Domains\Condomino\Models\Condomino::where('user_id', $user->id)->first();
        if ($condomino) {
            $contrato = \App\Domains\Condomino\Models\ContratoOcupacao::where('condomino_id', $condomino->id)
                ->where('estado', 'activo')
                ->with('fraccao.edificio.condominio:id,nome')
                ->first();
            $condominioNome = $contrato?->fraccao?->edificio?->condominio?->nome;
        }

        return response()->json([
            'id'                 => $user->id,
            'name'               => $user->name,
            'email'              => $user->email,
            'telefone'           => $user->telefone,
            'empresa_gestora_id' => $user->empresa_gestora_id,
            'estado'             => $user->estado,
            'roles'              => $user->roles->pluck('name'),
            'locale'             => $user->locale ?? 'pt_AO',
            'condominio_nome'    => $condominioNome,
        ]);
    }

    /**
     * Revoga o token actual (logout).
     *
     * POST /api/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout efectuado com sucesso.',
        ]);
    }
}
