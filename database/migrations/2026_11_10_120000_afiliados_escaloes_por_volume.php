<?php

declare(strict_types=1);

use App\Domains\Afiliados\Models\Afiliado;
use App\Domains\Afiliados\Services\AfiliadoConfigService;
use App\Domains\Afiliados\Services\AfiliadoService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Programa de Afiliados — escalões por VOLUME DE RECEITA (12 meses) em vez de nº de clientes.
 *
 * Canon (idêntico nos três produtos):
 *   6%  desde o 1.º Kz · 7% ≥ 500.000 · 8% ≥ 1.500.000 · 9% ≥ 3.000.000 · 10% ≥ 6.000.000
 *
 * As chaves de configuração têm sempre fallback em AfiliadoConfigService::DEFAULTS, por isso o
 * programa já funciona mesmo que esta migração não corra; aqui apenas se limpa a BD das chaves
 * antigas, se semeiam as novas e se recalcula o escalão dos afiliados existentes.
 */
return new class extends Migration
{
    private array $novas = [
        ['afiliado_taxa_e1_pct', '6', 'percent', 'Comissão base (%) — desde o 1.º Kz, sobre o valor sem imposto'],
        ['afiliado_taxa_e2_pct', '7', 'percent', 'Comissão (%) a partir do 2.º escalão de volume'],
        ['afiliado_vol_e2_kz', '500000', 'decimal', 'Volume de receita (12 meses) para o 2.º escalão (Kz)'],
        ['afiliado_taxa_e3_pct', '8', 'percent', 'Comissão (%) a partir do 3.º escalão de volume'],
        ['afiliado_vol_e3_kz', '1500000', 'decimal', 'Volume de receita (12 meses) para o 3.º escalão (Kz)'],
        ['afiliado_taxa_e4_pct', '9', 'percent', 'Comissão (%) a partir do 4.º escalão de volume'],
        ['afiliado_vol_e4_kz', '3000000', 'decimal', 'Volume de receita (12 meses) para o 4.º escalão (Kz)'],
        ['afiliado_taxa_e5_pct', '10', 'percent', 'Comissão (%) a partir do 5.º escalão de volume'],
        ['afiliado_vol_e5_kz', '6000000', 'decimal', 'Volume de receita (12 meses) para o 5.º escalão (Kz)'],
    ];

    private array $obsoletas = [
        'afiliado_taxa_base_pct',
        'afiliado_taxa_prata_pct',
        'afiliado_taxa_ouro_pct',
        'afiliado_nivel_prata_clientes',
        'afiliado_nivel_ouro_clientes',
    ];

    public function up(): void
    {
        $agora = now();
        foreach ($this->novas as [$chave, $valor, $tipo, $descricao]) {
            DB::table('plataforma_config')->insertOrIgnore([
                'chave' => $chave,
                'valor' => $valor,
                'tipo' => $tipo,
                'descricao' => $descricao,
                'created_at' => $agora,
                'updated_at' => $agora,
            ]);
        }

        DB::table('plataforma_config')->whereIn('chave', $this->obsoletas)->delete();

        AfiliadoConfigService::limparCache();

        // Recalcular o escalão/taxa dos afiliados activos para o novo modelo de volume.
        // Best-effort: nunca falhar a migração por causa disto.
        try {
            $service = app(AfiliadoService::class);
            Afiliado::where('estado', Afiliado::ESTADO_ACTIVO)->orderBy('id')->chunkById(100, function ($lote) use ($service) {
                foreach ($lote as $af) {
                    $service->recalcularNivel($af);
                }
            });
        } catch (\Throwable $e) {
            // Será recalculado na tarefa diária afiliados:processar.
        }
    }

    public function down(): void
    {
        $agora = now();
        $antigas = [
            ['afiliado_taxa_base_pct', '6', 'percent', 'Comissão nível Bronze (%) — sobre o valor sem imposto'],
            ['afiliado_taxa_prata_pct', '8', 'percent', 'Comissão nível Prata (%)'],
            ['afiliado_taxa_ouro_pct', '10', 'percent', 'Comissão nível Ouro (%)'],
            ['afiliado_nivel_prata_clientes', '5', 'int', 'Clientes pagantes necessários para Prata'],
            ['afiliado_nivel_ouro_clientes', '10', 'int', 'Clientes pagantes necessários para Ouro'],
        ];
        foreach ($antigas as [$chave, $valor, $tipo, $descricao]) {
            DB::table('plataforma_config')->insertOrIgnore([
                'chave' => $chave,
                'valor' => $valor,
                'tipo' => $tipo,
                'descricao' => $descricao,
                'created_at' => $agora,
                'updated_at' => $agora,
            ]);
        }

        DB::table('plataforma_config')->whereIn('chave', array_column($this->novas, 0))->delete();

        AfiliadoConfigService::limparCache();
    }
};
