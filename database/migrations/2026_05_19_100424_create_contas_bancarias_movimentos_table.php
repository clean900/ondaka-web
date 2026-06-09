<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contas_bancarias_movimentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conta_bancaria_id')->constrained('contas_bancarias')->cascadeOnDelete();
            $table->date('data');
            $table->enum('tipo', ['entrada', 'saida']);
            $table->string('descricao', 200);
            $table->decimal('valor', 15, 2);
            $table->decimal('saldo_apos', 15, 2);
            $table->foreignId('criado_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['conta_bancaria_id', 'data'], 'idx_conta_data');
            $table->index('tipo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contas_bancarias_movimentos');
    }
};
