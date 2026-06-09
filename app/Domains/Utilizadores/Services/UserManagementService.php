<?php

declare(strict_types=1);

namespace App\Domains\Utilizadores\Services;

use App\Domains\Utilizadores\Models\ConviteUtilizador;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Lista, edita e gere utilizadores no contexto de uma empresa-gestora.
 */
class UserManagementService
{
    /**
     * Lista paginada de utilizadores da empresa, com filtros.
     *
     * @param array{busca:?string,role:?string,estado:?string,condominio_id:?int} $filtros
     */
    public function listar(EmpresaGestora $empresa, array $filtros = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = User::where('empresa_gestora_id', $empresa->id)
            ->with(['roles:id,name'])
            ->withCount([])
            ->orderByDesc('created_at');

        if (! empty($filtros['busca'])) {
            $busca = $filtros['busca'];
            $query->where(function ($q) use ($busca) {
                $q->where('name', 'like', "%{$busca}%")
                  ->orWhere('email', 'like', "%{$busca}%")
                  ->orWhere('telefone', 'like', "%{$busca}%");
            });
        }

        if (! empty($filtros['role'])) {
            $role = $filtros['role'];
            $query->whereHas('roles', fn ($q) => $q->where('name', $role));
        }

        if (! empty($filtros['estado'])) {
            $query->where('estado', $filtros['estado']);
        }

        if (! empty($filtros['condominio_id'])) {
            $query->where('condominio_activo_id', $filtros['condominio_id']);
        }

        return $query->paginate($perPage)->through(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'telefone' => $u->telefone,
            'estado' => $u->estado,
            'condominio_activo_id' => $u->condominio_activo_id,
            'role' => $u->roles->first()->name ?? null,
            'ultimo_login_em' => $u->ultimo_login_em?->toIso8601String(),
            'created_at' => $u->created_at?->toIso8601String(),
        ]);
    }

    /**
     * Lista convites pendentes da empresa.
     */
    public function convitesPendentes(EmpresaGestora $empresa): array
    {
        return ConviteUtilizador::where('empresa_gestora_id', $empresa->id)
            ->whereNull('usado_em')
            ->whereNull('cancelado_em')
            ->where('expira_em', '>', now())
            ->with(['convidadoPor:id,name', 'condominio:id,nome'])
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'nome' => $c->nome,
                'email' => $c->email,
                'telefone' => $c->telefone,
                'role_name' => $c->role_name,
                'condominio_nome' => $c->condominio->nome ?? null,
                'convidado_por' => $c->convidadoPor->name ?? null,
                'expira_em' => $c->expira_em->toIso8601String(),
                'created_at' => $c->created_at->toIso8601String(),
            ])
            ->all();
    }

    /**
     * Muda o condomínio activo de um utilizador (ex: gestor reatribui guarda).
     */
    public function alterarCondominioActivo(User $user, ?int $condominioId): void
    {
        $user->update(['condominio_activo_id' => $condominioId]);
    }

    /**
     * Suspende um utilizador.
     */
    public function suspender(User $user): void
    {
        $user->update(['estado' => 'suspenso']);
    }

    /**
     * Reactiva um utilizador suspenso.
     */
    public function reactivar(User $user): void
    {
        $user->update(['estado' => 'activo']);
    }

    /**
     * Lista os roles permitidos que um admin-empresa pode atribuir.
     */
    public function rolesAtribuiveis(): array
    {
        return [
            ['name' => 'gestor', 'label' => 'Gestor de Condomínios'],
            ['name' => 'administrador-condominio', 'label' => 'Administrador de Condomínio'],
            ['name' => 'guarda', 'label' => 'Guarda / Porteiro'],
            ['name' => 'funcionario', 'label' => 'Funcionário'],
            ['name' => 'condomino', 'label' => 'Condómino'],
            ['name' => 'prestador', 'label' => 'Prestador de Serviços'],
        ];
    }

    /**
     * Cria um utilizador directamente (sem convite) com password definida pelo admin.
     */
    public function criarComPassword(array $dados, ?int $criadoPorUserId = null): User
    {
        return DB::transaction(function () use ($dados) {
            $user = User::create([
                'name' => $dados['nome'],
                'email' => $dados['email'],
                'telefone' => $dados['telefone'] ?? null,
                'password' => Hash::make($dados['password']),
                'forcar_troca_password' => $dados['forcar_troca_password'] ?? false,
                'empresa_gestora_id' => $dados['empresa_gestora_id'] ?? null,
                'condominio_activo_id' => $dados['condominio_id'] ?? null,
                'estado' => 'activo',
                'locale' => 'pt-PT',
                'email_verified_at' => now(),
            ]);

            $user->assignRole($dados['role_name']);

            return $user;
        });
    }

    /**
     * Altera a password de um utilizador existente (operacao de admin).
     * Forca troca no proximo login se $forcarTroca = true.
     */
    public function alterarPassword(User $user, string $novaPassword, bool $forcarTroca = false): void
    {
        $user->update([
            'password' => Hash::make($novaPassword),
            'forcar_troca_password' => $forcarTroca,
        ]);
    }

    /**
     * Edita os dados de um utilizador (sem alterar password).
     * Pode mudar role, condominio activo, telefone, nome, etc.
     */
    public function editar(User $user, array $dados): User
    {
        return DB::transaction(function () use ($user, $dados) {
            $update = [];
            foreach (['name', 'email', 'telefone'] as $campo) {
                if (array_key_exists($campo, $dados) && $dados[$campo] !== null) {
                    $update[$campo] = $dados[$campo];
                }
            }
            if (array_key_exists('condominio_id', $dados)) {
                $update['condominio_activo_id'] = $dados['condominio_id'] ?: null;
            }
            if (! empty($update)) {
                $user->update($update);
            }

            // Mudar role (Spatie): remove tudo e atribui o novo
            if (! empty($dados['role_name'])) {
                $user->syncRoles([$dados['role_name']]);
            }

            return $user->fresh();
        });
    }
}