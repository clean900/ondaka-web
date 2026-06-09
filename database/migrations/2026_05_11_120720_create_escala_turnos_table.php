<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('escala_turnos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();
            $table->foreignId('condominio_id')
                ->nullable()
                ->constrained('condominios')
                ->nullOnDelete();
            $table->foreignId('turno_modelo_id')
                ->constrained('turnos_modelo')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete()
                ->comment('Funcionário/guarda escalado');
            $table->date('data');
            $table->dateTime('inicio_previsto');
            $table->dateTime('fim_previsto');
            $table->enum('estado', ['agendado', 'em_curso', 'concluido', 'falhou', 'cancelado'])
                ->default('agendado');
            $table->foreignId('criado_por_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->text('observacoes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['empresa_gestora_id', 'data']);
            $table->index(['user_id', 'data']);
            $table->index(['condominio_id', 'data']);
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('escala_turnos');
    }
};
