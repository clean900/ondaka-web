<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('escaloes_core', function (Blueprint $table) {
            if (!Schema::hasColumn('escaloes_core', 'desconto_pct')) {
                $table->decimal('desconto_pct', 5, 2)->default(0)->after('preco_por_fraccao_mensal');
            }
        });

        // Calcular desconto_pct a partir do preço actual e do preço base (1.850 Kz)
        // Fórmula: desconto_pct = (1 - preco_actual / preco_base) × 100
        $precoBase = 1850;
        DB::table('escaloes_core')->orderBy('id')->each(function ($escalao) use ($precoBase) {
            $desconto = round((1 - ($escalao->preco_por_fraccao_mensal / $precoBase)) * 100, 2);
            DB::table('escaloes_core')
                ->where('id', $escalao->id)
                ->update(['desconto_pct' => max($desconto, 0)]);
        });
    }

    public function down(): void
    {
        Schema::table('escaloes_core', function (Blueprint $table) {
            if (Schema::hasColumn('escaloes_core', 'desconto_pct')) {
                $table->dropColumn('desconto_pct');
            }
        });
    }
};
