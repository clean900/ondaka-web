<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabela `creditos_fraccao` — saldo a favor do condómino numa fracção.
     *
     * Origem mais comum: conversão de pagamento (parcial/excedente) em crédito.
     * Pode também ser usado para ajustes administrativos.
     *
     * Uso: deduzido manualmente (admin imputa a um lançamento) ou
     * automaticamente (deduzido em novo pagamento).
     */
    public function up(): void
    {
        Schema::create('creditos_fraccao', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('empresa_gestora_id');
            $table->foreign('empresa_gestora_id', 'fk_credf_empresa')
                ->references('id')->on('empresas_gestoras')->cascadeOnDelete();

            $table->unsignedBigInteger('condominio_id');
            $table->foreign('condominio_id', 'fk_credf_condominio')
                ->references('id')->on('condominios')->cascadeOnDelete();

            $table->unsignedBigInteger('fraccao_id');
            $table->foreign('fraccao_id', 'fk_credf_fraccao')
                ->references('id')->on('fraccoes')->cascadeOnDelete();

            // Snapshot do condómino na altura da criação (pode mudar dono depois)
            $table->unsignedBigInteger('condomino_id')->nullable();
            $table->foreign('condomino_id', 'fk_credf_condomino')
                ->references('id')->on('condominos')->nullOnDelete();

            $table->decimal('valor', 12, 2);                    // positivo
            $table->decimal('valor_usado', 12, 2)->default(0);   // quanto já foi consumido

            $table->string('descricao', 500);
            $table->string('motivo', 500)->nullable();

            // Origem opcional: pagamento que gerou o crédito
            $table->unsignedBigInteger('pagamento_origem_id')->nullable();
            $table->foreign('pagamento_origem_id', 'fk_credf_pagamento')
                ->references('id')->on('pagamentos_condomino')->nullOnDelete();

            // Quem criou
            $table->unsignedBigInteger('created_by_user_id')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['empresa_gestora_id', 'fraccao_id'], 'idx_credf_emp_frac');
            $table->index('pagamento_origem_id', 'idx_credf_pag_origem');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('creditos_fraccao');
    }
};
