<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('plataforma_alteracoes_imoveis', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subscricao_id')
                ->constrained('subscricoes')
                ->cascadeOnDelete();

            $table->unsignedInteger('imoveis_antes');
            $table->unsignedInteger('imoveis_depois');
            $table->integer('diferenca'); // pode ser negativo

            $table->timestamp('data_alteracao');

            // Pro-rata calculado para a próxima factura
            // Positivo = a cobrar; Negativo = crédito a abater
            $table->decimal('valor_pro_rata_kz', 14, 2)->default(0);
            $table->unsignedSmallInteger('dias_periodo_restantes')->default(0);

            // Quando aplicado
            $table->foreignId('factura_id')
                ->nullable()
                ->constrained('plataforma_facturas')
                ->nullOnDelete();

            $table->string('motivo', 200)->nullable(); // ex: 'Adicionou 25 imóveis'

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index(['subscricao_id', 'data_alteracao']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plataforma_alteracoes_imoveis');
    }
};
