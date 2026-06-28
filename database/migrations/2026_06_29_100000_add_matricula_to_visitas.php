<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Matrícula do veículo do visitante (add-on registo_viaturas). Aditivo.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('visitas', function (Blueprint $table) {
            $table->string('matricula', 20)->nullable()->after('observacoes');
            $table->index(['empresa_gestora_id', 'matricula']);
        });
    }

    public function down(): void
    {
        Schema::table('visitas', function (Blueprint $table) {
            $table->dropIndex(['empresa_gestora_id', 'matricula']);
            $table->dropColumn('matricula');
        });
    }
};
