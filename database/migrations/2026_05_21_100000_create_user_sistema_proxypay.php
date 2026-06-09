<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Cria um utilizador "Sistema ProxyPay" para confirmacoes automaticas de
 * pagamentos via webhook. Idempotente: so cria se nao existir.
 *
 * Este user NAO pertence a nenhuma empresa_gestora (null) porque confirma
 * pagamentos de qualquer empresa (contexto multi-tenant, accao de sistema).
 */
return new class extends Migration {
    public function up(): void
    {
        $existe = DB::table('users')->where('email', 'sistema@ondaka.ao')->exists();
        if ($existe) {
            return;
        }

        DB::table('users')->insert([
            'name' => 'Sistema ProxyPay',
            'email' => 'sistema@ondaka.ao',
            'password' => Hash::make(bin2hex(random_bytes(32))), // password aleatoria — login impossivel
            'empresa_gestora_id' => null,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('users')->where('email', 'sistema@ondaka.ao')->delete();
    }
};
