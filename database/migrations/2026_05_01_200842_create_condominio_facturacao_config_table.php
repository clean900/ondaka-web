<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Configuração de facturação por condomínio.
     *
     * Permite ao admin definir:
     * - Dia de geração das quotas (default: dia 1)
     * - Dia de vencimento (default: dia 8 do mês)
     * - Dias de tolerância antes da multa
     * - Valor da multa por atraso
     * - IBAN, NIF, etc para gerar comprovativos
     *
     * Cumpre Decreto Presidencial 141/15:
     * - Reserva obrigatória do fundo (art. 5)
     * - Definição clara de obrigações de pagamento
     */
    public function up(): void
    {
        Schema::create('condominio_facturacao_config', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();
            $table->foreignId('condominio_id')->unique()->constrained('condominios')->cascadeOnDelete();

            // Geracao automatica
            $table->boolean('geracao_automatica')->default(true);
            $table->unsignedTinyInteger('dia_geracao')->default(1)->comment('Dia do mês em que a quota é gerada (1-28)');
            $table->unsignedTinyInteger('dia_vencimento')->default(8)->comment('Dia do mês em que vence');

            // Multas
            $table->boolean('multa_activa')->default(true);
            $table->unsignedSmallInteger('dias_tolerancia_multa')->default(7)->comment('Dias após vencimento até aplicar multa');
            $table->decimal('multa_valor_kz', 14, 2)->default(0)->comment('Valor fixo em Kwanzas');
            $table->enum('multa_tipo', ['fixa', 'percentagem'])->default('fixa');
            $table->decimal('multa_percentagem', 5, 2)->nullable()->comment('% sobre o valor em dívida (se tipo=percentagem)');

            // Dados bancários (para mostrar no extracto e gerar comprovativos)
            $table->string('banco_nome', 100)->nullable();
            $table->string('iban', 30)->nullable();
            $table->string('titular_conta', 200)->nullable();
            $table->string('nif_emissor', 20)->nullable();

            // Observacoes que aparecem no extracto/factura
            $table->text('observacoes_facturacao')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('empresa_gestora_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('condominio_facturacao_config');
    }
};
