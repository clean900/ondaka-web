<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sms_logs', function (Blueprint $table) {
            $table->id();

            // Quem "pagou" pelo SMS (owner polimórfico, nullable para SMS de sistema)
            $table->string('owner_type')->nullable();
            $table->unsignedBigInteger('owner_id')->nullable();

            // Destinatário (mascarado para logs, completo no envio)
            $table->string('numero_destinatario', 20);  // formato 9 dígitos
            $table->string('numero_mascarado', 20);     // ex: 923****89

            // Conteúdo
            $table->string('mensagem', 800);
            $table->unsignedSmallInteger('tamanho_chars');
            $table->unsignedTinyInteger('segmentos')->default(1); // partes multi-SMS

            // Tipo / origem
            $table->enum('categoria', [
                'sistema',           // SMS de sistema (2FA, avisos)
                'notificacao',       // Notificação de evento (ordem, etc)
                'manual_cliente',    // Cliente envia via API/painel
                'manual_admin',      // Admin envia manualmente
                'teste',             // Command sms:enviar-teste
            ])->default('sistema');

            // Contexto (ex: 'login_2fa', 'ordem_aprovada', 'expiracao_subscricao')
            $table->string('trigger', 50)->nullable();

            // Referências opcionais
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('feature_subscription_id')->nullable(); // saldo consumido daqui
            $table->unsignedBigInteger('ordem_compra_id')->nullable();

            // Provider
            $table->string('provider', 30)->default('TelcoSMS');
            $table->string('provider_id', 100)->nullable(); // ID da mensagem no provider
            $table->integer('saldo_provider_apos')->nullable();

            // Estado
            $table->enum('estado', [
                'pendente',   // em envio
                'enviado',    // aceite pelo provider
                'entregue',   // confirmado pelo operador (futuro via webhook)
                'falhado',    // falha no envio
                'rejeitado',  // provider rejeitou
            ])->default('pendente');

            $table->text('erro_mensagem')->nullable();
            $table->json('resposta_bruta')->nullable();

            // Datas
            $table->timestamp('enviado_em')->nullable();
            $table->timestamp('entregue_em')->nullable();
            $table->timestamp('falhado_em')->nullable();

            // Tentativas
            $table->unsignedTinyInteger('tentativas')->default(0);

            // Custo interno (créditos consumidos do cliente)
            $table->unsignedTinyInteger('creditos_consumidos_cliente')->default(0);
            $table->boolean('saldo_devolvido')->default(false);

            $table->timestamps();

            $table->index(['owner_type', 'owner_id']);
            $table->index(['estado', 'created_at']);
            $table->index('trigger');
            $table->index(['categoria', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_logs');
    }
};
