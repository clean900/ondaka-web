<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('condominio_encomenda_config', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominio_id')
                ->unique()
                ->constrained('condominios')
                ->cascadeOnDelete();

            // Valor padrão sugerido para a multa (gestor pode ajustar por encomenda)
            $table->decimal('multa_valor_padrao_kz', 10, 2)->default(5000);

            // Dias até aviso e multa
            $table->unsignedTinyInteger('dias_aviso')->default(5);
            $table->unsignedTinyInteger('dias_multa')->default(7);

            // Permitir cobrança por ProxyPay / extracto / dinheiro
            $table->boolean('permite_pagamento_proxypay')->default(true);
            $table->boolean('permite_pagamento_extracto')->default(true);
            $table->boolean('permite_pagamento_dinheiro')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('condominio_encomenda_config');
    }
};
