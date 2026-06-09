<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('encomendas', function (Blueprint $table) {
            $table->id();

            // Tenancy + a quem se destina
            $table->foreignId('condominio_id')->constrained('condominios')->cascadeOnDelete();
            $table->foreignId('fraccao_id')->constrained('fraccoes')->cascadeOnDelete();
            $table->foreignId('condomino_id')->constrained('condominos')->cascadeOnDelete();

            // Conteúdo
            $table->string('descricao', 500);
            $table->string('remetente')->nullable();
            $table->text('notas_guarda')->nullable();

            // Estado e origem
            $table->enum('estado', [
                'aguarda_chegada',
                'aguarda_levantamento',
                'entregue',
                'multa_aplicada',
                'cancelada',
            ])->default('aguarda_chegada');

            $table->enum('origem', ['pre_anunciada', 'sem_aviso']);

            $table->enum('local_atual', [
                'portaria',
                'administracao',
                'entregue',
            ])->default('portaria');

            // Pré-anúncio (Fluxo B)
            $table->dateTime('janela_inicio')->nullable();
            $table->dateTime('janela_fim')->nullable();

            // Chegada à portaria
            $table->dateTime('chegou_em')->nullable();
            $table->foreignId('recebida_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('foto_path')->nullable();

            // Aviso ao 5º dia
            $table->dateTime('aviso_5_dias_em')->nullable();

            // Levantamento
            $table->dateTime('levantada_em')->nullable();
            $table->string('levantada_por')->nullable();
            $table->foreignId('entregue_por_user_id')->nullable()->constrained('users')->nullOnDelete();

            // Multa
            $table->dateTime('multa_aplicada_em')->nullable();
            $table->decimal('multa_valor_kz', 10, 2)->nullable();
            $table->enum('multa_estado', ['pendente', 'paga', 'desbloqueada'])->nullable();
            $table->enum('multa_pago_via', ['proxypay', 'extracto', 'dinheiro'])->nullable();
            $table->dateTime('multa_pago_em')->nullable();
            $table->text('multa_pago_observacoes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['condominio_id', 'estado']);
            $table->index(['condomino_id', 'estado']);
            $table->index('chegou_em');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('encomendas');
    }
};
