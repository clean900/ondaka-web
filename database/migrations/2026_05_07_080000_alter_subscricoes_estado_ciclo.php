<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Antes de alterar enums, mapear valores existentes para os novos
        // Estados: trial/grace/activa/em_atraso/suspensa/cancelada/arquivada
        //       → trial/activa/limitado/cancelada
        DB::table('subscricoes')->whereIn('estado', ['grace', 'em_atraso', 'suspensa'])->update(['estado' => 'limitado']);
        DB::table('subscricoes')->where('estado', 'arquivada')->update(['estado' => 'cancelada']);

        // Alterar enum estado
        DB::statement("ALTER TABLE subscricoes MODIFY COLUMN estado ENUM('trial', 'activa', 'limitado', 'cancelada') NOT NULL DEFAULT 'trial'");

        // Alterar enum ciclo (adicionar 'semestral')
        DB::statement("ALTER TABLE subscricoes MODIFY COLUMN ciclo ENUM('mensal', 'semestral', 'anual') NOT NULL DEFAULT 'mensal'");

        // Adicionar coluna num_imoveis
        Schema::table('subscricoes', function (Blueprint $table) {
            if (!Schema::hasColumn('subscricoes', 'num_imoveis')) {
                $table->unsignedInteger('num_imoveis')->default(0)->after('ciclo');
            }
        });
    }

    public function down(): void
    {
        // Reverter enum estado
        DB::statement("ALTER TABLE subscricoes MODIFY COLUMN estado ENUM('trial', 'grace', 'activa', 'em_atraso', 'suspensa', 'cancelada', 'arquivada') NOT NULL DEFAULT 'trial'");

        // Reverter enum ciclo
        DB::statement("ALTER TABLE subscricoes MODIFY COLUMN ciclo ENUM('mensal', 'anual') NOT NULL DEFAULT 'mensal'");

        // Remover num_imoveis
        Schema::table('subscricoes', function (Blueprint $table) {
            if (Schema::hasColumn('subscricoes', 'num_imoveis')) {
                $table->dropColumn('num_imoveis');
            }
        });
    }
};
