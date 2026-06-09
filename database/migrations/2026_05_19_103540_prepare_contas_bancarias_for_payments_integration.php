<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. contas_bancarias — remover FK e UNIQUE de condominio_id, depois recriar FK sem UNIQUE
        Schema::table('contas_bancarias', function (Blueprint $table) {
            $table->dropForeign(['condominio_id']);
        });

        Schema::table('contas_bancarias', function (Blueprint $table) {
            $table->dropUnique('unique_conta_principal_por_condominio');
        });

        Schema::table('contas_bancarias', function (Blueprint $table) {
            $table->foreign('condominio_id')
                ->references('id')
                ->on('condominios')
                ->cascadeOnDelete();
            $table->index('condominio_id', 'idx_condominio_id');
        });

        Schema::table('contas_bancarias', function (Blueprint $table) {
            $table->boolean('principal')->default(false)->after('activa');
            $table->boolean('aceita_proxypay')->default(false)->after('principal');
            $table->boolean('aceita_manual')->default(true)->after('aceita_proxypay');
            $table->text('instrucoes_pagamento')->nullable()->after('aceita_manual');

            $table->index(['condominio_id', 'principal'], 'idx_condominio_principal');
            $table->index(['condominio_id', 'aceita_proxypay'], 'idx_condominio_proxypay');
            $table->index(['condominio_id', 'aceita_manual'], 'idx_condominio_manual');
        });

        // 2. contas_bancarias_movimentos — adicionar tracking de origem
        Schema::table('contas_bancarias_movimentos', function (Blueprint $table) {
            $table->enum('origem_tipo', ['manual', 'proxypay', 'pagamento_aprovado', 'despesa'])
                ->default('manual')
                ->after('saldo_apos');
            $table->unsignedBigInteger('origem_id')->nullable()->after('origem_tipo');

            $table->index(['origem_tipo', 'origem_id'], 'idx_origem');
        });

        // 3. pagamentos — adicionar conta_bancaria_id nullable
        if (Schema::hasTable('pagamentos')) {
            Schema::table('pagamentos', function (Blueprint $table) {
                $table->foreignId('conta_bancaria_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('contas_bancarias')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('pagamentos') && Schema::hasColumn('pagamentos', 'conta_bancaria_id')) {
            Schema::table('pagamentos', function (Blueprint $table) {
                $table->dropForeign(['conta_bancaria_id']);
                $table->dropColumn('conta_bancaria_id');
            });
        }

        Schema::table('contas_bancarias_movimentos', function (Blueprint $table) {
            $table->dropIndex('idx_origem');
            $table->dropColumn(['origem_tipo', 'origem_id']);
        });

        Schema::table('contas_bancarias', function (Blueprint $table) {
            $table->dropIndex('idx_condominio_principal');
            $table->dropIndex('idx_condominio_proxypay');
            $table->dropIndex('idx_condominio_manual');
            $table->dropColumn(['principal', 'aceita_proxypay', 'aceita_manual', 'instrucoes_pagamento']);
        });

        Schema::table('contas_bancarias', function (Blueprint $table) {
            $table->dropForeign(['condominio_id']);
            $table->dropIndex('idx_condominio_id');
        });

        Schema::table('contas_bancarias', function (Blueprint $table) {
            $table->foreign('condominio_id')->references('id')->on('condominios')->cascadeOnDelete();
            $table->unique('condominio_id', 'unique_conta_principal_por_condominio');
        });
    }
};
