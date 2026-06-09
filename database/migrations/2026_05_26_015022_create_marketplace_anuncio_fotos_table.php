<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_anuncio_fotos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anuncio_id')->constrained('marketplace_anuncios')->cascadeOnDelete();
            $table->string('path');
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();
            $table->index('anuncio_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_anuncio_fotos');
    }
};
