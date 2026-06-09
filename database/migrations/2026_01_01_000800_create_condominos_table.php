<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('condominos', function (Blueprint $table) {
            $table->id();

            // Multi-tenant
            $table->foreignId('empresa_gestora_id')
                ->constrained('empresas_gestoras')
                ->cascadeOnDelete();

            // Tipo: singular ou empresa
            $table->enum('tipo', ['singular', 'empresa'])->default('singular');

            // Dados gerais (aplicam-se a ambos)
            $table->string('nome_completo'); // Para empresas: razão social
            $table->string('nome_comercial')->nullable(); // Só para empresas

            // Identificação singular
            $table->string('numero_bi', 20)->nullable(); // BI angolano
            $table->date('data_nascimento')->nullable();
            $table->enum('genero', ['masculino', 'feminino', 'outro'])->nullable();
            $table->string('nacionalidade', 50)->default('Angolana');
            $table->enum('estado_civil', ['solteiro', 'casado', 'uniao_facto', 'divorciado', 'viuvo'])->nullable();
            $table->string('profissao', 100)->nullable();

            // Identificação empresa
            $table->string('nif', 20)->nullable(); // NIF angolano (para empresa é obrigatório)
            $table->date('data_constituicao_empresa')->nullable();
            $table->string('numero_registo_comercial', 50)->nullable();

            // Contactos
            $table->string('telefone_principal', 20)->nullable();
            $table->string('telefone_alternativo', 20)->nullable();
            $table->string('email')->nullable();

            // Morada (correspondência)
            $table->text('morada')->nullable();
            $table->string('provincia', 50)->nullable();
            $table->string('municipio', 100)->nullable();
            $table->string('bairro', 100)->nullable();

            // Representante legal (só para empresas)
            $table->string('representante_nome')->nullable();
            $table->string('representante_bi', 20)->nullable();
            $table->string('representante_cargo', 100)->nullable();
            $table->string('representante_telefone', 20)->nullable();
            $table->string('representante_email')->nullable();

            // Observações e ficheiros
            $table->text('observacoes')->nullable();
            $table->string('foto_path')->nullable();
            $table->string('bi_frente_path')->nullable();
            $table->string('bi_verso_path')->nullable();

            // Estado
            $table->enum('estado', ['activo', 'inactivo', 'arquivado'])->default('activo');

            // Ligação opcional a user (caso o condómino use a app)
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['empresa_gestora_id', 'estado']);
            $table->index('tipo');
            $table->index('numero_bi');
            $table->index('nif');
            $table->index('email');
            $table->index('telefone_principal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('condominos');
    }
};
