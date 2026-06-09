<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Adicionar a coluna na tabela CERTA (pagamentos_condomino)
        Schema::table('pagamentos_condomino', function (Blueprint $table) {
            if (! Schema::hasColumn('pagamentos_condomino', 'confirmacao_pdf_path')) {
                $table->string('confirmacao_pdf_path')->nullable()->after('comprovativo_tamanho_bytes');
            }
        });

        // Remover a coluna da tabela ERRADA (pagamentos), se lá foi criada por engano
        if (Schema::hasTable('pagamentos')
            && Schema::hasColumn('pagamentos', 'confirmacao_pdf_path')) {
            Schema::table('pagamentos', function (Blueprint $table) {
                $table->dropColumn('confirmacao_pdf_path');
            });
        }
    }

    public function down(): void
    {
        Schema::table('pagamentos_condomino', function (Blueprint $table) {
            if (Schema::hasColumn('pagamentos_condomino', 'confirmacao_pdf_path')) {
                $table->dropColumn('confirmacao_pdf_path');
            }
        });
    }
};
