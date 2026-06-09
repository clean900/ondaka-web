<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('contratos_ocupacao', function (Blueprint $table) {
            $table->id();

            // Multi-tenant (denormalizado para queries mais rápidas)
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();

            // Relações principais
            $table->foreignId('condomino_id')
                ->constrained('condominos')
                ->cascadeOnDelete();

            $table->foreignId('fraccao_id')
                ->constrained('fraccoes')
                ->cascadeOnDelete();

            // Tipo de ocupação
            $table->enum('tipo', ['proprietario', 'inquilino', 'usufructo', 'cedencia'])
                ->default('proprietario');

            // Percentagem de propriedade (para casos de comproprietários)
            $table->decimal('percentagem_propriedade', 5, 2)->default(100.00);

            // Datas
            $table->date('data_inicio');
            $table->date('data_fim')->nullable(); // Null = em vigor

            // Dados do contrato (opcional)
            $table->string('numero_contrato', 50)->nullable();
            $table->date('data_contrato')->nullable();
            $table->string('contrato_path')->nullable(); // PDF do contrato

            // Só para inquilinos: renda mensal
            $table->decimal('valor_renda_mensal', 15, 2)->nullable();

            // Proprietário do contrato (quando tipo=inquilino, quem é o senhorio)
            // Permite saber a quem o inquilino paga renda
            $table->foreignId('proprietario_id')
                ->nullable()
                ->constrained('condominos')
                ->nullOnDelete();

            // Configurações de facturação
            // Pode a facturação do condomínio ir directamente para este ocupante em vez do proprietário?
            // Útil quando o inquilino é quem paga as quotas
            $table->boolean('responsavel_facturacao')->default(false);

            // Contacto preferencial para comunicações do condomínio
            $table->boolean('recebe_comunicacoes')->default(true);

            // Observações
            $table->text('observacoes')->nullable();

            // Estado
            $table->enum('estado', ['activo', 'terminado', 'suspenso'])->default('activo');
            $table->text('motivo_fim')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['empresa_gestora_id', 'estado']);
            $table->index('condomino_id');
            $table->index('fraccao_id');
            $table->index(['fraccao_id', 'tipo', 'estado']);
            $table->index('data_inicio');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contratos_ocupacao');
    }
};
