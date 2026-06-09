<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('condominio_facturacao_config', function (Blueprint $table) {
            if (! Schema::hasColumn('condominio_facturacao_config', 'acordo_min_prestacoes')) {
                $table->unsignedTinyInteger('acordo_min_prestacoes')->default(2)->after('meses_limite_acesso');
            }
            if (! Schema::hasColumn('condominio_facturacao_config', 'acordo_max_prestacoes')) {
                $table->unsignedTinyInteger('acordo_max_prestacoes')->default(6)->after('acordo_min_prestacoes');
            }
            if (! Schema::hasColumn('condominio_facturacao_config', 'acordo_entrada_minima_pct')) {
                $table->decimal('acordo_entrada_minima_pct', 5, 2)->default(0)->after('acordo_max_prestacoes');
            }
            if (! Schema::hasColumn('condominio_facturacao_config', 'acordo_juro_pct')) {
                $table->decimal('acordo_juro_pct', 5, 2)->default(0)->after('acordo_entrada_minima_pct');
            }
        });
    }

    public function down(): void
    {
        Schema::table('condominio_facturacao_config', function (Blueprint $table) {
            foreach (['acordo_juro_pct', 'acordo_entrada_minima_pct', 'acordo_max_prestacoes', 'acordo_min_prestacoes'] as $col) {
                if (Schema::hasColumn('condominio_facturacao_config', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
