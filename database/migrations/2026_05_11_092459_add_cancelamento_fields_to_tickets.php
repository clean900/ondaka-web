<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->timestamp('cancelado_em')->nullable()->after('atribuido_em');
            $table->foreignId('cancelado_por_user_id')
                ->nullable()
                ->after('cancelado_em')
                ->constrained('users')
                ->nullOnDelete();
            $table->text('motivo_cancelamento')->nullable()->after('cancelado_por_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cancelado_por_user_id');
            $table->dropColumn(['cancelado_em', 'motivo_cancelamento']);
        });
    }
};
