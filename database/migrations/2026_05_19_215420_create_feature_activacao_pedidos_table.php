<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('feature_activacao_pedidos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('feature_id')
                ->constrained('features')
                ->cascadeOnDelete();

            // Polimórfico: owner = EmpresaGestora ou Condominio
            $table->string('owner_type');
            $table->unsignedBigInteger('owner_id');

            // Quem fez o pedido
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Snapshot do preço no momento do pedido (auditoria)
            $table->decimal('valor_kz_snapshot', 14, 2);

            // Estado do pedido
            $table->enum('estado', [
                'pendente',     // aguarda contacto/processamento
                'contactado',   // operador já contactou o cliente
                'activado',     // subscrição activada manualmente
                'cancelado',    // cancelado pelo cliente ou operador
            ])->default('pendente');

            // Tracking de processamento
            $table->timestamp('processado_em')->nullable();
            $table->foreignId('processado_por_user_id')->nullable()
                ->constrained('users')->nullOnDelete();

            // Notas internas do operador
            $table->text('notas_admin')->nullable();

            $table->timestamps();

            // Indices úteis
            $table->index(['owner_type', 'owner_id']);
            $table->index(['feature_id', 'estado']);
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feature_activacao_pedidos');
    }
};
