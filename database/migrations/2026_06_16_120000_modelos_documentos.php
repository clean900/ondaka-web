<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * F-01: modelos de documentação (templates) por empresa gestora.
 * Categorias: contrato, regulamento, outro.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modelos_documentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();
            $table->enum('categoria', ['contrato', 'regulamento', 'outro']);
            $table->string('nome');
            $table->string('descricao')->nullable();
            $table->string('ficheiro_path');
            $table->foreignId('criado_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['empresa_gestora_id', 'categoria']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modelos_documentos');
    }
};
