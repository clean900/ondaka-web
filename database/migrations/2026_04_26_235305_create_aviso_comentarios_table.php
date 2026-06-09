<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aviso_comentarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aviso_id')->constrained('avisos')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('aviso_comentarios')->onDelete('cascade');
            $table->text('mensagem');
            $table->boolean('destaque')->default(false); // Admin pode destacar comentários
            $table->timestamps();
            $table->softDeletes();

            $table->index('aviso_id');
            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aviso_comentarios');
    }
};
