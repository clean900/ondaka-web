<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Livro de Ocorrências + Passagem de Turno da portaria (add-on livro_ocorrencias).
 * Tabelas novas e isoladas (não tocam no fluxo existente).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ocorrencias_portaria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();
            $table->unsignedBigInteger('condominio_id')->nullable();
            $table->foreignId('guarda_id')->constrained('users')->restrictOnDelete();
            $table->enum('tipo', ['observacao', 'incidente', 'alerta'])->default('observacao');
            $table->text('descricao');
            $table->string('foto_path')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamp('resolvida_em')->nullable();
            $table->foreignId('resolvida_por')->nullable()->constrained('users')->nullOnDelete();
            $table->string('notas_resolucao', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['empresa_gestora_id', 'created_at']);
            $table->index(['empresa_gestora_id', 'resolvida_em']);
        });

        Schema::create('passagens_turno', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();
            $table->unsignedBigInteger('condominio_id')->nullable();
            $table->foreignId('guarda_id')->constrained('users')->restrictOnDelete();
            $table->text('resumo');
            $table->unsignedInteger('total_dentro')->default(0);
            $table->unsignedInteger('ocorrencias_abertas')->default(0);
            $table->timestamps();
            $table->index(['empresa_gestora_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('passagens_turno');
        Schema::dropIfExists('ocorrencias_portaria');
    }
};
