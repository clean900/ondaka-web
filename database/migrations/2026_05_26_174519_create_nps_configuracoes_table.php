<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nps_configuracoes', function (Blueprint $table) {
            $table->id();

            // Que alvo esta config controla
            $table->enum('alvo', ['condominio', 'plataforma']);

            // Dono da config:
            //  - plataforma: empresa_gestora_id = NULL (global, gerida pelo super-admin)
            //  - condominio: empresa_gestora_id = a gestora que a configura
            $table->unsignedBigInteger('empresa_gestora_id')->nullable();

            // Parametros configuraveis
            $table->boolean('activo')->default(true);
            $table->unsignedSmallInteger('periodicidade_dias')->default(90);
            $table->string('pergunta', 255);
            $table->string('seguimento', 255)->nullable();

            $table->timestamps();

            // Uma config por (alvo + gestora). Para plataforma, gestora é NULL → uma só linha.
            $table->unique(['alvo', 'empresa_gestora_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nps_configuracoes');
    }
};
