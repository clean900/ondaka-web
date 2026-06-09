<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('subscricoes', function (Blueprint $table) {
            // Ciclo agendado (downgrades) - aplicado no fim do período actual
            $table->enum('proximo_ciclo', ['mensal', 'semestral', 'anual'])
                ->nullable()
                ->after('ciclo')
                ->comment('Ciclo agendado para aplicar no fim do periodo actual (downgrades)');

            $table->timestamp('proximo_ciclo_aplica_em')
                ->nullable()
                ->after('proximo_ciclo')
                ->comment('Data prevista para aplicacao do proximo_ciclo');
        });
    }

    public function down(): void
    {
        Schema::table('subscricoes', function (Blueprint $table) {
            $table->dropColumn(['proximo_ciclo', 'proximo_ciclo_aplica_em']);
        });
    }
};
