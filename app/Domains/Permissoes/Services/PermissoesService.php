<?php

declare(strict_types=1);

namespace App\Domains\Permissoes\Services;

use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PermissoesService
{
    public function obterMatriz(): array
    {
        $roles = Role::orderBy('id')->get(['id', 'name'])->map(fn($r) => [
            'id' => $r->id,
            'name' => $r->name,
            'permissions' => $r->permissions->pluck('id')->all(),
        ])->all();

        $permissions = Permission::orderBy('name')->get(['id', 'name'])->map(fn($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'grupo' => $this->extrairGrupo($p->name),
        ])->all();

        return ['roles' => $roles, 'permissions' => $permissions];
    }

    public function togglePermissao(int $roleId, int $permissionId, bool $atribuir): void
    {
        $role = Role::findOrFail($roleId);
        $permission = Permission::findOrFail($permissionId);

        if ($atribuir) {
            $role->givePermissionTo($permission);
        } else {
            $role->revokePermissionTo($permission);
        }
    }

    public function criarPermissao(string $nome): Permission
    {
        return Permission::create(['name' => $nome, 'guard_name' => 'web']);
    }

    protected function extrairGrupo(string $name): string
    {
        // ex: "users.create" -> "users"
        $partes = explode('.', $name);
        return $partes[0] ?? 'geral';
    }
}
