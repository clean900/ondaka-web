<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checklist_modelos', function (Blueprint $t) {
            $t->id();
            $t->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();
            $t->foreignId('condominio_id')->nullable()->constrained('condominios')->cascadeOnDelete();
            $t->string('nome', 100);
            $t->string('descricao', 255)->nullable();
            $t->enum('tipo', ['ronda', 'inspeccao', 'limpeza', 'manutencao', 'outro'])->default('ronda');
            $t->boolean('activo')->default(true);
            $t->timestamps();
            $t->softDeletes();
            $t->index(['empresa_gestora_id', 'condominio_id', 'activo']);
        });
    }
    public function down(): void { Schema::dropIfExists('checklist_modelos'); }
};
