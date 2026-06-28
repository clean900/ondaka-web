<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Feature\Models\Feature;
use Illuminate\Database\Seeder;

/**
 * Add-on #9 "Acesso por horário/área" — restringe uma pré-aprovação/passe a
 * horários recorrentes (dias + faixas) e mostra à portaria as áreas autorizadas.
 *
 * Fica em_breve=true até a UI (web do gestor + aviso no mobile do guarda) estar pronta.
 */
class FeatureAcessoHorarioAreaSeeder extends Seeder
{
    public function run(): void
    {
        Feature::updateOrCreate(
            ['slug' => 'acesso_horario_area'],
            [
                'nome' => 'Acesso por horário e área',
                'descricao' => 'Limita uma pré-aprovação ou passe a horários recorrentes (ex.: empregada Seg-Sex 08h-12h) e indica à portaria as áreas autorizadas (piscina, bloco B). A portaria é avisada quando alguém chega fora do horário.',
                'icone' => 'CalendarClock',
                'categoria' => 'seguranca',
                'comprador' => 'ambos',
                'modelo_cobranca' => 'subscription',
                'unidade' => null,
                'preco_base' => 3500,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 50,
            ],
        );
    }
}
