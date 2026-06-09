<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('assembleia_pontos_votacao', function (Blueprint $table) {
            $table->id();

            $table->foreignId('assembleia_id')->constrained('assembleias')->cascadeOnDelete();

            $table->integer('ordem')->default(0); // 1, 2, 3... na ordem do dia
            $table->string('titulo', 300); // ex: "Aprovação das contas do exercício 2025"
            $table->text('descricao')->nullable(); // detalhe adicional

            // Estado do ponto
            $table->string('estado', 20)->default('pendente');
            // pendente | em_votacao | encerrado

            // Controlo temporal
            $table->timestamp('aberta_em')->nullable();
            $table->timestamp('fechada_em')->nullable();
            $table->foreignId('aberta_por_user_id')->nullable()->constrained('users');
            $table->foreignId('fechada_por_user_id')->nullable()->constrained('users');

            // Resultado (cacheado no fecho para performance e histórico)
            $table->integer('total_votos_sim')->default(0);
            $table->integer('total_votos_nao')->default(0);
            $table->integer('total_votos_abstencao')->default(0);
            $table->decimal('permilagem_sim', 8, 3)->default(0); // ‰
            $table->decimal('permilagem_nao', 8, 3)->default(0);
            $table->decimal('permilagem_abstencao', 8, 3)->default(0);
            $table->string('resultado', 20)->nullable();
            // aprovado | rejeitado | empate | sem_quorum

            // Origem da detecção (automática ou manual)
            $table->boolean('detectado_automaticamente')->default(false);

            $table->timestamps();

            $table->index(['assembleia_id', 'ordem']);
            $table->index(['assembleia_id', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assembleia_pontos_votacao');
    }
};
