<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Estender o enum estado com os novos estados do diálogo
        DB::statement("ALTER TABLE acordos_pagamento MODIFY COLUMN estado ENUM(
            'pendente','aprovado','recusado','em_cumprimento','cumprido','quebrado',
            'aguarda_gestor','aguarda_condomino','sem_acordo'
        ) NOT NULL DEFAULT 'pendente'");

        // 2. Campos de controlo de rondas no acordo
        Schema::table('acordos_pagamento', function (Blueprint $table) {
            if (! Schema::hasColumn('acordos_pagamento', 'rondas_condomino')) {
                $table->unsignedTinyInteger('rondas_condomino')->default(0)->after('motivo_recusa');
            }
            if (! Schema::hasColumn('acordos_pagamento', 'rondas_gestor')) {
                $table->unsignedTinyInteger('rondas_gestor')->default(0)->after('rondas_condomino');
            }
            if (! Schema::hasColumn('acordos_pagamento', 'valor_entrada')) {
                $table->decimal('valor_entrada', 14, 2)->default(0)->after('valor_total');
            }
            if (! Schema::hasColumn('acordos_pagamento', 'valor_com_juro')) {
                $table->decimal('valor_com_juro', 14, 2)->nullable()->after('valor_entrada');
            }
        });

        // 3. Tabela de histórico de propostas (cada ronda do diálogo)
        Schema::create('acordo_propostas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('acordo_id');
            $table->enum('autor', ['condomino', 'gestor']);
            $table->unsignedTinyInteger('ronda'); // 1, 2, 3... por autor
            $table->unsignedTinyInteger('num_prestacoes');
            $table->decimal('valor_com_juro', 14, 2);
            $table->decimal('valor_entrada', 14, 2)->default(0);
            $table->text('observacoes')->nullable();
            $table->unsignedBigInteger('autor_user_id');
            $table->timestamps();

            $table->index('acordo_id');
            $table->foreign('acordo_id')->references('id')->on('acordos_pagamento')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('acordo_propostas');
        Schema::table('acordos_pagamento', function (Blueprint $table) {
            foreach (['valor_com_juro', 'valor_entrada', 'rondas_gestor', 'rondas_condomino'] as $col) {
                if (Schema::hasColumn('acordos_pagamento', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
        DB::statement("ALTER TABLE acordos_pagamento MODIFY COLUMN estado ENUM(
            'pendente','aprovado','recusado','em_cumprimento','cumprido','quebrado'
        ) NOT NULL DEFAULT 'pendente'");
    }
};
