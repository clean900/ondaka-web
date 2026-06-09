<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('pagamentos_condomino', function (Blueprint $table) {
            $table->foreignId('conta_bancaria_id')
                ->nullable()
                ->after('condomino_id')
                ->constrained('contas_bancarias')
                ->nullOnDelete();

            $table->foreignId('movimento_id')
                ->nullable()
                ->after('conta_bancaria_id')
                ->constrained('contas_bancarias_movimentos')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pagamentos_condomino', function (Blueprint $table) {
            $table->dropForeign(['movimento_id']);
            $table->dropForeign(['conta_bancaria_id']);
            $table->dropColumn(['movimento_id', 'conta_bancaria_id']);
        });
    }
};
