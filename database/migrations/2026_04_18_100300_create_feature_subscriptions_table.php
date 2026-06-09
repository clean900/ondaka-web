<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('feature_subscriptions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('feature_id')
                ->constrained('features')
                ->cascadeOnDelete();

            // Polimórfico: owner = EmpresaGestora ou Condominio
            $table->string('owner_type'); // classe completa
            $table->unsignedBigInteger('owner_id');

            // Estado
            $table->enum('estado', [
                'pendente',    // aguarda pagamento/aprovação
                'activa',      // em uso
                'suspensa',    // temporariamente desactivada
                'expirada',    // passou validade (para subscrições)
                'esgotada',    // saldo zero (para consumíveis)
                'cancelada',   // cancelada pelo owner ou admin
            ])->default('pendente');

            // Datas
            $table->timestamp('activada_em')->nullable();
            $table->timestamp('expira_em')->nullable(); // para subscrições
            $table->timestamp('cancelada_em')->nullable();

            // Saldo (para consumíveis)
            $table->bigInteger('saldo_inicial')->default(0);  // total comprado (acumulado)
            $table->bigInteger('saldo_actual')->default(0);   // restante
            $table->bigInteger('saldo_utilizado')->default(0); // total consumido

            // Renovação automática (para subscrições)
            $table->boolean('renovacao_automatica')->default(false);

            // Recarga automática (para consumíveis)
            $table->boolean('recarga_automatica')->default(false);
            $table->unsignedInteger('recarga_limite_baixo')->nullable(); // quando saldo < isto, recarrega
            $table->foreignId('recarga_pacote_id')->nullable()
                ->constrained('feature_pacotes')->nullOnDelete();

            // Configuração específica (ex: {"sender_name": "ONDAKA"})
            $table->json('configuracao')->nullable();

            // Valor total pago até agora
            $table->decimal('valor_pago_total', 14, 2)->default(0);

            // Quem activou
            $table->foreignId('activada_por_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->text('notas_admin')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['owner_type', 'owner_id']);
            $table->index(['feature_id', 'estado']);
            $table->index(['estado', 'expira_em']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feature_subscriptions');
    }
};
