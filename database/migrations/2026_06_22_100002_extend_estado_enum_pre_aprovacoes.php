<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE pre_aprovacoes MODIFY COLUMN estado ENUM('pendente','usada','expirada','cancelada','aprovado','recusado') NOT NULL DEFAULT 'pendente'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE pre_aprovacoes MODIFY COLUMN estado ENUM('pendente','usada','expirada') NOT NULL DEFAULT 'pendente'");
    }
};
