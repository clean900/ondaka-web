<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Adiciona 'credito_saldo' ao enum metodo da tabela pagamentos_condomino.
 *
 * Contexto: permite registar utilizações de crédito de fracção como
 * pagamentos internos (Mini-Fase B — usar saldo de crédito).
 *
 * Schema Builder do Laravel não suporta ALTER ENUM directamente — usamos raw SQL.
 * MariaDB 10.11 executa esta alteração sem bloqueio significativo.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE `pagamentos_condomino`
            MODIFY COLUMN `metodo` ENUM(
                'transferencia_bancaria',
                'deposito_bancario',
                'proxypay_rps',
                'dinheiro',
                'outro',
                'credito_saldo'
            ) NOT NULL
        ");
    }

    public function down(): void
    {
        // Antes de reverter, garantir que não existem pagamentos com metodo='credito_saldo'
        $count = DB::table('pagamentos_condomino')
            ->where('metodo', 'credito_saldo')
            ->count();

        if ($count > 0) {
            throw new \RuntimeException(
                "Não é possível reverter — existem {$count} pagamentos com metodo='credito_saldo'. " .
                "Apaga-os primeiro ou faz hard delete via SQL antes de correr down()."
            );
        }

        DB::statement("
            ALTER TABLE `pagamentos_condomino`
            MODIFY COLUMN `metodo` ENUM(
                'transferencia_bancaria',
                'deposito_bancario',
                'proxypay_rps',
                'dinheiro',
                'outro'
            ) NOT NULL
        ");
    }
};