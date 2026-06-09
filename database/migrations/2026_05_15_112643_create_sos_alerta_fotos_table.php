<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sos_alerta_fotos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sos_alerta_id')->constrained('sos_alertas')->cascadeOnDelete();
            $table->string('path', 500);
            $table->integer('ordem')->default(0);
            $table->timestamps();

            $table->index(['sos_alerta_id', 'ordem']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sos_alerta_fotos');
    }
};
