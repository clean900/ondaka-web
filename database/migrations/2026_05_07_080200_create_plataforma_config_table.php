<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('plataforma_config', function (Blueprint $table) {
            $table->string('chave', 100)->primary();
            $table->text('valor')->nullable();
            $table->string('tipo', 20)->default('string'); // string, int, decimal, percent, bool, json
            $table->string('descricao', 200)->nullable();
            $table->timestamps();
        });

        // Seed com configurações iniciais
        $now = now();
        DB::table('plataforma_config')->insert([
            ['chave' => 'preco_base_imovel_mes', 'valor' => '1850', 'tipo' => 'decimal', 'descricao' => 'Preço base por imóvel/mês em Kz', 'created_at' => $now, 'updated_at' => $now],
            ['chave' => 'desconto_periodo_mensal_pct', 'valor' => '0', 'tipo' => 'percent', 'descricao' => 'Desconto % para subscrição mensal', 'created_at' => $now, 'updated_at' => $now],
            ['chave' => 'desconto_periodo_semestral_pct', 'valor' => '5', 'tipo' => 'percent', 'descricao' => 'Desconto % para subscrição semestral', 'created_at' => $now, 'updated_at' => $now],
            ['chave' => 'desconto_periodo_anual_pct', 'valor' => '15', 'tipo' => 'percent', 'descricao' => 'Desconto % para subscrição anual', 'created_at' => $now, 'updated_at' => $now],
            ['chave' => 'trial_duracao_dias', 'valor' => '14', 'tipo' => 'int', 'descricao' => 'Duração do trial em dias', 'created_at' => $now, 'updated_at' => $now],
            ['chave' => 'imposto_tipo', 'valor' => 'IVA', 'tipo' => 'string', 'descricao' => 'Tipo de imposto aplicável (IVA, IPC, etc.)', 'created_at' => $now, 'updated_at' => $now],
            ['chave' => 'imposto_taxa_pct', 'valor' => '14', 'tipo' => 'percent', 'descricao' => 'Taxa de imposto em %', 'created_at' => $now, 'updated_at' => $now],
            ['chave' => 'imposto_aplicavel', 'valor' => '1', 'tipo' => 'bool', 'descricao' => 'Aplicar imposto às facturas', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('plataforma_config');
    }
};
