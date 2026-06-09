<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Condominio\Models\TipoFraccao;
use App\Domains\Empresa\Models\EmpresaGestora;
use Illuminate\Database\Seeder;

class TiposFraccaoSeeder extends Seeder
{
    public function run(): void
    {
        // Aplicar tipos a todas as empresas gestoras activas
        $empresas = EmpresaGestora::where('activa', true)->get();

        if ($empresas->isEmpty()) {
            $this->command->warn('Nenhuma empresa gestora encontrada.');
            return;
        }

        foreach ($empresas as $empresa) {
            app()->instance('empresa_gestora_actual', $empresa);
            $this->seedParaEmpresa($empresa->id);
        }

        $this->command->info('✓ Tipos de fracção (Angola) sincronizados para ' . $empresas->count() . ' empresa(s).');
    }

    public function seedParaEmpresa(int $empresaId): void
    {
        $tipos = [
            // ===== RESIDENCIAL VERTICAL (Apartamentos) =====
            ['nome' => 'Apartamento T0', 'codigo' => 'APT-T0', 'categoria' => 'residencial_vertical', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 1, 'descricao' => 'Estúdio/Apartamento sem quarto separado'],
            ['nome' => 'Apartamento T1', 'codigo' => 'APT-T1', 'categoria' => 'residencial_vertical', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 1, 'descricao' => '1 quarto'],
            ['nome' => 'Apartamento T1+1', 'codigo' => 'APT-T1+1', 'categoria' => 'residencial_vertical', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 1, 'descricao' => '1 quarto + escritório/quarto auxiliar'],
            ['nome' => 'Apartamento T2', 'codigo' => 'APT-T2', 'categoria' => 'residencial_vertical', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 1, 'descricao' => '2 quartos'],
            ['nome' => 'Apartamento T2+1', 'codigo' => 'APT-T2+1', 'categoria' => 'residencial_vertical', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 1, 'descricao' => '2 quartos + escritório'],
            ['nome' => 'Apartamento T3', 'codigo' => 'APT-T3', 'categoria' => 'residencial_vertical', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 1, 'descricao' => '3 quartos'],
            ['nome' => 'Apartamento T3+1', 'codigo' => 'APT-T3+1', 'categoria' => 'residencial_vertical', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 1, 'descricao' => '3 quartos + escritório'],
            ['nome' => 'Apartamento T4', 'codigo' => 'APT-T4', 'categoria' => 'residencial_vertical', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 1, 'descricao' => '4 quartos'],
            ['nome' => 'Apartamento T4+1', 'codigo' => 'APT-T4+1', 'categoria' => 'residencial_vertical', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 1, 'descricao' => '4 quartos + escritório'],
            ['nome' => 'Apartamento T5', 'codigo' => 'APT-T5', 'categoria' => 'residencial_vertical', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 1, 'descricao' => '5 quartos'],

            // ===== RESIDENCIAL HORIZONTAL (Vivendas/Moradias) =====
            ['nome' => 'Vivenda V3 Térrea', 'codigo' => 'VIV-V3', 'categoria' => 'residencial_horizontal', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 1, 'tem_pisos_multiplos' => false, 'descricao' => 'Moradia de 3 quartos num único piso'],
            ['nome' => 'Vivenda V4 Térrea', 'codigo' => 'VIV-V4', 'categoria' => 'residencial_horizontal', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 1, 'tem_pisos_multiplos' => false, 'descricao' => 'Moradia de 4 quartos num único piso'],
            ['nome' => 'Vivenda V5 Térrea', 'codigo' => 'VIV-V5', 'categoria' => 'residencial_horizontal', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 1, 'tem_pisos_multiplos' => false, 'descricao' => 'Moradia de 5 quartos num único piso'],
            ['nome' => 'Vivenda V3 Duplex', 'codigo' => 'VIV-V3-DPX', 'categoria' => 'residencial_horizontal', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 2, 'tem_pisos_multiplos' => true, 'descricao' => 'Moradia V3 com 2 pisos'],
            ['nome' => 'Vivenda V4 Duplex', 'codigo' => 'VIV-V4-DPX', 'categoria' => 'residencial_horizontal', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 2, 'tem_pisos_multiplos' => true, 'descricao' => 'Moradia V4 com 2 pisos'],
            ['nome' => 'Vivenda V5 Duplex', 'codigo' => 'VIV-V5-DPX', 'categoria' => 'residencial_horizontal', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 2, 'tem_pisos_multiplos' => true, 'descricao' => 'Moradia V5 com 2 pisos'],
            ['nome' => 'Vivenda V6 Duplex', 'codigo' => 'VIV-V6-DPX', 'categoria' => 'residencial_horizontal', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 2, 'tem_pisos_multiplos' => true, 'descricao' => 'Moradia V6 com 2 pisos'],
            ['nome' => 'Vivenda V3 Triplex', 'codigo' => 'VIV-V3-TPX', 'categoria' => 'residencial_horizontal', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 3, 'tem_pisos_multiplos' => true, 'descricao' => 'Moradia V3 com 3 pisos'],
            ['nome' => 'Vivenda V4 Triplex', 'codigo' => 'VIV-V4-TPX', 'categoria' => 'residencial_horizontal', 'paga_quota' => true, 'eh_residencial' => true, 'numero_pisos_tipico' => 3, 'tem_pisos_multiplos' => true, 'descricao' => 'Moradia V4 com 3 pisos'],

            // ===== COMERCIAL =====
            ['nome' => 'Loja', 'codigo' => 'LOJA', 'categoria' => 'comercial', 'paga_quota' => true, 'eh_residencial' => false, 'numero_pisos_tipico' => 1, 'descricao' => 'Espaço comercial térreo'],
            ['nome' => 'Galeria Comercial', 'codigo' => 'GAL', 'categoria' => 'comercial', 'paga_quota' => true, 'eh_residencial' => false, 'numero_pisos_tipico' => 1, 'descricao' => 'Conjunto de lojas agrupadas'],
            ['nome' => 'Armazém', 'codigo' => 'ARM', 'categoria' => 'comercial', 'paga_quota' => true, 'eh_residencial' => false, 'numero_pisos_tipico' => 1, 'descricao' => 'Espaço de armazenamento/logística'],

            // ===== EMPRESARIAL =====
            ['nome' => 'Escritório', 'codigo' => 'ESCR', 'categoria' => 'empresarial', 'paga_quota' => true, 'eh_residencial' => false, 'numero_pisos_tipico' => 1, 'descricao' => 'Espaço de escritório/gabinete'],

            // ===== LOTEAMENTO =====
            ['nome' => 'Lote/Terreno', 'codigo' => 'LOT', 'categoria' => 'loteamento', 'paga_quota' => true, 'eh_residencial' => false, 'numero_pisos_tipico' => 0, 'descricao' => 'Lote de terreno em urbanização'],

            // ===== AUXILIAR =====
            ['nome' => 'Lugar de Garagem', 'codigo' => 'GAR', 'categoria' => 'auxiliar', 'paga_quota' => false, 'eh_residencial' => false, 'numero_pisos_tipico' => 0, 'descricao' => 'Lugar individual de estacionamento'],
            ['nome' => 'Arrecadação', 'codigo' => 'ARR', 'categoria' => 'auxiliar', 'paga_quota' => false, 'eh_residencial' => false, 'numero_pisos_tipico' => 0, 'descricao' => 'Espaço de arrumação/arrecadação'],
        ];

        foreach ($tipos as $t) {
            TipoFraccao::updateOrCreate(
                ['empresa_gestora_id' => $empresaId, 'codigo' => $t['codigo']],
                array_merge($t, ['empresa_gestora_id' => $empresaId])
            );
        }
    }
}
