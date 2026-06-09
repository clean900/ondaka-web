<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adiciona configurações avançadas de multa:
     * - multa_recorrente: se true, gera multa em todos os meses de atraso
     *                    (não apenas no primeiro)
     * - multa_percentagem_base: 'divida' (em dívida actual) ou 'original' (valor original)
     */
    public function up(): void
    {
        Schema::table('condominio_facturacao_config', function (Blueprint $table) {
            $table->boolean('multa_recorrente')->default(false)->after('multa_percentagem')
                ->comment('Se true, multa todos os meses em atraso. Se false, só uma vez.');
            $table->enum('multa_percentagem_base', ['divida', 'original'])
                ->default('divida')->after('multa_recorrente')
                ->comment('Quando multa_tipo=percentagem: calcula sobre dívida actual ou valor original.');
        });
    }

    public function down(): void
    {
        Schema::table('condominio_facturacao_config', function (Blueprint $table) {
            $table->dropColumn(['multa_recorrente', 'multa_percentagem_base']);
        });
    }
};
