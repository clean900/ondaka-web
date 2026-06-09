<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('plataforma_subscricao_eventos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subscricao_id')
                ->constrained('subscricoes')
                ->cascadeOnDelete();

            $table->enum('tipo', [
                'criada',
                'trial_iniciado',
                'trial_expirou',
                'imoveis_alterados',
                'factura_emitida',
                'pagamento_recebido',
                'activada',
                'limitada',
                'cancelada',
                'reactivada',
            ]);

            $table->string('descricao', 300);

            // Meta info adicional (valores antes/depois, IDs, etc.)
            $table->json('meta_json')->nullable();

            // Quem disparou (pode ser null se foi automático)
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('created_at');

            $table->index(['subscricao_id', 'created_at']);
            $table->index('tipo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plataforma_subscricao_eventos');
    }
};
