<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('empresas_prestadoras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();
            $table->string('nome', 150);
            $table->string('nif', 30)->nullable();
            $table->string('telefone', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->text('especialidades')->nullable()->comment('JSON ou texto livre');
            $table->text('observacoes')->nullable();
            $table->boolean('ativa')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['empresa_gestora_id', 'ativa'], 'ep_lookup');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresas_prestadoras');
    }
};
