<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('contas_bancarias_movimentos', function (Blueprint $table) {
            $table->boolean('anulado')->default(false)->after('saldo_apos')->index();
            $table->timestamp('anulado_em')->nullable()->after('anulado');
            $table->foreignId('anulado_por_user_id')->nullable()->after('anulado_em')->constrained('users')->nullOnDelete();
            $table->string('motivo_anulacao', 300)->nullable()->after('anulado_por_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('contas_bancarias_movimentos', function (Blueprint $table) {
            $table->dropForeign(['anulado_por_user_id']);
            $table->dropColumn(['anulado', 'anulado_em', 'anulado_por_user_id', 'motivo_anulacao']);
        });
    }
};
