<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contas_bancarias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominio_id')->constrained('condominios')->cascadeOnDelete();
            $table->string('nome', 100);
            $table->string('banco', 80);
            $table->string('iban', 50)->nullable();
            $table->enum('tipo', ['corrente', 'poupanca'])->default('corrente');
            $table->string('moeda', 3)->default('AOA');
            $table->decimal('saldo_inicial', 15, 2)->default(0);
            $table->decimal('saldo_actual', 15, 2)->default(0);
            $table->text('notas')->nullable();
            $table->boolean('activa')->default(true);
            $table->timestamps();

            $table->unique('condominio_id', 'unique_conta_principal_por_condominio');
            $table->index('activa');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contas_bancarias');
    }
};
