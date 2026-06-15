<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * F-03: comissão de moradores para aprovação de despesas.
 *
 * - Toggle opcional por condomínio (nem todos os condomínios têm esta regra).
 * - Tabela de membros da comissão (condóminos designados pelo gestor).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('condominios', function (Blueprint $table) {
            $table->boolean('exige_aprovacao_comissao')->default(false)->after('nome');
        });

        Schema::create('comissao_membros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominio_id')->constrained('condominios')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('designado_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['condominio_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comissao_membros');

        Schema::table('condominios', function (Blueprint $table) {
            $table->dropColumn('exige_aprovacao_comissao');
        });
    }
};
