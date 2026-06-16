<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * F-05: acordos para todo o tipo de faturas.
 * Snapshot dos lançamentos (multa, despesa_extra, juros, ajuste_debito) que
 * compõem o acordo, à semelhança de acordo_quotas para as quotas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('acordo_lancamentos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('acordo_id');
            $table->unsignedBigInteger('lancamento_id');
            $table->decimal('valor_em_divida', 14, 2)->default(0);
            $table->timestamps();

            $table->foreign('acordo_id')->references('id')->on('acordos_pagamento')->cascadeOnDelete();
            $table->index(['acordo_id', 'lancamento_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('acordo_lancamentos');
    }
};
