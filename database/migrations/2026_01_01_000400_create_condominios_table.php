<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('condominios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();

            $table->string('nome');
            $table->string('codigo', 20)->unique();
            $table->string('nif', 20)->nullable();
            $table->text('morada');
            $table->string('provincia', 50)->default('Luanda');
            $table->string('municipio', 100);
            $table->string('distrito_urbano', 100)->nullable();
            $table->string('bairro', 100)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Dados legais DP 141/15
            $table->date('data_constituicao')->nullable();
            $table->string('numero_matricula')->nullable();
            $table->string('conservatoria')->nullable();
            $table->string('acta_constituicao_path')->nullable();

            // Configuração financeira
            $table->string('iban', 34)->nullable();
            $table->string('banco', 100)->nullable();
            $table->string('moeda', 3)->default('AOA');
            $table->decimal('ucf_valor_actual', 15, 2)->nullable();
            $table->decimal('percentagem_fundo_reserva', 5, 2)->default(10.00);

            $table->foreignId('administrador_actual_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->date('administrador_mandato_inicio')->nullable();
            $table->date('administrador_mandato_fim')->nullable();

            $table->enum('estado', ['activo', 'inactivo', 'arquivado'])->default('activo');
            $table->json('configuracoes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['empresa_gestora_id', 'estado']);
            $table->index(['provincia', 'municipio']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('condominios');
    }
};
