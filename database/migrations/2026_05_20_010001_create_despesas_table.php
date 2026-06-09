<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('despesas', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();
            
            $table->enum('tipo', ['condominio', 'empresa'])->index();
            
            $table->foreignId('condominio_id')
                ->nullable()
                ->constrained('condominios')
                ->nullOnDelete();
            
            $table->foreignId('categoria_id')
                ->nullable()
                ->constrained('despesa_categorias')
                ->nullOnDelete();
            
            $table->foreignId('conta_bancaria_id')
                ->constrained('contas_bancarias')
                ->restrictOnDelete();
            
            $table->date('data_despesa');
            $table->decimal('valor', 14, 2);
            $table->text('descricao');
            $table->string('fornecedor')->nullable();
            
            $table->enum('estado', ['pendente', 'aprovada', 'paga', 'cancelada'])->default('pendente')->index();
            
            $table->foreignId('criada_por_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('aprovada_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('aprovada_em')->nullable();
            $table->timestamp('paga_em')->nullable();
            $table->foreignId('paga_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelada_em')->nullable();
            $table->foreignId('cancelada_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('motivo_cancelamento')->nullable();
            
            $table->foreignId('movimento_id')
                ->nullable()
                ->constrained('contas_bancarias_movimentos')
                ->nullOnDelete();
            
            $table->string('comprovativo_path')->nullable();
            $table->text('notas')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['empresa_gestora_id', 'estado']);
            $table->index(['condominio_id', 'estado']);
            $table->index('data_despesa');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('despesas');
    }
};
