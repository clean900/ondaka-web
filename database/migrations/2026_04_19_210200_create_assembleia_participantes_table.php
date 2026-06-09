<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('assembleia_participantes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('assembleia_id')->constrained('assembleias')->cascadeOnDelete();
            $table->foreignId('condomino_id')->constrained('condominos')->cascadeOnDelete();

            // Snapshot para acta (se condomino for apagado no futuro, mantemos histórico)
            $table->string('nome_snapshot', 200);
            $table->string('documento_snapshot', 50)->nullable();

            // Representação de fracções (um condómino pode ter múltiplas)
            $table->integer('numero_fraccoes')->default(0);
            $table->decimal('permilagem_total', 8, 4)->default(0); // soma de todas as suas fracções

            // Convocação
            $table->timestamp('convocado_em')->nullable();
            $table->string('canal_convocacao', 20)->nullable(); // email, sms, ambos
            $table->string('email_convocacao', 150)->nullable();
            $table->string('telefone_convocacao', 20)->nullable();
            $table->boolean('email_enviado')->default(false);
            $table->boolean('sms_enviado')->default(false);

            // Presença
            $table->timestamp('entrou_em')->nullable();
            $table->timestamp('saiu_em')->nullable();
            $table->boolean('presente')->default(false); // true se entrou pelo menos uma vez
            $table->string('ip_entrada', 45)->nullable();
            $table->text('user_agent_entrada')->nullable();

            // Representação / procuração (futuro)
            $table->foreignId('representado_por_condomino_id')->nullable()->constrained('condominos');

            $table->timestamps();

            $table->unique(['assembleia_id', 'condomino_id']);
            $table->index('assembleia_id');
            $table->index('presente');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assembleia_participantes');
    }
};
