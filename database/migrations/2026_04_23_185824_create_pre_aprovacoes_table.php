<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pre_aprovacoes', function (Blueprint $table) {
            $table->id();

            // Multi-tenant
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();

            // Quem aprovou e a fracção a visitar
            $table->foreignId('condomino_id')
                ->constrained('condominos')
                ->cascadeOnDelete();

            $table->foreignId('fraccao_id')
                ->constrained('fraccoes')
                ->cascadeOnDelete();

            // Dados do visitante (guardados aqui para o caso de ainda não existir
            // na tabela 'visitantes' — é criado/ligado só no momento da entrada)
            $table->string('nome_visitante', 150);
            $table->string('telefone_visitante', 20);

            // Tokens de validação
            $table->string('qr_token', 64)->unique();
            $table->string('otp_code', 10)->index();

            // Janela de validade
            $table->timestamp('valida_desde')->nullable();
            $table->timestamp('valida_ate');

            // Estado do fluxo
            $table->enum('estado', ['pendente', 'usada', 'expirada', 'cancelada'])
                ->default('pendente');

            // Notas do condómino (opcional: "chegará de carro", "3 pessoas")
            $table->string('observacoes', 500)->nullable();

            // SMS de aviso enviado?
            $table->boolean('sms_enviado')->default(false);
            $table->timestamp('sms_enviado_em')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices para queries frequentes
            $table->index(['empresa_gestora_id', 'estado']);
            $table->index(['condomino_id', 'estado']);
            $table->index(['otp_code', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pre_aprovacoes');
    }
};
