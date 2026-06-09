<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('assembleias', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();
            $table->foreignId('condominio_id')->constrained('condominios')->cascadeOnDelete();

            $table->string('numero')->unique(); // ex: ASS-2026-000001
            $table->string('tipo', 30); // 'ordinaria', 'extraordinaria'
            $table->string('titulo', 200);
            $table->text('ordem_do_dia'); // pontos a discutir
            $table->text('observacoes')->nullable();

            // Agendamento
            $table->timestamp('data_agendada'); // 1ª convocatória
            $table->timestamp('data_segunda_convocatoria')->nullable(); // +30min normalmente
            $table->string('local', 200)->default('Virtual (Jitsi)');
            $table->string('modo', 20)->default('virtual'); // virtual, presencial, hibrida

            // Jitsi
            $table->string('sala_jitsi', 100)->unique(); // slug único para URL
            $table->string('password_sala', 50)->nullable(); // opcional

            // Quórum (DP 141/15)
            $table->decimal('quorum_minimo_percent', 5, 2)->default(50.00); // %
            $table->integer('total_fraccoes')->default(0); // snapshot no momento da criação

            // Estado
            $table->string('estado', 20)->default('agendada');
            // agendada | em_curso | concluida | cancelada | sem_quorum

            // Controlo de sessão
            $table->timestamp('iniciada_em')->nullable();
            $table->timestamp('terminada_em')->nullable();
            $table->foreignId('iniciada_por_user_id')->nullable()->constrained('users');
            $table->foreignId('terminada_por_user_id')->nullable()->constrained('users');

            // Acta
            $table->boolean('acta_gerada')->default(false);
            $table->string('acta_path')->nullable();
            $table->timestamp('acta_gerada_em')->nullable();

            // Criação
            $table->foreignId('criada_por_user_id')->constrained('users');
            $table->json('convocatorias_enviadas')->nullable(); // { email_enviadas: N, sms_enviados: N }

            $table->timestamps();

            $table->index(['empresa_gestora_id', 'condominio_id']);
            $table->index(['estado', 'data_agendada']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assembleias');
    }
};
