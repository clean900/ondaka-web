<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Feature\Models\Feature;
use Illuminate\Database\Seeder;

/**
 * Add-ons do lote da Portaria (em_breve até validados/vendáveis).
 */
class FeaturePortariaLoteSeeder extends Seeder
{
    public function run(): void
    {
        $features = [
            [
                'slug' => 'livro_ocorrencias',
                'nome' => 'Livro de Ocorrências + Passagem de Turno',
                'descricao' => 'O guarda regista ocorrências do turno (texto, foto, hora, GPS) e faz a passagem de turno ao seguinte. Gestão acompanha tudo na web.',
                'icone' => 'ClipboardList',
                'categoria' => 'seguranca',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'preco_base' => 4000,
                'ordem_listagem' => 46,
            ],
            [
                'slug' => 'registo_viaturas',
                'nome' => 'Registo de Viaturas (matrícula)',
                'descricao' => 'Regista a matrícula do visitante na entrada e confere na saída. Controlo simples de viaturas na portaria.',
                'icone' => 'Car',
                'categoria' => 'seguranca',
                'comprador' => 'condominio',
                'modelo_cobranca' => 'subscription',
                'preco_base' => 3000,
                'ordem_listagem' => 47,
            ],
            [
                'slug' => 'dashboard_portaria',
                'nome' => 'Dashboard de Portaria',
                'descricao' => 'Estatísticas da portaria (fluxo por hora/dia, permanência média, fracções mais visitadas) e alerta de visitantes que entraram e ainda não saíram.',
                'icone' => 'BarChart3',
                'categoria' => 'seguranca',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'preco_base' => 5000,
                'ordem_listagem' => 48,
            ],
            [
                'slug' => 'foto_conferencia',
                'nome' => 'Foto + conferência do visitante na saída',
                'descricao' => 'Foto do visitante na entrada, mostrada na saída para confirmar que quem sai é quem entrou.',
                'icone' => 'Camera',
                'categoria' => 'seguranca',
                'comprador' => 'condominio',
                'modelo_cobranca' => 'subscription',
                'preco_base' => 4000,
                'ordem_listagem' => 49,
            ],
        ];

        foreach ($features as $f) {
            Feature::updateOrCreate(
                ['slug' => $f['slug']],
                array_merge($f, ['activa' => true, 'em_breve' => true]),
            );
        }
    }
}
