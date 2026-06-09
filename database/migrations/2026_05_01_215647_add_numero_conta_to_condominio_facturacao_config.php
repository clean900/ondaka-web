<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('condominio_facturacao_config', function (Blueprint $table) {
            $table->string('numero_conta', 50)->nullable()->after('iban')
                ->comment('Número de conta — usado para depósitos bancários');
        });
    }

    public function down(): void
    {
        Schema::table('condominio_facturacao_config', function (Blueprint $table) {
            $table->dropColumn('numero_conta');
        });
    }
};
