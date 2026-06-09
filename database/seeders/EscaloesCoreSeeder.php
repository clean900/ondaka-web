<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Subscription\Models\EscalaoCore;
use Illuminate\Database\Seeder;

class EscaloesCoreSeeder extends Seeder
{
    public function run(): void
    {
        $escaloes = [
            [
                'slug' => 'starter',
                'nome' => 'Starter',
                'descricao' => 'Para condomínios pequenos a começar com gestão digital',
                'min_fraccoes' => 1,
                'max_fraccoes' => 30,
                'preco_por_fraccao_mensal' => 1850.00,
                'desconto_anual_pct' => 10.00,
                'cor_badge' => 'c-teal',
                'ordem' => 1,
            ],
            [
                'slug' => 'standard',
                'nome' => 'Standard',
                'descricao' => 'Condomínios médios em Luanda e principais cidades',
                'min_fraccoes' => 31,
                'max_fraccoes' => 80,
                'preco_por_fraccao_mensal' => 1500.00,
                'desconto_anual_pct' => 12.00,
                'cor_badge' => 'c-blue',
                'ordem' => 2,
            ],
            [
                'slug' => 'plus',
                'nome' => 'Plus',
                'descricao' => 'Prédios grandes e condomínios estabelecidos',
                'min_fraccoes' => 81,
                'max_fraccoes' => 200,
                'preco_por_fraccao_mensal' => 1200.00,
                'desconto_anual_pct' => 13.00,
                'cor_badge' => 'c-purple',
                'ordem' => 3,
            ],
            [
                'slug' => 'large',
                'nome' => 'Large',
                'descricao' => 'Mega-condomínios e urbanizações em expansão',
                'min_fraccoes' => 201,
                'max_fraccoes' => 500,
                'preco_por_fraccao_mensal' => 900.00,
                'desconto_anual_pct' => 14.00,
                'cor_badge' => 'c-amber',
                'ordem' => 4,
            ],
            [
                'slug' => 'enterprise',
                'nome' => 'Enterprise',
                'descricao' => 'Grandes urbanizações (ex: Boa Vida, Kilamba). Preço negociável.',
                'min_fraccoes' => 501,
                'max_fraccoes' => null,
                'preco_por_fraccao_mensal' => 600.00,
                'desconto_anual_pct' => 15.00,
                'cor_badge' => 'c-pink',
                'ordem' => 5,
            ],
        ];

        foreach ($escaloes as $escalao) {
            EscalaoCore::updateOrCreate(
                ['slug' => $escalao['slug']],
                array_merge($escalao, ['activo' => true])
            );
        }

        $this->command->info('✓ 5 escalões de core inseridos.');
    }
}
