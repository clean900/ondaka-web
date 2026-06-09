<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('edificios', function (Blueprint $table) {
            // Tipo de bloco: torre (prédio), conjunto (vivendas), comercial (lojas), empresarial (escritórios), loteamento (lotes)
            $table->enum('tipo_bloco', ['torre', 'conjunto', 'comercial', 'empresarial', 'loteamento'])
                ->default('torre')
                ->after('codigo');

            // Tornar pisos e elevador nullable (não aplicável a conjuntos horizontais)
            $table->unsignedTinyInteger('numero_pisos')->nullable()->default(1)->change();
            $table->unsignedTinyInteger('pisos_subsolo')->nullable()->default(0)->change();
            $table->boolean('tem_elevador')->nullable()->default(false)->change();

            $table->index('tipo_bloco');
        });
    }

    public function down(): void
    {
        Schema::table('edificios', function (Blueprint $table) {
            $table->dropIndex(['tipo_bloco']);
            $table->dropColumn('tipo_bloco');
        });
    }
};
