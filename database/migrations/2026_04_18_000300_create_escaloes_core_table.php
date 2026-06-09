<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('escaloes_core', function (Blueprint $table) {
            $table->id();

            $table->string('slug', 50)->unique(); // starter, standard, plus, large, enterprise
            $table->string('nome', 80);
            $table->text('descricao')->nullable();

            // Intervalo de fracções (inclusivo)
            $table->unsignedInteger('min_fraccoes');
            $table->unsignedInteger('max_fraccoes')->nullable(); // null = sem limite

            // Preço por fracção por mês (em Kz)
            $table->decimal('preco_por_fraccao_mensal', 12, 2);

            // Se quiseres oferecer desconto específico para este escalão em anual
            $table->decimal('desconto_anual_pct', 5, 2)->default(10);

            // Para display
            $table->string('cor_badge', 20)->nullable(); // c-teal, c-blue, etc
            $table->unsignedSmallInteger('ordem')->default(0);

            // Activo?
            $table->boolean('activo')->default(true);

            $table->timestamps();

            $table->index(['activo', 'ordem']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('escaloes_core');
    }
};
