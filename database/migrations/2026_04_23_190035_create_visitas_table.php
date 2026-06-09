<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitas', function (Blueprint $table) {
            $table->id();

            // Multi-tenant
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();

            // Ligação à pré-aprovação (obrigatório — só se entra com pré-aprovação)
            $table->foreignId('pre_aprovacao_id')
                ->constrained('pre_aprovacoes')
                ->cascadeOnDelete();

            // O visitante efectivo (criado/encontrado no momento da entrada)
            $table->foreignId('visitante_id')
                ->constrained('visitantes')
                ->cascadeOnDelete();

            // Fracção visitada (redundante com pre_aprovacoes, mas útil para filtros)
            $table->foreignId('fraccao_id')
                ->constrained('fraccoes')
                ->cascadeOnDelete();

            // Guarda que registou a entrada (user_id do staff de portaria)
            $table->foreignId('guarda_entrada_id')
                ->constrained('users')
                ->restrictOnDelete();

            // Guarda que registou a saída (pode ser diferente da entrada)
            $table->foreignId('guarda_saida_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Timestamps efectivos
            $table->timestamp('entrou_em');
            $table->timestamp('saiu_em')->nullable();

            // Método de validação (como o guarda validou)
            $table->enum('metodo_validacao', ['qr', 'otp', 'manual'])
                ->default('qr');

            // Foto opcional tirada à entrada (segurança adicional)
            $table->string('foto_entrada_path', 255)->nullable();

            // Notas do guarda (ex: "entrou com 2 pessoas", "parecia nervoso")
            $table->string('observacoes', 500)->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices para relatórios frequentes
            $table->index(['empresa_gestora_id', 'entrou_em']);
            $table->index(['fraccao_id', 'entrou_em']);
            $table->index(['visitante_id', 'entrou_em']);

            // Índice para "visitantes dentro do condomínio agora" (saiu_em IS NULL)
            $table->index(['empresa_gestora_id', 'saiu_em']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitas');
    }
};
