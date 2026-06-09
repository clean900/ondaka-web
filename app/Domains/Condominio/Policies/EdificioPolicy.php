<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Policies;

use App\Domains\Condominio\Models\Edificio;
use App\Models\User;

class EdificioPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('edificios.ver');
    }

    public function view(User $user, Edificio $edificio): bool
    {
        return $user->can('edificios.ver')
            && $this->mesmaEmpresa($user, $edificio);
    }

    public function create(User $user): bool
    {
        return $user->can('edificios.criar');
    }

    public function update(User $user, Edificio $edificio): bool
    {
        return $user->can('edificios.editar')
            && $this->mesmaEmpresa($user, $edificio);
    }

    public function delete(User $user, Edificio $edificio): bool
    {
        return $user->can('edificios.eliminar')
            && $this->mesmaEmpresa($user, $edificio);
    }

    private function mesmaEmpresa(User $user, Edificio $edificio): bool
    {
        if ($user->ehSuperAdmin()) {
            return true;
        }
        return $user->empresa_gestora_id === $edificio->empresa_gestora_id;
    }
}
