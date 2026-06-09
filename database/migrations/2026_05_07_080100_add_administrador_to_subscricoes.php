<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('subscricoes', function (Blueprint $table) {
            // Coluna nova: administrador independente
            if (!Schema::hasColumn('subscricoes', 'administrador_user_id')) {
                $table->foreignId('administrador_user_id')
                    ->nullable()
                    ->after('empresa_gestora_id')
                    ->constrained('users')
                    ->nullOnDelete();
            }
        });

        // Tornar empresa_gestora_id nullable (XOR com administrador_user_id)
        DB::statement('ALTER TABLE subscricoes MODIFY COLUMN empresa_gestora_id BIGINT UNSIGNED NULL');
    }

    public function down(): void
    {
        Schema::table('subscricoes', function (Blueprint $table) {
            if (Schema::hasColumn('subscricoes', 'administrador_user_id')) {
                $table->dropForeign(['administrador_user_id']);
                $table->dropColumn('administrador_user_id');
            }
        });

        // Voltar empresa_gestora_id a NOT NULL
        DB::statement('ALTER TABLE subscricoes MODIFY COLUMN empresa_gestora_id BIGINT UNSIGNED NOT NULL');
    }
};
