<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pagamentos', function (Blueprint $table) {
            $table->id();

            // Referência interna (PAG-2026-000001)
            $table->string('referencia', 30)->unique();

            // Ordem a que pertence
            $table->foreignId('ordem_compra_id')
                ->constrained('ordens_compra')
                ->cascadeOnDelete();

            // Método
            $table->enum('metodo', [
                'transferencia_bancaria', // manual com comprovativo
                'deposito_bancario',      // manual com comprovativo
                'proxypay_rps',           // automático (Fase 4)
                'proxypay_dds',           // automático (Fase 4)
                'multicaixa_express',     // automático (Fase 4)
                'outro',
            ]);

            // Valor do pagamento (pode ser parcial)
            $table->decimal('valor', 14, 2);
            $table->string('moeda', 3)->default('AOA');

            // Dados da transacção (quando aplicável)
            $table->string('referencia_externa', 100)->nullable(); // número da transferência, ID ProxyPay, etc
            $table->date('data_transacao')->nullable(); // data na qual cliente fez pagamento
            $table->string('banco_origem', 100)->nullable();
            $table->string('conta_origem', 50)->nullable(); // últimos 4 dígitos ou IBAN parcial
            $table->string('nome_ordenante', 150)->nullable();

            // Comprovativo
            $table->string('comprovativo_path', 255)->nullable(); // path do ficheiro em storage
            $table->string('comprovativo_original_name', 255)->nullable();
            $table->string('comprovativo_mime', 50)->nullable();
            $table->unsignedInteger('comprovativo_tamanho_bytes')->nullable();

            // Estado
            $table->enum('estado', [
                'registado',   // cliente submeteu
                'em_analise',  // super-admin a verificar
                'confirmado',  // super-admin validou
                'rejeitado',   // super-admin rejeitou (comprovativo inválido, etc)
                'devolvido',   // devolução/reembolso
            ])->default('registado');

            // Datas
            $table->timestamp('confirmado_em')->nullable();
            $table->timestamp('rejeitado_em')->nullable();

            $table->text('notas')->nullable();
            $table->text('motivo_rejeicao')->nullable();

            // Utilizadores
            $table->foreignId('registado_por_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->foreignId('confirmado_por_user_id')->nullable()
                ->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['ordem_compra_id', 'estado']);
            $table->index('referencia');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagamentos');
    }
};
