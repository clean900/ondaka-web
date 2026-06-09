<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('assembleia_votos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ponto_votacao_id')->constrained('assembleia_pontos_votacao')->cascadeOnDelete();
            $table->foreignId('participante_id')->constrained('assembleia_participantes')->cascadeOnDelete();

            // O voto
            $table->string('opcao', 15); // 'sim' | 'nao' | 'abstencao'

            // Peso (permilagem que o participante representa, inclui delegações)
            $table->decimal('peso_permilagem', 8, 3); // ‰ das fracções que representa

            // Se votou como procurador
            $table->boolean('votou_como_procurador')->default(false);
            $table->foreignId('procuracao_de_participante_id')->nullable()->constrained('assembleia_participantes');

            // Momento do voto
            $table->timestamp('votado_em');

            $table->timestamps();

            // Um participante só vota 1x por ponto (mas pode votar no próprio nome + procurações)
            $table->index(['ponto_votacao_id', 'participante_id']);
            $table->index(['ponto_votacao_id', 'opcao']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assembleia_votos');
    }
};
