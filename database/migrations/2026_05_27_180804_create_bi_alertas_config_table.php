<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bi_alertas_config', function (Blueprint $t) {
            $t->id();
            $t->foreignId('empresa_gestora_id')->unique()->constrained('empresas_gestoras')->cascadeOnDelete();
            $t->decimal('taxa_cobranca_min', 5, 2)->default(50.00);
            $t->decimal('divida_imovel_limite', 14, 2)->default(100000.00);
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bi_alertas_config');
    }
};
