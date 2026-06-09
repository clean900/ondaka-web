<?php

declare(strict_types=1);

namespace App\Domains\Condomino\Policies;

use App\Domains\Condomino\Models\Condomino;
use App\Models\User;

class CondominoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('condominos.ver');
    }

    public function view(User $user, Condomino $condomino): bool
    {
        return $user->can('condominos.ver')
            && $this->mesmaEmpresa($user, $condomino);
    }

    public function create(User $user): bool
    {
        return $user->can('condominos.criar');
    }

    public function update(User $user, Condomino $condomino): bool
    {
        return $user->can('condominos.editar')
            && $this->mesmaEmpresa($user, $condomino);
    }

    public function delete(User $user, Condomino $condomino): bool
    {
        return $user->can('condominos.eliminar')
            && $this->mesmaEmpresa($user, $condomino);
    }

    private function mesmaEmpresa(User $user, Condomino $condomino): bool
    {
        if ($user->ehSuperAdmin()) {
            return true;
        }
        return $user->empresa_gestora_id === $condomino->empresa_gestora_id;
    }
}
