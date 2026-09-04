<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * CAIXA DE ENTRADA DE PAGAMENTOS ProxyPay.
 *
 * A conta ProxyPay é PARTILHADA por vários sistemas (ONDAKA, Welwitschia,
 * Academia Digital, BWEFACIL) e a ProxyPay só permite UM webhook — que aponta
 * para o ONDAKA. Até agora o ONDAKA respondia 204 a tudo o que recebia, mesmo
 * ao que não era dele; para a ProxyPay, 204 significa "entregue e tratado", e o
 * pagamento saía da fila. Os outros sistemas sondavam a fila, não encontravam
 * nada, e o pagamento perdia-se em silêncio.
 *
 * Esta tabela separa RECEBER de INTERPRETAR: a porta de entrada regista tudo o
 * que a ProxyPay entrega, sem julgar de quem é. Depois cada sistema procura
 * aqui as SUAS referências e marca-as como consumidas — nenhum pode consumir o
 * pagamento de outro, porque só procura as referências que ele próprio emitiu.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proxypay_pagamentos_recebidos', function (Blueprint $table) {
            $table->id();

            // Identificadores vindos da ProxyPay.
            $table->unsignedBigInteger('reference_id')->index();
            // payment_id é o identificador do PAGAMENTO (não da referência). É por
            // ele que se garante idempotência: a ProxyPay repete a entrega quando
            // não recebe 204, e uma repetição não pode criar uma segunda linha.
            $table->unsignedBigInteger('payment_id')->nullable()->unique();

            $table->decimal('amount', 15, 2)->nullable();

            // Sistema declarado nos custom_fields da referência (ex.: 'carreiras').
            // Ajuda a encaminhar e a diagnosticar, mas NÃO é a fonte de verdade:
            // quem decide se um pagamento é seu é cada sistema, pela referência.
            $table->string('sistema', 60)->nullable()->index();

            $table->json('custom_fields')->nullable();
            // O corpo em bruto, tal como chegou. É o que permite reprocessar mais
            // tarde sem depender da nossa leitura de hoje estar certa.
            $table->json('payload');

            $table->timestamp('recebido_em')->useCurrent();

            // Quem reclamou este pagamento, e quando. Fica nulo enquanto ninguém
            // o reclamar — e é essa a lista que interessa vigiar.
            $table->string('consumido_por', 60)->nullable()->index();
            $table->timestamp('consumido_em')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proxypay_pagamentos_recebidos');
    }
};
