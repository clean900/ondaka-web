<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add-on #9 "Acesso por horário/área" — restrições opcionais numa pré-aprovação/passe.
 *
 * Aditiva e nullable: sem restrição definida, o comportamento da validação é
 * exactamente o de hoje (não parte o fluxo existente).
 *
 * Formatos esperados:
 *  - horarios_json: [{ "dias": [1,2,3,4,5], "inicio": "08:00", "fim": "12:00" }, ...]
 *    (dias em ISO: 1=segunda ... 7=domingo)
 *  - areas_json: [{ "tipo": "espaco|edificio|livre", "id": 12|null, "nome": "Piscina" }, ...]
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pre_aprovacoes', function (Blueprint $table) {
            $table->json('horarios_json')->nullable()->after('valida_ate');
            $table->json('areas_json')->nullable()->after('horarios_json');
        });
    }

    public function down(): void
    {
        Schema::table('pre_aprovacoes', function (Blueprint $table) {
            $table->dropColumn(['horarios_json', 'areas_json']);
        });
    }
};
