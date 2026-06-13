<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// C-01: ocultar o addon "Domínio personalizado" da loja (à semelhança do Sender ID).
// features é catálogo global (slug unique), por isso esconde para todos os clientes.
return new class extends Migration
{
    public function up(): void
    {
        DB::table('features')
            ->where('slug', 'dominio_personalizado')
            ->update(['activa' => false]);
    }

    public function down(): void
    {
        DB::table('features')
            ->where('slug', 'dominio_personalizado')
            ->update(['activa' => true]);
    }
};
