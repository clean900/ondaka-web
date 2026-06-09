<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_avaliacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_prestadora_id')->constrained('empresas_prestadoras')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('estrelas');
            $table->text('comentario')->nullable();
            $table->boolean('aprovado')->default(true);
            $table->timestamps();

            $table->unique(['empresa_prestadora_id', 'user_id'], 'uniq_avaliacao_user');
            $table->index(['empresa_prestadora_id', 'aprovado'], 'idx_prestador_aprovado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_avaliacoes');
    }
};
