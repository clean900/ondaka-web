<?php

declare(strict_types=1);

namespace App\Providers;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condominio\Models\Edificio;
use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Condominio\Models\TipoFraccao;
use App\Domains\Condominio\Policies\CondominioPolicy;
use App\Domains\Condominio\Policies\EdificioPolicy;
use App\Domains\Condominio\Policies\FraccaoPolicy;
use App\Domains\Condominio\Policies\TipoFraccaoPolicy;
use App\Domains\Condomino\Models\Condomino;
use App\Domains\Condomino\Policies\CondominoPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Condominio::class => CondominioPolicy::class,
        Edificio::class => EdificioPolicy::class,
        Fraccao::class => FraccaoPolicy::class,
        TipoFraccao::class => TipoFraccaoPolicy::class,
        Condomino::class => CondominoPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
