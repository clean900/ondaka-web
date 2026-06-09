<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empresas_gestoras', function (Blueprint $table) {
            $table->string('whatsapp_suporte', 30)->nullable()->after('telefone');
            $table->string('horario_atendimento', 100)->nullable()->after('whatsapp_suporte');
        });
    }

    public function down(): void
    {
        Schema::table('empresas_gestoras', function (Blueprint $table) {
            $table->dropColumn(['whatsapp_suporte', 'horario_atendimento']);
        });
    }
};
