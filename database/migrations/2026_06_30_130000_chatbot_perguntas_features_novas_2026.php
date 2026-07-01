<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Atualiza a base de conhecimento do chatbot (Assistente ONDAKA) com as
 * funcionalidades lançadas em 2026: Contabilidade, Relatórios Personalizados,
 * Transparência Financeira, Fornecedores Certificados, Livro de Ocorrências,
 * Chamadas de Voz, SOS com GPS, Portaria Offline e Acesso por Horário/Área.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Garante uma categoria válida (categoria_id é obrigatório).
        $catId = DB::table('chatbot_categorias')->where('slug', 'funcionalidades')->value('id');
        if (! $catId) {
            $catId = DB::table('chatbot_categorias')->insertGetId([
                'nome' => 'Funcionalidades',
                'slug' => 'funcionalidades',
                'icon' => 'Sparkles',
                'tipo' => 'ondaka',
                'ordem' => 90,
                'activa' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $perguntas = [
            // ── Contabilidade ──
            [
                'pergunta' => 'Como exporto os dados para a contabilidade (PHC/Primavera)?',
                'resposta' => "## Integração Contabilidade\n\nO add-on **Contabilidade** exporta os dados financeiros para importar no seu ERP.\n\n**Passos (gestor):**\n1. Menu **Qualidade & BI → Contabilidade**\n2. Escolha o período e o condomínio\n3. Exporte: **Recibos**, **Taxas** ou **Despesas** em CSV (abre no Excel)\n4. Ou gere o ficheiro **SAF-T (AO) em XML** para importar no ERP\n\n> O SAF-T deve ser validado com o schema da AGT antes de submissão oficial.",
                'palavras_chave' => ['contabilidade', 'phc', 'primavera', 'saf-t', 'exportar contabilístico', 'csv contabilidade', 'razão'],
                'ordem' => 200,
            ],
            // ── Relatórios Personalizados ──
            [
                'pergunta' => 'Como gero um relatório financeiro personalizado?',
                'resposta' => "## Relatórios Personalizados\n\n**Passos (gestor):**\n1. Menu **Relatórios**\n2. Escolha as **secções** (receitas vs despesas, cobrança, devedores, despesas por categoria, saúde financeira)\n3. Defina o **período** e o **condomínio**\n4. Clique em **Gerar PDF**\n\nHá ainda o **Construtor visual**: arraste blocos para montar o relatório na ordem que quiser.",
                'palavras_chave' => ['relatório personalizado', 'gerar relatório', 'relatório financeiro', 'pdf relatório', 'construtor relatório'],
                'ordem' => 201,
            ],
            [
                'pergunta' => 'Posso agendar o envio de um relatório por email?',
                'resposta' => "## Agendar Relatório por Email\n\nSim. Em **Relatórios → Agendar envio por email**:\n1. Escolha as secções, período e condomínio\n2. Indique os **destinatários** (emails separados por vírgula)\n3. Defina a **frequência** (mensal ou semanal) e o dia\n4. Crie o agendamento\n\nO relatório é gerado e enviado automaticamente em PDF, anexo ao email.",
                'palavras_chave' => ['agendar relatório', 'relatório email', 'envio automático relatório', 'relatório mensal email'],
                'ordem' => 202,
            ],
            // ── Transparência Financeira (condómino) ──
            [
                'pergunta' => 'Onde vejo as contas do meu condomínio?',
                'resposta' => "## Contas do Condomínio (Transparência)\n\nNa app, em **Mais → Contas do Condomínio**, vê o resumo financeiro do seu condomínio:\n- 💰 Receitas vs Despesas do período\n- 🏦 Fundo de reserva (e se cumpre o mínimo legal de 10%)\n- 📊 Taxa de cobrança global\n- 🧾 Despesas por categoria\n\n> Por privacidade, **não são mostrados nomes de devedores** — apenas totais.\n\nSe não aparecer, a gestão ainda não publicou a transparência para o seu condomínio.",
                'palavras_chave' => ['contas condomínio', 'transparência financeira', 'ver despesas condomínio', 'fundo de reserva', 'para onde vai o dinheiro'],
                'ordem' => 203,
            ],
            [
                'pergunta' => 'Como publico a transparência financeira aos condóminos?',
                'resposta' => "## Publicar Transparência (Gestor)\n\n1. Abra o condomínio → **Configuração → Quotas**\n2. Ative **Publicar transparência financeira aos condóminos**\n\nOs condóminos passam a ver, na app, o resumo financeiro do condomínio (receitas/despesas, fundo de reserva, cobrança, despesas por categoria) — sem nomes de devedores.",
                'palavras_chave' => ['publicar transparência', 'ativar contas condomínio', 'mostrar despesas condóminos', 'transparência gestor'],
                'ordem' => 204,
            ],
            // ── Fornecedores Certificados ──
            [
                'pergunta' => 'O que são Fornecedores Certificados?',
                'resposta' => "## Fornecedores Certificados\n\nO gestor mantém um **diretório de prestadores** (canalizador, electricista, etc.) e pode marcar os de confiança como **Certificados** (selo verde + data).\n\n**Inclui:**\n- ⭐ Avaliações de 5 estrelas\n- 🛠️ Nº de **intervenções** e **preço médio** por fornecedor\n- ✅ Selo *Certificado* visível também no catálogo do condómino\n\nEm **Configurações → Empresas Prestadoras**, use o botão de certificar.",
                'palavras_chave' => ['fornecedores certificados', 'prestador certificado', 'selo certificado', 'preço médio fornecedor', 'diretório prestadores'],
                'ordem' => 205,
            ],
            [
                'pergunta' => 'Como registo o custo de uma intervenção de um fornecedor?',
                'resposta' => "## Custo da Intervenção\n\nAo tratar de um **Pedido**:\n1. Abra o pedido → painel de atribuição\n2. Escolha **Empresa** e selecione o fornecedor\n3. Preencha o **Custo da intervenção**\n4. Confirme\n\nOs custos alimentam o **preço médio** e o histórico de intervenções do fornecedor no diretório.",
                'palavras_chave' => ['custo intervenção', 'atribuir fornecedor pedido', 'preço médio', 'histórico intervenções', 'custo pedido'],
                'ordem' => 206,
            ],
            // ── Livro de Ocorrências + Passagem de Turno ──
            [
                'pergunta' => 'Como registo uma ocorrência na portaria?',
                'resposta' => "## Livro de Ocorrências\n\nO guarda regista ocorrências (incidentes, rondas, anomalias) na app:\n1. Portaria → **Livro de Ocorrências**\n2. **+ Nova ocorrência** com descrição, hora e foto\n3. A gestão vê e pode marcar como resolvida\n\nÉ um registo cronológico permanente das ocorrências do condomínio.",
                'palavras_chave' => ['livro de ocorrências', 'registar ocorrência', 'ocorrência portaria', 'incidente guarda', 'ronda'],
                'ordem' => 207,
            ],
            [
                'pergunta' => 'Como funciona a passagem de turno na portaria?',
                'resposta' => "## Passagem de Turno\n\nQuando um guarda termina o turno:\n1. Portaria → **Passagem de Turno**\n2. Escreve um **resumo** do turno (ocorrências, pendências, avisos)\n3. Regista a passagem\n\nO guarda que entra vê o resumo do turno anterior, garantindo continuidade da informação.",
                'palavras_chave' => ['passagem de turno', 'troca de turno', 'resumo turno', 'guarda entra sai', 'turno portaria'],
                'ordem' => 208,
            ],
            // ── Chamadas de Voz ──
            [
                'pergunta' => 'Posso ligar para a portaria pela app?',
                'resposta' => "## Chamadas de Voz\n\nSim — a app tem **chamadas de voz** entre condómino, portaria e gestão, **sem custos de operadora** (usa a internet).\n\n- 📞 Condómino ↔ Portaria\n- 📞 Portaria ↔ Morador\n- 📞 Gestão ↔ ambos\n\nNa tab **Visitas**, use o botão **Ligar** e escolha o destino.",
                'palavras_chave' => ['chamada de voz', 'ligar portaria', 'chamada app', 'falar com portaria', 'chamada morador'],
                'ordem' => 209,
            ],
            // ── SOS ──
            [
                'pergunta' => 'Como funciona o botão SOS de emergência?',
                'resposta' => "## SOS de Emergência\n\nO botão **SOS** aciona um alerta por gravidade (13 tipos: incêndio, médica, assalto, fuga de gás, etc.).\n\n- 🚨 Alerta **guarda e gestão em tempo real**\n- 📍 Anexa automaticamente a **localização GPS** (link de mapa) de quem pediu socorro\n- 🔔 O guarda recebe alarme em ecrã cheio com sirene\n\nUse apenas em emergências reais.",
                'palavras_chave' => ['sos', 'emergência', 'botão pânico', 'alerta emergência', 'gps socorro', 'incêndio médica'],
                'ordem' => 210,
            ],
            // ── Portaria Offline ──
            [
                'pergunta' => 'A portaria funciona sem internet?',
                'resposta' => "## Portaria em Modo Offline\n\nSim. Se a internet cair, a portaria continua a validar entradas:\n- ✅ Valida **códigos QR/OTP** contra uma cópia local\n- 🚫 Bloqueia reutilização de códigos de uso único\n- ⚠️ Mantém o alerta da lista negra\n- 🔄 **Sincroniza** automaticamente as entradas quando a rede voltar\n\nNão é preciso fazer nada — é automático.",
                'palavras_chave' => ['portaria offline', 'sem internet', 'validar sem rede', 'qr offline', 'sincronizar portaria'],
                'ordem' => 211,
            ],
            // ── Acesso por Horário e Área ──
            [
                'pergunta' => 'Posso limitar uma pré-aprovação a horários e áreas?',
                'resposta' => "## Acesso por Horário e Área\n\nAo criar uma **pré-aprovação** ou passe, pode:\n- 🕐 Definir **horários recorrentes** (ex.: empregada Seg–Sex 08h–12h)\n- 📍 Indicar as **áreas autorizadas** (piscina, bloco B)\n\nSe o visitante chegar **fora do horário**, o guarda é avisado no check-in.",
                'palavras_chave' => ['acesso por horário', 'horário visitante', 'área autorizada', 'pré-aprovação horário', 'empregada horário'],
                'ordem' => 212,
            ],
        ];

        foreach ($perguntas as $p) {
            DB::table('chatbot_perguntas')->insertOrIgnore([
                'categoria_id' => $catId,
                'pergunta' => $p['pergunta'],
                'resposta' => $p['resposta'],
                'palavras_chave' => json_encode($p['palavras_chave']),
                'formato' => 'markdown',
                'ordem' => $p['ordem'],
                'activa' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('chatbot_perguntas')->whereBetween('ordem', [200, 212])->delete();
    }
};
