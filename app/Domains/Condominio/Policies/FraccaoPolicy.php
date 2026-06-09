<?php

declare(strict_types=1);

namespace App\Domains\Condominio\Policies;

use App\Domains\Condominio\Models\Fraccao;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class FraccaoPolicy
{
    public function viewAny(User $user): bool
    {
        $ok = $user->can('fraccoes.ver');
        Log::info('FraccaoPolicy::viewAny', ['user_id' => $user->id, 'can' => $ok]);
        return $ok;
    }

    public function view(User $user, Fraccao $fraccao): bool
    {
        $canPerm = $user->can('fraccoes.ver');
        $mesmaEmp = $this->mesmaEmpresa($user, $fraccao);
        Log::info('FraccaoPolicy::view', [
            'user_id' => $user->id,
            'user_empresa' => $user->empresa_gestora_id,
            'fraccao_id' => $fraccao->id,
            'fraccao_empresa' => $fraccao->empresa_gestora_id,
            'can_perm' => $canPerm,
            'mesma_empresa' => $mesmaEmp,
            'super_admin' => $user->ehSuperAdmin(),
        ]);
        return $canPerm && $mesmaEmp;
    }

    public function create(User $user): bool
    {
        return $user->can('fraccoes.criar');
    }

    public function update(User $user, Fraccao $fraccao): bool
    {
        return $user->can('fraccoes.editar')
            && $this->mesmaEmpresa($user, $fraccao);
    }

    public function delete(User $user, Fraccao $fraccao): bool
    {
        return $user->can('fraccoes.eliminar')
            && $this->mesmaEmpresa($user, $fraccao);
    }

    private function mesmaEmpresa(User $user, Fraccao $fraccao): bool
    {
        if ($user->ehSuperAdmin()) {
            return true;
        }
        return $user->empresa_gestora_id === $fraccao->empresa_gestora_id;
    }
}
