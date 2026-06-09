<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Policies;

use App\Domains\Condominio\Models\Condominio;
use App\Models\User;

class CondominioPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('condominios.ver');
    }

    public function view(User $user, Condominio $condominio): bool
    {
        return $user->can('condominios.ver')
            && $this->mesmaEmpresa($user, $condominio);
    }

    public function create(User $user): bool
    {
        return $user->can('condominios.criar');
    }

    public function update(User $user, Condominio $condominio): bool
    {
        return $user->can('condominios.editar')
            && $this->mesmaEmpresa($user, $condominio);
    }

    public function delete(User $user, Condominio $condominio): bool
    {
        return $user->can('condominios.eliminar')
            && $this->mesmaEmpresa($user, $condominio);
    }

    private function mesmaEmpresa(User $user, Condominio $condominio): bool
    {
        if ($user->ehSuperAdmin()) {
            return true;
        }
        return $user->empresa_gestora_id === $condominio->empresa_gestora_id;
    }
}
