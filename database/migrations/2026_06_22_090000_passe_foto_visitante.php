<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Foto do visitante (vai no passe). Obrigatória ao solicitar. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pre_aprovacoes', function (Blueprint $table) {
            $table->string('foto_visitante_path')->nullable()->after('documento_anexo_path');
        });
    }

    public function down(): void
    {
        Schema::table('pre_aprovacoes', function (Blueprint $table) {
            $table->dropColumn('foto_visitante_path');
        });
    }
};
