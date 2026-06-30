<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Relatórios Personalizados agendados (Fase 2 #3): envio recorrente por email.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('relatorios_agendados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();
            $table->unsignedBigInteger('condominio_id')->nullable();
            $table->string('titulo')->default('Relatório Personalizado');
            $table->json('seccoes');
            $table->unsignedSmallInteger('meses')->default(12);
            $table->string('frequencia', 20)->default('mensal'); // mensal | semanal
            $table->unsignedTinyInteger('dia')->default(1);        // dia do mês (1-28) ou da semana (1-7)
            $table->text('destinatarios');                          // emails separados por vírgula
            $table->boolean('ativo')->default(true);
            $table->timestamp('ultimo_envio_em')->nullable();
            $table->timestamps();

            $table->index(['empresa_gestora_id', 'ativo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('relatorios_agendados');
    }
};
