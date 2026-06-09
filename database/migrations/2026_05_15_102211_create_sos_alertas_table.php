<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sos_alertas', function (Blueprint $table) {
            $table->id();

            // Quem e onde
            $table->foreignId('condominio_id')->constrained('condominios')->cascadeOnDelete();
            $table->foreignId('condomino_id')->nullable()->constrained('condominos')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // O que
            $table->enum('tipo', [
                'incendio',
                'medica',
                'assalto',
                'agressao',
                'fuga_gas',
                'inundacao',
                'falha_electrica',
                'elevador_avariado',
                'acidente',
                'animal_perigoso',
                'pessoa_suspeita',
                'barulho',
                'outro',
            ]);

            $table->enum('gravidade', ['critico', 'alto', 'medio', 'baixo']);
            $table->text('descricao')->nullable();
            $table->string('localizacao', 255)->nullable();

            // Ciclo de vida
            $table->enum('estado', ['aberto', 'atendido', 'resolvido', 'falso_alarme'])
                ->default('aberto');
            $table->foreignId('atendido_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('atendido_em')->nullable();
            $table->timestamp('resolvido_em')->nullable();
            $table->text('resolucao_notas')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['condominio_id', 'estado']);
            $table->index(['tipo', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sos_alertas');
    }
};
