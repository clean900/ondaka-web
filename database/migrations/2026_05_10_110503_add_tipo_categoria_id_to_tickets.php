<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->enum('tipo', ['particular', 'publico'])
                ->default('particular')
                ->after('descricao');

            $table->foreignId('categoria_id')
                ->nullable()
                ->after('tipo')
                ->constrained('categorias_pedido')
                ->nullOnDelete();

            $table->index(['empresa_gestora_id', 'condominio_id', 'tipo'], 'tickets_tipo_lookup');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex('tickets_tipo_lookup');
            $table->dropConstrainedForeignId('categoria_id');
            $table->dropColumn('tipo');
        });
    }
};
