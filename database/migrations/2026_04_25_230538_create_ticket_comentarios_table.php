<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_comentarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('mensagem');
            $table->boolean('publico')->default(true);
            $table->string('mudanca_estado_de', 30)->nullable();
            $table->string('mudanca_estado_para', 30)->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['ticket_id', 'created_at']);
            $table->index(['ticket_id', 'publico']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_comentarios');
    }
};
