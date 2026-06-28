<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Acrescenta o tipo 'panico' (botão de pânico da portaria) ao enum de tipos
 * de SOS. Aditivo — mantém os 13 tipos existentes.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement(
            "ALTER TABLE sos_alertas MODIFY tipo ENUM("
            . "'panico','incendio','medica','assalto','agressao','fuga_gas',"
            . "'inundacao','falha_electrica','elevador_avariado','acidente',"
            . "'animal_perigoso','pessoa_suspeita','barulho','outro'"
            . ") NOT NULL"
        );
    }

    public function down(): void
    {
        DB::statement(
            "ALTER TABLE sos_alertas MODIFY tipo ENUM("
            . "'incendio','medica','assalto','agressao','fuga_gas',"
            . "'inundacao','falha_electrica','elevador_avariado','acidente',"
            . "'animal_perigoso','pessoa_suspeita','barulho','outro'"
            . ") NOT NULL"
        );
    }
};
