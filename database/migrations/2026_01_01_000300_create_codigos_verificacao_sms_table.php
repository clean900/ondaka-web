<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('codigos_verificacao_sms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('codigo_hash');
            $table->string('telefone', 30);
            $table->enum('proposito', ['login_2fa', 'recuperar_password', 'confirmar_telefone']);
            $table->unsignedTinyInteger('tentativas')->default(0);
            $table->timestamp('expira_em');
            $table->timestamp('usado_em')->nullable();
            $table->string('ip_solicitacao', 45)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'proposito', 'expira_em']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('codigos_verificacao_sms');
    }
};
