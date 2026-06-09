<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('plataforma_facturas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subscricao_id')
                ->constrained('subscricoes')
                ->cascadeOnDelete();

            $table->string('numero', 50)->unique(); // ex: PLAT/2026/00001

            // Período coberto pela factura
            $table->date('periodo_referencia_inicio');
            $table->date('periodo_referencia_fim');

            // Snapshot do cálculo
            $table->unsignedInteger('num_imoveis_facturado');
            $table->decimal('preco_base_kz', 12, 2);
            $table->decimal('desconto_qtd_pct', 5, 2)->default(0);
            $table->decimal('desconto_periodo_pct', 5, 2)->default(0);
            $table->decimal('subtotal_kz', 14, 2);

            // Imposto (snapshot)
            $table->string('imposto_tipo', 10)->nullable(); // IVA, IPC, etc.
            $table->decimal('imposto_taxa_pct', 5, 2)->default(0);
            $table->decimal('imposto_valor_kz', 14, 2)->default(0);

            // Total a pagar
            $table->decimal('valor_total_kz', 14, 2);

            // Detalhe completo do cálculo (auditoria)
            $table->json('breakdown_json')->nullable();

            // Estado e pagamento
            $table->enum('estado', ['pendente', 'paga', 'anulada'])->default('pendente');
            $table->foreignId('proxypay_referencia_id')->nullable();

            $table->timestamp('data_emissao');
            $table->timestamp('data_vencimento');
            $table->timestamp('data_pagamento')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['subscricao_id', 'estado']);
            $table->index('data_vencimento');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plataforma_facturas');
    }
};
