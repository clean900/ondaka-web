import { useEffect, useRef } from 'react';
import { driver, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const STORAGE_KEY = 'ondaka_tour_v2_visto';

interface Props {
    role?: string | null;
    permissions?: string[];
    autoStart?: boolean;
}

/**
 * Tour interactivo guiado, adaptado ao role do utilizador.
 * v2 — passos detalhados (25+) cobrindo todas as funcionalidades principais.
 *
 * Reabrir manualmente: window.ondakaTour.iniciar() ou window.ondakaTour.reset()
 */
export default function OnboardingTour({ role, permissions = [], autoStart = true }: Props) {
    const driverRef = useRef<Driver | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const passos = construirPassos(role, permissions);

        const driverObj = driver({
            showProgress: true,
            allowClose: true,
            overlayOpacity: 0.7,
            stagePadding: 4,
            popoverClass: 'ondaka-tour-popover',
            nextBtnText: 'Próximo →',
            prevBtnText: '← Anterior',
            doneBtnText: 'Concluir ✓',
            progressText: 'Passo {{current}} de {{total}}',
            steps: passos,
            onDestroyed: () => {
                try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
            },
        });

        driverRef.current = driverObj;

        if (autoStart) {
            try {
                if (!localStorage.getItem(STORAGE_KEY)) {
                    const t = setTimeout(() => driverObj.drive(), 1000);
                    return () => clearTimeout(t);
                }
            } catch (e) {}
        }

        (window as any).ondakaTour = {
            iniciar: () => driverObj.drive(),
            reset: () => {
                try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
                driverObj.drive();
            },
        };

        return () => {
            driverObj.destroy();
            delete (window as any).ondakaTour;
        };
    }, [role, permissions, autoStart]);

    return null;
}

function construirPassos(role?: string | null, permissions: string[] = []) {
    const tem = (perm?: string) => !perm || permissions.includes(perm);

    const isCondomino = role === 'condomino';
    const isGuarda = role === 'guarda';
    const isGestor = ['admin-empresa', 'gestor', 'super-admin'].includes(role ?? '');

    if (isCondomino) return filtrarPassos(passosCondomino(), tem);
    if (isGuarda) return filtrarPassos(passosGuarda(), tem);
    if (isGestor) return filtrarPassos(passosGestor(), tem);
    return passosGenerico();
}


// Filtra os passos com base nas permissões disponíveis.
function filtrarPassos(passos: any[], tem: (p?: string) => boolean): any[] {
    return passos.filter((p) => tem(p.permissaoNecessaria));
}

// =====================================
// TOUR PARA GESTOR / ADMIN (28 passos)
// =====================================
function passosGestor() {
    return [
        {
            popover: {
                title: '🚀 Bem-vindo ao ONDAKA',
                description: 'Esta é a sua plataforma de gestão de condomínios em Angola. Vamos dar uma volta detalhada por todas as áreas — pode saltar a qualquer momento.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        // === SECÇÃO 1: PRINCIPAL ===
        {
            element: '[href="/dashboard"]',
            popover: {
                title: '📊 1. Painel principal',
                description: 'Aqui vê resumo de tudo: KPIs (condomínios, imóveis, pendentes, receita), próximas assembleias e actividade recente. É o seu centro de controlo.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'condominios.ver', element: '[href="/condominios"]',
            popover: {
                title: '🏢 2. Condomínios',
                description: 'A base de tudo. Crie aqui o seu primeiro condomínio com nome, NIF, morada, IBAN. Cada condomínio tem edifícios, fracções e condóminos.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'condominos.ver', element: '[href="/condominos"]',
            popover: {
                title: '👥 3. Condóminos',
                description: 'Lista de todos os residentes (proprietários e inquilinos). Adicione contactos, BI, telefone para facilitar comunicação e cobrança.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'empresa.utilizadores.ver', element: '[href="/utilizadores"]',
            popover: {
                title: '👤 4. Utilizadores da plataforma',
                description: 'Convide gestores, guardas, administradores e condóminos. Pode enviar convite por email+SMS ou criar directamente com password. Permissões específicas por função.',
                side: 'right' as const,
            },
        },
        // === SECÇÃO 2: OPERAÇÃO ===
        {
            permissaoNecessaria: 'votacoes.ver', element: '[href="/assembleias"]',
            popover: {
                title: '🗳️ 5. Assembleias virtuais',
                description: 'Agende assembleias gerais, conduza com Jitsi (videoconferência), faça votações electrónicas. Acta em PDF gerada automaticamente. Cumpre Decreto 141/15.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'visitantes.ver', element: '[href="/visitantes/dentro-agora"]',
            popover: {
                title: '🚪 6. Controlo de visitantes',
                description: 'Veja quem está dentro do condomínio em tempo real. Pré-aprovações, registo de entradas/saídas, listas negras. Funciona com app de portaria.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'encomendas.ver', element: '[href="/encomendas"]',
            popover: {
                title: '📦 7. Encomendas',
                description: 'Quando uma encomenda chega à portaria, regista-se e o destinatário é notificado por push/SMS automaticamente. Histórico completo.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'chat.usar', element: '[href="/tickets"]',
            popover: {
                title: '🔧 8. Pedidos de intervenção',
                description: 'Condóminos abrem pedidos (avarias, queixas, sugestões). Atribua a prestadores, mude estado, comente. Tudo registado para histórico.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'empresa.configuracoes.editar', element: '[href="/admin/chatbot/faqs"]',
            popover: {
                title: '🤖 9. FAQs do Chatbot',
                description: 'Configure perguntas frequentes específicas do seu condomínio (horários, regras, contactos). Os condóminos têm respostas instantâneas 24/7.',
                side: 'right' as const,
            },
        },
        // === SECÇÃO 3: FACTURAÇÃO ===
        {
            permissaoNecessaria: 'pagamentos.ver', element: '[href="/pagamentos"]',
            popover: {
                title: '💳 10. Pagamentos',
                description: 'Lista de todos os pagamentos recebidos. Confirme, rejeite ou converta em crédito. Integração com ProxyPay para Multicaixa Express e referências bancárias.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'facturacao.faturas.ver', element: '[href="/quotas"]',
            popover: {
                title: '💰 11. Taxas de Condomínio (Quotas)',
                description: 'Gere quotas mensais com um clique. Sistema calcula proporcional à fracção (permilagem), aplica multas, gere extractos.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'pagamentos.ver', element: '[href="/creditos"]',
            popover: {
                title: '💵 12. Créditos',
                description: 'Quando um condómino paga a mais ou tem reembolso, fica em crédito para abater na próxima quota. Controlo total de saldos.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'facturacao.faturas.ver', element: '[href="/lancamentos"]',
            popover: {
                title: '📝 13. Lançamentos manuais',
                description: 'Registe despesas extra (manutenções, multas), receitas avulsas (parques alugados) ou ajustes. Tudo aparece nos relatórios.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'avisos.ver', element: 'a[href*="avisos"]',
            popover: {
                title: '📢 14. Avisos',
                description: 'Comunique com condóminos por email + push + SMS. Modelos pré-prontos para cortes de água, assembleias, manutenções. Histórico de leituras.',
                side: 'right' as const,
            },
        },
        // === SECÇÃO 4: SUPORTE ===
        {
            popover: {
                title: '🤖 15. Chatbot da plataforma',
                description: 'Botão flutuante no canto inferior direito. Faz perguntas em português sobre como usar a plataforma — 150+ respostas pré-preparadas, sem IA externa.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            element: '#tour-btn-aprenda',
            popover: {
                title: '🎓 16. Aprenda a usar',
                description: 'Botão na barra superior — abre lista de tutoriais passo-a-passo das tarefas mais comuns. Ideal para quando precisa de aprender uma funcionalidade específica.',
                side: 'bottom' as const,
            },
        },
        {
            element: '#tour-btn-tour',
            popover: {
                title: '🗺️ 17. Reabrir este tour',
                description: 'Pode voltar a fazer este tour a qualquer momento clicando neste botão. Sem stress!',
                side: 'bottom' as const,
            },
        },
        {
            element: '#tour-btn-suporte',
            popover: {
                title: '💬 18. Suporte por WhatsApp',
                description: 'Precisa de ajuda humana? Clique aqui para falar directamente com a equipa ONDAKA via WhatsApp. Resposta rápida em horário comercial.',
                side: 'bottom' as const,
            },
        },
        // === SECÇÃO 5: CONFIG (super-admin only - ainda visível só para esses) ===
        {
            popover: {
                title: '⚙️ 19. Configurações importantes',
                description: 'Há configurações importantes em cada condomínio: coordenadas bancárias, ProxyPay, quotas e multas. Configure ANTES de gerar a primeira quota.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            popover: {
                title: '🔐 20. Segurança e 2FA',
                description: 'Active a autenticação de 2 factores via SMS para mais segurança. No seu perfil, pode também alterar a sua password a qualquer momento.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            popover: {
                title: '📱 21. App mobile',
                description: 'Existe app ONDAKA para Android (em breve iOS) onde os condóminos podem ver quotas, pagar, ver assembleias e receber avisos. Disponível no Google Play.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            popover: {
                title: '📊 22. Relatórios (em breve)',
                description: 'Em breve poderá gerar relatórios financeiros mensais e anuais para apresentar em assembleia, exportáveis para PDF e Excel.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            popover: {
                title: '💼 23. Loja de Add-ons',
                description: 'Expanda o ONDAKA com funcionalidades premium: Passe de Visitante, Lista Negra, Manutenção Preventiva, Dashboard BI, Importação Massiva e mais. Aceda em Funcionalidades no menu lateral.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            popover: {
                title: '🚫 24. Lista Negra de Visitantes',
                description: 'Bloqueie visitantes indesejados por BI, matrícula ou nome. Quando um visitante bloqueado tenta entrar, a portaria recebe alerta imediato. Aplica-se a todos os condomínios da empresa.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            popover: {
                title: '🪪 25. Passe de Visitante com Branding',
                description: 'O condómino solicita um passe digital para prestadores e trabalhadores — com foto, documento e QR Code. O gestor aprova e escolhe entre 12 modelos visuais por condomínio. Partilhável via WhatsApp.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            popover: {
                title: '🔧 26. Manutenção Preventiva',
                description: 'Registe equipamentos (elevadores, geradores, piscinas) com periodicidade de manutenção. Receba alertas automáticos a 30, 15 e 7 dias antes da data prevista. Histórico completo de manutenções.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            popover: {
                title: '📊 27. Dashboard BI Executivo',
                description: 'Painel de análise avançada com indicadores financeiros e operacionais em tempo real: receita cobrada vs prevista, taxa de cobrança, imóveis em dívida e evolução de pagamentos por condomínio.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            popover: {
                title: '📥 28. Importação Massiva',
                description: 'Adicione dezenas de condóminos de uma vez via ficheiro CSV. Descarregue o modelo, preencha e faça upload — com pré-visualização antes de confirmar. Poupa horas de trabalho manual.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            popover: {
                title: '⚖️ 29. Conformidade legal',
                description: 'A plataforma cumpre integralmente o Decreto Presidencial 141/15 (gestão de condomínios em Angola) — fundo de reserva, UCF, actas como título executivo.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            popover: {
                title: '💡 30. Dica importante',
                description: 'Comece sempre pelos CONDOMÍNIOS, depois EDIFÍCIOS, depois FRACÇÕES, depois CONDÓMINOS. Só depois disso pode gerar quotas. Esta sequência é fundamental.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            popover: {
                title: '🔄 31. Subscrição e plano',
                description: 'No menu CONTA, em Subscrição, pode mudar de plano (Mensal/Semestral/Anual), adicionar imóveis, ver facturas da plataforma e gerir pagamento.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            popover: {
                title: '🎯 32. Pronto para começar!',
                description: 'Comece pela criação do seu primeiro condomínio. Se precisar de ajuda, lembra-se: 🎓 Aprenda a Usar, 🗺️ Tour ou 💬 Suporte na top bar.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            popover: {
                title: '✨ Bom trabalho!',
                description: 'O ONDAKA foi feito para simplificar a sua vida. Se tiver sugestões, partilhe connosco — somos uma equipa pequena que ouve os utilizadores. 🇦🇴',
                side: 'over' as const, align: 'center' as const,
            },
        },
    ];
}

// =====================================
// TOUR PARA CONDÓMINO
// =====================================
function passosCondomino() {
    return [
        {
            popover: {
                title: '👋 Bem-vindo ao ONDAKA',
                description: 'A plataforma de gestão do seu condomínio. Vamos mostrar-lhe o essencial em poucos passos.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            element: '[href="/dashboard"]',
            popover: {
                title: '📊 O seu painel',
                description: 'Resumo da sua fracção: quotas pendentes, próximas assembleias, avisos importantes do condomínio.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'proprio.pagamentos.efectuar', element: '[href="/pagamentos"]',
            popover: {
                title: '💳 Pagamentos',
                description: 'Pague as suas quotas online. Aceitamos Multicaixa Express, referência ATM e transferência bancária.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'proprio.faturas.ver', element: '[href="/quotas"]',
            popover: {
                title: '📋 Histórico de quotas',
                description: 'Veja todas as suas quotas (pagas e pendentes), descarregue extractos e comprovativos.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'avisos.ver', element: 'a[href*="avisos"]',
            popover: {
                title: '🔔 Avisos do condomínio',
                description: 'Comunicação oficial: cortes de água, manutenções, eventos. Receberá também por email e push.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'votacoes.ver', element: '[href="/assembleias"]',
            popover: {
                title: '🗳️ Assembleias',
                description: 'Veja convocatórias, participe online via Jitsi e vote electronicamente. As suas decisões contam!',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'chat.usar', element: '[href="/tickets"]',
            popover: {
                title: '🔧 Abrir um pedido',
                description: 'Reportar avarias, queixas de barulho, sugestões. A administração responde e atribui a um prestador.',
                side: 'right' as const,
            },
        },
        {
            element: '#tour-btn-suporte',
            popover: {
                title: '💬 Precisa de ajuda?',
                description: 'Botão de suporte WhatsApp na top bar. Resposta rápida da equipa ONDAKA.',
                side: 'bottom' as const,
            },
        },
        {
            popover: {
                title: '✨ Pronto!',
                description: 'Pode reabrir este tour a qualquer momento clicando em 🗺️ na top bar.',
                side: 'over' as const, align: 'center' as const,
            },
        },
    ];
}

// =====================================
// TOUR PARA GUARDA
// =====================================
function passosGuarda() {
    return [
        {
            popover: {
                title: '🛡️ Bem-vindo, guarda',
                description: 'Plataforma de portaria ONDAKA. Vamos ver o essencial para o seu trabalho diário.',
                side: 'over' as const, align: 'center' as const,
            },
        },
        {
            permissaoNecessaria: 'visitantes.ver', element: '[href="/visitantes/dentro-agora"]',
            popover: {
                title: '👥 Quem está dentro',
                description: 'Lista em tempo real de visitantes dentro do condomínio. Registe entradas e saídas com 1 clique.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'encomendas.ver', element: '[href="/encomendas"]',
            popover: {
                title: '📦 Encomendas chegadas',
                description: 'Quando chega uma encomenda, registe aqui (foto, transportadora, destinatário). O sistema notifica automaticamente.',
                side: 'right' as const,
            },
        },
        {
            permissaoNecessaria: 'chat.usar', element: '[href="/tickets"]',
            popover: {
                title: '🔧 Reportar ocorrências',
                description: 'Avarias, problemas de segurança, situações estranhas — abra um pedido aqui. A administração é alertada.',
                side: 'right' as const,
            },
        },
        {
            element: '#tour-btn-suporte',
            popover: {
                title: '💬 Precisa de ajuda técnica?',
                description: 'Botão de suporte WhatsApp na top bar para questões técnicas da plataforma.',
                side: 'bottom' as const,
            },
        },
        {
            popover: {
                title: '✨ Bom trabalho!',
                description: 'Use sempre a app de portaria no telemóvel para mais agilidade. Bom turno!',
                side: 'over' as const, align: 'center' as const,
            },
        },
    ];
}

function passosGenerico() {
    return [{
        popover: {
            title: '👋 Bem-vindo ao ONDAKA',
            description: 'Explore o menu lateral à esquerda para começar.',
            side: 'over' as const, align: 'center' as const,
        },
    }];
}
