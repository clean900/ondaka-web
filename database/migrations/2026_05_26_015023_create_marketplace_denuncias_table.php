<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_denuncias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anuncio_id')->constrained('marketplace_anuncios')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('motivo', 100);
            $table->text('detalhe')->nullable();
            $table->enum('estado', ['pendente', 'resolvida'])->default('pendente');
            $table->timestamps();
            $table->index(['estado', 'anuncio_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_denuncias');
    }
};
