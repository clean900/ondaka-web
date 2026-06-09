<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitantes', function (Blueprint $table) {
            $table->id();

            // Multi-tenant (isolamento por empresa gestora)
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();

            // Dados pessoais
            $table->string('nome', 150);
            $table->string('telefone', 20)->nullable();
            $table->string('bi_numero', 30)->nullable();

            // Foto opcional (caminho no storage)
            $table->string('foto_path', 255)->nullable();

            // Notas (ex: "jardineiro do Sr. Silva", "frequente")
            $table->string('notas', 255)->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices para pesquisa
            $table->index(['empresa_gestora_id', 'nome']);
            $table->index(['empresa_gestora_id', 'telefone']);
            $table->index(['empresa_gestora_id', 'bi_numero']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitantes');
    }
};
