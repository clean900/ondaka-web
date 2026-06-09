<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('fraccao_autorizados', function (Blueprint $table) {
            $table->id();

            $table->foreignId('fraccao_id')
                ->constrained('fraccoes')
                ->cascadeOnDelete();

            // Quem cadastrou (titular da fracção)
            $table->foreignId('cadastrado_por_condomino_id')
                ->constrained('condominos')
                ->cascadeOnDelete();

            $table->string('nome_completo');
            $table->string('bi_passport', 50)->nullable();
            $table->string('telefone', 20)->nullable();

            $table->enum('relacao', [
                'conjuge',
                'filho',
                'empregada',
                'familiar',
                'outro',
            ])->default('outro');

            $table->string('foto_path')->nullable();

            $table->boolean('activo')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['fraccao_id', 'activo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fraccao_autorizados');
    }
};
