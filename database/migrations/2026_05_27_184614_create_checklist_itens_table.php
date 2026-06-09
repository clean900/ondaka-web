<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checklist_itens', function (Blueprint $t) {
            $t->id();
            $t->foreignId('modelo_id')->constrained('checklist_modelos')->cascadeOnDelete();
            $t->string('texto', 255);
            $t->unsignedSmallInteger('ordem')->default(0);
            $t->boolean('obrigatorio')->default(true);
            $t->timestamps();
            $t->index(['modelo_id', 'ordem']);
        });
    }
    public function down(): void { Schema::dropIfExists('checklist_itens'); }
};
