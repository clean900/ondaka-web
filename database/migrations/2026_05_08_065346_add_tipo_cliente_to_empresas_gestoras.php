<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Adiciona distinção entre Empresa Gestora vs Admin Independente.
     *
     * tipo_cliente:
     *  - 'empresa_gestora' (default): sociedade comercial com vários condomínios
     *  - 'admin_independente': pessoa singular com 1 condomínio só
     *
     * Adiciona também documento_tipo + documento_numero unificado:
     *  - Empresa Gestora: documento_tipo=NIF, número de NIF de empresa
     *  - Admin Independente: documento_tipo=BI ou NIF (singular)
     *
     * O campo `nif` mantém-se para retro-compatibilidade.
     */
    public function up(): void
    {
        Schema::table('empresas_gestoras', function (Blueprint $table) {
            $table->enum('tipo_cliente', ['empresa_gestora', 'admin_independente'])
                ->default('empresa_gestora')
                ->after('nome');

            $table->enum('documento_tipo', ['NIF', 'BI', 'PASSAPORTE'])
                ->default('NIF')
                ->after('nif');

            // Para Admin Independente — campos opcionais de pessoa singular
            $table->string('nome_completo_responsavel', 255)->nullable()->after('documento_tipo');
        });

        // Backfill: registos existentes ficam como empresa_gestora (já é default)
        // mas garantir que documento_tipo está preenchido para os que tinham NIF
        DB::table('empresas_gestoras')
            ->whereNotNull('nif')
            ->update(['documento_tipo' => 'NIF']);
    }

    public function down(): void
    {
        Schema::table('empresas_gestoras', function (Blueprint $table) {
            $table->dropColumn(['tipo_cliente', 'documento_tipo', 'nome_completo_responsavel']);
        });
    }
};
