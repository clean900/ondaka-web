import { Link, usePage, router } from '@inertiajs/react';
import { PropsWithChildren, useState, useEffect, useRef } from 'react';
import { toast, Toaster } from 'sonner';
import {
    LayoutDashboard, Building2, Users, UserCog, Receipt, MessageSquare,
    FileText, Shield, Menu, X, LogOut, Bell, Settings, Search, CreditCard, Ticket, DollarSign, GraduationCap, Map, MessageCircle, Megaphone,
    Sparkles, Package, DoorOpen, Wallet, Clock, Tag, Briefcase, FileBarChart, Calendar, LifeBuoy, Siren, Lock,
    Flag, ShoppingBag, Gauge, ChartBar, ClipboardList, CalendarCheck, Handshake, Cog, Wrench, Upload,
} from 'lucide-react';
import type { PageProps } from '@/types';
import { cn, iniciais, gradientDeNome } from '@/lib/utils';
import SubscricaoBanner from '@/Components/SubscricaoBanner';
import ChatbotFab from '@/Components/Chatbot/ChatbotFab';
import ChatbotDrawer from '@/Components/Chatbot/ChatbotDrawer';
import OnboardingTour from '@/Components/OnboardingTour';
import AprendaUsar from '@/Components/AprendaUsar';
import { abrirWhatsAppSuporte } from '@/config/suporte';
import BellNotificacoes from '@/Components/BellNotificacoes';
import AddonPremiumModal from '@/Components/AddonPremiumModal';
import { useFeatures } from '@/Hooks/useFeature';

type MenuItem = {
    label: string;
    href: string;
    icon: React.ElementType;
    disabled?: boolean;
    badge?: string;
    urgentBadge?: number;
    feature_slug?: string;
    externo?: boolean;
};

type MenuSection = {
    titulo: string;
    itens: MenuItem[];
};

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
    const { auth, flash, url } = usePage<PageProps & { url: string }>().props as any;
    const currentUrl = (usePage() as any).url || '';
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [aprendaAberto, setAprendaAberto] = useState(false);
    const [sosCriticosAbertos, setSosCriticosAbertos] = useState(0);
    const [seccoesAbertas, setSeccoesAbertas] = useState<Record<string, boolean>>(() => {
        if (typeof window === 'undefined') return { PRINCIPAL: true };
        try {
            const saved = localStorage.getItem('ondaka.sidebar.seccoes');
            if (saved) return JSON.parse(saved);
        } catch {}
        return { PRINCIPAL: true };
    });

    useEffect(() => {
        try {
            localStorage.setItem('ondaka.sidebar.seccoes', JSON.stringify(seccoesAbertas));
        } catch {}
    }, [seccoesAbertas]);

    const toggleSeccao = (titulo: string) => {
        setSeccoesAbertas(prev => ({ ...prev, [titulo]: !prev[titulo] }));
    };
    const sosIdsSeenRef = useRef<Set<number>>(new Set());
    const sosFirstLoadRef = useRef<boolean>(true);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.info) toast.info(flash.info);
        if (flash?.warning) toast.warning(flash.warning);
    }, [flash]);

    // === Polling SOS para som + badge + toast ===
    useEffect(() => {
        console.log('[SOS] Hook init. Roles:', auth.user.roles);
        const podeVerSos = (auth.user.roles ?? []).some((r: string) =>
            ['super-admin', 'admin-empresa', 'gestor', 'administrador-condominio'].includes(r)
        );
        console.log('[SOS] Pode ver SOS?', podeVerSos);
        if (!podeVerSos) return;

        // === AudioContext PARTILHADO ===
        let audioCtx: AudioContext | null = null;
        const getOrCreateCtx = (): AudioContext => {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            return audioCtx;
        };

        // === Destravar áudio no primeiro click/tecla do user ===
        const unlockAudio = async () => {
            try {
                const ctx = getOrCreateCtx();
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                    console.log('[SOS] 🔊 AudioContext destravado pelo user');
                }
            } catch (e) {
                console.warn('[SOS] Erro ao destravar áudio:', e);
            }
        };
        window.addEventListener('click', unlockAudio, { once: false });
        window.addEventListener('keydown', unlockAudio, { once: false });

        const tocarSirene = async () => {
            try {
                const ctx = getOrCreateCtx();
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                }
                console.log('[SOS] AudioContext state:', ctx.state);
                if (ctx.state !== 'running') {
                    console.warn('[SOS] AudioContext não está running. Estado:', ctx.state);
                    return;
                }
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(400, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3);
                osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.6);
                osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.9);
                gain.gain.setValueAtTime(0.001, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
                osc.start();
                osc.stop(ctx.currentTime + 1.3);
                console.log('[SOS] 🔔 Sirene tocou com sucesso');
            } catch (e) {
                console.warn('[SOS] Erro ao tocar sirene:', e);
            }
        };

        const fetchSos = async () => {
            try {
                console.log('[SOS] Polling...');
                const r = await fetch('/sos/alertas/data', { headers: { Accept: 'application/json' } });
                if (!r.ok) {
                    console.log('[SOS] Response not OK:', r.status);
                    return;
                }
                const json = await r.json();
                const alertas = (json.data || []) as Array<{ id: number; gravidade: string; estado: string; tipo_label: string }>;
                console.log('[SOS] Alertas recebidos:', alertas.length, 'first load?', sosFirstLoadRef.current);

                const criticos = alertas.filter(a => a.estado === 'aberto' && a.gravidade === 'critico').length;
                setSosCriticosAbertos(criticos);

                const idsAbertos = alertas
                    .filter(a => a.estado === 'aberto' && (a.gravidade === 'critico' || a.gravidade === 'alto'))
                    .map(a => a.id);

                if (!sosFirstLoadRef.current) {
                    const novos = idsAbertos.filter(id => !sosIdsSeenRef.current.has(id));
                    console.log('[SOS] Novos detectados:', novos.length, 'path actual:', window.location.pathname);
                    if (novos.length > 0 && !window.location.pathname.startsWith('/sos/alertas')) {
                        console.log('[SOS] TOCANDO SIRENE para alerta', novos[0]);
                        const alertaNovo = alertas.find(a => a.id === novos[0])!;
                        const isCritico = alertaNovo.gravidade === 'critico';
                        tocarSirene();
                        toast.error(`🚨 ${isCritico ? 'EMERGÊNCIA CRÍTICA' : 'Alerta SOS'}: ${alertaNovo.tipo_label}`, {
                            duration: 10_000,
                            action: { label: 'Ver', onClick: () => (window.location.href = `/sos/alertas/${alertaNovo.id}`) },
                        });
                    }
                }
                sosIdsSeenRef.current = new Set(idsAbertos);
                sosFirstLoadRef.current = false;
            } catch (e) {
                console.warn('SOS polling error:', e);
            }
        };

        fetchSos();
        const interval = setInterval(fetchSos, 30_000);
        return () => clearInterval(interval);
    }, [auth.user.roles]);

    const isSuperAdmin = auth.user.roles?.includes('super-admin') ?? false;
    const isGestoraNps = (auth.user.roles ?? []).some((r: string) => ['admin-empresa', 'gestor'].includes(r));

    const [numAlertas, setNumAlertas] = useState<number>(0);
    useEffect(() => {
        if (!isGestoraNps) return;
        fetch('/bi/dados/alertas', { headers: { Accept: 'application/json' } })
            .then((r) => r.ok ? r.json() : null)
            .then((j) => { if (j && typeof j.total === 'number') setNumAlertas(j.total); })
            .catch(() => { /* silencioso */ });
    }, [isGestoraNps]);
    const isAdminIndependente = auth.user.empresa_gestora?.tipo_cliente === 'admin_independente';

    const seccoes: MenuSection[] = [
        {
            titulo: 'Principal',
            itens: [
                { label: 'Painel', href: '/dashboard', icon: LayoutDashboard },
                ...(isAdminIndependente ? [] : [{ label: 'Condomínios', href: '/condominios', icon: Building2 }]),
                { label: 'Condóminos', href: '/condominos', icon: Users },
                { label: 'Importar', href: '/importacao', icon: Upload, feature_slug: 'importacao_massiva' },
                { label: 'Utilizadores', href: '/utilizadores', icon: UserCog },
            ],
        },
        {
            titulo: 'Operação',
            itens: [
                { label: 'Assembleias', href: '/assembleias', icon: Users, feature_slug: 'assembleia_virtual' },
                { label: 'Visitantes', href: '/visitantes/dentro-agora', icon: DoorOpen },
                { label: 'Lista Negra', href: '/visitantes/lista-negra', icon: Shield, feature_slug: 'lista_negra_visitantes' },
                { label: 'Passes', href: '/visitantes/passes', icon: CreditCard, feature_slug: 'passe_visitante_branding' },
                { label: 'Encomendas', href: '/encomendas', icon: Package, feature_slug: 'encomendas_avancado' },
                { label: 'Reservas', href: '/reservas', icon: CalendarCheck, feature_slug: 'reservas_areas_comuns' },
                { label: 'Manutenção', href: '/manutencao', icon: Cog, feature_slug: 'manutencao_preventiva' },
                { label: 'Pedidos de intervenção', href: '/tickets', icon: Ticket },
                { label: 'Equipa', href: '/condominio/equipa', icon: Users },
                { label: 'Minhas quotas', href: '/minhas-quotas', icon: Wallet },
                // { label: 'Modelos de Turno', href: '/configuracoes/turnos', icon: Clock, feature_slug: 'modulo_rh' }, // RH - fase futura
                // { label: 'Escala de Turnos', href: '/turnos/escala', icon: Calendar, feature_slug: 'modulo_rh' }, // RH - fase futura
                // { label: 'Marcar Presença', href: '/turnos/presenca', icon: Clock, feature_slug: 'modulo_rh' }, // RH - fase futura
                // { label: 'Relatório de Horas', href: '/turnos/relatorio', icon: FileBarChart, feature_slug: 'modulo_rh' }, // RH - fase futura
                { label: 'Empresas Prestadoras', href: '/configuracoes/empresas-prestadoras', icon: Briefcase, feature_slug: 'empresas_prestadoras' },
                { label: 'FAQs do Chatbot', href: '/admin/chatbot/faqs', icon: MessageSquare, feature_slug: 'chatbot_faq' },
                { label: 'Domínio Personalizado', href: '/funcionalidades/dominio_personalizado', icon: Sparkles, feature_slug: 'dominio_personalizado' },
                { label: 'Marketplace', href: '/funcionalidades/marketplace', icon: ShoppingBag, feature_slug: 'marketplace' },
            ],
        },
        {
            titulo: 'Comunicação',
            itens: [
                { label: 'Avisos', href: '/avisos', icon: Megaphone },
                { label: 'Serviço SMS', href: '/funcionalidades/sms_basico', icon: MessageSquare, feature_slug: 'sms_basico' },
                { label: 'SMS Sender ID', href: '/funcionalidades/sms_sender_id', icon: MessageSquare, feature_slug: 'sms_sender_id' },
                { label: 'SMS Pack Extra', href: '/funcionalidades/sms_pack_extra', icon: MessageSquare, feature_slug: 'sms_pack_extra' },
            ],
        },
        {
            titulo: 'Documentos',
            itens: [
                { label: 'Contratos', href: '/documentos/contratos', icon: FileText },
                { label: 'Regulamentos', href: '/documentos/regulamentos', icon: FileText },
                { label: 'Outros', href: '/documentos/outros', icon: FileText },
                { label: 'Formulário de Registo', href: '/documentos/formulario-registo', icon: FileText, externo: true },
            ],
        },
        {
            titulo: 'Segurança',
            itens: [
                { label: 'Emergências SOS', href: '/sos/alertas', icon: Siren, urgentBadge: sosCriticosAbertos },
            ],
        },
        {
            titulo: 'Finanças',
            itens: [
                { label: 'Contas Bancárias', href: '/financas/contas-bancarias', icon: Wallet },
                { label: 'Despesas', href: '/despesas', icon: Receipt },
            ],
        },
        {
            titulo: 'Facturação',
            itens: [
                { label: 'Pagamentos', href: '/pagamentos', icon: DollarSign },
                { label: 'Taxas de Condomínio', href: '/quotas', icon: FileText },
                { label: 'Acordos', href: '/acordos', icon: Handshake },
                { label: 'Créditos', href: '/creditos', icon: Wallet },
                { label: 'Lançamentos', href: '/lancamentos', icon: Receipt },
                { label: 'ProxyPay', href: '/funcionalidades/proxypay_rps', icon: CreditCard, feature_slug: 'proxypay_rps' },
            ],
        },
        {
            titulo: 'Funcionalidades',
            itens: [
                { label: 'Loja de add-ons', href: '/funcionalidades', icon: Sparkles },
                { label: 'Minhas funcionalidades', href: '/funcionalidades/minhas', icon: Package },
            ],
        },
        {
            titulo: 'Configurações',
            itens: [
                { label: 'Categorias de Pedidos', href: '/configuracoes/categorias-pedidos', icon: Tag },
                { label: 'Contactos & Suporte', href: '/configuracoes/contactos-suporte', icon: LifeBuoy },
            ],
        },
        ...(isGestoraNps ? [{
            titulo: 'Qualidade & BI',
            itens: [
                { label: 'Dashboard BI', href: '/bi', icon: ChartBar, urgentBadge: numAlertas, feature_slug: 'dashboard_bi' },
                { label: 'NPS do Condomínio', href: '/nps/dashboard', icon: Gauge },
                { label: 'Configurar NPS', href: '/nps/configuracao', icon: Settings },
            ],
        }] : []),
        {
            titulo: 'Conta',
            itens: [
                { label: 'Subscrição', href: '/subscricao', icon: CreditCard },
                { label: 'Minhas ordens', href: '/ordens', icon: Receipt },
                ...(isSuperAdmin ? [
                    { label: 'Admin subscrições', href: '/admin/subscricoes', icon: Settings },
                    { label: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
                    { label: 'Comunicados', href: '/admin/comunicados', icon: Megaphone },
                    { label: 'Clientes B2B', href: '/super-admin/clientes', icon: Users },
                    { label: 'Config subscrições', href: '/super-admin/subscricoes-config', icon: Settings },
                    { label: 'Permissões', href: '/super-admin/permissoes', icon: Shield },
                    { label: 'Facturas plataforma', href: '/super-admin/facturas-plataforma', icon: Receipt },
                    { label: 'Admin features', href: '/admin/features', icon: Package },
                    { label: 'Moderação Marketplace', href: '/admin/marketplace', icon: Flag },
                    { label: 'Anúncios Marketplace', href: '/admin/marketplace/anuncios', icon: ShoppingBag },
                    { label: 'NPS — Satisfação', href: '/admin/nps', icon: Gauge },
                    { label: 'Configurar NPS', href: '/admin/nps/configuracao', icon: Gauge },
                    { label: 'Admin ordens', href: '/admin/ordens', icon: Receipt },
                    { label: 'Admin SMS', href: '/admin/sms', icon: MessageSquare },
                ] : []),
            ],
        },
    ];

    // Recolhe todos os feature_slugs únicos do menu para consultar de uma vez
    const todosSlugs = seccoes.flatMap((s) => s.itens).map((i) => i.feature_slug).filter((s): s is string => !!s);
    const slugsUnicos = Array.from(new Set(todosSlugs));
    const featuresMap = useFeatures(slugsUnicos);

    if (!auth.user) {
        return null;
    }

    const nomeCompleto = auth.user.name;
    const role = auth.user.roles?.[0] ?? '';
    const roleFormatado = role.replace(/-/g, ' ');
    const empresaNome = auth.user.empresa_gestora?.nome ?? 'Plataforma';
    const avatarGradient = gradientDeNome(nomeCompleto);

    const horaActual = new Date().getHours();
    const saudacao = horaActual < 12 ? 'Bom dia' : horaActual < 19 ? 'Boa tarde' : 'Boa noite';

    const estaActivo = (href: string) => {
        if (href === '/dashboard') return currentUrl === '/dashboard' || currentUrl === '/';
        return currentUrl.startsWith(href);
    };

    const abrirModalPremium = (slug: string) => {
        window.dispatchEvent(new CustomEvent('ondaka:premium-modal', { detail: { slug } }));
    };

    return (
        <div className="min-h-screen relative">
            {/* Backdrop mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-30 w-64 transform transition-transform lg:translate-x-0',
                    'bg-[#070715] border-r border-white/5',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo + empresa */}
                <div className="flex h-[72px] items-center justify-between px-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #A855F7 60%, #EC4899 100%)' }}
                        >
                            O
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-white tracking-wide">ONDAKA</div>
                            <div className="text-[10px] text-white/50 truncate">{empresaNome}</div>
                        </div>
                    </div>
                    <button
                        className="lg:hidden text-white/60 hover:text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Menu */}
                <nav className="px-3 py-5 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
                    {seccoes.map((seccao) => (
                        <div key={seccao.titulo}>
                            <button
                                type="button"
                                onClick={() => toggleSeccao(seccao.titulo)}
                                className={`w-full px-3 mb-2 flex items-center justify-between text-[10px] uppercase tracking-[1.5px] font-semibold transition-colors ${
                                    seccao.titulo === 'Segurança'
                                        ? `text-red-500 hover:text-red-400 ${sosCriticosAbertos > 0 ? 'animate-pulse' : ''}`
                                        : 'text-white hover:text-white/80'
                                }`}
                                aria-expanded={!!seccoesAbertas[seccao.titulo]}
                            >
                                <span>{seccao.titulo}</span>
                                <span className="text-[9px]" aria-hidden="true">
                                    {seccoesAbertas[seccao.titulo] ? '▼' : '▶'}
                                </span>
                            </button>
                            <div className={`space-y-0.5 overflow-hidden transition-all ${seccoesAbertas[seccao.titulo] ? 'max-h-[2000px]' : 'max-h-0'}`}>
                                {seccao.itens.map((item) => {
                                    const featureBloqueada = !!item.feature_slug && !featuresMap[item.feature_slug];

                                    if (featureBloqueada && item.feature_slug) {
                                        const slug = item.feature_slug;
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.label}
                                                type="button"
                                                onClick={() => abrirModalPremium(slug)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-white/50 hover:text-white/70 hover:bg-white/5 transition-all group relative"
                                                aria-label={`${item.label} (Premium — bloqueado)`}
                                            >
                                                <Icon className="h-[15px] w-[15px] flex-shrink-0" />
                                                <span className="flex-1 text-left">{item.label}</span>
                                                <span
                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[8px] font-semibold tracking-wider text-white"
                                                    style={{ background: 'linear-gradient(90deg, #06b6d4 0%, #a855f7 50%, #ec4899 100%)' }}
                                                >
                                                    <Lock className="h-[9px] w-[9px]" aria-hidden="true" />
                                                    PRO
                                                </span>
                                            </button>
                                        );
                                    }

                                    const activo = !item.disabled && estaActivo(item.href);
                                    const Comp: any = item.externo ? 'a' : Link;
                                    const linkProps: any = item.externo
                                        ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
                                        : { href: item.disabled ? '#' : item.href };
                                    return (
                                        <Comp
                                            key={item.label}
                                            {...linkProps}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all group relative',
                                                item.disabled
                                                    ? 'text-white/25 cursor-not-allowed'
                                                    : activo
                                                        ? 'text-white'
                                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                            )}
                                            style={activo ? {
                                                background: 'linear-gradient(90deg, rgba(0, 212, 255, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
                                                borderLeft: '2px solid #00D4FF',
                                                borderRadius: '0 8px 8px 0',
                                                marginLeft: '-2px',
                                            } : undefined}
                                            onClick={(e) => item.disabled && e.preventDefault()}
                                        >
                                            <item.icon className="h-[15px] w-[15px] flex-shrink-0" />
                                            <span className="flex-1">{item.label}</span>
                                            {item.badge && (
                                                <span className="text-[9px] uppercase tracking-wider text-white/30 font-medium">
                                                    {item.badge}
                                                </span>
                                            )}
                                            {item.urgentBadge !== undefined && item.urgentBadge > 0 && (
                                                <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                                                    {item.urgentBadge > 99 ? '99+' : item.urgentBadge}
                                                </span>
                                            )}
                                        </Comp>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer sidebar */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/5">
                    <div className="text-[10px] text-white/30 px-3 py-2 flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Sistema operacional
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="lg:pl-64">
                {/* Header */}
                <header className="h-[72px] sticky top-0 z-20 border-b border-white/5 backdrop-blur-md bg-[#0A0A1A]/80 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            className="lg:hidden text-white/70 hover:text-white p-2 -ml-2"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {/* Search bar */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 max-w-md flex-1">
                            <Search className="h-4 w-4 text-white/40" />
                            <input
                                type="text"
                                placeholder="Pesquisar condomínios, condóminos..."
                                className="bg-transparent outline-none text-sm text-white placeholder-white/40 flex-1"
                            />
                            <span className="text-[10px] text-white/30 border border-white/10 rounded px-1.5 py-0.5">
                                ⌘K
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            id="tour-btn-aprenda"
                            onClick={() => setAprendaAberto(true)}
                            className="hidden md:inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition"
                            title="Aprenda a usar a plataforma"
                        >
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">Aprenda</span>
                        </button>
                        <button
                            id="tour-btn-tour"
                            onClick={() => (window as any).ondakaTour?.reset?.()}
                            className="hidden md:inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition"
                            title="Conheça a plataforma"
                        >
                            <Map className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">Conheça</span>
                        </button>
                        <button
                            id="tour-btn-suporte"
                            onClick={() => abrirWhatsAppSuporte()}
                            className="hidden md:inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 text-xs text-emerald-300 hover:text-white hover:bg-emerald-500/20 transition"
                            title="Falar com suporte via WhatsApp"
                        >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">Suporte</span>
                        </button>
                        <BellNotificacoes />
                        <button
                            className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition"
                            aria-label="Definições"
                        >
                            <Settings className="h-4 w-4" />
                        </button>

                        <div className="h-6 w-px bg-white/10 mx-1" />

                        <div className="flex items-center gap-2.5 pl-2">
                            <Link
                                href="/perfil"
                                className="flex items-center gap-2.5 rounded-lg hover:bg-white/5 px-1.5 py-1 transition group"
                                title="Meu perfil"
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
                                    style={{ background: avatarGradient }}
                                >
                                    {iniciais(nomeCompleto)}
                                </div>
                                <div className="hidden sm:block text-right leading-tight">
                                    <div className="text-xs font-medium text-white group-hover:text-cyan-300 transition">
                                        {nomeCompleto}
                                    </div>
                                    <div className="text-[10px] text-white/50 capitalize">
                                        {roleFormatado}
                                    </div>
                                </div>
                            </Link>
                            <button
                                onClick={() => router.post('/logout')}
                                className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition ml-1"
                                aria-label="Sair"
                                title="Sair"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </header>

                <SubscricaoBanner />

                <main className="p-6 lg:p-8 animate-fade-in">
                    {children}
                </main>

                <footer className="border-t border-white/5 py-6 text-center text-xs text-white/40">
                    © {new Date().getFullYear()} ONDAKA · Soluções Simples, Lda · Luanda, Angola · <Link href="/privacidade" className="hover:text-white/70">Privacidade</Link> · <Link href="/termos" className="hover:text-white/70">Termos</Link> · <a href="https://wa.me/244922772177" target="_blank" rel="noopener noreferrer" className="hover:text-white/70">Suporte</a>
                </footer>
            </div>

            <OnboardingTour role={auth.user.roles?.[0] ?? null} permissions={auth.user.permissions ?? []} />
            <AprendaUsar aberto={aprendaAberto} onClose={() => setAprendaAberto(false)} role={auth.user.roles?.[0] ?? null} permissions={auth.user.permissions ?? []} />
            <ChatbotFab onClick={() => setChatbotOpen(true)} />
            <ChatbotDrawer open={chatbotOpen} onClose={() => setChatbotOpen(false)} userName={auth?.user?.name} />
            <AddonPremiumModal />

            <Toaster
                position="top-right"
                richColors
                theme="dark"
                toastOptions={{
                    style: {
                        background: '#16163A',
                        border: '0.5px solid rgba(168, 85, 247, 0.2)',
                        color: '#FFFFFF',
                    },
                }}
            />

            {/* Expor saudação para páginas que queiram usar */}
            <script dangerouslySetInnerHTML={{ __html: `window.__ondakaSaudacao = '${saudacao}'` }} />
        </div>
    );
}
