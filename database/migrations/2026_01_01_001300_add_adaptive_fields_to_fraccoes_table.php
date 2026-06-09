<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('fraccoes', function (Blueprint $table) {
            // Para vivendas: número de pisos (1 térrea, 2 duplex, 3 triplex)
            $table->unsignedTinyInteger('numero_pisos')->default(1)->after('piso');

            // Para vivendas: tipo de habitação
            $table->enum('tipo_habitacao', ['isolada', 'geminada', 'em_banda'])
                ->nullable()
                ->after('numero_pisos');

            // Para vivendas: características privativas
            $table->boolean('tem_piscina_privativa')->default(false)->after('tem_arrecadacao');
            $table->boolean('tem_jardim_privativo')->default(false)->after('tem_piscina_privativa');
            $table->boolean('tem_anexo')->default(false)->after('tem_jardim_privativo');

            // Para lotes: área do terreno
            $table->decimal('area_terreno_m2', 10, 2)->nullable()->after('area_privativa_m2');

            // Orientação solar (norte, sul, este, oeste) - útil para marketing
            $table->enum('orientacao', ['norte', 'sul', 'este', 'oeste', 'nordeste', 'noroeste', 'sudeste', 'sudoeste'])
                ->nullable()
                ->after('tem_anexo');

            // Ter piso múltiplo (duplex/triplex): permitir piso nullable
            $table->smallInteger('piso')->nullable()->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('fraccoes', function (Blueprint $table) {
            $table->dropColumn([
                'numero_pisos',
                'tipo_habitacao',
                'tem_piscina_privativa',
                'tem_jardim_privativo',
                'tem_anexo',
                'area_terreno_m2',
                'orientacao',
            ]);
        });
    }
};
