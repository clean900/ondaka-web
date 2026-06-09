<?php

declare(strict_types=1);

namespace App\Domains\Tenancy\Traits;

use App\Domains\Empresa\Models\EmpresaGestora;
use App\Domains\Tenancy\Scopes\EmpresaGestoraScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToEmpresaGestora
{
    protected static function bootBelongsToEmpresaGestora(): void
    {
        static::addGlobalScope(new EmpresaGestoraScope);

        static::creating(function ($model) {
            if (! $model->empresa_gestora_id && app()->bound('empresa_gestora_actual')) {
                $empresa = app('empresa_gestora_actual');
                if ($empresa) {
                    $model->empresa_gestora_id = $empresa->id;
                }
            }
        });
    }

    public function empresaGestora(): BelongsTo
    {
        return $this->belongsTo(EmpresaGestora::class);
    }
}
