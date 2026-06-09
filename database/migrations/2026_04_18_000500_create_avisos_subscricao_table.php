<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('avisos_subscricao', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();

            $table->foreignId('subscricao_id')
                ->nullable()
                ->constrained('subscricoes')
                ->nullOnDelete();

            // Tipo de aviso
            $table->enum('tipo', [
                'trial_boas_vindas',
                'trial_7_dias_restantes',
                'trial_3_dias_restantes',
                'trial_expira_hoje',
                'grace_dia_1',
                'grace_dia_3',
                'grace_dia_7',
                'conta_suspensa',
                'saldo_baixo_sms',
                'saldo_baixo_generico',
                'renovacao_proxima',
                'renovacao_falhou',
                'factura_emitida',
                'factura_vencida',
            ]);

            // Canal
            $table->enum('canal', ['email', 'sms', 'in_app', 'push'])->default('email');

            // Destino
            $table->string('destinatario', 200); // email ou telefone

            // Estado
            $table->enum('estado', ['pendente', 'enviado', 'falhou'])->default('pendente');

            $table->timestamp('enviado_em')->nullable();
            $table->text('erro')->nullable();

            // Contexto livre (ex: {"factura_id": 42})
            $table->json('contexto')->nullable();

            $table->timestamps();

            $table->index(['empresa_gestora_id', 'tipo']);
            $table->index(['estado', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avisos_subscricao');
    }
};
