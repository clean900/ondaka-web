<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // JSON array de IDs de condomínios atribuídos ao guarda/funcionário.
            // null = sem atribuição; [] = sem condomínios; [1,2,3] = atribuído a 3.
            $table->json('condominios_atribuidos')->nullable()->after('condominio_activo_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('condominios_atribuidos');
        });
    }
};
