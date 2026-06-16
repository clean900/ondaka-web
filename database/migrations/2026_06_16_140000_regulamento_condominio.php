<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * F-01: regulamento do condomínio (template DP 141/15) editável pelo gestor e
 * publicável no mobile dos condóminos. Guardado por condomínio.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('condominios', function (Blueprint $table) {
            $table->longText('regulamento_html')->nullable()->after('configuracoes');
            $table->boolean('regulamento_mobile')->default(false)->after('regulamento_html');
        });
    }

    public function down(): void
    {
        Schema::table('condominios', function (Blueprint $table) {
            $table->dropColumn(['regulamento_html', 'regulamento_mobile']);
        });
    }
};
