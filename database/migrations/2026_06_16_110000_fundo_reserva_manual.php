<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * F-04: fundo de reserva manual.
 * - Marca uma conta bancária como conta do Fundo de Reserva.
 * - Adiciona 'fundo_reserva' ao enum origem_tipo dos movimentos.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contas_bancarias', function (Blueprint $table) {
            $table->boolean('e_fundo_reserva')->default(false)->after('principal');
        });

        DB::statement("ALTER TABLE contas_bancarias_movimentos MODIFY COLUMN origem_tipo ENUM('manual','proxypay','pagamento_aprovado','despesa','transferencia','fundo_reserva') NOT NULL DEFAULT 'manual'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE contas_bancarias_movimentos MODIFY COLUMN origem_tipo ENUM('manual','proxypay','pagamento_aprovado','despesa','transferencia') NOT NULL DEFAULT 'manual'");

        Schema::table('contas_bancarias', function (Blueprint $table) {
            $table->dropColumn('e_fundo_reserva');
        });
    }
};
