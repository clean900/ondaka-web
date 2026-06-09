<?php

declare(strict_types=1);

namespace App\Domains\Familiar\Http\Controllers\Api;

use App\Domains\Condomino\Models\Condomino;
use App\Domains\Familiar\Models\Familiar;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class FamiliarApiController extends Controller
{
    private function titular(Request $request): ?Condomino
    {
        $user = $request->user();
        // Um familiar NUNCA pode gerir familiares — so o condomino titular.
        if ($user->hasRole('familiar')) {
            return null;
        }
        return Condomino::where('user_id', $user->id)->first();
    }

    // GET /api/familiares — lista os familiares do titular
    public function index(Request $request): JsonResponse
    {
        $titular = $this->titular($request);
        if (! $titular) {
            return response()->json(['data' => []]);
        }
        $familiares = Familiar::where('condomino_id', $titular->id)->get()->map(fn ($f) => [
            'id' => $f->id,
            'nome' => $f->nome,
            'parentesco' => $f->parentesco,
            'telefone' => $f->telefone,
            'email' => $f->email,
            'acessos' => $f->acessos ?? [],
            'ativo' => $f->ativo,
            'tem_conta' => $f->user_id !== null,
        ]);
        return response()->json([
            'data' => $familiares,
            'acessos_disponiveis' => Familiar::ACESSOS_DISPONIVEIS,
        ]);
    }

    // POST /api/familiares — cria um familiar (e a conta de login)
    public function store(Request $request): JsonResponse
    {
        $titular = $this->titular($request);
        if (! $titular) {
            return response()->json(['message' => 'Apenas condóminos podem adicionar familiares.'], 403);
        }

        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'parentesco' => ['nullable', 'string', 'max:100'],
            'telefone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:6'],
            'acessos' => ['nullable', 'array'],
            'acessos.*' => ['string', 'in:' . implode(',', Familiar::ACESSOS_DISPONIVEIS)],
        ]);

        // criar a conta de utilizador do familiar (login por telemovel)
        $user = User::create([
            'name' => $data['nome'],
            'email' => $data['email'] ?? null,
            'telefone' => $data['telefone'],
            'password' => Hash::make($data['password']),
            'empresa_gestora_id' => $titular->empresa_gestora_id,
            'estado' => 'activo',
        ]);
        $user->assignRole('familiar');

        $familiar = Familiar::create([
            'condomino_id' => $titular->id,
            'user_id' => $user->id,
            'nome' => $data['nome'],
            'parentesco' => $data['parentesco'] ?? null,
            'telefone' => $data['telefone'],
            'email' => $data['email'] ?? null,
            'acessos' => $data['acessos'] ?? [],
            'ativo' => true,
        ]);

        return response()->json(['message' => 'Familiar adicionado.', 'id' => $familiar->id], 201);
    }

    // PUT /api/familiares/{familiar} — atualiza acessos/dados
    public function update(Request $request, Familiar $familiar): JsonResponse
    {
        $titular = $this->titular($request);
        if (! $titular || $familiar->condomino_id !== $titular->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $data = $request->validate([
            'nome' => ['sometimes', 'string', 'max:255'],
            'parentesco' => ['nullable', 'string', 'max:100'],
            'acessos' => ['nullable', 'array'],
            'acessos.*' => ['string', 'in:' . implode(',', Familiar::ACESSOS_DISPONIVEIS)],
            'ativo' => ['sometimes', 'boolean'],
        ]);

        $familiar->update($data);

        // refletir o estado no user (se desativar familiar, desativa login)
        if (isset($data['ativo']) && $familiar->user) {
            $familiar->user->update(['estado' => $data['ativo'] ? 'activo' : 'inactivo']);
        }

        return response()->json(['message' => 'Familiar atualizado.']);
    }

    // DELETE /api/familiares/{familiar}
    public function destroy(Request $request, Familiar $familiar): JsonResponse
    {
        $titular = $this->titular($request);
        if (! $titular || $familiar->condomino_id !== $titular->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }
        // desativar a conta de login do familiar
        if ($familiar->user) {
            $familiar->user->update(['estado' => 'inactivo']);
        }
        $familiar->delete();
        return response()->json(['message' => 'Familiar removido.']);
    }
}
