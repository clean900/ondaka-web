<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('turnos_modelo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();
            $table->string('nome', 60);
            $table->time('hora_inicio');
            $table->time('hora_fim');
            $table->boolean('atravessa_meia_noite')->default(false)->comment('true se hora_fim < hora_inicio');
            $table->string('cor_hex', 7)->default('#06B6D4')->comment('Cor para UI');
            $table->text('descricao')->nullable();
            $table->boolean('ativo')->default(true);
            $table->integer('ordem')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['empresa_gestora_id', 'ativo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('turnos_modelo');
    }
};
