<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $perguntas = [
            [
                'pergunta' => 'O que é a Lista Negra de Visitantes?',
                'resposta' => "## Lista Negra de Visitantes\n\nA Lista Negra permite ao gestor bloquear visitantes indesejados para **todos os condomínios** da empresa.\n\n**Como funciona:**\n- 🚫 Bloquear por **número de BI**, **matrícula** ou **nome**\n- ⚠️ Quando um visitante bloqueado tenta entrar, a portaria recebe **alerta imediato**\n- O guarda vê o motivo do bloqueio e pode recusar a entrada\n\n**Para activar:** Esta é uma funcionalidade premium — verifique se o seu plano inclui o addon *Lista Negra*.",
                'palavras_chave' => ['lista negra', 'visitante bloqueado', 'banido', 'bloquear visitante', 'entrada recusada'],
                'formato' => 'markdown',
                'ordem' => 160,
            ],
            [
                'pergunta' => 'Como adicionar uma pessoa à Lista Negra?',
                'resposta' => "## Adicionar à Lista Negra\n\n**Passos (gestor):**\n1. Menu **Visitantes → Lista Negra**\n2. Toque em **+ Adicionar**\n3. Preencha: Nome, Nº BI ou Matrícula, Motivo\n4. Confirme\n\nO bloqueio aplica-se imediatamente a **todos os condomínios** da empresa gestora.",
                'palavras_chave' => ['lista negra', 'adicionar bloqueio', 'banir visitante', 'bi matricula bloquear'],
                'formato' => 'markdown',
                'ordem' => 161,
            ],
            [
                'pergunta' => 'O que é o Passe de Visitante?',
                'resposta' => "## Passe de Visitante com Branding\n\nO Passe é um **cartão digital** para prestadores e trabalhadores que acedem regularmente ao condomínio.\n\n**Inclui:**\n- 📸 Foto do visitante\n- 🪪 Dados do documento de identificação\n- 📅 Período de validade\n- 🔳 QR Code para validação na portaria\n- 🎨 Visual personalizado (12 modelos de cor por condomínio)\n\nO passe pode ser **partilhado via WhatsApp** ou descarregado em PDF.",
                'palavras_chave' => ['passe visitante', 'cartão digital', 'qr code portaria', 'prestador trabalhador passe'],
                'formato' => 'markdown',
                'ordem' => 162,
            ],
            [
                'pergunta' => 'Como solicitar um passe para um prestador ou trabalhador?',
                'resposta' => "## Solicitar Passe de Visitante\n\n**Passos (condómino, na app mobile):**\n1. Visitas → separador **Passes**\n2. Toque em **+ Solicitar passe**\n3. Escolha o imóvel e o tipo: *Prestador* ou *Trabalhador*\n4. Preencha nome, função/motivo, documento\n5. Tire foto do visitante e anexe o documento de identificação\n6. Defina as datas de validade\n7. Submeta — fica pendente até o gestor aprovar\n\nQuando aprovado, recebe notificação e pode descarregar/partilhar o passe.",
                'palavras_chave' => ['solicitar passe', 'pedir passe', 'prestador trabalhador', 'passe pendente aprovação'],
                'formato' => 'markdown',
                'ordem' => 163,
            ],
            [
                'pergunta' => 'Como o gestor aprova um passe de visitante?',
                'resposta' => "## Aprovar Passe (Gestor)\n\n1. Aceda a **Visitantes → Passes** na plataforma web\n2. Encontre o passe com estado *Pendente*\n3. Clique em **Aprovar** (ou Recusar com motivo)\n\nApós aprovação:\n- O condómino recebe notificação push\n- O passe fica disponível para descarregar em PDF com QR Code\n- O guarda pode validar o QR na portaria\n\nO gestor pode ainda escolher o **modelo visual** (1–12) para cada condomínio.",
                'palavras_chave' => ['aprovar passe', 'gestor passe', 'validar passe', 'passe aprovado recusado'],
                'formato' => 'markdown',
                'ordem' => 164,
            ],
            [
                'pergunta' => 'O que é a Manutenção Preventiva?',
                'resposta' => "## Manutenção Preventiva\n\nPermite ao gestor registar **planos de manutenção** para equipamentos do condomínio (elevadores, geradores, piscinas, etc.).\n\n**Funcionalidades:**\n- 📋 Registar equipamento com periodicidade de manutenção\n- 🔔 Alertas automáticos a **30, 15 e 7 dias** antes da data prevista\n- ✅ Marcar manutenção como concluída e agendar a próxima\n- 📊 Histórico de manutenções realizadas\n\nEvita esquecimentos e mantém o condomínio em conformidade.",
                'palavras_chave' => ['manutenção preventiva', 'equipamento', 'elevador gerador', 'plano manutenção', 'alerta manutenção'],
                'formato' => 'markdown',
                'ordem' => 165,
            ],
            [
                'pergunta' => 'Como registar um plano de manutenção para um equipamento?',
                'resposta' => "## Registar Plano de Manutenção\n\n**Passos (gestor):**\n1. Menu **Manutenção Preventiva**\n2. Toque em **+ Novo equipamento**\n3. Preencha: nome do equipamento, descrição, periodicidade (dias)\n4. Defina a próxima data de manutenção\n5. Guarde\n\nO sistema enviará alertas automáticos a 30, 15 e 7 dias antes da data.",
                'palavras_chave' => ['registar manutenção', 'novo equipamento', 'periodicidade', 'agendar manutenção'],
                'formato' => 'markdown',
                'ordem' => 166,
            ],
            [
                'pergunta' => 'O que é o Dashboard BI Executivo?',
                'resposta' => "## Dashboard BI Executivo\n\nUm painel de análise avançada para gestores com **indicadores financeiros e operacionais** em tempo real.\n\n**Inclui:**\n- 💰 Receita cobrada vs prevista por mês\n- 📊 Taxa de cobrança por condomínio\n- 🏠 Imóveis em dívida\n- 📈 Evolução de pagamentos\n- 🔧 Pedidos por estado e categoria\n- 🗳️ Participação em assembleias\n\nIdeal para gestoras com múltiplos condomínios.",
                'palavras_chave' => ['dashboard bi', 'painel executivo', 'análise financeira', 'indicadores', 'relatório executivo'],
                'formato' => 'markdown',
                'ordem' => 167,
            ],
            [
                'pergunta' => 'Como importar condóminos em massa via CSV?',
                'resposta' => "## Importação Massiva de Condóminos\n\nPermite adicionar muitos condóminos de uma vez através de um ficheiro CSV.\n\n**Passos:**\n1. Menu **Importação Massiva**\n2. Descarregue o modelo CSV de exemplo\n3. Preencha com os dados (nome, email, telefone, imóvel)\n4. Faça upload do ficheiro\n5. Confirme a pré-visualização antes de importar\n\n**Dica:** Verifique os identificadores dos imóveis antes de importar para evitar erros de associação.",
                'palavras_chave' => ['importação massiva', 'csv condóminos', 'importar lista', 'bulk import'],
                'formato' => 'markdown',
                'ordem' => 168,
            ],
            [
                'pergunta' => 'Como activar funcionalidades extra (addons) no ONDAKA?',
                'resposta' => "## Activar Addons\n\nO ONDAKA tem funcionalidades extra que podem ser activadas separadamente.\n\n**Addons disponíveis:**\n- 🚫 Lista Negra de Visitantes\n- 🪪 Passe de Visitante com Branding\n- 🔧 Manutenção Preventiva\n- 📊 Dashboard BI Executivo\n- 📥 Importação Massiva\n- 🗳️ Votação Digital em Assembleia\n\n**Como activar:**\n1. Aceda a **Funcionalidades** no menu\n2. Escolha o addon desejado\n3. Siga as instruções de activação\n\nContacte o suporte em **suporte@ondaka.ao** para mais informações.",
                'palavras_chave' => ['addon', 'funcionalidade extra', 'activar addon', 'loja funcionalidades', 'premium'],
                'formato' => 'markdown',
                'ordem' => 169,
            ],
        ];

        foreach ($perguntas as $p) {
            DB::table('chatbot_perguntas')->insertOrIgnore([
                'pergunta' => $p['pergunta'],
                'resposta' => $p['resposta'],
                'palavras_chave' => json_encode($p['palavras_chave']),
                'formato' => $p['formato'],
                'ordem' => $p['ordem'],
                'activa' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('chatbot_perguntas')->whereBetween('ordem', [160, 169])->delete();
    }
};
