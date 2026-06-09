<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('empresas_gestoras', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('nif', 20)->unique();
            $table->string('slug')->unique();
            $table->string('email_contacto');
            $table->string('telefone', 30)->nullable();
            $table->text('morada')->nullable();
            $table->string('provincia', 50)->default('Luanda');
            $table->string('municipio', 100)->nullable();
            $table->string('logotipo_path')->nullable();
            $table->string('licenca_alvara')->nullable();
            $table->date('licenca_validade')->nullable();
            $table->enum('plano', ['trial', 'basico', 'pro', 'enterprise'])->default('trial');
            $table->timestamp('trial_termina_em')->nullable();
            $table->boolean('activa')->default(true);
            $table->json('configuracoes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['activa', 'plano']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresas_gestoras');
    }
};
