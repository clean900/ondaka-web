<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('despesa_categorias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();
            $table->string('nome');
            $table->string('slug');
            $table->string('icone')->nullable();
            $table->string('cor', 20)->nullable();
            $table->unsignedInteger('ordem')->default(0);
            $table->boolean('activa')->default(true);
            $table->timestamps();
            
            $table->unique(['empresa_gestora_id', 'slug']);
            $table->index(['empresa_gestora_id', 'activa']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('despesa_categorias');
    }
};
