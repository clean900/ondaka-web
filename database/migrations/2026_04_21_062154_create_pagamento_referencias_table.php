<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagamento_referencias', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();

            $table->foreignId('ordem_compra_id')
                ->constrained('ordens_compra')
                ->cascadeOnDelete();

            $table->unsignedBigInteger('reference_id')->unique();
            $table->string('entity_id', 10);
            $table->decimal('amount', 14, 2);

            $table->enum('status', ['activa', 'paga', 'expirada', 'cancelada'])
                ->default('activa');

            $table->timestamp('expira_em');
            $table->timestamp('pago_em')->nullable();

            $table->unsignedBigInteger('payment_id')->nullable();
            $table->unsignedBigInteger('transaction_id')->nullable();
            $table->string('terminal_type', 10)->nullable();
            $table->string('terminal_id', 20)->nullable();
            $table->decimal('fee', 10, 2)->nullable();

            $table->json('custom_fields')->nullable();
            $table->json('webhook_payload')->nullable();

            $table->timestamps();

            $table->index(['empresa_gestora_id', 'status']);
            $table->index(['ordem_compra_id', 'status']);
            $table->index('expira_em');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagamento_referencias');
    }
};