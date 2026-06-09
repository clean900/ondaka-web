<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->onDelete('cascade');
            $table->foreignId('condominio_id')->constrained('condominios')->onDelete('cascade');
            $table->foreignId('aberto_por_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('fraccao_id')->nullable()->constrained('fraccoes')->onDelete('set null');
            $table->foreignId('atribuido_a_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('titulo', 200);
            $table->text('descricao');
            $table->enum('categoria', ['manutencao','limpeza','seguranca','ruido','agua','electricidade','jardim','estacionamento','reclamacao','sugestao','outro'])->default('outro');
            $table->enum('prioridade', ['baixa', 'media', 'alta', 'urgente'])->default('media');
            $table->enum('estado', ['aberto', 'em_analise', 'em_curso', 'resolvido', 'fechado', 'cancelado'])->default('aberto');
            $table->timestamp('atribuido_em')->nullable();
            $table->timestamp('resolvido_em')->nullable();
            $table->timestamp('fechado_em')->nullable();
            $table->boolean('threads_publicas')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['empresa_gestora_id', 'condominio_id', 'estado']);
            $table->index(['aberto_por_user_id', 'estado']);
            $table->index(['atribuido_a_user_id', 'estado']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
