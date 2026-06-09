<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subscricao_periodos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subscricao_id')
                ->constrained('subscricoes')
                ->cascadeOnDelete();

            // Período coberto
            $table->timestamp('inicio_em');
            $table->timestamp('fim_em');

            // Snapshot no momento de cobrança (histórico)
            $table->string('ciclo', 20); // mensal ou anual
            $table->unsignedInteger('fraccoes_cobradas');
            $table->decimal('preco_por_fraccao', 12, 2);
            $table->decimal('subtotal', 14, 2);
            $table->decimal('desconto_pct', 5, 2)->default(0);
            $table->decimal('desconto_valor', 14, 2)->default(0);
            $table->decimal('valor_total', 14, 2);

            // Escalão aplicado (snapshot para auditoria)
            $table->string('escalao_nome', 50)->nullable();

            // Ligação à factura emitida (FK adicionada na Fase 3)
            $table->unsignedBigInteger('factura_id')->nullable();
            $table->index('factura_id');

            // Estado do período
            $table->enum('estado', [
                'pendente_pagamento',
                'pago',
                'em_atraso',
                'cancelado',
            ])->default('pendente_pagamento');

            $table->timestamp('pago_em')->nullable();

            $table->timestamps();

            $table->index(['subscricao_id', 'inicio_em']);
            $table->index(['estado', 'fim_em']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscricao_periodos');
    }
};
