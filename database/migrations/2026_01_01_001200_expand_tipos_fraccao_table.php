<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tipos_fraccao', function (Blueprint $table) {
            // Categoria: ajuda a filtrar tipos por tipo de condomínio
            $table->enum('categoria', [
                'residencial_vertical',
                'residencial_horizontal',
                'comercial',
                'empresarial',
                'auxiliar',
                'loteamento',
            ])->default('residencial_vertical')->after('codigo');

            // Se pode ter múltiplos pisos (duplex, triplex)
            $table->boolean('tem_pisos_multiplos')->default(false)->after('categoria');

            // Número típico de pisos (1 para térrea, 2 para duplex, 3 para triplex)
            $table->unsignedTinyInteger('numero_pisos_tipico')->default(1)->after('tem_pisos_multiplos');

            // É residencial?
            $table->boolean('eh_residencial')->default(true)->after('numero_pisos_tipico');

            $table->index('categoria');
        });
    }

    public function down(): void
    {
        Schema::table('tipos_fraccao', function (Blueprint $table) {
            $table->dropIndex(['categoria']);
            $table->dropColumn([
                'categoria',
                'tem_pisos_multiplos',
                'numero_pisos_tipico',
                'eh_residencial',
            ]);
        });
    }
};
