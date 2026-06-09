<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Remover FK para poder tornar empresa_gestora_id nullable
        Schema::table('empresas_prestadoras', function (Blueprint $table) {
            $table->dropForeign('empresas_prestadoras_empresa_gestora_id_foreign');
        });

        // 2. Tornar nullable + adicionar campos de marketplace
        Schema::table('empresas_prestadoras', function (Blueprint $table) {
            $table->unsignedBigInteger('empresa_gestora_id')->nullable()->change();

            $table->enum('tipo', ['gestora', 'publico'])->default('gestora')->after('empresa_gestora_id');
            $table->decimal('latitude', 10, 7)->nullable()->after('especialidades');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->string('foto_path', 255)->nullable()->after('longitude');
            $table->enum('estado_aprovacao', ['pendente', 'aprovado', 'rejeitado'])->default('pendente')->after('foto_path');
            $table->enum('aprovado_por', ['gestora', 'super_admin', 'pendente'])->default('pendente')->after('estado_aprovacao');
            $table->boolean('subscricao_activa')->default(false)->after('aprovado_por');
            $table->date('subscricao_expira_em')->nullable()->after('subscricao_activa');
            $table->decimal('subscricao_valor', 12, 2)->default(5000)->after('subscricao_expira_em');

            $table->index(['tipo', 'estado_aprovacao'], 'idx_tipo_estado');
            $table->index(['latitude', 'longitude'], 'idx_geo');
            $table->index('subscricao_activa', 'idx_subscricao');
        });

        // 3. Recriar FK (agora nullable, com nullOnDelete)
        Schema::table('empresas_prestadoras', function (Blueprint $table) {
            $table->foreign('empresa_gestora_id')
                ->references('id')->on('empresas_gestoras')
                ->nullOnDelete();
        });

        // 4. Marcar os 3 registos existentes como tipo=gestora + aprovados pela gestora
        \DB::table('empresas_prestadoras')->update([
            'tipo' => 'gestora',
            'estado_aprovacao' => 'aprovado',
            'aprovado_por' => 'gestora',
        ]);
    }

    public function down(): void
    {
        Schema::table('empresas_prestadoras', function (Blueprint $table) {
            $table->dropForeign(['empresa_gestora_id']);
        });

        Schema::table('empresas_prestadoras', function (Blueprint $table) {
            $table->dropIndex('idx_tipo_estado');
            $table->dropIndex('idx_geo');
            $table->dropIndex('idx_subscricao');
            $table->dropColumn([
                'tipo', 'latitude', 'longitude', 'foto_path',
                'estado_aprovacao', 'aprovado_por',
                'subscricao_activa', 'subscricao_expira_em', 'subscricao_valor',
            ]);
        });

        Schema::table('empresas_prestadoras', function (Blueprint $table) {
            $table->foreign('empresa_gestora_id')
                ->references('id')->on('empresas_gestoras')
                ->cascadeOnDelete();
        });
    }
};
