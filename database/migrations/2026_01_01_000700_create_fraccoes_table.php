<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('fraccoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();
            $table->foreignId('condominio_id')
                ->constrained('condominios')
                ->cascadeOnDelete();
            $table->foreignId('edificio_id')
                ->constrained('edificios')
                ->cascadeOnDelete();
            $table->foreignId('tipo_fraccao_id')
                ->constrained('tipos_fraccao')
                ->restrictOnDelete();

            $table->string('identificador', 20);
            $table->smallInteger('piso');
            $table->string('letra', 5)->nullable();
            $table->decimal('area_privativa_m2', 8, 2);
            $table->decimal('permilagem', 8, 4);

            $table->decimal('quota_mensal_base', 15, 2)->default(0);
            $table->decimal('quota_mensal_fundo_reserva', 15, 2)->default(0);

            $table->unsignedTinyInteger('numero_quartos')->nullable();
            $table->unsignedTinyInteger('numero_casas_banho')->nullable();
            $table->boolean('tem_lugar_garagem')->default(false);
            $table->unsignedTinyInteger('numero_lugares_garagem')->default(0);
            $table->boolean('tem_arrecadacao')->default(false);

            $table->enum('estado', ['ocupada', 'vaga', 'obras', 'arrendada'])->default('vaga');
            $table->text('observacoes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['edificio_id', 'identificador']);
            $table->index(['condominio_id', 'estado']);
            $table->index('empresa_gestora_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fraccoes');
    }
};
