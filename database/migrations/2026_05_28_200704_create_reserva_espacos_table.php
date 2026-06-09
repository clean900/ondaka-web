<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reserva_espacos', function (Blueprint $t) {
            $t->id();
            $t->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();
            $t->foreignId('condominio_id')->nullable()->constrained('condominios')->cascadeOnDelete();
            $t->string('nome', 100);                  // Salão de Festas, Churrasqueira...
            $t->string('descricao', 255)->nullable();
            $t->time('hora_abertura')->default('08:00');   // janela diária
            $t->time('hora_fecho')->default('22:00');
            $t->unsignedSmallInteger('duracao_min_horas')->default(1);  // bloco mínimo
            $t->unsignedSmallInteger('duracao_max_horas')->default(4);  // bloco máximo
            $t->unsignedSmallInteger('antecedencia_min_horas')->default(48);  // pedir com X h de antecedência
            $t->unsignedSmallInteger('antecedencia_max_dias')->default(60);   // até X dias no futuro
            $t->boolean('tem_caucao')->default(false);
            $t->decimal('valor_caucao', 14, 2)->default(0);
            $t->boolean('activo')->default(true);
            $t->timestamps();
            $t->softDeletes();
            $t->index(['empresa_gestora_id', 'condominio_id', 'activo']);
        });
    }
    public function down(): void { Schema::dropIfExists('reserva_espacos'); }
};
