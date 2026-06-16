<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * F-01: o gestor escolhe quais modelos de documentação ficam visíveis aos
 * condóminos na app mobile.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('modelos_documentos', function (Blueprint $table) {
            $table->boolean('visivel_mobile')->default(false)->after('ficheiro_path');
        });
    }

    public function down(): void
    {
        Schema::table('modelos_documentos', function (Blueprint $table) {
            $table->dropColumn('visivel_mobile');
        });
    }
};
