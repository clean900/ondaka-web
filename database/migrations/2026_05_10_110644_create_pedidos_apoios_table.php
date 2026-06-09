<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pedidos_apoios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')
                ->constrained('tickets')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['ticket_id', 'user_id'], 'pa_unique');
            $table->index('ticket_id', 'pa_ticket_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos_apoios');
    }
};
