<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Limiar por condomínio (default 3 meses, ligado por condomínio)
        Schema::table('condominio_facturacao_config', function (Blueprint $table) {
            if (! Schema::hasColumn('condominio_facturacao_config', 'limitar_acesso_divida')) {
                $table->boolean('limitar_acesso_divida')->default(false)->after('multa_percentagem_base');
            }
            if (! Schema::hasColumn('condominio_facturacao_config', 'meses_limite_acesso')) {
                $table->unsignedTinyInteger('meses_limite_acesso')->default(3)->after('limitar_acesso_divida');
            }
        });

        // 2. Interruptor mestre global (começa OFF)
        $existe = DB::table('plataforma_config')->where('chave', 'modo_limitado_condominos_activo')->exists();
        if (! $existe) {
            DB::table('plataforma_config')->insert([
                'chave' => 'modo_limitado_condominos_activo',
                'valor' => '0',
                'tipo' => 'bool',
                'descricao' => 'Interruptor mestre: modo limitado de condóminos devedores (0=OFF, 1=ON)',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('condominio_facturacao_config', function (Blueprint $table) {
            if (Schema::hasColumn('condominio_facturacao_config', 'meses_limite_acesso')) {
                $table->dropColumn('meses_limite_acesso');
            }
            if (Schema::hasColumn('condominio_facturacao_config', 'limitar_acesso_divida')) {
                $table->dropColumn('limitar_acesso_divida');
            }
        });
        DB::table('plataforma_config')->where('chave', 'modo_limitado_condominos_activo')->delete();
    }
};
