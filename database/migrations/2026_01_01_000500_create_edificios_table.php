<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('edificios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();
            $table->foreignId('condominio_id')
                ->constrained('condominios')
                ->cascadeOnDelete();

            $table->string('nome');
            $table->string('codigo', 20);
            $table->unsignedSmallInteger('numero_pisos')->default(1);
            $table->unsignedSmallInteger('pisos_subsolo')->default(0);
            $table->unsignedInteger('numero_fraccoes')->default(0);
            $table->boolean('tem_elevador')->default(false);
            $table->unsignedSmallInteger('numero_elevadores')->default(0);
            $table->text('descricao')->nullable();
            $table->string('foto_path')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['condominio_id', 'codigo']);
            $table->index('empresa_gestora_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('edificios');
    }
};
