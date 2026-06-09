<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('acordo_quotas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('acordo_id');
            $table->unsignedBigInteger('quota_id');
            // valor em divida da quota no momento em que o acordo foi criado
            $table->decimal('valor_em_divida', 14, 2)->default(0);
            $table->timestamps();

            $table->foreign('acordo_id')->references('id')->on('acordos_pagamento')->cascadeOnDelete();
            $table->index(['acordo_id', 'quota_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('acordo_quotas');
    }
};
