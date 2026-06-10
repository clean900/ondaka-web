<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sms_sender_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominio_id')->constrained('condominios')->cascadeOnDelete();
            $table->string('sender_name', 11);
            $table->text('api_key')->nullable();
            $table->enum('estado', ['pendente', 'configurado'])->default('pendente');
            $table->timestamps();

            $table->unique('condominio_id', 'sms_sender_config_condominio_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_sender_configs');
    }
};
