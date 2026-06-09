<?php

declare(strict_types=1);

namespace App\Domains\Tenancy\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class EmpresaGestoraScope implements Scope
{
    /**
     * Aplica o scope: todas as queries filtram automaticamente
     * por empresa_gestora_id do tenant actual.
     *
     * Super-admin (empresa_gestora_id = null no user) não é filtrado.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (! app()->bound('empresa_gestora_actual')) {
            return;
        }

        $empresa = app('empresa_gestora_actual');

        if ($empresa === null) {
            return;
        }

        $builder->where(
            $model->getTable() . '.empresa_gestora_id',
            $empresa->id
        );
    }
}
