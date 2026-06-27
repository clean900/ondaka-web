<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * visita_itens — itens/bens registados à entrada de uma visita.
 *
 * Add-on "Controlo de Bens": cada item entra com estado 'dentro' e na saída é
 * reconciliado como 'saiu' ou 'ficou'. Só os itens registados na entrada podem
 * sair na portaria.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visita_itens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();
            $table->foreignId('visita_id')->constrained('visitas')->cascadeOnDelete();
            $table->string('descricao', 150);
            $table->string('categoria', 30)->nullable();
            $table->unsignedInteger('quantidade')->default(1);
            $table->string('identificador', 100)->nullable(); // nº série, marca/modelo, matrícula
            $table->string('foto_entrada_path')->nullable();
            $table->string('foto_saida_path')->nullable();
            $table->enum('estado', ['dentro', 'saiu', 'ficou'])->default('dentro');
            $table->foreignId('registado_por')->constrained('users');
            $table->foreignId('resolvido_por')->nullable()->constrained('users');
            $table->timestamp('resolvido_em')->nullable();
            $table->string('observacoes', 255)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['visita_id', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visita_itens');
    }
};
