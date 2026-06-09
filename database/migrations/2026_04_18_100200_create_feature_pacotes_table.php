<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('feature_pacotes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('feature_id')
                ->constrained('features')
                ->cascadeOnDelete();

            // Nome apresentado (ex: "Pacote Pequeno", "Pacote Grande")
            $table->string('nome', 100);

            // Slug para referência (ex: sms_pequeno, sms_grande)
            $table->string('slug', 80);

            // Quantidade de unidades no pacote (500 SMS, 200 leituras, etc.)
            $table->unsignedInteger('quantidade');

            // Preço total do pacote (Kz)
            $table->decimal('preco', 12, 2);

            // Valor por unidade (calculado — só para display/comparação)
            $table->decimal('valor_unitario', 12, 4);

            // Flag de destaque (ex: "MAIS POPULAR")
            $table->boolean('destaque')->default(false);

            // Descrição opcional
            $table->string('descricao', 200)->nullable();

            $table->integer('ordem')->default(0);
            $table->boolean('activo')->default(true);

            $table->timestamps();

            $table->unique(['feature_id', 'slug']);
            $table->index(['feature_id', 'activo', 'ordem']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feature_pacotes');
    }
};
