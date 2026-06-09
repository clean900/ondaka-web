<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_destaques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();
            $table->foreignId('empresa_prestadora_id')->constrained('empresas_prestadoras')->cascadeOnDelete();
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();

            $table->unique(['empresa_gestora_id', 'empresa_prestadora_id'], 'uniq_destaque');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_destaques');
    }
};
