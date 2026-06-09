<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_anuncios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('condominio_id')->nullable();
            $table->unsignedBigInteger('empresa_gestora_id')->nullable();
            $table->foreignId('categoria_id')->constrained('marketplace_categorias');
            $table->enum('tipo', ['produto', 'servico']);
            $table->string('titulo', 150);
            $table->text('descricao')->nullable();
            $table->decimal('preco', 14, 2)->nullable();
            $table->enum('visibilidade', ['condominio', 'plataforma'])->default('condominio');
            $table->enum('estado_venda', ['disponivel', 'em_negociacao', 'vendido', 'cancelado'])->default('disponivel');
            $table->enum('estado_moderacao', ['activo', 'removido'])->default('activo');

            // Identidade publica (privacidade: nunca expor dados reais do user)
            $table->string('nome_exibicao', 80)->nullable();

            // Contactos — anunciante preenche os que quiser
            $table->string('contacto_telefone', 30)->nullable();
            $table->string('contacto_whatsapp', 30)->nullable();
            $table->string('contacto_email', 120)->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['estado_moderacao', 'visibilidade']);
            $table->index('estado_venda');
            $table->index('condominio_id');
            $table->index('categoria_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_anuncios');
    }
};
