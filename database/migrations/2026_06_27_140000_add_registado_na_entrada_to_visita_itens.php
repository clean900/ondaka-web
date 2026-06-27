<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * registado_na_entrada — false marca um item DETECTADO na saída que não foi
 * declarado à entrada (anomalia: o visitante leva algo que não trouxe).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('visita_itens', function (Blueprint $table) {
            $table->boolean('registado_na_entrada')->default(true)->after('estado');
        });
    }

    public function down(): void
    {
        Schema::table('visita_itens', function (Blueprint $table) {
            $table->dropColumn('registado_na_entrada');
        });
    }
};
