<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Feature\Models\Feature;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * FeaturesLojaFinalSeeder
 *
 * Adiciona os 21 add-ons novos da Loja FINAL ao catálogo.
 * Complementa o FeaturesCatalogoSeeder original (16 features).
 * Após este seeder: total ~37 features (16 originais + 21 novas), das quais
 * 2 desactivadas (whatsapp_business + marketplace) → 35 visíveis na Loja.
 *
 * Categorias BD usadas: comunicacao, pagamentos, seguranca, gestao,
 * personalizacao, outros (6 enum existentes).
 *
 * Preços: 2.000 - 10.000 Kz/mês (excepto hardware ZKTeco/Hikvision já no original).
 *
 * Para correr:
 *   php artisan db:seed --class=FeaturesLojaFinalSeeder
 */
class FeaturesLojaFinalSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $this->criarAddonsLojaFinal();
            $this->desactivarFeaturesDuplicadas();
        });

        $total = Feature::count();
        $activas = Feature::where('activa', true)->count();
        $this->command->info('✓ FeaturesLojaFinalSeeder aplicado.');
        $this->command->line("  - Total features: {$total}");
        $this->command->line("  - Activas: {$activas}");
    }

    /**
     * Cria os 21 add-ons novos da Loja FINAL.
     * Usa updateOrCreate por slug — idempotente, pode ser corrido várias vezes.
     */
    private function criarAddonsLojaFinal(): void
    {
        $addons = [
            // =============================================
            // PAGAMENTOS / FACTURAÇÃO
            // =============================================
            [
                'slug' => 'pagar_tudo_multicaixa',
                'nome' => 'Pagar Tudo Multicaixa',
                'descricao' => 'Botão único para liquidar todas as taxas em aberto numa só transacção ProxyPay. Cálculo automático de saldo, multas e juros.',
                'icone' => 'CreditCard',
                'categoria' => 'pagamentos',
                'comprador' => 'condominio',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 3000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 100,
            ],
            [
                'slug' => 'cobranca_judicial',
                'nome' => 'Cobrança Judicial Automática',
                'descricao' => 'Geração automática de documentação para acção judicial contra morosos (>90 dias). Templates legais DP 141/15, certidão de dívida, audit trail para tribunal.',
                'icone' => 'Gavel',
                'categoria' => 'pagamentos',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 6000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 50000.00,
                'activa' => true,
                'em_breve' => true,
                'requer_aprovacao_manual' => true,
                'ordem_listagem' => 110,
            ],
            [
                'slug' => 'sistema_creditos',
                'nome' => 'Sistema de Créditos / Saldo da Fracção',
                'descricao' => 'Saldo positivo do imóvel utilizável em pagamentos futuros automaticamente. Aplicação em pagamentos pendentes + histórico transparente para o condómino.',
                'icone' => 'Wallet',
                'categoria' => 'pagamentos',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 4000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 120,
            ],

            // =============================================
            // GESTÃO (Estrutural + Operação + Relatórios + Compliance)
            // =============================================
            [
                'slug' => 'importacao_massiva',
                'nome' => 'Importação Massiva Avançada',
                'descricao' => 'Importar condóminos, imóveis, edifícios e histórico de pagamentos via Excel/CSV com validação inteligente, mapeamento de colunas e preview antes de gravar.',
                'icone' => 'Upload',
                'categoria' => 'gestao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 3000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 15000.00,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 200,
            ],
            [
                'slug' => 'modulo_rh',
                'nome' => 'Módulo de RH Completo',
                'descricao' => 'Cadastro de funcionários (BI, foto, função) + Turnos & Escala + Registo de presença + Faltas/atrasos + Cálculo INSS + IRT + subsídios + Recibo de vencimento PDF + Mapa pessoal. Piquete activo continua gratuito no core (depende deste módulo).',
                'icone' => 'Users',
                'categoria' => 'gestao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 7000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 210,
            ],
            [
                'slug' => 'gestao_documentos',
                'nome' => 'Gestão de Documentos',
                'descricao' => 'Repositório centralizado de documentos do condomínio (regulamento, plantas, contratos, seguros) com versionamento, permissões por role e pesquisa full-text PDF.',
                'icone' => 'FolderArchive',
                'categoria' => 'gestao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 5000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 220,
            ],
            [
                'slug' => 'manutencao_preventiva',
                'nome' => 'Manutenção Preventiva Calendário',
                'descricao' => 'Calendário de manutenções recorrentes (elevadores, AVAC, gerador, bombas) com alertas automáticos 30/15/7 dias antes e histórico de intervenções por equipamento.',
                'icone' => 'Wrench',
                'categoria' => 'gestao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 2000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 15000.00,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 230,
            ],
            [
                'slug' => 'reservas_areas_comuns',
                'nome' => 'Reservas Áreas Comuns (Avançado)',
                'descricao' => 'Calendário visual para reservar áreas comuns (piscina, salão, churrasqueira) com regras complexas, conflitos automáticos, taxa por reserva, aprovação por gestor e estatísticas de uso.',
                'icone' => 'Calendar',
                'categoria' => 'gestao',
                'comprador' => 'ambos',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 5000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 240,
            ],
            [
                'slug' => 'checklist_inspeccao',
                'nome' => 'Checklist Diária de Inspecção',
                'descricao' => 'Guarda ou funcionário preenche checklist diária no mobile: estado das áreas comuns, equipamentos, ronda nocturna. Foto + assinatura + GPS por ponto. Alerta automático ao gestor.',
                'icone' => 'ClipboardCheck',
                'categoria' => 'gestao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 4000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 250,
            ],
            [
                'slug' => 'fornecedores_certificados',
                'nome' => 'Fornecedores Certificados',
                'descricao' => 'Catálogo de fornecedores avaliados (canalizador, electricista, pintor) com histórico de intervenções, avaliações 5 estrelas, contactos e preços médios.',
                'icone' => 'Briefcase',
                'categoria' => 'gestao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 3000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 260,
            ],
            [
                'slug' => 'anomaly_detection',
                'nome' => 'Anomaly Detection ML',
                'descricao' => 'Machine Learning detecta padrões anómalos: condóminos com mudança de comportamento de pagamento, picos de despesas, gastos inesperados. Alerta proactivo ao gestor.',
                'icone' => 'AlertTriangle',
                'categoria' => 'gestao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 8000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 270,
            ],
            [
                'slug' => 'relatorios_personalizados',
                'nome' => 'Relatórios Personalizados',
                'descricao' => 'Construtor visual de relatórios próprios. Drag-and-drop de campos, filtros customizados, agendamento de envio por email. Sem necessidade de SQL.',
                'icone' => 'FileBarChart',
                'categoria' => 'gestao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 6000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 280,
            ],
            [
                'slug' => 'livro_reclamacoes',
                'nome' => 'Livro de Reclamações Electrónico',
                'descricao' => 'Reclamações digitais conforme regulamento angolano. Condómino reclama via mobile, gestor responde em prazo legal (15 dias), export PDF para autoridades.',
                'icone' => 'BookOpen',
                'categoria' => 'gestao',
                'comprador' => 'ambos',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 5000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 290,
            ],
            [
                'slug' => 'rgpd_avancado',
                'nome' => 'RGPD & Privacidade Avançada',
                'descricao' => 'Conformidade total RGPD/Lei de Protecção de Dados Angola: consentimentos granulares, export de dados pessoais 1-click, direito a ser esquecido automatizado, política privacidade auto-gerada.',
                'icone' => 'Shield',
                'categoria' => 'gestao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 7000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 20000.00,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 300,
            ],
            [
                'slug' => 'audit_log_centralizado',
                'nome' => 'Audit Log Centralizado',
                'descricao' => 'Registo imutável de todas as acções críticas: pagamentos, alterações de quotas, deletes, login as. User + IP + timestamp. Filtros avançados + export CSV para auditor + retenção configurável.',
                'icone' => 'ScrollText',
                'categoria' => 'gestao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 6000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 310,
            ],
            [
                'slug' => 'historico_alteracoes',
                'nome' => 'Histórico de Alterações (Audit Básico)',
                'descricao' => 'Histórico 12 meses de alterações (vs 30 dias do core) com filtros expandidos por user/data/tipo e export CSV simples.',
                'icone' => 'History',
                'categoria' => 'gestao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 2000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 320,
            ],

            // =============================================
            // COMUNICAÇÃO
            // =============================================
            [
                'slug' => 'email_marketing',
                'nome' => 'Email Marketing & Newsletters',
                'descricao' => 'Newsletters segmentadas para condóminos (avisos especiais, eventos, novidades). Editor visual drag-and-drop, templates ONDAKA prontos, analytics open/click rate, agendamento de envio.',
                'icone' => 'Mail',
                'categoria' => 'comunicacao',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 7000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 400,
            ],
            [
                'slug' => 'realtime_pusher',
                'nome' => 'Realtime Pusher (Notificações Instantâneas)',
                'descricao' => 'Push instantâneo (1-3s) para eventos não-críticos: avisos, votações, dashboards em tempo real. SOS continua sempre core sem este add-on.',
                'icone' => 'Zap',
                'categoria' => 'comunicacao',
                'comprador' => 'ambos',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 4000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 410,
            ],

            // =============================================
            // SEGURANÇA
            // =============================================
            [
                'slug' => 'lista_negra_visitantes',
                'nome' => 'Lista Negra Visitantes',
                'descricao' => 'Banimento de visitantes por BI/passaporte/matrícula. Alerta visual + sonoro na portaria quando tentam entrar. Motivo + histórico de bloqueio.',
                'icone' => 'UserX',
                'categoria' => 'seguranca',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 3000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 500,
            ],
            [
                'slug' => 'encomendas_avancado',
                'nome' => 'Encomendas Avançado (Dimensões/Foto)',
                'descricao' => 'Registo de encomendas com foto da embalagem, dimensões, peso aproximado, prazo de levantamento e alerta automático ao condómino com prazo limite.',
                'icone' => 'Package',
                'categoria' => 'seguranca',
                'comprador' => 'condominio',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 4000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 0,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 510,
            ],

            // =============================================
            // OUTROS (Integrações)
            // =============================================
            [
                'slug' => 'integracao_contabilidade',
                'nome' => 'Integração Contabilidade (PHC/Primavera)',
                'descricao' => 'Sincronização automática com software de contabilidade comum em Angola (PHC, Primavera) ou export SAF-T. Reduz trabalho manual do contabilista.',
                'icone' => 'Briefcase',
                'categoria' => 'outros',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 10000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 60000.00,
                'activa' => true,
                'em_breve' => true,
                'requer_aprovacao_manual' => true,
                'ordem_listagem' => 600,
            ],
            [
                'slug' => 'api_publica',
                'nome' => 'API Pública (Webhooks)',
                'descricao' => 'Acesso programático aos dados via REST API + webhooks (10 eventos). Token-based auth, rate limit 1000 req/h, sandbox para testes. Útil para empresas com BI próprio ou ERPs específicos.',
                'icone' => 'Webhook',
                'categoria' => 'outros',
                'comprador' => 'empresa_gestora',
                'modelo_cobranca' => 'subscription',
                'unidade' => 'mês',
                'preco_base' => 7000.00,
                'duracao_dias' => 30,
                'preco_activacao' => 30000.00,
                'activa' => true,
                'em_breve' => true,
                'ordem_listagem' => 610,
            ],
        ];

        foreach ($addons as $data) {
            Feature::updateOrCreate(
                ['slug' => $data['slug']],
                $data,
            );
        }

        $this->command->line('  ✓ ' . count($addons) . ' add-ons da Loja FINAL criados/actualizados.');
    }

    /**
     * Desactiva features que decidimos manter como CORE gratuito (não na Loja):
     *   - whatsapp_business → infra de comunicação core
     *   - marketplace → funcionalidade core para condóminos
     *
     * Não apaga (preserva histórico de subscriptions existentes se houver).
     * Define activa=0 para não aparecer na Loja.
     */
    private function desactivarFeaturesDuplicadas(): void
    {
        $desactivar = ['whatsapp_business', 'marketplace'];

        $afectadas = Feature::whereIn('slug', $desactivar)->update([
            'activa' => false,
            'updated_at' => now(),
        ]);

        $this->command->line("  ✓ {$afectadas} features desactivadas (whatsapp_business, marketplace).");
    }
}
