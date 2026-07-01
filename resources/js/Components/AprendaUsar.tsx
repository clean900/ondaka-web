import { useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import {
    GraduationCap, X, Search, ArrowRight, Building2, Users, UserPlus,
    Receipt, FileText, Bell, Wrench, Calendar, MessageSquare, KeyRound,
    Settings, CreditCard, Wallet, ChevronRight,
    FileBarChart, Calculator, PieChart, BadgeCheck,
} from 'lucide-react';

interface Tutorial {
    id: string;
    titulo: string;
    descricao: string;
    icon: React.ElementType;
    cor: string;
    categoria: string;
    rolesPermitidos: string[]; // se vazio, todos
    permissaoNecessaria?: string; // se definido, requer essa permissao
    passos: TutorialPasso[];
}

interface TutorialPasso {
    elemento?: string;
    titulo: string;
    descricao: string;
    side?: 'top' | 'right' | 'bottom' | 'left' | 'over';
}

interface Props {
    aberto: boolean;
    onClose: () => void;
    role?: string | null;
    permissions?: string[];
}

const TUTORIAIS: Tutorial[] = [
    // ===== Relatórios & BI =====
    {
        id: 'gerar-relatorio',
        titulo: 'Gerar um relatório personalizado',
        descricao: 'Escolha secções ou use o construtor visual para um PDF à medida',
        icon: FileBarChart,
        cor: '#A855F7',
        categoria: 'Relatórios & BI',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin'],
        passos: [
            { elemento: '[href="/relatorios"]', titulo: '1. Abrir Relatórios', descricao: 'No menu, clique em "Relatórios".', side: 'right' },
            { titulo: '2. Escolher secções', descricao: 'Selecione as secções (receitas/despesas, cobrança, devedores, despesas por categoria, saúde financeira), o período e o condomínio.', side: 'over' },
            { titulo: '3. Construtor visual (opcional)', descricao: 'Em "Construtor visual", arraste blocos para montar o relatório na ordem que quiser.', side: 'over' },
            { titulo: '4. Gerar PDF', descricao: 'Clique em "Gerar PDF". Pode ainda agendar o envio automático por email.', side: 'over' },
        ],
    },
    {
        id: 'exportar-contabilidade',
        titulo: 'Exportar para a contabilidade',
        descricao: 'CSV para Excel ou ficheiro SAF-T (AO) para o ERP',
        icon: Calculator,
        cor: '#10B981',
        categoria: 'Relatórios & BI',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin'],
        passos: [
            { elemento: '[href="/contabilidade"]', titulo: '1. Abrir Contabilidade', descricao: 'No menu Qualidade & BI, clique em "Contabilidade".', side: 'right' },
            { titulo: '2. Escolher período', descricao: 'Defina o período e o condomínio.', side: 'over' },
            { titulo: '3. Exportar', descricao: 'Exporte Recibos, Taxas ou Despesas em CSV, ou gere o SAF-T (AO) em XML para importar no PHC/Primavera.', side: 'over' },
        ],
    },
    {
        id: 'publicar-transparencia',
        titulo: 'Publicar transparência financeira',
        descricao: 'Dê aos condóminos acesso às contas do condomínio na app',
        icon: PieChart,
        cor: '#00D4FF',
        categoria: 'Relatórios & BI',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin'],
        passos: [
            { titulo: '1. Abrir o condomínio', descricao: 'Vá ao detalhe do condomínio → Configuração → separador Quotas.', side: 'over' },
            { titulo: '2. Ativar transparência', descricao: 'Ative "Publicar transparência financeira aos condóminos".', side: 'over' },
            { titulo: '3. Guardar', descricao: 'Os condóminos passam a ver as Contas do Condomínio na app (sem nomes de devedores).', side: 'over' },
        ],
    },
    {
        id: 'certificar-fornecedor',
        titulo: 'Certificar um fornecedor',
        descricao: 'Marque prestadores de confiança e acompanhe o preço médio',
        icon: BadgeCheck,
        cor: '#10B981',
        categoria: 'Relatórios & BI',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin'],
        passos: [
            { elemento: '[href="/configuracoes/empresas-prestadoras"]', titulo: '1. Empresas Prestadoras', descricao: 'Vá a Configurações → Empresas Prestadoras.', side: 'right' },
            { titulo: '2. Certificar', descricao: 'Clique no ícone de certificação (selo) ao lado do fornecedor de confiança.', side: 'over' },
            { titulo: '3. Custo nas intervenções', descricao: 'Ao atribuir um fornecedor a um Pedido, registe o custo — alimenta o nº de intervenções e o preço médio.', side: 'over' },
        ],
    },
    // ===== Configuração inicial =====
    {
        id: 'criar-condominio', permissaoNecessaria: 'condominios.criar',
        titulo: 'Criar primeiro condomínio',
        descricao: 'Configure um novo condomínio de raiz com edifícios e fracções',
        icon: Building2,
        cor: '#00D4FF',
        categoria: 'Configuração inicial',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin'],
        passos: [
            { elemento: '[href="/condominios"]', titulo: '1. Abrir Condomínios', descricao: 'No menu lateral, clique em "Condomínios".', side: 'right' },
            { titulo: '2. Botão Novo', descricao: 'Na página de listagem, clique em "+ Novo condomínio" no canto superior direito.', side: 'over' },
            { titulo: '3. Preencher dados', descricao: 'Nome, NIF, morada, número de polícia, IBAN do condomínio. Tudo obrigatório.', side: 'over' },
            { titulo: '4. Guardar', descricao: 'Clique em "Criar". Depois adicione edifícios, fracções e condóminos a partir do detalhe.', side: 'over' },
        ],
    },
    {
        id: 'configurar-facturacao', permissaoNecessaria: 'facturacao.quotas.configurar',
        titulo: 'Configurar facturação do condomínio',
        descricao: 'Definir coordenadas bancárias, ProxyPay, regras de quotas e multas',
        icon: Settings,
        cor: '#10B981',
        categoria: 'Configuração inicial',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin'],
        passos: [
            { elemento: '[href="/condominios"]', titulo: '1. Abrir Condomínios', descricao: 'No menu, vá a "Condomínios" e clique no condomínio que quer configurar.', side: 'right' },
            { titulo: '2. Configurar facturação', descricao: 'Na página de detalhe, clique no botão "Configurar facturação".', side: 'over' },
            { titulo: '3. Coordenadas Bancárias', descricao: 'Tab 1: IBAN, banco, NIB para receber transferências.', side: 'over' },
            { titulo: '4. ProxyPay', descricao: 'Tab 2: configurar Sender ID e Entity ID para gerar referências Multicaixa.', side: 'over' },
            { titulo: '5. Quotas', descricao: 'Tab 3: dia do mês para gerar quota, valor base por permilagem, regras de cálculo.', side: 'over' },
            { titulo: '6. Multas', descricao: 'Tab 4: percentagem de multa por atraso, dias de tolerância, juros.', side: 'over' },
        ],
    },
    // ===== Utilizadores =====
    {
        id: 'convidar-utilizador', permissaoNecessaria: 'empresa.utilizadores.criar',
        titulo: 'Convidar gestor / guarda / utilizador',
        descricao: 'Adicionar membros à sua equipa por email + SMS',
        icon: UserPlus,
        cor: '#A855F7',
        categoria: 'Utilizadores',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin'],
        passos: [
            { elemento: '[href="/utilizadores"]', titulo: '1. Abrir Utilizadores', descricao: 'No menu lateral em "Principal", clique em "Utilizadores".', side: 'right' },
            { titulo: '2. Novo utilizador', descricao: 'Clique no botão "+ Novo utilizador" no topo direito.', side: 'over' },
            { titulo: '3. Aba Convidar por email', descricao: 'Aba activa por defeito. Preencha nome, email, telefone (opcional para SMS), função.', side: 'over' },
            { titulo: '4. Para guarda', descricao: 'Se a função for "Guarda", "Admin Condomínio" ou "Condómino", aparece selector de Condomínio — obrigatório.', side: 'over' },
            { titulo: '5. Enviar convite', descricao: 'Clique em "Enviar convite". O utilizador recebe email (e SMS) com link para definir password.', side: 'over' },
        ],
    },
    {
        id: 'criar-com-password', permissaoNecessaria: 'empresa.utilizadores.criar',
        titulo: 'Criar utilizador com password directa',
        descricao: 'Alternativa ao convite: definir password na hora',
        icon: KeyRound,
        cor: '#EC4899',
        categoria: 'Utilizadores',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin'],
        passos: [
            { elemento: '[href="/utilizadores"]', titulo: '1. Abrir Utilizadores', descricao: 'No menu, clique em "Utilizadores".', side: 'right' },
            { titulo: '2. Novo utilizador', descricao: 'Clique em "+ Novo utilizador".', side: 'over' },
            { titulo: '3. Aba Criar com password', descricao: 'Mude para a 2ª aba "Criar com password".', side: 'over' },
            { titulo: '4. Dados + password', descricao: 'Preencha tudo + uma password mínima de 8 caracteres.', side: 'over' },
            { titulo: '5. Forçar troca', descricao: 'Marque "Forçar troca no primeiro login" (recomendado) — o utilizador será obrigado a definir nova password ao entrar.', side: 'over' },
            { titulo: '6. Comunicar', descricao: 'Após criar, comunique a password ao utilizador por canal seguro (telefone, presencial, etc).', side: 'over' },
        ],
    },
    {
        id: 'mudar-condominio-guarda', permissaoNecessaria: 'empresa.utilizadores.editar',
        titulo: 'Reatribuir guarda a outro condomínio',
        descricao: 'Mudar o condomínio activo de um guarda ou admin condomínio',
        icon: Building2,
        cor: '#F59E0B',
        categoria: 'Utilizadores',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin'],
        passos: [
            { elemento: '[href="/utilizadores"]', titulo: '1. Abrir Utilizadores', descricao: 'No menu, clique em "Utilizadores".', side: 'right' },
            { titulo: '2. Encontrar o guarda', descricao: 'Use o filtro "Função → Guarda" ou pesquise pelo nome.', side: 'over' },
            { titulo: '3. Menu de acções', descricao: 'Clique nos 3 pontos (...) na linha do guarda.', side: 'over' },
            { titulo: '4. Mudar condomínio', descricao: 'Selecione "Mudar condomínio" e escolha o novo condomínio.', side: 'over' },
        ],
    },
    // ===== Facturação =====
    {
        id: 'gerar-quotas', permissaoNecessaria: 'facturacao.faturas.criar',
        titulo: 'Gerar quotas mensais',
        descricao: 'Calcular e emitir quotas para todas as fracções',
        icon: Receipt,
        cor: '#EC4899',
        categoria: 'Facturação',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin'],
        passos: [
            { elemento: '[href="/quotas"]', titulo: '1. Abrir Taxas de Condomínio', descricao: 'No menu Facturação, clique em "Taxas de Condomínio".', side: 'right' },
            { titulo: '2. Botão Gerar quotas', descricao: 'No topo da página, clique em "Gerar quotas". Sistema calcula automaticamente baseado na permilagem de cada fracção.', side: 'over' },
            { titulo: '3. Confirmar', descricao: 'Sistema gera quotas para todas as fracções activas do condomínio. Cada uma com sua referência ProxyPay.', side: 'over' },
            { titulo: '4. Notificar condóminos', descricao: 'Envie um aviso geral em "Avisos" a informar que as quotas foram emitidas.', side: 'over' },
        ],
    },
    {
        id: 'confirmar-pagamento', permissaoNecessaria: 'pagamentos.reconciliar',
        titulo: 'Confirmar pagamento manual',
        descricao: 'Quando recebe transferência ou depósito bancário',
        icon: CreditCard,
        cor: '#10B981',
        categoria: 'Facturação',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin'],
        passos: [
            { elemento: '[href="/pagamentos"]', titulo: '1. Abrir Pagamentos', descricao: 'No menu, clique em "Pagamentos".', side: 'right' },
            { titulo: '2. Filtrar pendentes', descricao: 'Filtre por estado "Pendente" ou "Em revisão".', side: 'over' },
            { titulo: '3. Abrir pagamento', descricao: 'Clique no pagamento que quer processar.', side: 'over' },
            { titulo: '4. Confirmar', descricao: 'Verifique comprovativo, valor, data. Clique "Confirmar". A quota associada é marcada como paga.', side: 'over' },
        ],
    },
    {
        id: 'criar-credito', permissaoNecessaria: 'pagamentos.reembolsar',
        titulo: 'Devolver crédito a um condómino',
        descricao: 'Quando há pagamento a mais ou ajuste favorável',
        icon: Wallet,
        cor: '#A855F7',
        categoria: 'Facturação',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin'],
        passos: [
            { elemento: '[href="/pagamentos"]', titulo: '1. Abrir o pagamento', descricao: 'Em "Pagamentos", abra o pagamento confirmado a converter em crédito.', side: 'right' },
            { titulo: '2. Converter em crédito', descricao: 'No detalhe, clique em "Converter em crédito". Indique o valor e nota.', side: 'over' },
            { titulo: '3. Crédito disponível', descricao: 'O crédito fica disponível na fracção para abater na próxima quota — automaticamente.', side: 'over' },
        ],
    },
    {
        id: 'lancamento-manual', permissaoNecessaria: 'facturacao.faturas.criar',
        titulo: 'Registar lançamento manual',
        descricao: 'Despesa extra, receita avulsa ou ajuste',
        icon: FileText,
        cor: '#F59E0B',
        categoria: 'Facturação',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin'],
        passos: [
            { elemento: '[href="/lancamentos"]', titulo: '1. Abrir Lançamentos', descricao: 'No menu Facturação, clique em "Lançamentos".', side: 'right' },
            { titulo: '2. Novo lançamento', descricao: 'Clique em "+ Novo lançamento".', side: 'over' },
            { titulo: '3. Tipo', descricao: 'Escolha: Despesa (gastos do condomínio), Receita (entradas extra), Ajuste.', side: 'over' },
            { titulo: '4. Multi-fracção', descricao: 'Pode dividir por todas as fracções proporcionalmente, ou aplicar a uma só.', side: 'over' },
        ],
    },
    // ===== Comunicação =====
    {
        id: 'enviar-aviso', permissaoNecessaria: 'avisos.criar',
        titulo: 'Enviar aviso aos condóminos',
        descricao: 'Comunicação por email + push + SMS',
        icon: Bell,
        cor: '#3B82F6',
        categoria: 'Comunicação',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin', 'administrador-condominio'],
        passos: [
            { elemento: 'a[href*="avisos"]', titulo: '1. Abrir Avisos', descricao: 'No menu, clique em "Avisos".', side: 'right' },
            { titulo: '2. Novo aviso', descricao: 'Clique em "+ Novo aviso".', side: 'over' },
            { titulo: '3. Conteúdo', descricao: 'Título, mensagem (suporta Markdown), data programada (ou "agora").', side: 'over' },
            { titulo: '4. Segmentação', descricao: 'Escolher: todos os condóminos, edifício específico, fracção, ou role.', side: 'over' },
            { titulo: '5. Canais', descricao: 'Escolher: email (sempre), push (se app instalada), SMS (custo extra).', side: 'over' },
        ],
    },
    {
        id: 'configurar-faqs', permissaoNecessaria: 'empresa.configuracoes.editar',
        titulo: 'Configurar FAQs do chatbot',
        descricao: 'Respostas automáticas para perguntas frequentes do seu condomínio',
        icon: MessageSquare,
        cor: '#A855F7',
        categoria: 'Comunicação',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin', 'administrador-condominio'],
        passos: [
            { elemento: '[href="/admin/chatbot/faqs"]', titulo: '1. Abrir FAQs', descricao: 'No menu, "FAQs do Chatbot".', side: 'right' },
            { titulo: '2. Nova FAQ', descricao: 'Clique em "+ Nova FAQ".', side: 'over' },
            { titulo: '3. Pergunta + resposta', descricao: 'Escreva pergunta clara e resposta detalhada (Markdown suportado).', side: 'over' },
            { titulo: '4. Keywords', descricao: 'Adicione até 10 palavras-chave (JSON) que activam esta resposta.', side: 'over' },
            { titulo: '5. Drag-and-drop', descricao: 'Reordene as FAQs por relevância arrastando.', side: 'over' },
        ],
    },
    // ===== Operação =====
    {
        id: 'agendar-assembleia', permissaoNecessaria: 'votacoes.criar',
        titulo: 'Agendar assembleia geral',
        descricao: 'Convocação, ordem do dia e votação electrónica',
        icon: Calendar,
        cor: '#00D4FF',
        categoria: 'Operação',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin', 'administrador-condominio'],
        passos: [
            { elemento: '[href="/assembleias"]', titulo: '1. Abrir Assembleias', descricao: 'No menu Operação, clique em "Assembleias".', side: 'right' },
            { titulo: '2. Nova assembleia', descricao: 'Clique em "+ Nova assembleia".', side: 'over' },
            { titulo: '3. Tipo + data', descricao: 'Ordinária ou extraordinária, data, hora, local físico (se aplicável).', side: 'over' },
            { titulo: '4. Modo', descricao: 'Virtual (videoconferência automática), presencial, ou híbrida.', side: 'over' },
            { titulo: '5. Ordem do dia', descricao: 'Liste pontos a discutir. Cada ponto pode ter uma votação associada.', side: 'over' },
            { titulo: '6. Convocatórias', descricao: 'Sistema envia convocatória automática a todos os condóminos por email.', side: 'over' },
        ],
    },
    {
        id: 'gerir-pedidos', permissaoNecessaria: 'chat.usar',
        titulo: 'Atender pedidos de manutenção',
        descricao: 'Atribuir, mudar estado, comentar tickets',
        icon: Wrench,
        cor: '#F59E0B',
        categoria: 'Operação',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin', 'administrador-condominio'],
        passos: [
            { elemento: '[href="/tickets"]', titulo: '1. Abrir Pedidos de intervenção', descricao: 'No menu Operação, clique em "Pedidos de intervenção".', side: 'right' },
            { titulo: '2. Filtrar abertos', descricao: 'Filtre por estado "Aberto" para ver os por atender.', side: 'over' },
            { titulo: '3. Abrir ticket', descricao: 'Clique no ticket. Veja descrição, fotos anexadas, condómino que reportou.', side: 'over' },
            { titulo: '4. Atribuir', descricao: 'Atribua a um prestador (canalizador, electricista, etc).', side: 'over' },
            { titulo: '5. Mudar estado', descricao: 'À medida que avança: "Em curso" → "Concluído". Comente para histórico.', side: 'over' },
        ],
    },
    {
        id: 'pre-aprovar-visitante', permissaoNecessaria: 'visitantes.autorizar',
        titulo: 'Pré-aprovar um visitante',
        descricao: 'Para que a portaria deixe entrar sem confirmação',
        icon: Users,
        cor: '#EF4444',
        categoria: 'Operação',
        rolesPermitidos: ['admin-empresa', 'gestor', 'super-admin', 'administrador-condominio', 'condomino'],
        passos: [
            { elemento: '[href="/visitantes/dentro-agora"]', titulo: '1. Abrir Visitantes', descricao: 'No menu, "Visitantes".', side: 'right' },
            { titulo: '2. Pré-aprovações', descricao: 'Vá ao separador "Pré-aprovações".', side: 'over' },
            { titulo: '3. Nova pré-aprovação', descricao: 'Clique em "+ Nova". Indique nome, BI, validade (ex: hoje 14h-18h).', side: 'over' },
            { titulo: '4. Partilhar QR', descricao: 'Sistema gera QR Code para o visitante mostrar à portaria.', side: 'over' },
        ],
    },
    // ===== Tutoriais para CONDÓMINO =====
    {
        id: 'pagar-quota',
        permissaoNecessaria: 'proprio.pagamentos.efectuar',
        titulo: 'Pagar quota de condomínio',
        descricao: 'Aprenda a efectuar o pagamento da sua quota mensal',
        icon: CreditCard,
        cor: '#10B981',
        categoria: 'Condóminos',
        rolesPermitidos: ['condomino'],
        passos: [
            { elemento: '[href="/pagamentos"]', titulo: '1. Abrir Pagamentos', descricao: 'No menu lateral, clique em "Pagamentos".', side: 'right' },
            { titulo: '2. Quota pendente', descricao: 'Veja a sua quota em aberto. Clique no botão "Pagar".', side: 'over' },
            { titulo: '3. Escolher método', descricao: 'Multicaixa Express (rápido), referência ATM ou transferência bancária.', side: 'over' },
            { titulo: '4. Confirmar pagamento', descricao: 'Após pagar, o sistema actualiza automaticamente em poucos minutos.', side: 'over' },
        ],
    },
    {
        id: 'ver-extrato',
        permissaoNecessaria: 'proprio.extrato.ver',
        titulo: 'Ver o meu extracto',
        descricao: 'Consultar histórico de quotas, pagamentos e saldo da sua fracção',
        icon: FileText,
        cor: '#A855F7',
        categoria: 'Condóminos',
        rolesPermitidos: ['condomino'],
        passos: [
            { titulo: '1. Aceder ao perfil', descricao: 'Clique no seu nome no canto superior direito.', side: 'over' },
            { titulo: '2. Extracto', descricao: 'No menu, encontre "Extracto" ou "Histórico".', side: 'over' },
            { titulo: '3. Ler', descricao: 'Veja todas as suas quotas, pagamentos efectuados e saldo actual.', side: 'over' },
            { titulo: '4. Exportar', descricao: 'Pode descarregar PDF para guardar ou apresentar em assembleia.', side: 'over' },
        ],
    },
    {
        id: 'pre-autorizar-visita',
        permissaoNecessaria: 'proprio.visitantes.pre_autorizar',
        titulo: 'Pré-autorizar uma visita',
        descricao: 'Para que a portaria deixe entrar a sua visita sem confirmação',
        icon: Users,
        cor: '#EF4444',
        categoria: 'Condóminos',
        rolesPermitidos: ['condomino'],
        passos: [
            { elemento: '[href="/visitantes/dentro-agora"]', titulo: '1. Abrir Visitantes', descricao: 'No menu, clique em "Visitantes".', side: 'right' },
            { titulo: '2. Nova autorização', descricao: 'Clique em "+ Pré-autorizar".', side: 'over' },
            { titulo: '3. Dados', descricao: 'Nome, BI, validade (ex: hoje 14h-18h ou para sempre).', side: 'over' },
            { titulo: '4. QR Code', descricao: 'O sistema gera um QR Code que pode partilhar com a visita.', side: 'over' },
        ],
    },
    {
        id: 'votar-assembleia',
        permissaoNecessaria: 'proprio.votacoes.participar',
        titulo: 'Participar em votações',
        descricao: 'Votar em assembleia online (mesmo sem estar presente)',
        icon: Calendar,
        cor: '#00D4FF',
        categoria: 'Condóminos',
        rolesPermitidos: ['condomino'],
        passos: [
            { elemento: '[href="/assembleias"]', titulo: '1. Abrir Assembleias', descricao: 'No menu, clique em "Assembleias".', side: 'right' },
            { titulo: '2. Assembleia activa', descricao: 'Veja a assembleia em curso ou agendada.', side: 'over' },
            { titulo: '3. Participar', descricao: 'Clique para entrar na videoconferência ou ler ordem do dia.', side: 'over' },
            { titulo: '4. Votar', descricao: 'Em cada ponto da ordem do dia com votação, escolha "A favor", "Contra" ou "Abstenção".', side: 'over' },
        ],
    },
    {
        id: 'editar-perfil',
        permissaoNecessaria: 'proprio.perfil.editar',
        titulo: 'Editar o meu perfil',
        descricao: 'Alterar telefone, palavra-passe, foto, dados de contacto',
        icon: KeyRound,
        cor: '#EC4899',
        categoria: 'Condóminos',
        rolesPermitidos: ['condomino'],
        passos: [
            { titulo: '1. Aceder ao perfil', descricao: 'Clique no seu nome no canto superior direito.', side: 'over' },
            { titulo: '2. Definições', descricao: 'No menu, escolha "Definições" ou "Perfil".', side: 'over' },
            { titulo: '3. Editar', descricao: 'Altere telefone, foto. Para a palavra-passe, use "Alterar password".', side: 'over' },
            { titulo: '4. Guardar', descricao: 'Clique em "Guardar" para confirmar as alterações.', side: 'over' },
        ],
    },
    {
        id: 'ver-avisos',
        permissaoNecessaria: 'avisos.ver',
        titulo: 'Ver avisos do condomínio',
        descricao: 'Comunicação oficial: cortes de água, manutenções, eventos',
        icon: Bell,
        cor: '#3B82F6',
        categoria: 'Condóminos',
        rolesPermitidos: ['condomino'],
        passos: [
            { elemento: 'a[href*="avisos"]', titulo: '1. Abrir Avisos', descricao: 'No menu, clique em "Avisos".', side: 'right' },
            { titulo: '2. Lista', descricao: 'Veja todos os avisos publicados pela administração, ordenados do mais recente para o mais antigo.', side: 'over' },
            { titulo: '3. Detalhe', descricao: 'Clique num aviso para ver o conteúdo completo (texto, anexos).', side: 'over' },
            { titulo: '4. Notificações', descricao: 'Receberá também notificação por email e push (app móvel) sempre que houver novo aviso.', side: 'over' },
        ],
    },
];

export default function AprendaUsar({ aberto, onClose, role, permissions = [] }: Props) {
    const [busca, setBusca] = useState('');
    const [tutorialActivo, setTutorialActivo] = useState<Tutorial | null>(null);

    if (!aberto) return null;

    const tutoriais = TUTORIAIS.filter((t) => {
        if (t.rolesPermitidos.length > 0 && role && !t.rolesPermitidos.includes(role)) return false;
        if (t.permissaoNecessaria && !permissions.includes(t.permissaoNecessaria)) return false;
        if (busca) {
            const t2 = busca.toLowerCase();
            return t.titulo.toLowerCase().includes(t2) || t.descricao.toLowerCase().includes(t2);
        }
        return true;
    });

    const categorias = Array.from(new Set(tutoriais.map((t) => t.categoria)));

    const iniciarTutorial = (tutorial: Tutorial) => {
        onClose(); // fechar o modal primeiro

        const driverObj = driver({
            showProgress: true,
            allowClose: true,
            overlayOpacity: 0.7,
            stagePadding: 4,
            popoverClass: 'ondaka-tour-popover',
            nextBtnText: 'Próximo →',
            prevBtnText: '← Anterior',
            doneBtnText: 'Concluído ✓',
            progressText: 'Passo {{current}} de {{total}}',
            steps: tutorial.passos.map((p) => ({
                element: p.elemento,
                popover: {
                    title: p.titulo,
                    description: p.descricao,
                    side: p.side ?? 'over',
                    align: 'center' as const,
                },
            })),
        });

        setTimeout(() => driverObj.drive(), 300);
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 backdrop-blur-md py-8 px-4" onClick={onClose}>
            <div className="bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-2xl mx-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-[#00D4FF]" />
                        Aprenda a usar
                    </h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5">
                    <p className="text-sm text-white/60 mb-4">
                        Escolha um tutorial passo-a-passo. O sistema vai guiar-lhe directamente pela acção.
                    </p>

                    <div className="relative mb-5">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Pesquisar tutorial..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#00D4FF]/50 text-white"
                        />
                    </div>

                    {tutoriais.length === 0 ? (
                        <div className="text-center py-12 text-white/40 text-sm">
                            Nenhum tutorial encontrado.
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {categorias.map((cat) => (
                                <div key={cat}>
                                    <div className="text-[10px] uppercase tracking-wider text-[#00D4FF] font-semibold mb-2">
                                        {cat}
                                    </div>
                                    <div className="space-y-2">
                                        {tutoriais.filter((t) => t.categoria === cat).map((t) => {
                                            const Icon = t.icon;
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => iniciarTutorial(t)}
                                                    className="w-full text-left p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition group flex items-center gap-3"
                                                >
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        style={{ background: `${t.cor}15`, border: `0.5px solid ${t.cor}30` }}
                                                    >
                                                        <Icon className="w-5 h-5" style={{ color: t.cor }} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-white">{t.titulo}</div>
                                                        <div className="text-xs text-white/50 mt-0.5">{t.descricao}</div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition flex-shrink-0" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-5 py-3 border-t border-white/5 text-[11px] text-white/40 text-center">
                    Não encontra o que procura? Use o <strong className="text-white/60">Suporte WhatsApp</strong> 💬 ou o <strong className="text-white/60">Chatbot</strong> 🤖
                </div>
            </div>
        </div>
    );
}
