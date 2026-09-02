<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Programa de Afiliados ONDAKA.
 *
 * Um afiliado indica empresas gestoras / administradores independentes; cada pagamento
 * que esse cliente faz à ONDAKA (subscrição, add-ons, pacotes SMS) gera uma comissão
 * de 6% a 10% calculada sobre o valor SEM imposto.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('afiliados', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $t->string('codigo', 20)->unique();
            $t->enum('tipo', ['particular', 'empresa'])->default('particular');
            $t->string('nome', 150);
            $t->string('email', 150);
            $t->string('telefone', 30)->nullable();
            $t->string('nif', 30)->nullable();
            // Se o afiliado é uma empresa gestora cliente da ONDAKA (aderiu a partir do painel)
            $t->foreignId('empresa_gestora_id')->nullable()->constrained('empresas_gestoras')->nullOnDelete();
            $t->enum('estado', ['pendente', 'activo', 'suspenso', 'recusado'])->default('pendente');
            $t->string('nivel', 20)->default('bronze'); // bronze | prata | ouro
            $t->decimal('taxa_actual_pct', 5, 2)->default(6.00); // taxa efectiva (cache)
            $t->decimal('taxa_manual_pct', 5, 2)->nullable();    // override do super-admin
            $t->string('iban', 40)->nullable();
            $t->string('banco', 100)->nullable();
            $t->string('titular_conta', 150)->nullable();
            $t->text('como_divulga')->nullable();
            $t->text('notas_admin')->nullable();
            $t->string('motivo_recusa', 255)->nullable();
            $t->string('motivo_suspensao', 255)->nullable();
            $t->timestamp('aprovado_em')->nullable();
            $t->foreignId('aprovado_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamp('suspenso_em')->nullable();
            $t->unsignedInteger('total_cliques')->default(0);
            $t->timestamps();
            $t->softDeletes();

            $t->index('estado');
        });

        Schema::create('afiliado_cliques', function (Blueprint $t) {
            $t->id();
            $t->foreignId('afiliado_id')->constrained('afiliados')->cascadeOnDelete();
            $t->string('ip_hash', 64);
            $t->string('user_agent', 255)->nullable();
            $t->string('url_destino', 255)->nullable();
            $t->string('referer', 255)->nullable();
            $t->timestamp('created_at')->useCurrent();

            $t->index(['afiliado_id', 'ip_hash', 'created_at'], 'afiliado_cliques_dedupe_idx');
        });

        Schema::create('afiliado_pagamentos', function (Blueprint $t) {
            $t->id();
            $t->foreignId('afiliado_id')->constrained('afiliados')->cascadeOnDelete();
            $t->string('numero', 30)->unique(); // AFP/2026/00001
            $t->unsignedInteger('num_comissoes')->default(0);
            $t->decimal('valor_bruto_kz', 14, 2);
            $t->decimal('retencao_pct', 5, 2)->default(0);
            $t->decimal('retencao_valor_kz', 14, 2)->default(0);
            $t->decimal('valor_liquido_kz', 14, 2);
            $t->enum('metodo', ['transferencia_bancaria', 'deposito', 'multicaixa_express', 'outro'])->default('transferencia_bancaria');
            $t->string('referencia_bancaria', 100)->nullable();
            $t->string('iban_destino', 40)->nullable();
            $t->string('comprovativo_path', 255)->nullable();
            $t->string('comprovativo_nome', 150)->nullable();
            $t->string('comprovativo_mime', 80)->nullable();
            $t->date('pago_em');
            $t->text('notas')->nullable();
            $t->foreignId('registado_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();

            $t->index(['afiliado_id', 'pago_em']);
        });

        Schema::create('afiliado_comissoes', function (Blueprint $t) {
            $t->id();
            $t->foreignId('afiliado_id')->constrained('afiliados')->cascadeOnDelete();
            $t->foreignId('empresa_gestora_id')->constrained('empresas_gestoras')->cascadeOnDelete();
            // Origem do pagamento: plataforma_factura (subscrição) | ordem_compra (loja/add-ons/SMS)
            $t->string('origem_type', 40);
            $t->unsignedBigInteger('origem_id');
            $t->string('origem_numero', 50)->nullable();
            $t->string('descricao', 255);
            // Snapshot do pagamento do cliente
            $t->decimal('valor_pago_total_kz', 14, 2);   // com imposto (o que o cliente pagou)
            $t->decimal('valor_imposto_kz', 14, 2)->default(0);
            $t->decimal('valor_base_kz', 14, 2);         // SEM imposto = base da comissão
            $t->decimal('taxa_pct', 5, 2);
            $t->decimal('valor_comissao_kz', 14, 2);
            $t->string('nivel', 20)->nullable();
            $t->enum('estado', ['pendente', 'aprovada', 'paga', 'anulada'])->default('pendente');
            $t->timestamp('pago_pelo_cliente_em')->nullable();
            $t->date('disponivel_em')->nullable();       // fim da carência
            $t->timestamp('aprovada_em')->nullable();
            $t->foreignId('afiliado_pagamento_id')->nullable()->constrained('afiliado_pagamentos')->nullOnDelete();
            $t->timestamp('paga_em')->nullable();
            $t->timestamp('anulada_em')->nullable();
            $t->string('motivo_anulacao', 255)->nullable();
            $t->json('meta_json')->nullable();
            $t->timestamps();

            $t->unique(['origem_type', 'origem_id'], 'afiliado_comissoes_origem_unique');
            $t->index(['afiliado_id', 'estado']);
            $t->index(['empresa_gestora_id', 'estado']);
            $t->index('disponivel_em');
        });

        Schema::table('empresas_gestoras', function (Blueprint $t) {
            $t->foreignId('afiliado_id')->nullable()->after('configuracoes')->constrained('afiliados')->nullOnDelete();
            $t->timestamp('afiliado_atribuido_em')->nullable()->after('afiliado_id');
            $t->string('afiliado_origem', 20)->nullable()->after('afiliado_atribuido_em'); // link | manual
            $t->date('afiliado_expira_em')->nullable()->after('afiliado_origem');          // null = vitalícia
        });

        // Configuração global do programa (chave/valor em plataforma_config)
        $agora = now();
        $config = [
            ['afiliado_programa_activo', '1', 'bool', 'Programa de afiliados activo (aceita candidaturas e atribui comissões)'],
            ['afiliado_taxa_base_pct', '6', 'percent', 'Comissão nível Bronze (%) — sobre o valor sem imposto'],
            ['afiliado_taxa_prata_pct', '8', 'percent', 'Comissão nível Prata (%)'],
            ['afiliado_taxa_ouro_pct', '10', 'percent', 'Comissão nível Ouro (%)'],
            ['afiliado_nivel_prata_clientes', '5', 'int', 'Clientes pagantes necessários para Prata'],
            ['afiliado_nivel_ouro_clientes', '10', 'int', 'Clientes pagantes necessários para Ouro'],
            ['afiliado_carencia_dias', '15', 'int', 'Dias de carência antes de a comissão ficar aprovada (protecção contra estornos)'],
            ['afiliado_pagamento_minimo_kz', '10000', 'decimal', 'Valor mínimo acumulado para pagamento ao afiliado (Kz)'],
            ['afiliado_cookie_dias', '90', 'int', 'Dias em que o link de afiliado fica memorizado no browser do visitante'],
            ['afiliado_duracao_meses', '0', 'int', 'Meses em que o cliente gera comissão ao afiliado (0 = vitalício)'],
            ['afiliado_retencao_pct', '0', 'percent', 'Retenção na fonte aplicada por defeito aos pagamentos de comissões (%)'],
            ['afiliado_aprovacao_automatica', '0', 'bool', 'Aprovar candidaturas automaticamente (1) ou exigir aprovação do super-admin (0)'],
        ];
        foreach ($config as [$chave, $valor, $tipo, $descricao]) {
            DB::table('plataforma_config')->insertOrIgnore([
                'chave' => $chave,
                'valor' => $valor,
                'tipo' => $tipo,
                'descricao' => $descricao,
                'created_at' => $agora,
                'updated_at' => $agora,
            ]);
        }

        // Role 'afiliado' (Spatie)
        if (! DB::table('roles')->where('name', 'afiliado')->where('guard_name', 'web')->exists()) {
            DB::table('roles')->insert([
                'name' => 'afiliado',
                'guard_name' => 'web',
                'created_at' => $agora,
                'updated_at' => $agora,
            ]);
        }
        try {
            app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
        } catch (\Throwable) {
            // sem cache disponível — ignorar
        }
    }

    public function down(): void
    {
        Schema::table('empresas_gestoras', function (Blueprint $t) {
            $t->dropConstrainedForeignId('afiliado_id');
            $t->dropColumn(['afiliado_atribuido_em', 'afiliado_origem', 'afiliado_expira_em']);
        });
        Schema::dropIfExists('afiliado_comissoes');
        Schema::dropIfExists('afiliado_pagamentos');
        Schema::dropIfExists('afiliado_cliques');
        Schema::dropIfExists('afiliados');
        DB::table('plataforma_config')->where('chave', 'like', 'afiliado_%')->delete();
    }
};
