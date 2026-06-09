<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Quota mensal de uma fracção.
     *
     * Estratégia "B" — separação contabilística:
     * - Cada quota gera 2 LANCAMENTOS na tabela lancamentos_condomino:
     *   - tipo='quota_base' (fundo de manutenção corrente)
     *   - tipo='fundo_reserva' (reserva legal — Decreto 141/15 art. 5)
     *
     * Esta tabela `quotas` é o "AGRUPADOR" — vincula os 2 lançamentos
     * mensais a um período (mês/ano) e fracção.
     *
     * Permite:
     * - Saber rapidamente quanto cada fracção deveria pagar num mês
     * - Distinguir "quotas" de "lançamentos extras" (multas, despesas)
     * - Bloquear duplicação (1 quota por fracção+mês)
     */
    public function up(): void
    {
        Schema::create('quotas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();
            $table->foreignId('condominio_id')->constrained('condominios')->cascadeOnDelete();
            $table->foreignId('fraccao_id')->constrained('fraccoes')->cascadeOnDelete();

            // Período
            $table->unsignedSmallInteger('ano');
            $table->unsignedTinyInteger('mes')->comment('1-12');
            $table->date('data_referencia')->comment('Data lógica da quota (1º dia do mês)');
            $table->date('data_vencimento');

            // Valores (snapshot no momento da geração — fica imutável)
            $table->decimal('valor_quota_base', 14, 2);
            $table->decimal('valor_fundo_reserva', 14, 2);
            $table->decimal('valor_total', 14, 2)->comment('base + reserva');

            // Estado consolidado da quota
            $table->enum('estado', ['aberta', 'paga_parcial', 'paga', 'cancelada'])->default('aberta');
            $table->decimal('valor_pago', 14, 2)->default(0)->comment('Soma dos pagamentos imputados');
            $table->timestamp('paga_em')->nullable();

            // Geração
            $table->enum('origem_geracao', ['automatica', 'manual'])->default('manual');
            $table->foreignId('gerada_por_user_id')->nullable()->constrained('users')->nullOnDelete();

            // Observações (admin pode anotar)
            $table->text('observacoes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Constraint: 1 quota por fracção+mês
            $table->unique(['fraccao_id', 'ano', 'mes'], 'uq_quotas_fraccao_periodo');

            $table->index(['condominio_id', 'ano', 'mes']);
            $table->index(['empresa_gestora_id', 'estado']);
            $table->index('data_vencimento');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotas');
    }
};
