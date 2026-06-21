<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lista Negra de Visitantes — banimento por BI, matrícula ou nome.
 * Quando um visitante na portaria corresponde a uma entrada activa, o guarda
 * recebe um alerta (visual + sonoro). Não bloqueia automaticamente; o guarda decide.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitantes_banidos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('empresa_gestora_id');
            // null = aplica-se a todos os condomínios da empresa (se partilhar_empresa);
            // preenchido = só este condomínio.
            $table->unsignedBigInteger('condominio_id')->nullable();
            $table->enum('tipo', ['bi', 'matricula', 'nome']);
            $table->string('valor', 150);                 // valor original (como inserido)
            $table->string('valor_normalizado', 150);     // maiúsculas, sem espaços/traços — para o match
            $table->text('motivo')->nullable();
            $table->boolean('partilhar_empresa')->default(false);
            $table->unsignedBigInteger('criado_por_user_id');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['empresa_gestora_id', 'tipo', 'valor_normalizado'], 'idx_banido_lookup');
            $table->index('condominio_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitantes_banidos');
    }
};
