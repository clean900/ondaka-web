<?php

use App\Domains\Feature\Models\Feature;
use App\Domains\Feature\Models\FeaturePacote;
use Illuminate\Database\Migrations\Migration;

/**
 * SMS: 3 vertentes.
 *  - sms_basico (NOVO): serviço SMS base, 5.000 = 200 SMS/mês (remetente ONDAKA).
 *  - sms_sender_id: branding (já existe).
 *  - sms_pack_extra: top-up por unidade a 25 AOA/SMS.
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. SMS Básica (novo) — 5.000 = 200 SMS/mês
        $basica = Feature::updateOrCreate(['slug' => 'sms_basico'], [
            'nome' => 'Serviço SMS (ONDAKA)',
            'descricao' => 'Activação do serviço de SMS com remetente "ONDAKA". Inclui 200 SMS por mês.',
            'icone' => 'MessageSquare',
            'categoria' => 'comunicacao',
            'comprador' => 'ambos',
            'modelo_cobranca' => 'consumable',
            'unidade' => 'SMS',
            'preco_base' => 25,
            'activa' => true,
            'em_breve' => false,
            'ordem_listagem' => 19,
        ]);

        FeaturePacote::updateOrCreate(
            ['feature_id' => $basica->id, 'slug' => 'mensal'],
            [
                'nome' => 'Mensal',
                'quantidade' => 200,
                'preco' => 5000,
                'valor_unitario' => 25,
                'destaque' => true,
                'descricao' => '200 SMS por mês',
                'ordem' => 1,
                'activo' => true,
            ],
        );

        // 2. SMS Pack Extra — 25 AOA/SMS, por unidade
        $extra = Feature::where('slug', 'sms_pack_extra')->first();
        if ($extra) {
            $extra->update([
                'descricao' => 'SMS adicionais (remetente "ONDAKA") para quando o pacote mensal de 200 termina. 25 AOA por SMS — escolha a quantidade.',
                'preco_base' => 25,
            ]);

            // Repreçar os pacotes para 25/SMS (presets), além da compra por quantidade.
            foreach ([
                ['slug' => 'pequeno', 'nome' => '100 SMS', 'quantidade' => 100, 'preco' => 2500, 'ordem' => 1],
                ['slug' => 'medio', 'nome' => '200 SMS', 'quantidade' => 200, 'preco' => 5000, 'ordem' => 2, 'destaque' => true],
                ['slug' => 'grande', 'nome' => '500 SMS', 'quantidade' => 500, 'preco' => 12500, 'ordem' => 3],
            ] as $p) {
                FeaturePacote::updateOrCreate(
                    ['feature_id' => $extra->id, 'slug' => $p['slug']],
                    [
                        'nome' => $p['nome'],
                        'quantidade' => $p['quantidade'],
                        'preco' => $p['preco'],
                        'valor_unitario' => 25,
                        'destaque' => $p['destaque'] ?? false,
                        'ordem' => $p['ordem'],
                        'activo' => true,
                    ],
                );
            }
        }
    }

    public function down(): void
    {
        Feature::where('slug', 'sms_basico')->update(['activa' => false]);
    }
};
