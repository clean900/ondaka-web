<?php

declare(strict_types=1);

namespace App\Support\Publico;

/**
 * Catálogo de funcionalidades do ONDAKA (página pública /catalogo).
 *
 * Veio de resources/js/pages/Catalogo/Index.tsx quando as páginas públicas
 * passaram a Blade (o texto tem de estar no HTML do servidor). Ficam aqui
 * todos os estados — pronto, curso, breve, roadmap — mas a página pública só
 * mostra o que está em produção e esconde a categoria interna SaaS B2B.
 *
 * Glossário PT-AO: Taxas de Condomínio, Pedidos, Imóvel, Quota proporcional,
 * Crédito/Acréscimo, «Serviço SMS ONDAKA» (nunca o nome do fornecedor).
 */
final class CatalogoPublico
{
    public const ESTADOS = [
        'pronto' => 'Em produção',
        'curso' => 'Em desenvolvimento',
        'breve' => 'Em breve',
        'roadmap' => 'Roadmap',
    ];

    /** Categorias e funcionalidades que a página pública mostra. */
    public static function publico(): array
    {
        $out = [];
        foreach (self::todas() as $cat) {
            if ($cat['id'] === 'saas') {
                continue;
            }
            $cat['features'] = array_values(array_filter($cat['features'], fn ($f) => $f['estado'] === 'pronto'));
            if ($cat['features'] !== []) {
                $out[] = $cat;
            }
        }

        return $out;
    }

    public static function todas(): array
    {
        return [
            [
                'id' => 'facturacao',
                'titulo' => 'Facturação do Condomínio',
                'icone' => 'dollar-sign',
                'cor' => 'blue',
                'descricao' => 'Cobrança das Taxas de Condomínio, multas e gestão financeira do condomínio',
                'features' => [
                    ['nome' => 'Geração automática das Taxas de Condomínio', 'desc' => 'Por quota proporcional ou valor fixo. Configurável por condomínio.', 'estado' => 'pronto'],
                    ['nome' => 'Multicaixa Express via ProxyPay', 'desc' => 'Pagamentos online directos. A confirmação do pagamento chega sozinha e o pagamento fica registado.', 'estado' => 'pronto'],
                    ['nome' => 'Gestão de Multas', 'desc' => 'Configuração por activação, tolerância, tipo (fixa ou %) e recorrência.', 'estado' => 'pronto'],
                    ['nome' => 'Fundo de Reserva ≥10%', 'desc' => 'Conformidade com o DP 141/15 — cálculo automático.', 'estado' => 'pronto'],
                    ['nome' => 'UCF/m² limite 6', 'desc' => 'Fórmula legal angolana aplicada automaticamente.', 'estado' => 'pronto'],
                    ['nome' => 'Lançamentos Manuais', 'desc' => 'Despesas extra, ajustes a débito e a crédito, vários imóveis de uma vez.', 'estado' => 'pronto'],
                    ['nome' => 'Sistema de Créditos', 'desc' => 'Saldo do imóvel utilizável em pagamentos futuros.', 'estado' => 'pronto'],
                    ['nome' => 'Lista de Pagamentos com filtros', 'desc' => 'Pesquisa, paginação e anulação de pagamentos.', 'estado' => 'pronto'],
                    ['nome' => 'Email com factura PDF', 'desc' => 'Anexa um PDF profissional na confirmação do pagamento.', 'estado' => 'pronto'],
                    ['nome' => 'Reverter pagamentos', 'desc' => 'Anular a operação completa, com auditoria.', 'estado' => 'pronto'],
                    ['nome' => 'Uso automático de saldo', 'desc' => 'O sistema deduz o saldo do imóvel num novo pagamento.', 'estado' => 'breve', 'quando' => 'Agosto 2026'],
                    ['nome' => 'Relatórios contabilísticos', 'desc' => 'Exportação em Excel/PDF com filtros por período e condomínio.', 'estado' => 'pronto'],
                ],
            ],
            [
                'id' => 'estrutural',
                'titulo' => 'Gestão Estrutural',
                'icone' => 'building',
                'cor' => 'purple',
                'descricao' => 'Condomínios, edifícios, imóveis e cadastros base',
                'features' => [
                    ['nome' => 'Gestão completa de Condomínios', 'desc' => 'Várias empresas gestoras isoladas entre si, com configurações por condomínio.', 'estado' => 'pronto'],
                    ['nome' => 'Edifícios e Imóveis', 'desc' => 'Hierarquia condomínio → edifício → imóvel, com quota proporcional.', 'estado' => 'pronto'],
                    ['nome' => 'Cadastro de Condóminos', 'desc' => 'Proprietários, inquilinos e dependentes, com perfis e permissões.', 'estado' => 'pronto'],
                    ['nome' => 'Importação massiva (Excel)', 'desc' => 'Envio de XLSX com validação e pré-visualização antes de importar.', 'estado' => 'pronto'],
                    ['nome' => 'Histórico de alterações', 'desc' => 'Auditoria completa de quem alterou o quê e quando.', 'estado' => 'pronto'],
                    ['nome' => 'Cadastro de Funcionários', 'desc' => 'BI/Passaporte, foto, função e datas. Conformidade com a protecção de dados.', 'estado' => 'roadmap', 'quando' => 'Março 2027'],
                ],
            ],
            [
                'id' => 'operacao',
                'titulo' => 'Operação Diária',
                'icone' => 'home',
                'cor' => 'cyan',
                'descricao' => 'Assembleias, Pedidos, manutenção e tarefas do dia-a-dia',
                'features' => [
                    ['nome' => 'Assembleias Digitais', 'desc' => 'Convocatórias, votações online, presenças e quórum automático.', 'estado' => 'pronto'],
                    ['nome' => 'Geração automática da Acta em PDF', 'desc' => 'Acta como título executivo, conforme o DP 141/15, art. 7.º', 'estado' => 'pronto'],
                    ['nome' => 'Sistema de Votos', 'desc' => 'Apuramento por quota proporcional, com acta automática.', 'estado' => 'pronto'],
                    ['nome' => 'Pedidos de Intervenção', 'desc' => 'Manutenção acompanhada, com fotos, comentários e cronologia.', 'estado' => 'pronto'],
                    ['nome' => 'Reservas de Áreas Comuns', 'desc' => 'Calendário com aprovação pelo gestor.', 'estado' => 'pronto'],
                    ['nome' => 'Layout PDF profissional da Acta', 'desc' => 'Logótipo, letra serifada, NIF no rodapé e paginação.', 'estado' => 'breve', 'quando' => 'Julho 2026'],
                    ['nome' => 'Relatórios operacionais', 'desc' => 'Indicadores de Pedidos resolvidos, tempo médio, por estado e categoria.', 'estado' => 'pronto'],
                ],
            ],
            [
                'id' => 'comunidade',
                'titulo' => 'Comunidade',
                'icone' => 'users',
                'cor' => 'pink',
                'descricao' => 'Comunicação entre condóminos, gestores e administração',
                'features' => [
                    ['nome' => 'Chat em Tempo Real', 'desc' => 'Comunicação directa entre condóminos e gestão. Com anexos.', 'estado' => 'breve', 'quando' => 'Q4 2026'],
                    ['nome' => 'Avisos à Comunidade', 'desc' => 'Avisos segmentados por edifício ou imóvel.', 'estado' => 'pronto'],
                    ['nome' => 'Confirmação de Leitura', 'desc' => 'Registo automático de quem leu cada aviso.', 'estado' => 'pronto'],
                    ['nome' => 'Notificações Push', 'desc' => 'Notificações no telemóvel, em iOS e Android.', 'estado' => 'pronto'],
                    ['nome' => 'Email transaccional', 'desc' => 'Convocatórias, recibos e avisos por email.', 'estado' => 'pronto'],
                    ['nome' => 'Serviço SMS ONDAKA', 'desc' => 'SMS para a verificação em dois passos e alertas críticos.', 'estado' => 'pronto'],
                ],
            ],
            [
                'id' => 'mobile',
                'titulo' => 'App Móvel',
                'icone' => 'smartphone',
                'cor' => 'blue',
                'descricao' => 'Aplicação para iOS e Android',
                'features' => [
                    ['nome' => 'Entrada com verificação por SMS', 'desc' => 'Autenticação segura em dois passos pelo Serviço SMS ONDAKA.', 'estado' => 'pronto'],
                    ['nome' => 'Painel do Condómino', 'desc' => 'Saldo, próximas Taxas de Condomínio, avisos e Pedidos abertos.', 'estado' => 'pronto'],
                    ['nome' => 'Extracto Financeiro', 'desc' => 'Histórico completo de pagamentos e Taxas de Condomínio.', 'estado' => 'pronto'],
                    ['nome' => 'Pagamentos Multicaixa Express', 'desc' => 'Gerar a referência de pagamento directamente na app.', 'estado' => 'pronto'],
                    ['nome' => 'Visitantes com QR', 'desc' => 'Pré-aprovação e leitura do QR na portaria.', 'estado' => 'pronto'],
                    ['nome' => 'Encomendas', 'desc' => 'Aviso ao destinatário quando o guarda regista a encomenda.', 'estado' => 'pronto'],
                    ['nome' => 'Pedidos com fotos', 'desc' => 'Anexar fotos directamente da câmara.', 'estado' => 'pronto'],
                    ['nome' => 'Chatbot 2-em-1', 'desc' => 'Assistente do Condomínio + Assistente ONDAKA.', 'estado' => 'pronto'],
                    ['nome' => 'Sincronização total Mobile/Web', 'desc' => 'Todas as funcionalidades da web também no telemóvel.', 'estado' => 'curso', 'quando' => 'Q4 2026'],
                    ['nome' => 'Personalização visual', 'desc' => 'Tema e marca por empresa, modo claro e escuro.', 'estado' => 'breve', 'quando' => 'Setembro 2026'],
                ],
            ],
            [
                'id' => 'portaria',
                'titulo' => 'Portaria & Visitantes',
                'icone' => 'door-open',
                'cor' => 'purple',
                'descricao' => 'Controlo de acessos, visitantes e encomendas',
                'features' => [
                    ['nome' => 'App de Portaria dedicada', 'desc' => 'Interface pensada para o tablet ou telemóvel do guarda.', 'estado' => 'pronto'],
                    ['nome' => 'Leitor de QR Code', 'desc' => 'Validação automática de visitantes pré-aprovados.', 'estado' => 'pronto'],
                    ['nome' => 'Registo de Encomendas', 'desc' => 'Regista a entrega com foto e avisa o destinatário automaticamente.', 'estado' => 'pronto'],
                    ['nome' => 'Histórico de Entradas', 'desc' => 'Quem entrou, quando e autorizado por quem.', 'estado' => 'pronto'],
                    ['nome' => 'Chamadas de Voz na App', 'desc' => 'Portaria ↔ morador ↔ gestão por voz dentro da app, sem custos de operadora.', 'estado' => 'pronto'],
                    ['nome' => 'Portaria em Modo Offline', 'desc' => 'Valida QR/OTP sem internet contra uma cópia local e sincroniza quando a rede volta.', 'estado' => 'pronto'],
                    ['nome' => 'Acesso por Horário e Área', 'desc' => 'Pré-aprovações com horários recorrentes e áreas autorizadas; alerta fora de horário.', 'estado' => 'pronto'],
                    ['nome' => 'Lista Negra de Visitantes', 'desc' => 'Bloqueio por nome, BI ou matrícula. Alerta na entrada.', 'estado' => 'pronto'],
                    ['nome' => 'Controlo de Saída de Bens', 'desc' => 'Regista os bens à entrada; na saída só liberta o declarado. Os não declarados aguardam autorização do morador.', 'estado' => 'pronto'],
                    ['nome' => 'Leitura de matrículas (ANPR)', 'desc' => 'Leitura automática de matrículas (≥98,5% de precisão).', 'estado' => 'roadmap', 'quando' => 'Agosto 2027'],
                    ['nome' => 'Biometria', 'desc' => 'Reconhecimento facial e impressão digital.', 'estado' => 'roadmap', 'quando' => 'Agosto 2027'],
                ],
            ],
            [
                'id' => 'automacao',
                'titulo' => 'Automação & Chatbot',
                'icone' => 'bot',
                'cor' => 'cyan',
                'descricao' => 'Tarefas automáticas, chatbot e fluxos sem intervenção manual',
                'features' => [
                    ['nome' => 'Chatbot com mais de 150 perguntas', 'desc' => 'Base de conhecimento própria, sem depender de IA externa.', 'estado' => 'pronto'],
                    ['nome' => 'Perguntas frequentes do Condomínio', 'desc' => 'O administrador gere as perguntas frequentes do seu condomínio, com arrastar e largar.', 'estado' => 'pronto'],
                    ['nome' => 'Pesquisa inteligente em 4 níveis', 'desc' => 'Palavras-chave, pergunta, resposta e prioridade ao condomínio.', 'estado' => 'pronto'],
                    ['nome' => 'Geração mensal automática das Taxas de Condomínio', 'desc' => 'Automática, no dia configurado em cada condomínio.', 'estado' => 'pronto'],
                    ['nome' => 'Confirmação automática de pagamentos', 'desc' => 'Verificação periódica dos pagamentos Multicaixa Express.', 'estado' => 'pronto'],
                    ['nome' => 'Emissão automática de facturas', 'desc' => 'Do fim do trial à primeira factura; renovação 24h antes.', 'estado' => 'pronto'],
                    ['nome' => 'Registo de auditoria completo', 'desc' => 'Eventos registados por subscrição, factura e pagamento.', 'estado' => 'pronto'],
                    ['nome' => 'Chatbot v2 com imagens', 'desc' => 'Respostas com capturas de ecrã e formatação rica.', 'estado' => 'breve', 'quando' => 'Q3 2026'],
                ],
            ],
            [
                'id' => 'integracoes',
                'titulo' => 'Integrações',
                'icone' => 'plug',
                'cor' => 'pink',
                'descricao' => 'Ligações a sistemas externos',
                'features' => [
                    ['nome' => 'ProxyPay', 'desc' => 'Multicaixa Express, ATM e homebanking, com confirmação assinada.', 'estado' => 'pronto'],
                    ['nome' => 'Serviço SMS ONDAKA', 'desc' => 'SMS para a verificação em dois passos e notificações críticas.', 'estado' => 'pronto'],
                    ['nome' => 'Notificações Push', 'desc' => 'Notificações push em iOS e Android.', 'estado' => 'pronto'],
                    ['nome' => 'Tempo real', 'desc' => 'Infraestrutura de tempo real (chat, votos, notificações).', 'estado' => 'breve', 'quando' => 'Q4 2026'],
                    ['nome' => 'Débito Directo (ProxyPay DDS)', 'desc' => 'Débito Directo automático mensal.', 'estado' => 'roadmap', 'quando' => 'Maio 2027'],
                ],
            ],
            [
                'id' => 'compliance',
                'titulo' => 'Conformidade & Segurança',
                'icone' => 'shield-check',
                'cor' => 'blue',
                'descricao' => 'Conformidade legal, segurança e autenticação',
                'features' => [
                    ['nome' => 'Conformidade com o DP 141/15', 'desc' => 'Decreto Presidencial angolano integralmente respeitado.', 'estado' => 'pronto'],
                    ['nome' => 'Verificação em dois passos por SMS', 'desc' => 'Autenticação em dois passos para gestores e administradores.', 'estado' => 'pronto'],
                    ['nome' => 'Encriptação', 'desc' => 'TLS 1.3 e dados sensíveis encriptados em repouso.', 'estado' => 'pronto'],
                    ['nome' => 'Glossário PT-AO', 'desc' => 'Mais de 75 termos angolanos (Taxa de Condomínio, Imóvel, etc.).', 'estado' => 'pronto'],
                    ['nome' => 'Empresas isoladas entre si', 'desc' => 'Isolamento total entre empresas gestoras.', 'estado' => 'pronto'],
                    ['nome' => 'Perfis & Permissões', 'desc' => '7 perfis: administrador da empresa, gestor, condómino, guarda, entre outros.', 'estado' => 'pronto'],
                    ['nome' => 'Protecção de dados', 'desc' => 'Consentimentos, direito ao esquecimento e exportação de dados.', 'estado' => 'pronto'],
                    ['nome' => 'Bloqueio Inteligente', 'desc' => 'Modo limitado para incumprimento. Configurável por condomínio.', 'estado' => 'pronto'],
                    ['nome' => 'Lista Negra de Devedores', 'desc' => 'Histórico de dívida, acordos negociados e acção em massa.', 'estado' => 'curso', 'quando' => 'Setembro 2026'],
                    ['nome' => 'SOS com 13 tipos por gravidade', 'desc' => 'Botão de emergência por gravidade com localização GPS. Alerta o guarda e a gestão em tempo real.', 'estado' => 'pronto'],
                ],
            ],
            [
                'id' => 'saas',
                'titulo' => 'SaaS B2B (KAYANTEC)',
                'icone' => 'file-text',
                'cor' => 'purple',
                'descricao' => 'Gestão da plataforma e das subscrições B2B (interno — não aparece no catálogo público)',
                'features' => [
                    ['nome' => 'Configuração de Preços', 'desc' => 'Preço base + 5 escalões + descontos + trial + imposto.', 'estado' => 'pronto'],
                    ['nome' => 'Calculadora da Subscrição', 'desc' => 'Cálculo dinâmico com 3 períodos.', 'estado' => 'pronto'],
                    ['nome' => 'Trial de 30 dias automático', 'desc' => 'Activação imediata para novas empresas.', 'estado' => 'pronto'],
                    ['nome' => 'Pagamento activa a subscrição', 'desc' => 'A confirmação do pagamento da factura da plataforma activa a subscrição.', 'estado' => 'pronto'],
                    ['nome' => 'Modo Limitado', 'desc' => 'Trial expirado sem pagamento → acesso restrito.', 'estado' => 'pronto'],
                    ['nome' => 'Aviso de trial em 3 cores', 'desc' => 'Verde/laranja/vermelho conforme os dias restantes.', 'estado' => 'pronto'],
                    ['nome' => 'Lista global de facturas da plataforma', 'desc' => 'O super-admin vê todas as facturas, com filtros e anulação.', 'estado' => 'pronto'],
                    ['nome' => 'Histórico de Imóveis (Crédito/Acréscimo)', 'desc' => 'Aumento ou redução de imóveis com Acréscimo ou Crédito automático.', 'estado' => 'pronto'],
                    ['nome' => 'Painel do Super-Admin', 'desc' => 'MRR, ARR, churn, pipeline e clientes recentes.', 'estado' => 'pronto'],
                    ['nome' => 'Empresa vs. Administrador Independente', 'desc' => 'O tipo de cliente diferencia a interface e o fluxo.', 'estado' => 'pronto'],
                    ['nome' => 'Auto-registo + assistente de arranque', 'desc' => 'Os visitantes criam conta sem aprovação manual.', 'estado' => 'pronto'],
                    ['nome' => 'Cancelamento da subscrição', 'desc' => 'Confirmação + motivo. Termina no fim do período pago.', 'estado' => 'pronto'],
                    ['nome' => 'Modelos de email (5 tipos)', 'desc' => 'Trial, factura emitida, pagamento, cancelamento, recuperação.', 'estado' => 'pronto'],
                    ['nome' => 'Mudança de plano', 'desc' => 'Mensal ↔ Semestral ↔ Anual, com Acréscimo ou Crédito.', 'estado' => 'pronto'],
                ],
            ],
        ];
    }
}
