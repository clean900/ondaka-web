<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Camada "Fornecedores Certificados" (add-on fornecedores_certificados):
 * permite ao gestor marcar um prestador como CERTIFICADO (selo + data).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empresas_prestadoras', function (Blueprint $table) {
            $table->boolean('certificado')->default(false)->after('estado_aprovacao');
            $table->timestamp('certificado_em')->nullable()->after('certificado');
        });
    }

    public function down(): void
    {
        Schema::table('empresas_prestadoras', function (Blueprint $table) {
            $table->dropColumn(['certificado', 'certificado_em']);
        });
    }
};
