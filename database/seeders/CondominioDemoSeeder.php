<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Condominio\Models\Condominio;
use App\Domains\Condominio\Models\Edificio;
use App\Domains\Condominio\Models\Fraccao;
use App\Domains\Condominio\Models\TipoFraccao;
use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Database\Seeder;

class CondominioDemoSeeder extends Seeder
{
    public function run(): void
    {
        $empresa = EmpresaGestora::where('slug', 'solucoes-simples')->first();

        if (! $empresa) {
            $this->command->error('Executar EmpresaGestoraDemoSeeder primeiro.');
            return;
        }

        // Bind de tenant para criação
        app()->instance('empresa_gestora_actual', $empresa);

        // Tipos de fracção típicos angolanos
        $tipos = [
            ['nome' => 'Tipologia 1 (T1)', 'codigo' => 'T1', 'paga_quota' => true],
            ['nome' => 'Tipologia 2 (T2)', 'codigo' => 'T2', 'paga_quota' => true],
            ['nome' => 'Tipologia 3 (T3)', 'codigo' => 'T3', 'paga_quota' => true],
            ['nome' => 'Tipologia 4 (T4)', 'codigo' => 'T4', 'paga_quota' => true],
            ['nome' => 'Loja Comercial', 'codigo' => 'LOJA', 'paga_quota' => true],
            ['nome' => 'Escritório', 'codigo' => 'ESCR', 'paga_quota' => true],
            ['nome' => 'Garagem', 'codigo' => 'GAR', 'paga_quota' => false],
            ['nome' => 'Arrecadação', 'codigo' => 'ARR', 'paga_quota' => false],
        ];

        $tiposIds = [];
        foreach ($tipos as $t) {
            $tipo = TipoFraccao::firstOrCreate(
                ['empresa_gestora_id' => $empresa->id, 'codigo' => $t['codigo']],
                $t
            );
            $tiposIds[$t['codigo']] = $tipo->id;
        }

        // Condomínio de exemplo: Torres Atlântico
        $condominio = Condominio::firstOrCreate(
            ['codigo' => 'COND-LUA-001'],
            [
                'empresa_gestora_id' => $empresa->id,
                'nome' => 'Torres Atlântico',
                'nif' => '5999888777',
                'morada' => 'Av. 4 de Fevereiro, Marginal de Luanda',
                'provincia' => 'Luanda',
                'municipio' => 'Luanda',
                'bairro' => 'Ingombota',
                'data_constituicao' => '2022-03-15',
                'numero_matricula' => 'CRP-LUA-2022/0415',
                'conservatoria' => 'Conservatória do Registo Predial de Luanda',
                'iban' => 'AO06 0040 0000 1234 5678 9012 3',
                'banco' => 'Banco de Fomento Angola (BFA)',
                'moeda' => 'AOA',
                'ucf_valor_actual' => 88.00,
                'percentagem_fundo_reserva' => 15.00,
                'estado' => 'activo',
            ]
        );

        // Edifício A
        $edificioA = Edificio::firstOrCreate(
            ['condominio_id' => $condominio->id, 'codigo' => 'A'],
            [
                'empresa_gestora_id' => $empresa->id,
                'nome' => 'Torre A',
                'numero_pisos' => 12,
                'pisos_subsolo' => 2,
                'tem_elevador' => true,
                'numero_elevadores' => 2,
                'descricao' => 'Torre principal com vista para a Marginal',
            ]
        );

        // Fracções Torre A — T3 em cada piso (4 por piso)
        $letras = ['A', 'B', 'C', 'D'];
        foreach (range(1, 10) as $piso) {
            foreach ($letras as $letra) {
                $areaM2 = 120.50;
                $quotaBase = 35000.00;
                $fundoReserva = 5250.00; // 15% de 35000

                Fraccao::firstOrCreate(
                    ['edificio_id' => $edificioA->id, 'identificador' => "{$piso}º{$letra}"],
                    [
                        'empresa_gestora_id' => $empresa->id,
                        'condominio_id' => $condominio->id,
                        'tipo_fraccao_id' => $tiposIds['T3'],
                        'piso' => $piso,
                        'letra' => $letra,
                        'area_privativa_m2' => $areaM2,
                        'permilagem' => 8.5,
                        'quota_mensal_base' => $quotaBase,
                        'quota_mensal_fundo_reserva' => $fundoReserva,
                        'numero_quartos' => 3,
                        'numero_casas_banho' => 2,
                        'tem_lugar_garagem' => true,
                        'numero_lugares_garagem' => 1,
                        'tem_arrecadacao' => true,
                        'estado' => $piso <= 7 ? 'ocupada' : 'vaga',
                    ]
                );
            }
        }

        // Lojas no R/C (piso 0)
        foreach (['L1', 'L2', 'L3'] as $idx => $lojaId) {
            Fraccao::firstOrCreate(
                ['edificio_id' => $edificioA->id, 'identificador' => $lojaId],
                [
                    'empresa_gestora_id' => $empresa->id,
                    'condominio_id' => $condominio->id,
                    'tipo_fraccao_id' => $tiposIds['LOJA'],
                    'piso' => 0,
                    'area_privativa_m2' => 85.00,
                    'permilagem' => 6.2,
                    'quota_mensal_base' => 45000.00,
                    'quota_mensal_fundo_reserva' => 6750.00,
                    'tem_lugar_garagem' => false,
                    'tem_arrecadacao' => false,
                    'estado' => 'arrendada',
                ]
            );
        }

        // Edifício B
        $edificioB = Edificio::firstOrCreate(
            ['condominio_id' => $condominio->id, 'codigo' => 'B'],
            [
                'empresa_gestora_id' => $empresa->id,
                'nome' => 'Torre B',
                'numero_pisos' => 10,
                'pisos_subsolo' => 1,
                'tem_elevador' => true,
                'numero_elevadores' => 1,
                'descricao' => 'Torre secundária',
            ]
        );

        // Fracções Torre B — T2 (3 por piso)
        foreach (range(1, 8) as $piso) {
            foreach (['A', 'B', 'C'] as $letra) {
                Fraccao::firstOrCreate(
                    ['edificio_id' => $edificioB->id, 'identificador' => "{$piso}º{$letra}"],
                    [
                        'empresa_gestora_id' => $empresa->id,
                        'condominio_id' => $condominio->id,
                        'tipo_fraccao_id' => $tiposIds['T2'],
                        'piso' => $piso,
                        'letra' => $letra,
                        'area_privativa_m2' => 85.00,
                        'permilagem' => 6.0,
                        'quota_mensal_base' => 25000.00,
                        'quota_mensal_fundo_reserva' => 3750.00,
                        'numero_quartos' => 2,
                        'numero_casas_banho' => 1,
                        'tem_lugar_garagem' => true,
                        'numero_lugares_garagem' => 1,
                        'tem_arrecadacao' => false,
                        'estado' => 'ocupada',
                    ]
                );
            }
        }

        $this->command->info('✓ Condomínio «Torres Atlântico» criado:');
        $this->command->info('  - 2 Torres (A e B)');
        $this->command->info('  - ' . Fraccao::where('condominio_id', $condominio->id)->count() . ' fracções');
    }
}
