<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Passe de Visitante com branding — estende pre_aprovacoes para passes de
 * prestadores/trabalhadores: tipo de acesso, documento anexo, aprovação do
 * gestor e janela de validade longa. O modelo visual (1–12) é por condomínio.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pre_aprovacoes', function (Blueprint $table) {
            $table->enum('tipo_acesso', ['visita', 'prestador', 'trabalhador', 'outro'])
                ->default('visita')->after('fraccao_id');
            $table->enum('tipo_documento', ['bi', 'passaporte', 'carta_conducao', 'outro'])
                ->nullable()->after('telefone_visitante');
            $table->string('numero_documento', 60)->nullable()->after('tipo_documento');
            $table->string('documento_anexo_path')->nullable()->after('numero_documento');
            $table->boolean('requer_aprovacao')->default(false)->after('documento_anexo_path');
            $table->unsignedBigInteger('aprovado_por_user_id')->nullable()->after('requer_aprovacao');
            $table->timestamp('aprovado_em')->nullable()->after('aprovado_por_user_id');
        });

        // Modelo visual do passe escolhido pelo gestor para cada condomínio (1–12).
        Schema::table('condominios', function (Blueprint $table) {
            if (! Schema::hasColumn('condominios', 'modelo_passe')) {
                $table->unsignedTinyInteger('modelo_passe')->default(1);
            }
        });
    }

    public function down(): void
    {
        Schema::table('pre_aprovacoes', function (Blueprint $table) {
            $table->dropColumn([
                'tipo_acesso', 'tipo_documento', 'numero_documento', 'documento_anexo_path',
                'requer_aprovacao', 'aprovado_por_user_id', 'aprovado_em',
            ]);
        });
        Schema::table('condominios', function (Blueprint $table) {
            if (Schema::hasColumn('condominios', 'modelo_passe')) {
                $table->dropColumn('modelo_passe');
            }
        });
    }
};
