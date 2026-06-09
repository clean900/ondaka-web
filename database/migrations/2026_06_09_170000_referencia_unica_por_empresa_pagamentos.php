<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Remover a constraint unica global na coluna referencia
        Schema::table('pagamentos_condomino', function (Blueprint $table) {
            $table->dropUnique('pagamentos_condomino_referencia_unique');
        });

        // Criar constraint unica composta: referencia unica POR empresa gestora
        Schema::table('pagamentos_condomino', function (Blueprint $table) {
            $table->unique(['empresa_gestora_id', 'referencia'], 'pag_cond_empresa_referencia_unique');
        });
    }

    public function down(): void
    {
        Schema::table('pagamentos_condomino', function (Blueprint $table) {
            $table->dropUnique('pag_cond_empresa_referencia_unique');
        });
        Schema::table('pagamentos_condomino', function (Blueprint $table) {
            $table->unique('referencia', 'pagamentos_condomino_referencia_unique');
        });
    }
};
