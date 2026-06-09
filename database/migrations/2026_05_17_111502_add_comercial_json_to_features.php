<?php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ONDAKA — Adicionar coluna comercial_json à tabela features
 *
 * Guarda o conteúdo comercial completo para a página /funcionalidades/{slug}:
 * tagline, problema, solucao, beneficios[], demo_passos[], testemunho, faq[]
 *
 * Formato JSON validado no FuncionalidadesController::show()
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('features', function (Blueprint $table) {
            $table->longText('comercial_json')->nullable()->after('configuracao_schema');
        });
    }

    public function down(): void
    {
        Schema::table('features', function (Blueprint $table) {
            $table->dropColumn('comercial_json');
        });
    }
};
