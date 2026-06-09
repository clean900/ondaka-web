<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checklist_execucoes', function (Blueprint $t) {
            $t->id();
            $t->foreignId('modelo_id')->constrained('checklist_modelos')->cascadeOnDelete();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('escala_turno_id')->nullable()->constrained('escala_turnos')->nullOnDelete();
            $t->timestamp('iniciada_em');
            $t->timestamp('concluida_em')->nullable();
            $t->enum('estado', ['em_curso', 'concluida', 'cancelada'])->default('em_curso');
            $t->json('respostas')->nullable(); // [{item_id, ok, nota}, ...]
            $t->string('observacoes', 1000)->nullable();
            $t->timestamps();
            $t->index(['modelo_id', 'estado']);
            $t->index(['user_id', 'estado']);
        });
    }
    public function down(): void { Schema::dropIfExists('checklist_execucoes'); }
};
