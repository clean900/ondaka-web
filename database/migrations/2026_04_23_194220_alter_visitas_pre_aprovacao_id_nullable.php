<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('visitas', function (Blueprint $table) {
            // 1. Remover FK actual (cascadeOnDelete)
            $table->dropForeign(['pre_aprovacao_id']);

            // 2. Tornar coluna nullable
            $table->unsignedBigInteger('pre_aprovacao_id')->nullable()->change();

            // 3. Recriar FK com nullOnDelete (se apagar pre_aprovacao, visita fica órfã mas mantém-se)
            $table->foreign('pre_aprovacao_id')
                ->references('id')->on('pre_aprovacoes')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('visitas', function (Blueprint $table) {
            $table->dropForeign(['pre_aprovacao_id']);

            // Atenção: rollback só funciona se não houver registos com pre_aprovacao_id NULL
            $table->unsignedBigInteger('pre_aprovacao_id')->nullable(false)->change();

            $table->foreign('pre_aprovacao_id')
                ->references('id')->on('pre_aprovacoes')
                ->cascadeOnDelete();
        });
    }
};
