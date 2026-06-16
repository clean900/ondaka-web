<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * F-02: adiciona 'transferencia' ao enum origem_tipo dos movimentos de conta
 * bancária (transferências entre contas).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE contas_bancarias_movimentos MODIFY COLUMN origem_tipo ENUM('manual','proxypay','pagamento_aprovado','despesa','transferencia') NOT NULL DEFAULT 'manual'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE contas_bancarias_movimentos MODIFY COLUMN origem_tipo ENUM('manual','proxypay','pagamento_aprovado','despesa') NOT NULL DEFAULT 'manual'");
    }
};
