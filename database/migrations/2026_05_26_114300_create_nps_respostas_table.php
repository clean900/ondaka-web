<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nps_respostas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Quem avalia e o que avalia
            $table->enum('tipo_avaliador', ['condomino', 'gestora']);
            $table->enum('alvo', ['condominio', 'plataforma']);

            // Contexto (preenchido conforme o alvo)
            $table->unsignedBigInteger('condominio_id')->nullable();
            $table->unsignedBigInteger('empresa_gestora_id')->nullable();

            // Resposta
            $table->unsignedTinyInteger('nota'); // 0 a 10
            $table->enum('categoria', ['detractor', 'passivo', 'promotor']);
            $table->text('comentario')->nullable();
            $table->text('seguimento')->nullable();

            $table->timestamps();

            $table->index(['alvo', 'tipo_avaliador']);
            $table->index('condominio_id');
            $table->index('empresa_gestora_id');
            $table->index(['user_id', 'alvo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nps_respostas');
    }
};
