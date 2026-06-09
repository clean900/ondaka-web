<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('registos_presenca', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();
            $table->foreignId('escala_turno_id')
                ->nullable()
                ->constrained('escala_turnos')
                ->nullOnDelete()
                ->comment('Escala associada — null se checkin sem escala prévia');
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('condominio_id')
                ->nullable()
                ->constrained('condominios')
                ->nullOnDelete();
            $table->dateTime('checkin_em');
            $table->dateTime('checkout_em')->nullable();
            $table->decimal('horas_trabalhadas', 8, 2)->nullable()->comment('Calculado em checkout');
            $table->text('observacoes_checkin')->nullable();
            $table->text('observacoes_checkout')->nullable();
            $table->ipAddress('ip_checkin')->nullable();
            $table->ipAddress('ip_checkout')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['empresa_gestora_id', 'checkin_em']);
            $table->index(['user_id', 'checkin_em']);
            $table->index('escala_turno_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registos_presenca');
    }
};
