<?php

declare(strict_types=1);

use App\Domains\Feature\Models\Feature;
use Illuminate\Database\Migrations\Migration;

/**
 * Regista no catálogo (loja) os 3 add-ons recém-construídos, com comercial_json
 * (modal comercial rico) — ficam com cadeado como os restantes add-ons.
 */
return new class extends Migration
{
    public function up(): void
    {
        foreach ($this->addons() as $a) {
            Feature::updateOrCreate(
                ['slug' => $a['slug']],
                [
                    'nome' => $a['nome'],
                    'descricao' => $a['descricao'],
                    'icone' => $a['icone'],
                    'categoria' => $a['categoria'],
                    'comprador' => 'ambos',
                    'modelo_cobranca' => 'subscription',
                    'preco_base' => $a['preco'],
                    'duracao_dias' => 30,
                    'activa' => true,
                    'em_breve' => false,
                    'comercial_json' => json_encode($a['comercial'], JSON_UNESCAPED_UNICODE),
                ],
            );
        }
    }

    public function down(): void
    {
        Feature::whereIn('slug', ['lista_negra_visitantes', 'manutencao_preventiva', 'importacao_massiva'])
            ->update(['comercial_json' => null, 'activa' => false]);
    }

    private function addons(): array
    {
        return [
            [
                'slug' => 'lista_negra_visitantes',
                'nome' => 'Lista Negra de Visitantes',
                'descricao' => 'Banir visitantes por BI, matrícula ou nome. A portaria recebe um alerta na hora.',
                'icone' => 'ban', 'categoria' => 'seguranca', 'preco' => 8000,
                'comercial' => [
                    'tagline' => 'Quem não pode entrar, a portaria sabe na hora.',
                    'problema' => 'Visitantes problemáticos — quem agrediu um guarda, quem furtou, ex-companheiros com restrição — voltam a tentar entrar, e o guarda nem sempre se lembra. A informação fica na cabeça das pessoas, não no sistema.',
                    'solucao' => 'Crie uma lista negra por BI, matrícula ou nome. Quando o visitante chega à portaria, o guarda recebe um alerta vermelho com o motivo — e decide com informação. Opcionalmente partilhada entre todos os condomínios da empresa.',
                    'beneficios' => [
                        ['icone' => 'ban', 'titulo' => 'Banir por BI, matrícula ou nome', 'descricao' => 'Três formas de identificar — qualquer correspondência alerta o guarda.'],
                        ['icone' => 'shield-check', 'titulo' => 'Alerta na portaria', 'descricao' => 'Banner vermelho com o motivo, na validação da entrada.'],
                        ['icone' => 'layers', 'titulo' => 'Partilha entre condomínios', 'descricao' => 'Opcional: o banimento vale para todos os condomínios da empresa.'],
                        ['icone' => 'check-circle', 'titulo' => 'Decisão do guarda', 'descricao' => 'Não bloqueia automaticamente — avisa, e o guarda decide (mais seguro).'],
                    ],
                    'demo_passos' => [
                        ['icone' => 'ban', 'label_curto' => 'Banir', 'label_longo' => 'Adicione o BI/matrícula/nome + motivo'],
                        ['icone' => 'shield-check', 'label_curto' => 'Alerta', 'label_longo' => 'A portaria é avisada ao validar a entrada'],
                        ['icone' => 'check-circle', 'label_curto' => 'Decidir', 'label_longo' => 'O guarda decide com a informação à frente'],
                    ],
                    'faq' => [
                        ['pergunta' => 'Bloqueia a entrada automaticamente?', 'resposta' => 'Não. Mostra um alerta ao guarda, que decide — evita bloqueios indevidos e é mais defensável legalmente.'],
                        ['pergunta' => 'Posso usar para vários condomínios?', 'resposta' => 'Sim. Cada entrada pode ser só do condomínio ou partilhada com toda a empresa gestora.'],
                    ],
                ],
            ],
            [
                'slug' => 'manutencao_preventiva',
                'nome' => 'Manutenção Preventiva',
                'descricao' => 'Elevadores, AVAC, geradores, bombas — calendário, alertas 30/15/7 dias e histórico por equipamento.',
                'icone' => 'wrench', 'categoria' => 'gestao', 'preco' => 12000,
                'comercial' => [
                    'tagline' => 'Nenhuma manutenção esquecida — o sistema avisa antes.',
                    'problema' => 'Elevadores, geradores e bombas precisam de manutenção regular. Quando se esquece, falham na pior altura — e a responsabilidade é da gestão. Controlar isto em folhas de Excel não escala.',
                    'solucao' => 'Registe os equipamentos e os seus planos de manutenção. O sistema mostra as próximas datas num calendário e avisa os gestores a 30, 15 e 7 dias. Cada intervenção fica no histórico com relatório anexo.',
                    'beneficios' => [
                        ['icone' => 'wrench', 'titulo' => 'Por equipamento', 'descricao' => 'Elevador, AVAC, gerador, bomba, incêndio… cada um com o seu plano.'],
                        ['icone' => 'clock', 'titulo' => 'Alertas 30/15/7 dias', 'descricao' => 'Notificação automática aos gestores antes de cada manutenção.'],
                        ['icone' => 'check-circle', 'titulo' => 'Avança sozinho', 'descricao' => 'Ao registar uma intervenção, a próxima data calcula-se automaticamente.'],
                        ['icone' => 'package', 'titulo' => 'Histórico + relatórios', 'descricao' => 'Cada intervenção guarda data, custo e relatório técnico em anexo.'],
                    ],
                    'demo_passos' => [
                        ['icone' => 'wrench', 'label_curto' => 'Equipar', 'label_longo' => 'Adicione equipamentos e planos'],
                        ['icone' => 'clock', 'label_curto' => 'Avisar', 'label_longo' => 'O sistema alerta 30/15/7 dias antes'],
                        ['icone' => 'check-circle', 'label_curto' => 'Registar', 'label_longo' => 'Regista a intervenção e a data avança'],
                    ],
                    'faq' => [
                        ['pergunta' => 'Os alertas vão para quem?', 'resposta' => 'Para os gestores/administradores da empresa, por notificação push, a 30, 15 e 7 dias da próxima manutenção.'],
                        ['pergunta' => 'Posso anexar o relatório do técnico?', 'resposta' => 'Sim, cada intervenção aceita um PDF ou foto do relatório técnico.'],
                    ],
                ],
            ],
            [
                'slug' => 'importacao_massiva',
                'nome' => 'Importação Massiva',
                'descricao' => 'Importar condóminos via CSV com validação inteligente e preview antes de gravar.',
                'icone' => 'upload', 'categoria' => 'gestao', 'preco' => 5000,
                'comercial' => [
                    'tagline' => 'Centenas de condóminos no sistema em minutos.',
                    'problema' => 'Pôr um condomínio novo a funcionar significa inserir dezenas ou centenas de condóminos à mão — horas de trabalho e erros de digitação que depois se pagam caro.',
                    'solucao' => 'Carregue um ficheiro CSV (exportado de Excel), reveja um preview que valida cada linha (nome obrigatório, email válido) e importe só as linhas correctas — tudo numa transação, sem deixar dados a meio.',
                    'beneficios' => [
                        ['icone' => 'upload', 'titulo' => 'CSV de Excel', 'descricao' => 'Exporte a sua folha para CSV e carregue — sem formato proprietário.'],
                        ['icone' => 'check-circle', 'titulo' => 'Preview + validação', 'descricao' => 'Vê cada linha antes de gravar; as inválidas ficam marcadas a vermelho.'],
                        ['icone' => 'shield-check', 'titulo' => 'Tudo-ou-nada', 'descricao' => 'Importação em transação — se algo falha, nada fica a meio.'],
                        ['icone' => 'zap', 'titulo' => 'Minutos, não horas', 'descricao' => 'Onboarding de um condomínio inteiro numa fracção do tempo.'],
                    ],
                    'demo_passos' => [
                        ['icone' => 'upload', 'label_curto' => 'Carregar', 'label_longo' => 'Suba o CSV de condóminos'],
                        ['icone' => 'check-circle', 'label_curto' => 'Rever', 'label_longo' => 'Veja o preview com a validação'],
                        ['icone' => 'zap', 'label_curto' => 'Importar', 'label_longo' => 'Só as linhas válidas entram'],
                    ],
                    'faq' => [
                        ['pergunta' => 'Que colunas preciso?', 'resposta' => 'nome (obrigatório), bi, nif, telefone e email. Há um modelo CSV para descarregar na página.'],
                        ['pergunta' => 'E se houver linhas com erro?', 'resposta' => 'São marcadas no preview e ignoradas na importação — as válidas entram à mesma.'],
                    ],
                ],
            ],
        ];
    }
};
