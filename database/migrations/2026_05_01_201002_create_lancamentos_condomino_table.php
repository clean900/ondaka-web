<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Lancamentos no extracto do condómino — débitos e créditos.
     *
     * Tipos de lançamento:
     * - quota_base — quota mensal de manutenção (gerada via tabela `quotas`)
     * - fundo_reserva — reserva legal (gerada via tabela `quotas`)
     * - despesa_extra — lançamento manual pelo admin (ex: "Reparação de elevador")
     * - multa — gerada automaticamente após N dias de atraso
     * - juros — futuro (não usado no MVP)
     * - ajuste_credito — admin perdoa parte da dívida
     * - ajuste_debito — admin acrescenta valor (raro)
     *
     * Pagamentos NÃO entram aqui — vão na tabela `pagamentos_condomino`
     * e são imputados aos lançamentos via `pagamento_imputacoes`.
     *
     * Esta separação é importante para auditoria: um lançamento é
     * uma DÍVIDA, um pagamento é um CRÉDITO. Cada um vive na sua tabela.
     */
    public function up(): void
    {
        Schema::create('lancamentos_condomino', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();
            $table->foreignId('condominio_id')->constrained('condominios')->cascadeOnDelete();
            $table->foreignId('fraccao_id')->constrained('fraccoes')->cascadeOnDelete();
            $table->foreignId('condomino_id')->nullable()->constrained('condominos')->nullOnDelete()
                ->comment('Titular activo no momento do lançamento. Nullable para resistir a mudanças.');

            // Vinculação opcional a uma quota agrupadora
            $table->foreignId('quota_id')->nullable()->constrained('quotas')->nullOnDelete()
                ->comment('Preenchido quando o lancamento foi gerado por uma quota mensal');

            // Classificação do lançamento
            $table->enum('tipo', [
                'quota_base',
                'fundo_reserva',
                'despesa_extra',
                'multa',
                'juros',
                'ajuste_credito',
                'ajuste_debito',
            ]);
            $table->string('descricao', 255);
            $table->text('detalhes')->nullable();

            // Valor (sempre positivo. ajuste_credito significa abate à dívida)
            $table->decimal('valor', 14, 2);

            // Período de referência
            $table->date('data_lancamento')->comment('Quando foi criado contabilisticamente');
            $table->date('data_vencimento')->nullable();

            // Estado de pagamento
            $table->enum('estado', ['em_aberto', 'pago_parcial', 'pago', 'cancelado'])->default('em_aberto');
            $table->decimal('valor_pago', 14, 2)->default(0)->comment('Soma das imputacoes recebidas');
            $table->timestamp('pago_em')->nullable();

            // Para multas: vincular ao lançamento que gerou a multa
            $table->foreignId('lancamento_origem_id')->nullable()->constrained('lancamentos_condomino')->nullOnDelete()
                ->comment('Para multas: aponta para o lançamento em atraso que originou esta multa');

            // Audit
            $table->foreignId('criado_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('cancelado_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelado_em')->nullable();
            $table->text('motivo_cancelamento')->nullable();

            // Observações livres
            $table->text('observacoes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['fraccao_id', 'estado']);
            $table->index(['condomino_id', 'estado']);
            $table->index(['condominio_id', 'data_lancamento']);
            $table->index(['empresa_gestora_id', 'tipo']);
            $table->index('data_vencimento');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lancamentos_condomino');
    }
};
