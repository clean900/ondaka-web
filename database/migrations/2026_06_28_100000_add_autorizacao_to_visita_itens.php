<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Saída de bens autorizada pelo condómino.
 *
 * Aditivo: acrescenta os estados 'aguarda_autorizacao' e 'retido' ao enum
 * (mantém dentro/saiu/ficou) e campos de quem autorizou.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement(
            "ALTER TABLE visita_itens MODIFY estado ENUM('dentro','saiu','ficou','aguarda_autorizacao','retido') NOT NULL DEFAULT 'dentro'"
        );

        Schema::table('visita_itens', function (Blueprint $table) {
            $table->foreignId('autorizado_por')->nullable()->after('resolvido_por')->constrained('users');
            $table->timestamp('autorizado_em')->nullable()->after('autorizado_por');
        });
    }

    public function down(): void
    {
        Schema::table('visita_itens', function (Blueprint $table) {
            $table->dropConstrainedForeignId('autorizado_por');
            $table->dropColumn('autorizado_em');
        });

        DB::statement(
            "ALTER TABLE visita_itens MODIFY estado ENUM('dentro','saiu','ficou') NOT NULL DEFAULT 'dentro'"
        );
    }
};
