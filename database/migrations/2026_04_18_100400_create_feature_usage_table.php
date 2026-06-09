<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('feature_usage', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subscription_id')
                ->constrained('feature_subscriptions')
                ->cascadeOnDelete();

            // Quantidade consumida (1 para cada SMS, ou N para lote)
            $table->unsignedInteger('quantidade')->default(1);

            // Acção executada (sms_enviado, referencia_gerada, assembleia_realizada, etc.)
            $table->string('acao', 80);

            // Descrição humana opcional
            $table->text('descricao')->nullable();

            // Referência polimórfica (ex: factura_id, condomino_id, condominio_id)
            $table->string('referenciavel_type')->nullable();
            $table->unsignedBigInteger('referenciavel_id')->nullable();

            // Utilizador que gerou a acção
            $table->foreignId('user_id')->nullable()
                ->constrained('users')->nullOnDelete();

            // Snapshot do saldo APÓS esta acção (para auditoria)
            $table->bigInteger('saldo_depois')->default(0);

            // Metadados livres
            $table->json('metadata')->nullable();

            // Apenas created_at (append-only, não se edita)
            $table->timestamp('created_at')->useCurrent();

            $table->index(['subscription_id', 'created_at']);
            $table->index(['referenciavel_type', 'referenciavel_id']);
            $table->index('acao');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feature_usage');
    }
};
