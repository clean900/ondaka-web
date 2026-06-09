<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Estender o enum 'tipo' de lancamentos_condomino com 'acordo'
        DB::statement("ALTER TABLE lancamentos_condomino MODIFY COLUMN tipo ENUM('quota_base','fundo_reserva','despesa_extra','multa','juros','ajuste_credito','ajuste_debito','acordo') NOT NULL");

        // 2. Adicionar lancamento_id em acordo_prestacoes (o elo)
        Schema::table('acordo_prestacoes', function (Blueprint $table) {
            $table->unsignedBigInteger('lancamento_id')->nullable()->after('acordo_id');
        });
    }

    public function down(): void
    {
        Schema::table('acordo_prestacoes', function (Blueprint $table) {
            $table->dropColumn('lancamento_id');
        });
        DB::statement("ALTER TABLE lancamentos_condomino MODIFY COLUMN tipo ENUM('quota_base','fundo_reserva','despesa_extra','multa','juros','ajuste_credito','ajuste_debito') NOT NULL");
    }
};
