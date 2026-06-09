<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pagamento_referencias', function (Blueprint $table) {
            $table->unsignedBigInteger('ordem_compra_id')->nullable()->change();
            $table->foreignId('pagamento_condomino_id')->nullable()->after('ordem_compra_id')
                ->constrained('pagamentos_condomino')->nullOnDelete();
            $table->index('pagamento_condomino_id', 'idx_pag_ref_pag_cond');
        });
    }

    public function down(): void
    {
        Schema::table('pagamento_referencias', function (Blueprint $table) {
            $table->dropForeign(['pagamento_condomino_id']);
            $table->dropIndex('idx_pag_ref_pag_cond');
            $table->dropColumn('pagamento_condomino_id');
        });
    }
};
