<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('configuracoes_cobranca', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_gestora_id')
                ->unique()
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();

            // Comportamento quando saldo de consumível chega a zero
            $table->enum('comportamento_saldo_zero', [
                'bloqueia',       // Não deixa continuar até recarregar (default)
                'cortesia',       // Permite até -X Kz de crédito
                'factura_fim_mes', // Nunca bloqueia, factura tudo fim do mês
            ])->default('bloqueia');

            // Para modo cortesia
            $table->decimal('limite_credito_cortesia', 14, 2)->default(0);

            // Dados fiscais
            $table->string('email_facturacao', 150)->nullable();
            $table->string('nif_facturacao', 20)->nullable();
            $table->text('morada_facturacao')->nullable();
            $table->string('designacao_fiscal', 200)->nullable();

            // Preferências de notificação
            $table->boolean('notificar_saldo_baixo_email')->default(true);
            $table->boolean('notificar_saldo_baixo_sms')->default(false);
            $table->decimal('limite_saldo_baixo_pct', 5, 2)->default(20); // 20% é "baixo"

            // Método de pagamento preferido
            $table->enum('metodo_pagamento_preferido', [
                'transferencia_bancaria',
                'deposito',
                'multicaixa',
                'referencia',
            ])->default('transferencia_bancaria');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configuracoes_cobranca');
    }
};
