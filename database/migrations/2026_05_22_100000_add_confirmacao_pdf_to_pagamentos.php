<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pagamentos', function (Blueprint $table) {
            if (! Schema::hasColumn('pagamentos', 'confirmacao_pdf_path')) {
                $table->string('confirmacao_pdf_path')->nullable()->after('comprovativo_tamanho_bytes');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pagamentos', function (Blueprint $table) {
            if (Schema::hasColumn('pagamentos', 'confirmacao_pdf_path')) {
                $table->dropColumn('confirmacao_pdf_path');
            }
        });
    }
};
