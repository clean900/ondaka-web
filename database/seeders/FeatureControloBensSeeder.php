<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Feature\Models\Feature;
use Illuminate\Database\Seeder;

/**
 * Add-on "Controlo de Bens" — registo de itens à entrada/saída de visitantes.
 *
 * Fica em_breve=true até a UI mobile (registar itens + reconciliação) estar pronta.
 */
class FeatureControloBensSeeder extends Seeder
{
    public function run(): void
    {
        Feature::updateOrCreate(
            ['slug' => 'controlo_bens'],
            [
                'nome' => 'Controlo de Bens (entrada/saída)',
                'descricao' => 'Regista os itens que um visitante traz na entrada (descrição, foto, nº de série) e só permite a saída dos itens registados. A portaria reconcilia cada item na saída (saiu/ficou).',
                'icone' => 'PackageCheck',
                'categoria' => 'seguranca',
                'comprador' => 'ambos',
                'modelo_cobranca' => 'subscription',
                'unidade' => null,
                'preco_base' => 4000,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 45,
            ],
        );
    }
}
