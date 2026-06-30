<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Toggle do gestor para PUBLICAR/OCULTAR a transparência financeira aos
 * condóminos (ecrã "Contas do Condomínio"). Default true = visível (mantém o
 * comportamento atual). O gestor pode desligar por condomínio.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('condominio_facturacao_config', function (Blueprint $table) {
            $table->boolean('transparencia_financeira')->default(true)->after('multa_recorrente');
        });
    }

    public function down(): void
    {
        Schema::table('condominio_facturacao_config', function (Blueprint $table) {
            $table->dropColumn('transparencia_financeira');
        });
    }
};
