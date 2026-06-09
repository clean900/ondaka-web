<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('familiares', function (Blueprint $table) {
            $table->id();
            // o condomino TITULAR a quem este familiar pertence
            $table->unsignedBigInteger('condomino_id');
            // a conta de utilizador do familiar (login proprio por telemovel)
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('nome');
            $table->string('parentesco')->nullable();
            $table->string('telefone')->nullable();
            $table->string('email')->nullable();
            // acessos que o titular liga/desliga (flexivel, JSON)
            $table->json('acessos')->nullable();
            $table->boolean('ativo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('condomino_id')->references('id')->on('condominos')->cascadeOnDelete();
            $table->index(['condomino_id', 'ativo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('familiares');
    }
};
