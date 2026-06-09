<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Pagamentos B2C — Empresa Gestora ↔ Condómino.
     *
     * Separada da tabela `pagamentos` que existe (que é B2B:
     * Soluções Simples ↔ Empresa Gestora).
     *
     * Métodos suportados:
     * - transferencia_bancaria — condómino transfere para IBAN do condomínio,
     *   sobe comprovativo, admin valida.
     * - deposito_bancario — variante do anterior
     * - proxypay_rps — pagamento via referência multicaixa (automático)
     * - dinheiro — admin regista pagamento em dinheiro entregue na portaria/sede
     * - outro — método manual, admin descreve
     *
     * O pagamento NÃO está directamente ligado a um lançamento. Em vez disso,
     * cria-se uma ou mais "imputacoes" que distribuem o valor do pagamento
     * pelos lançamentos em dívida.
     *
     * Exemplo: condomino paga 50.000 Kz. Admin imputa:
     * - 15.000 → quota_base de Maio
     * - 5.000 → fundo_reserva de Maio
     * - 25.000 → despesa_extra (reparação)
     * - 5.000 → multa de Abril
     */
    public function up(): void
    {
        // 1. Pagamento (registo do dinheiro recebido)
        Schema::create('pagamentos_condomino', function (Blueprint $table) {
            $table->id();
            $table->string('referencia', 50)->unique()->comment('Identificador externo: PAG-2026-00001');

            $table->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();
            $table->foreignId('condominio_id')->constrained('condominios')->cascadeOnDelete();
            $table->foreignId('fraccao_id')->constrained('fraccoes')->cascadeOnDelete();
            $table->foreignId('condomino_id')->nullable()->constrained('condominos')->nullOnDelete();

            // Método e valor
            $table->enum('metodo', [
                'transferencia_bancaria',
                'deposito_bancario',
                'proxypay_rps',
                'dinheiro',
                'outro',
            ]);
            $table->decimal('valor', 14, 2);
            $table->string('moeda', 3)->default('AOA');

            // Datas
            $table->date('data_pagamento')->comment('Quando foi efectuado pelo condómino');
            $table->timestamp('confirmado_em')->nullable();
            $table->timestamp('rejeitado_em')->nullable();

            // Comprovativo (transferência/depósito)
            $table->string('comprovativo_path', 500)->nullable();
            $table->string('comprovativo_nome_original', 255)->nullable();
            $table->string('comprovativo_mime', 50)->nullable();
            $table->unsignedInteger('comprovativo_tamanho_bytes')->nullable();
            $table->string('referencia_externa', 100)->nullable()->comment('Nº de transferência/depósito reportado pelo banco');
            $table->string('banco_origem', 100)->nullable();

            // ProxyPay (vinculação à referência se método = proxypay_rps)
            $table->foreignId('pagamento_referencia_id')->nullable()->constrained('pagamento_referencias')->nullOnDelete();

            // Estado
            $table->enum('estado', ['pendente', 'em_revisao', 'confirmado', 'rejeitado', 'devolvido'])->default('pendente');
            $table->text('motivo_rejeicao')->nullable();

            // Audit
            $table->foreignId('registado_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('confirmado_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notas_admin')->nullable();
            $table->text('notas_condomino')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['fraccao_id', 'estado']);
            $table->index(['condominio_id', 'data_pagamento']);
            $table->index(['empresa_gestora_id', 'estado']);
            $table->index('referencia');
        });

        // 2. Imputações (distribuição do pagamento pelos lançamentos)
        Schema::create('pagamento_imputacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pagamento_id')->constrained('pagamentos_condomino')->cascadeOnDelete();
            $table->foreignId('lancamento_id')->constrained('lancamentos_condomino')->cascadeOnDelete();
            $table->decimal('valor', 14, 2)->comment('Quanto deste pagamento foi imputado a este lançamento');
            $table->timestamps();

            $table->unique(['pagamento_id', 'lancamento_id']);
            $table->index('lancamento_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagamento_imputacoes');
        Schema::dropIfExists('pagamentos_condomino');
    }
};
