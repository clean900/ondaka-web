<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Policies;

use App\Domains\Condominio\Models\TipoFraccao;
use App\Models\User;

class TipoFraccaoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('fraccoes.ver');
    }

    public function create(User $user): bool
    {
        return $user->can('empresa.configuracoes.editar');
    }

    public function update(User $user, TipoFraccao $tipo): bool
    {
        return $user->can('empresa.configuracoes.editar')
            && ($user->ehSuperAdmin() || $user->empresa_gestora_id === $tipo->empresa_gestora_id);
    }

    public function delete(User $user, TipoFraccao $tipo): bool
    {
        return $user->can('empresa.configuracoes.editar')
            && ($user->ehSuperAdmin() || $user->empresa_gestora_id === $tipo->empresa_gestora_id);
    }
}
