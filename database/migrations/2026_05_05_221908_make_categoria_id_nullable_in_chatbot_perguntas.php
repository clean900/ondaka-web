<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chatbot_perguntas', function (Blueprint $table) {
            $table->dropForeign(['categoria_id']);
            $table->foreignId('categoria_id')
                ->nullable()
                ->change();
            $table->foreign('categoria_id')
                ->references('id')
                ->on('chatbot_categorias')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('chatbot_perguntas', function (Blueprint $table) {
            $table->dropForeign(['categoria_id']);
            $table->foreignId('categoria_id')
                ->nullable(false)
                ->change();
            $table->foreign('categoria_id')
                ->references('id')
                ->on('chatbot_categorias')
                ->cascadeOnDelete();
        });
    }
};
