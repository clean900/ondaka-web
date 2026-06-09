<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('condominio_id')->nullable()->constrained('condominios')->nullOnDelete();
            // null = FAQ global (empresa gestora), preenchido = específico do condomínio

            $table->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();

            $table->string('categoria', 50)->default('geral');
            // 'geral', 'financeiro', 'manutencao', 'assembleias', 'segurança', 'contactos'

            $table->string('pergunta', 300);
            $table->text('resposta');

            // Palavras-chave para matching (separadas por vírgula)
            $table->text('palavras_chave')->nullable();

            $table->integer('ordem')->default(0);
            $table->boolean('activa')->default(true);

            // Métricas
            $table->integer('vezes_respondida')->default(0);
            $table->integer('util_sim')->default(0);
            $table->integer('util_nao')->default(0);

            $table->foreignId('criada_por_user_id')->nullable()->constrained('users');

            $table->timestamps();

            $table->index(['condominio_id', 'activa']);
            $table->index(['empresa_gestora_id', 'activa']);
            $table->index('categoria');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};
