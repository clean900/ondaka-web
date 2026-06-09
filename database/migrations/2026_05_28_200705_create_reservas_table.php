<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $t) {
            $t->id();
            $t->foreignId('espaco_id')->constrained('reserva_espacos')->cascadeOnDelete();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('condominio_id')->nullable()->constrained('condominios')->nullOnDelete();
            $t->date('data');
            $t->time('hora_inicio');
            $t->time('hora_fim');
            // estados: pendente -> aprovada|recusada ; aprovada -> aguarda_caucao -> confirmada
            $t->enum('estado', ['pendente', 'aprovada', 'recusada', 'aguarda_caucao', 'confirmada', 'cancelada'])->default('pendente');
            $t->string('motivo', 255)->nullable();          // p/ recusa ou nota do condómino
            $t->string('comprovativo_caucao')->nullable();  // path do ficheiro
            $t->boolean('caucao_paga')->default(false);
            $t->timestamp('decidida_em')->nullable();
            $t->foreignId('decidida_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
            $t->index(['espaco_id', 'data', 'estado']);
            $t->index(['user_id', 'estado']);
        });
    }
    public function down(): void { Schema::dropIfExists('reservas'); }
};
