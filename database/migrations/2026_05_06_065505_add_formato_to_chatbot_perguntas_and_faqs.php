<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chatbot_perguntas', function (Blueprint $table) {
            $table->enum('formato', ['texto', 'markdown'])->default('texto')->after('resposta');
        });

        Schema::table('chatbot_faqs_condominio', function (Blueprint $table) {
            $table->enum('formato', ['texto', 'markdown'])->default('texto')->after('resposta');
        });
    }

    public function down(): void
    {
        Schema::table('chatbot_perguntas', function (Blueprint $table) {
            $table->dropColumn('formato');
        });

        Schema::table('chatbot_faqs_condominio', function (Blueprint $table) {
            $table->dropColumn('formato');
        });
    }
};
