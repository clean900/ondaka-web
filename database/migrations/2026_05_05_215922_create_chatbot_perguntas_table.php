<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chatbot_perguntas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')
                ->constrained('chatbot_categorias')
                ->cascadeOnDelete();
            $table->string('pergunta');
            $table->text('resposta');
            $table->json('palavras_chave')->nullable()->comment('Array de keywords para pesquisa');
            $table->json('role_filter')->nullable()->comment('Roles que podem ver: condomino, gestor, etc');
            $table->integer('ordem')->default(0);
            $table->boolean('activa')->default(true);
            $table->timestamps();

            $table->index('activa');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chatbot_perguntas');
    }
};
