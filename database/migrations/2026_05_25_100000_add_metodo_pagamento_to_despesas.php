<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('despesas', function (Blueprint $table) {
            if (! Schema::hasColumn('despesas', 'metodo_pagamento')) {
                $table->string('metodo_pagamento', 20)->nullable()->after('paga_em');
            }
        });
    }

    public function down(): void
    {
        Schema::table('despesas', function (Blueprint $table) {
            if (Schema::hasColumn('despesas', 'metodo_pagamento')) {
                $table->dropColumn('metodo_pagamento');
            }
        });
    }
};
