<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tipos_fraccao', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();
            $table->string('nome');
            $table->string('codigo', 10);
            $table->text('descricao')->nullable();
            $table->boolean('paga_quota')->default(true);
            $table->timestamps();

            $table->unique(['empresa_gestora_id', 'codigo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipos_fraccao');
    }
};
