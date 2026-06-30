<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Custo da intervenção do pedido — alimenta o "preço médio" por fornecedor no
 * add-on Fornecedores Certificados (a coluna atribuido_a_empresa_id já existe).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->decimal('custo_intervencao', 14, 2)->nullable()->after('atribuido_a_empresa_id');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('custo_intervencao');
        });
    }
};
