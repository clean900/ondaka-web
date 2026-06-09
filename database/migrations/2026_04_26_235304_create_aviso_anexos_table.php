<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aviso_anexos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aviso_id')->constrained('avisos')->onDelete('cascade');
            $table->foreignId('uploaded_by_user_id')->constrained('users');
            $table->string('path'); // Path no storage
            $table->string('nome_original');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('tamanho_bytes');
            $table->timestamps();

            $table->index('aviso_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aviso_anexos');
    }
};
