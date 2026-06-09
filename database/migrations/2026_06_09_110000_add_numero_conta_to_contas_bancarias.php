<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contas_bancarias', function (Blueprint $table) {
            if (! Schema::hasColumn('contas_bancarias', 'numero_conta')) {
                $table->string('numero_conta', 50)->nullable()->after('iban');
            }
        });
    }

    public function down(): void
    {
        Schema::table('contas_bancarias', function (Blueprint $table) {
            if (Schema::hasColumn('contas_bancarias', 'numero_conta')) {
                $table->dropColumn('numero_conta');
            }
        });
    }
};
