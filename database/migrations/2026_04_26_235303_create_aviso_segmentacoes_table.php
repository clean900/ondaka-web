<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aviso_segmentacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aviso_id')->constrained('avisos')->onDelete('cascade');

            // Tipo de segmentação
            $table->enum('tipo', [
                'todos',       // Todo o condomínio (sem mais critérios)
                'fraccao',     // Uma fração específica
                'bloco',       // Todas as fracções de um bloco/torre
                'grupo',       // Um grupo de utilizadores (ex: gestores)
            ]);

            // ID alvo (depende do tipo)
            //   - tipo=todos: NULL
            //   - tipo=fraccao: id da fração
            //   - tipo=bloco: nome do bloco como string em valor_texto
            //   - tipo=grupo: id do grupo (futuro - quando criarmos tabela grupos)
            $table->unsignedBigInteger('alvo_id')->nullable();
            $table->string('valor_texto', 100)->nullable(); // Para bloco (ex: "Bloco A")

            $table->timestamps();

            $table->index(['aviso_id', 'tipo']);
            $table->index(['tipo', 'alvo_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aviso_segmentacoes');
    }
};
