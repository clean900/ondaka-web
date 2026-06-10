<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Feature\Models\Feature;
use App\Domains\Feature\Models\FeaturePacote;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeaturesCatalogoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $this->criarFeatures();
            $this->criarPacotes();
        });

        $this->command->info('✓ Catálogo de features populado.');
        $this->command->line('  - ' . Feature::count() . ' features');
        $this->command->line('  - ' . FeaturePacote::count() . ' pacotes');
    }

    private function criarFeatures(): void
    {
        $features = [
            // =============================================
            // COMUNICAÇÃO
            // =============================================
            [
                'slug' => 'sms_sender_id',
                'nome' => 'Sender ID personalizado (SMS)',
                'descricao' => 'SMS enviados com nome da empresa/condomínio (ex: "TALATONA", "BOAVIDA") em vez de "ONDAKA". Mais reconhecimento e confiança dos condóminos.',
                'icone' => 'MessageSquare',
                'categoria' => 'comunicacao',
                'comprador' => 'ambos',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'SMS',
                'preco_base' => null, // depende do pacote
                'preco_activacao' => 5000.00,
                'configuracao_schema' => [
                    'sender_name' => [
                        'tipo' => 'string',
                        'max' => 11,
                        'obrigatorio' => true,
                        'label' => 'Nome do remetente (máx 11 caracteres)',
                    ],
                ],
                'activa' => true,
                'em_breve' => false,
                'requer_aprovacao_manual' => true,
                'ordem_listagem' => 10,
            ],
            [
                'slug' => 'sms_pack_extra',
                'nome' => 'Pacote extra SMS (ONDAKA)',
                'descricao' => 'SMS adicionais com remetente padrão "ONDAKA" para condomínios que excedam o pacote grátis mensal (50 SMS/mês incluídos no core).',
                'icone' => 'Send',
                'categoria' => 'comunicacao',
                'comprador' => 'ambos',
                'modelo_cobranca' => 'consumable',
                'unidade' => 'SMS',
                'preco_base' => null,
                'activa' => true,
                'em_breve' => false,
                'ordem_listagem' => 20,
            ],
            [
                'slug' => 'whatsapp_business',
                'nome' => 'WhatsApp Business API',
                'descricao' => 'Notificações via WhatsApp Business (mais barato e eficaz que SMS em Angola). Requer conta WhatsApp Business verificada pela Meta.',
                'icone' => 'Phone',
                'categoria' => 'comunicacao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'consumable',
                'unidade' => 'mensagem',
                'preco_base' => null,
                'activa' => true,
                'em_breve' => true,
                'requer_aprovacao_manual' => true,
                'ordem_listagem' => 30,
            ],
            [
                'slug' => 'assembleia_virtual',
                'nome' => 'Assembleia virtual',
                'descricao' => 'Videochamada integrada (Jitsi) + convocatória digital + votação em tempo real + acta automática com assinaturas dos presentes.',
                'icone' => 'Video',
                'categoria' => 'comunicacao',
                'comprador' => 'condominio',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'assembleia',
                'preco_base' => 6000.00,
                'activa' => true,
                'em_breve' => false,
                'ordem_listagem' => 40,
            ],

            // =============================================
            // PAGAMENTOS
            // =============================================
            [
                'slug' => 'proxypay_rps',
                'nome' => 'ProxyPay Referências Multicaixa (RPS)',
                'descricao' => 'Cada factura gera referência Multicaixa automática. Condóminos pagam em ATM, balcão ou banca online. Confirmação via webhook.',
                'icone' => 'Receipt',
                'categoria' => 'pagamentos',
                'comprador' => 'condominio',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'transacção',
                'preco_base' => null,
                'preco_activacao' => 20000.00,
                'activa' => true,
                'em_breve' => true,
                'requer_aprovacao_manual' => true,
                'ordem_listagem' => 50,
            ],
            [
                'slug' => 'proxypay_dds',
                'nome' => 'ProxyPay Débito Directo (DDS)',
                'descricao' => 'Débito automático mensal na conta do condómino. Reduz drasticamente inadimplência. Requer mandato assinado pelo condómino.',
                'icone' => 'RefreshCw',
                'categoria' => 'pagamentos',
                'comprador' => 'condominio',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'débito',
                'preco_base' => null,
                'activa' => true,
                'em_breve' => true,
                'requer_aprovacao_manual' => true,
                'ordem_listagem' => 60,
            ],
            [
                'slug' => 'multicaixa_express',
                'nome' => 'Multicaixa Express (pagamento na app)',
                'descricao' => 'Condómino paga factura directamente dentro da app ONDAKA via Multicaixa Express. Experiência moderna de banca móvel.',
                'icone' => 'Smartphone',
                'categoria' => 'pagamentos',
                'comprador' => 'condominio',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'transacção',
                'preco_base' => null,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 70,
            ],

            // =============================================
            // SEGURANÇA
            // =============================================
            [
                'slug' => 'anpr_hikvision',
                'nome' => 'ANPR Hikvision (leitura de matrículas)',
                'descricao' => 'Integração com câmaras Hikvision. Residentes entram sem parar, visitas registadas automaticamente, abertura de cancela via relay.',
                'icone' => 'Camera',
                'categoria' => 'seguranca',
                'comprador' => 'condominio',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'entrada',
                'preco_base' => 10000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 10000.00,
                'activa' => true,
                'em_breve' => true,
                'requer_hardware' => true,
                'requer_aprovacao_manual' => true,
                'ordem_listagem' => 80,
            ],
            [
                'slug' => 'zkteco',
                'nome' => 'ZKTeco (controlo de acessos)',
                'descricao' => 'Sync com leitores biométricos ZKBio CVAccess. Horários, cartões, impressão digital, face.',
                'icone' => 'Fingerprint',
                'categoria' => 'seguranca',
                'comprador' => 'condominio',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'dispositivo',
                'preco_base' => 8000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 10000.00,
                'activa' => true,
                'em_breve' => true,
                'requer_hardware' => true,
                'requer_aprovacao_manual' => true,
                'ordem_listagem' => 90,
            ],
            [
                'slug' => 'passe_visitante_branding',
                'nome' => 'Passe visitante com branding',
                'descricao' => 'PDF do passe de visitante com logotipo, morada e cores do condomínio. QR code impresso para validação na entrada.',
                'icone' => 'UserCheck',
                'categoria' => 'seguranca',
                'comprador' => 'condominio',
                'modelo_cobranca' => 'subscription',
                'preco_base' => 3000.00,
                'duracao_dias' => 30,
                'configuracao_schema' => [
                    'cor_primaria' => ['tipo' => 'color', 'label' => 'Cor primária'],
                    'cor_secundaria' => ['tipo' => 'color', 'label' => 'Cor secundária'],
                ],
                'activa' => true,
                'em_breve' => false,
                'ordem_listagem' => 100,
            ],

            // =============================================
            // GESTÃO AVANÇADA
            // =============================================
            [
                'slug' => 'ocr_contadores',
                'nome' => 'OCR leitura de contadores',
                'descricao' => 'Condómino fotografa contador de água/luz pela app. Sistema extrai valor automaticamente e entra na factura. Google ML Kit.',
                'icone' => 'Scan',
                'categoria' => 'gestao',
                'comprador' => 'condominio',
                'modelo_cobranca' => 'consumable',
                'unidade' => 'leitura',
                'preco_base' => null,
                'activa' => true,
                'em_breve' => false,
                'ordem_listagem' => 110,
            ],
            [
                'slug' => 'chatbot_faq',
                'nome' => 'Chatbot FAQ inteligente',
                'descricao' => 'Bot 24h responde perguntas dos condóminos: saldo, próxima assembleia, como pré-autorizar visita. Encaminha para admin se não souber.',
                'icone' => 'Bot',
                'categoria' => 'gestao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'preco_base' => 8000.00,
                'duracao_dias' => 30,
                'activa' => true,
                'em_breve' => false,
                'ordem_listagem' => 120,
            ],
            [
                'slug' => 'marketplace',
                'nome' => 'Marketplace condominial',
                'descricao' => 'Compra, venda e serviços entre vizinhos (Vendo/Procuro/Serviços) com chat integrado e moderação.',
                'icone' => 'ShoppingBag',
                'categoria' => 'gestao',
                'comprador' => 'condominio',
                'modelo_cobranca' => 'subscription',
                'preco_base' => 4000.00,
                'duracao_dias' => 30,
                'activa' => true,
                'em_breve' => false,
                'ordem_listagem' => 130,
            ],

            // =============================================
            // PERSONALIZAÇÃO
            // =============================================
            [
                'slug' => 'white_label',
                'nome' => 'White Label (logo próprio)',
                'descricao' => 'Substitui logo ONDAKA pelo da empresa gestora em toda a plataforma web e na app mobile.',
                'icone' => 'Palette',
                'categoria' => 'personalizacao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'preco_base' => 10000.00,
                'duracao_dias' => 30,
                'configuracao_schema' => [
                    'logo_url' => ['tipo' => 'file', 'label' => 'Logotipo (PNG, transparente)'],
                    'cor_primaria' => ['tipo' => 'color', 'label' => 'Cor primária'],
                ],
                'activa' => true,
                'em_breve' => false,
                'requer_aprovacao_manual' => true,
                'ordem_listagem' => 140,
            ],
            [
                'slug' => 'dominio_personalizado',
                'nome' => 'Domínio personalizado',
                'descricao' => 'Aceder via app.meucondominio.ao em vez de ondaka.ao. Apps móveis com certificado próprio.',
                'icone' => 'Globe',
                'categoria' => 'personalizacao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'preco_base' => 5000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 10000.00,
                'configuracao_schema' => [
                    'dominio' => ['tipo' => 'string', 'label' => 'Domínio (ex: app.meucondominio.ao)'],
                ],
                'activa' => true,
                'em_breve' => false,
                'requer_aprovacao_manual' => true,
                'ordem_listagem' => 150,
            ],
            [
                'slug' => 'dashboard_bi',
                'nome' => 'Dashboard BI avançado',
                'descricao' => 'KPIs cross-condomínio, comparativos, previsões, exportação automática semanal em Excel/PDF.',
                'icone' => 'BarChart3',
                'categoria' => 'personalizacao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'preco_base' => 10000.00,
                'duracao_dias' => 30,
                'activa' => true,
                'em_breve' => false,
                'ordem_listagem' => 160,
            ],
        ];

        foreach ($features as $dados) {
            Feature::updateOrCreate(
                ['slug' => $dados['slug']],
                $dados,
            );
        }
    }

    private function criarPacotes(): void
    {
        // Pacotes SMS Sender ID — 18 Kz/SMS
        $this->criarPacotesFeature('sms_sender_id', [
            ['nome' => 'Pequeno', 'slug' => 'pequeno', 'preco' => 5000, 'quantidade' => 277, 'ordem' => 1],
            ['nome' => 'Médio', 'slug' => 'medio', 'preco' => 7500, 'quantidade' => 416, 'ordem' => 2, 'destaque' => true],
            ['nome' => 'Grande', 'slug' => 'grande', 'preco' => 10000, 'quantidade' => 555, 'ordem' => 3],
        ]);

        // Pacotes SMS extra ONDAKA — 16 Kz/SMS (margem menor, remetente padrão)
        $this->criarPacotesFeature('sms_pack_extra', [
            ['nome' => 'Pequeno', 'slug' => 'pequeno', 'preco' => 5000, 'quantidade' => 312, 'ordem' => 1],
            ['nome' => 'Médio', 'slug' => 'medio', 'preco' => 7500, 'quantidade' => 468, 'ordem' => 2, 'destaque' => true],
            ['nome' => 'Grande', 'slug' => 'grande', 'preco' => 10000, 'quantidade' => 625, 'ordem' => 3],
        ]);

        // OCR contadores — 5000 Kz por 200 leituras (25 Kz/leitura)
        $this->criarPacotesFeature('ocr_contadores', [
            ['nome' => 'Básico', 'slug' => 'basico', 'preco' => 5000, 'quantidade' => 200, 'ordem' => 1],
            ['nome' => 'Profissional', 'slug' => 'profissional', 'preco' => 10000, 'quantidade' => 450, 'ordem' => 2, 'destaque' => true, 'descricao' => 'Poupa 10% vs básico'],
        ]);

        // Assembleia virtual — pacote único 6000 Kz por 1 assembleia
        $this->criarPacotesFeature('assembleia_virtual', [
            ['nome' => '1 Assembleia', 'slug' => 'unica', 'preco' => 6000, 'quantidade' => 1, 'ordem' => 1],
            ['nome' => 'Pack 5 assembleias', 'slug' => 'pack_5', 'preco' => 27000, 'quantidade' => 5, 'ordem' => 2, 'destaque' => true, 'descricao' => 'Poupa 10% vs avulso'],
        ]);
    }

    private function criarPacotesFeature(string $featureSlug, array $pacotes): void
    {
        $feature = Feature::where('slug', $featureSlug)->first();
        if (! $feature) {
            return;
        }

        foreach ($pacotes as $p) {
            $valorUnit = round($p['preco'] / max($p['quantidade'], 1), 4);
            FeaturePacote::updateOrCreate(
                ['feature_id' => $feature->id, 'slug' => $p['slug']],
                [
                    'nome' => $p['nome'],
                    'quantidade' => $p['quantidade'],
                    'preco' => $p['preco'],
                    'valor_unitario' => $valorUnit,
                    'destaque' => $p['destaque'] ?? false,
                    'descricao' => $p['descricao'] ?? null,
                    'ordem' => $p['ordem'],
                    'activo' => true,
                ],
            );
        }
    }
}
