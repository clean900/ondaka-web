<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::rename('marketplace_categorias', 'prestador_categorias');
        Schema::rename('marketplace_destaques', 'prestador_destaques');
        Schema::rename('marketplace_avaliacoes', 'prestador_avaliacoes');
    }

    public function down(): void
    {
        Schema::rename('prestador_categorias', 'marketplace_categorias');
        Schema::rename('prestador_destaques', 'marketplace_destaques');
        Schema::rename('prestador_avaliacoes', 'marketplace_avaliacoes');
    }
};
