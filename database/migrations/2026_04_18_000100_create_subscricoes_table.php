<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subscricoes', function (Blueprint $table) {
            $table->id();

            // Empresa gestora é a tenant — cada empresa tem 1 subscrição activa de cada vez
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();

            // Estado da subscrição
            $table->enum('estado', [
                'trial',        // Em período de trial 30 dias
                'grace',        // Trial acabou, 7 dias grace period
                'activa',       // Paga e em dia
                'em_atraso',    // Pagamento falhou, acesso ainda permitido
                'suspensa',     // Acesso bloqueado (falta grave)
                'cancelada',    // Cancelada pelo cliente (activa até fim do período)
                'arquivada',    // Dados preservados 90 dias, depois arquivam
            ])->default('trial');

            // Ciclo de cobrança
            $table->enum('ciclo', ['mensal', 'anual'])->default('mensal');

            // Dia do mês para renovação (1-28, baseado no dia da subscrição)
            $table->unsignedTinyInteger('dia_aniversario')->default(1);

            // Datas do trial
            $table->timestamp('trial_inicia_em')->nullable();
            $table->timestamp('trial_expira_em')->nullable();

            // Grace period (7 dias após trial expirar)
            $table->timestamp('grace_expira_em')->nullable();

            // Datas da subscrição activa
            $table->timestamp('activa_desde')->nullable();
            $table->timestamp('periodo_actual_inicio')->nullable();
            $table->timestamp('periodo_actual_fim')->nullable();

            // Cancelamento
            $table->timestamp('cancelada_em')->nullable();
            $table->timestamp('cancela_no_fim_periodo')->nullable();
            $table->text('motivo_cancelamento')->nullable();

            // Preço customizado (override dos escalões para Enterprise)
            $table->decimal('preco_customizado_por_fraccao', 12, 2)->nullable();
            $table->text('nota_preco_customizado')->nullable();

            // Desconto anual (10-15%)
            $table->decimal('desconto_anual_pct', 5, 2)->default(0);

            // Renovação automática
            $table->boolean('renovacao_automatica')->default(true);

            // Flags
            $table->boolean('converteu_do_trial')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['estado', 'trial_expira_em']);
            $table->index(['estado', 'periodo_actual_fim']);
            $table->index('empresa_gestora_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscricoes');
    }
};
