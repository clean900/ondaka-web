<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('acordos_pagamento', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('condomino_id');
            $table->unsignedBigInteger('condominio_id');
            $table->unsignedBigInteger('empresa_gestora_id');
            $table->decimal('valor_total', 14, 2);
            $table->unsignedTinyInteger('num_prestacoes');
            $table->enum('estado', [
                'pendente',       // condómino propôs, aguarda gestor
                'aprovado',       // gestor aprovou, prestações criadas
                'recusado',       // gestor recusou
                'em_cumprimento', // pelo menos 1 prestação paga
                'cumprido',       // todas as prestações pagas
                'quebrado',       // prestação em atraso
            ])->default('pendente');
            $table->unsignedBigInteger('proposto_por_user_id');
            $table->unsignedBigInteger('aprovado_por_user_id')->nullable();
            $table->timestamp('decidido_em')->nullable();
            $table->text('observacoes')->nullable();
            $table->text('motivo_recusa')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('condomino_id');
            $table->index('condominio_id');
            $table->index('estado');
        });

        Schema::create('acordo_prestacoes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('acordo_id');
            $table->unsignedTinyInteger('numero');
            $table->decimal('valor', 14, 2);
            $table->date('data_vencimento');
            $table->enum('estado', ['pendente', 'paga', 'atrasada'])->default('pendente');
            $table->timestamp('paga_em')->nullable();
            $table->timestamps();

            $table->index('acordo_id');
            $table->index('estado');
            $table->foreign('acordo_id')->references('id')->on('acordos_pagamento')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('acordo_prestacoes');
        Schema::dropIfExists('acordos_pagamento');
    }
};
