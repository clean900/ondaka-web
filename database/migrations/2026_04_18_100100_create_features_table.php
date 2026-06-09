<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('features', function (Blueprint $table) {
            $table->id();

            // Identificação
            $table->string('slug', 80)->unique();
            $table->string('nome', 120);
            $table->text('descricao')->nullable();
            $table->string('icone', 50)->nullable(); // nome do ícone Lucide

            // Categoria
            $table->enum('categoria', [
                'comunicacao',
                'pagamentos',
                'seguranca',
                'gestao',
                'personalizacao',
                'outros',
            ])->default('outros');

            // Quem pode comprar
            $table->enum('comprador', ['empresa_gestora', 'condominio', 'ambos'])
                ->default('empresa_gestora');

            // Modelo de cobrança
            $table->enum('modelo_cobranca', [
                'subscription',  // mensal
                'one_time',      // activação única
                'consumable',    // pacotes com saldo
            ]);

            // Para consumíveis: unidade (SMS, transacção, assembleia, leitura)
            $table->string('unidade', 50)->nullable();

            // Preço base (Kz)
            $table->decimal('preco_base', 12, 2)->nullable();

            // Para subscrições: duração em dias (30 = mensal)
            $table->integer('duracao_dias')->nullable();

            // Taxa de activação única (adicional ao preço base)
            $table->decimal('preco_activacao', 12, 2)->default(0);

            // Schema JSON de configuração (ex: {"sender_name": {"tipo": "string", "max": 11}})
            $table->json('configuracao_schema')->nullable();

            // Flags
            $table->boolean('activa')->default(true); // disponível ao público?
            $table->boolean('em_breve')->default(false); // mostrar mas não permitir compra
            $table->boolean('requer_aprovacao_manual')->default(false);
            $table->boolean('requer_hardware')->default(false);

            $table->integer('ordem_listagem')->default(100);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['activa', 'em_breve', 'categoria']);
            $table->index('ordem_listagem');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('features');
    }
};
