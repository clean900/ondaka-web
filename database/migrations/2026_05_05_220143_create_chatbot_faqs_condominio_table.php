<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chatbot_faqs_condominio', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominio_id')
                ->constrained('condominios')
                ->cascadeOnDelete();
            $table->foreignId('criado_por_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('categoria')->nullable()->comment('Texto livre escrito pelo administrador');
            $table->string('pergunta');
            $table->text('resposta');
            $table->integer('ordem')->default(0);
            $table->boolean('activa')->default(true);
            $table->timestamps();

            $table->index(['condominio_id', 'activa']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chatbot_faqs_condominio');
    }
};
