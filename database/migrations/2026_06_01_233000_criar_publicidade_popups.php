<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publicidade_popups', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('mensagem')->nullable();
            $table->string('imagem_path')->nullable();
            $table->string('botao_texto')->nullable();
            $table->string('link_url')->nullable();
            $table->enum('alvo', ['ambos', 'mobile', 'web'])->default('ambos');
            $table->boolean('ativo')->default(false);
            // data e hora de inicio/fim da campanha (opcionais)
            $table->dateTime('inicio_em')->nullable();
            $table->dateTime('fim_em')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publicidade_popups');
    }
};
