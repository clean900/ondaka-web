<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avisos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->onDelete('cascade');
            $table->foreignId('condominio_id')->constrained('condominios')->onDelete('cascade');
            $table->foreignId('autor_user_id')->constrained('users')->onDelete('cascade');

            // Conteúdo
            $table->string('titulo', 200);
            $table->text('descricao'); // Texto rico (HTML/markdown)

            // Categoria
            $table->enum('categoria', [
                'geral',
                'manutencao',
                'reuniao',
                'urgente',
                'evento',
                'aviso_legal',
                'outro',
            ])->default('geral');

            // Prioridade
            $table->enum('prioridade', ['baixa', 'media', 'alta', 'urgente'])->default('media');

            // Estado
            $table->enum('estado', [
                'rascunho',     // Draft, ainda não publicado
                'agendado',     // Tem publicar_em no futuro
                'publicado',    // Visível aos condóminos
                'arquivado',    // Já não aparece na lista
            ])->default('rascunho');

            // Agendamento
            $table->timestamp('publicar_em')->nullable(); // Quando publicar (null = imediato)
            $table->timestamp('publicado_em')->nullable(); // Quando foi efectivamente publicado
            $table->timestamp('arquivar_em')->nullable(); // Quando arquivar automaticamente

            // Configurações
            $table->boolean('permite_comentarios')->default(true);
            $table->boolean('requer_confirmacao')->default(false); // Condomino marca "li e aceito"
            $table->boolean('notificar_push')->default(true);
            $table->boolean('notificar_email')->default(true);
            $table->boolean('notificar_sms')->default(false);

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['empresa_gestora_id', 'condominio_id']);
            $table->index(['condominio_id', 'estado']);
            $table->index('publicar_em');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avisos');
    }
};
