<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('facturas', function (Blueprint $table) {
            $table->id();

            // Número de factura conforme DP 141/15 (FT ONDAKA/2026/000001)
            $table->string('numero', 40)->unique();
            $table->string('serie', 20)->default('ONDAKA/2026');
            $table->unsignedBigInteger('numero_sequencial');

            // Tipo de documento SAFT-AO
            $table->enum('tipo_documento', [
                'FT',  // Factura
                'FR',  // Factura-Recibo
                'NC',  // Nota de Crédito
                'ND',  // Nota de Débito
                'RC',  // Recibo
            ])->default('FT');

            // Ordem a que está associada
            $table->foreignId('ordem_compra_id')
                ->constrained('ordens_compra')
                ->restrictOnDelete();

            // Destinatário (snapshot no momento da emissão)
            $table->string('destinatario_nome', 200);
            $table->string('destinatario_nif', 20)->nullable();
            $table->string('destinatario_morada', 255)->nullable();
            $table->string('destinatario_provincia', 100)->nullable();
            $table->string('destinatario_municipio', 100)->nullable();
            $table->string('destinatario_email', 150)->nullable();
            $table->string('destinatario_telefone', 30)->nullable();

            // Emissor (nosso — snapshot)
            $table->string('emissor_nome', 200)->default('Soluções Simples, Lda');
            $table->string('emissor_nif', 20);
            $table->string('emissor_morada', 255)->nullable();

            // Valores (conforme DP 141/15)
            $table->decimal('valor_base', 14, 2);
            $table->decimal('valor_desconto', 14, 2)->default(0);
            $table->decimal('valor_iva', 14, 2);
            $table->decimal('taxa_iva', 5, 2)->default(14.00); // IVA Angola 14%
            $table->decimal('valor_total', 14, 2);
            $table->decimal('valor_pago', 14, 2)->default(0);
            $table->string('moeda', 3)->default('AOA');

            // Datas
            $table->date('data_emissao');
            $table->date('data_vencimento')->nullable();

            // Estado
            $table->enum('estado', [
                'rascunho',
                'emitida',   // certificada, não editável
                'paga',      // pagamento confirmado
                'anulada',   // por nota de crédito
            ])->default('emitida');

            // Hash de integridade (SAFT-AO requer)
            $table->string('hash_integridade', 64)->nullable();

            // Path do PDF gerado
            $table->string('pdf_path', 255)->nullable();

            // Linhas (descrição dos items) - guardadas como JSON
            $table->json('linhas'); // [{descricao, quantidade, preco_unitario, subtotal}]

            // Observações
            $table->text('observacoes')->nullable();

            // Emitida por
            $table->foreignId('emitida_por_user_id')->nullable()
                ->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['serie', 'numero_sequencial']);
            $table->index(['estado', 'data_emissao']);
            $table->index('destinatario_nif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facturas');
    }
};
