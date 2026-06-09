<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ordens_compra', function (Blueprint $table) {
            $table->id();

            // Numeração única (ex: ORD-2026-000001) - gerada pelo service
            $table->string('numero', 30)->unique();

            // Polimórfico: quem comprou (EmpresaGestora ou Condominio)
            $table->string('owner_type');
            $table->unsignedBigInteger('owner_id');

            // O que está a comprar
            $table->enum('tipo_item', ['feature', 'pacote_consumivel', 'subscricao_core']);
            $table->unsignedBigInteger('feature_id')->nullable();
            $table->foreign('feature_id')->references('id')->on('features')->nullOnDelete();
            $table->unsignedBigInteger('pacote_id')->nullable();
            $table->foreign('pacote_id')->references('id')->on('feature_pacotes')->nullOnDelete();

            // Para subscrições mensais (meses pedidos)
            $table->unsignedInteger('meses_contratados')->nullable();

            // Descrição humana ("Pacote Médio SMS Sender ID - 416 SMS")
            $table->string('descricao_item', 200);

            // Valores
            $table->decimal('valor_base', 14, 2); // sem IVA
            $table->decimal('valor_activacao', 14, 2)->default(0); // taxa activação única
            $table->decimal('valor_iva', 14, 2)->default(0); // IVA 14%
            $table->decimal('valor_total', 14, 2); // final com IVA

            // Estado
            $table->enum('estado', [
                'pendente',    // criada, aguarda pagamento
                'em_revisao',  // comprovativo submetido, super-admin a validar
                'aprovada',    // aprovada, feature/subscrição activada
                'rejeitada',   // rejeitada por super-admin
                'cancelada',   // cancelada pelo cliente
                'expirada',    // passou prazo de pagamento (ex: 7 dias)
            ])->default('pendente');

            // Datas
            $table->timestamp('prazo_pagamento')->nullable(); // 7 dias após criação
            $table->timestamp('aprovada_em')->nullable();
            $table->timestamp('rejeitada_em')->nullable();
            $table->timestamp('cancelada_em')->nullable();

            // Notas
            $table->text('motivo_rejeicao')->nullable();
            $table->text('notas_cliente')->nullable();
            $table->text('notas_admin')->nullable();

            // Factura gerada (FK para facturas — criado depois)
            $table->string('numero_factura', 30)->nullable();

            // Relação resultante (quando aprovada, cria/actualiza uma FeatureSubscription)
            $table->foreignId('feature_subscription_id')->nullable()
                ->constrained('feature_subscriptions')->nullOnDelete();

            // Quem criou e quem aprovou
            $table->foreignId('criada_por_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->foreignId('aprovada_por_user_id')->nullable()
                ->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['owner_type', 'owner_id']);
            $table->index(['estado', 'created_at']);
            $table->index('numero');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ordens_compra');
    }
};
