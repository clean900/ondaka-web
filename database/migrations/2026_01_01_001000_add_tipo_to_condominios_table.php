<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('condominios', function (Blueprint $table) {
            // Tipo de empreendimento
            $table->enum('tipo', ['vertical', 'horizontal', 'misto', 'loteamento'])
                ->default('vertical')
                ->after('codigo');

            // Número de blocos/edifícios esperado (opcional, para referência)
            $table->unsignedSmallInteger('numero_blocos_previsto')->nullable()->after('tipo');

            // Tem área comercial?
            $table->boolean('tem_area_comercial')->default(false)->after('numero_blocos_previsto');

            $table->index('tipo');
        });
    }

    public function down(): void
    {
        Schema::table('condominios', function (Blueprint $table) {
            $table->dropIndex(['tipo']);
            $table->dropColumn(['tipo', 'numero_blocos_previsto', 'tem_area_comercial']);
        });
    }
};
