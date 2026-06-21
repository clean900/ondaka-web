<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Manutenção Preventiva — equipamentos do condomínio, planos recorrentes e
 * histórico de intervenções. Alertas 30/15/7 dias antes da próxima data.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipamentos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('empresa_gestora_id');
            $table->unsignedBigInteger('condominio_id');
            $table->string('nome');
            $table->enum('tipo', ['elevador', 'avac', 'gerador', 'bomba', 'incendio', 'portao', 'outro'])
                ->default('outro');
            $table->string('localizacao')->nullable();
            $table->string('marca')->nullable();
            $table->string('modelo')->nullable();
            $table->string('numero_serie')->nullable();
            $table->text('observacoes')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['condominio_id', 'activo']);
            $table->index('empresa_gestora_id');
        });

        Schema::create('manutencao_planos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('equipamento_id');
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->unsignedSmallInteger('periodicidade_dias'); // 30, 90, 180, 365...
            $table->date('proxima_data');
            $table->unsignedBigInteger('prestador_empresa_id')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['proxima_data', 'activo'], 'idx_plano_proxima');
            $table->index('equipamento_id');
        });

        Schema::create('manutencao_intervencoes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('plano_id');
            $table->unsignedBigInteger('equipamento_id');
            $table->date('data_realizada');
            $table->text('descricao')->nullable();
            $table->decimal('custo', 14, 2)->nullable();
            $table->string('realizado_por')->nullable();
            $table->string('relatorio_path')->nullable();      // anexo (servido via /ficheiros)
            $table->unsignedBigInteger('registado_por_user_id');
            $table->timestamps();

            $table->index('equipamento_id');
            $table->index('plano_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manutencao_intervencoes');
        Schema::dropIfExists('manutencao_planos');
        Schema::dropIfExists('equipamentos');
    }
};
