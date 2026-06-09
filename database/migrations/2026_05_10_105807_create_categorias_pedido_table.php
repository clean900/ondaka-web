<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('categorias_pedido', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();
            $table->string('nome', 100);
            $table->string('slug', 120);
            $table->string('icone', 30)->nullable()->comment('Lucide icon name');
            $table->enum('tipo', ['particular', 'publico']);
            $table->unsignedSmallInteger('ordem')->default(0);
            $table->boolean('ativo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['empresa_gestora_id', 'tipo', 'slug'], 'cp_unique_slug');
            $table->index(['empresa_gestora_id', 'tipo', 'ativo'], 'cp_lookup');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categorias_pedido');
    }
};
