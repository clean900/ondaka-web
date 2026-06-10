import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft, ArrowRight, Gift, Lock, Sparkles, Quote, CheckCircle,
    ShieldCheck, TrendingUp, Ban, Settings, Edit, Send, Smartphone,
    Package, Clock, Zap, ChartBar, Store, CreditCard,
    MessageSquare, Search, Tag, TrendingDown, Camera, Scan,
    Upload, FileText, Users, Video, Calendar, History,
    type LucideIcon,
} from 'lucide-react';

/**
 * ONDAKA — Página comercial /funcionalidades/{slug}
 *
 * Renderizada quando feature.comercial_json existe na BD.
 * Layout vendedor com 7 secções:
 *   1. Hero (badges + tagline + CTAs duplos)
 *   2. Problema / Solução
 *   3. Benefícios grid
 *   4. Demo visual (3 passos)
 *   5. Testemunho (opcional)
 *   6. FAQ
 *   7. CTA final
 */

interface Beneficio {
    icone: string;
    titulo: string;
    descricao: string;
}

interface DemoPasso {
    icone: string;
    label_curto: string;
    label_longo: string;
}

interface Testemunho {
    texto: string;
    autor: string;
}

interface FaqItem {
    pergunta: string;
    resposta: string;
}

interface Comercial {
    tagline: string;
    problema: string;
    solucao: string;
    beneficios: Beneficio[];
    demo_passos: DemoPasso[];
    testemunho?: Testemunho;
    faq: FaqItem[];
}

interface Feature {
    slug: string;
    nome: string;
    descricao: string;
    categoria_label: string;
    preco_base: number | string;
    em_breve: boolean;
    comercial: Comercial;
}

interface Subscription {
    estado: string;
    estado_label: string;
    esta_activa: boolean;
    expira_em?: string | null;
}

interface Props {
    feature: Feature;
    subscription: Subscription | null;
}

// Mapeamento de ícones (string → componente Lucide)
const ICONES: Record<string, LucideIcon> = {
    'shield-check': ShieldCheck,
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    'ban': Ban,
    'settings': Settings,
    'edit': Edit,
    'send': Send,
    'smartphone': Smartphone,
    'package': Package,
    'clock': Clock,
    'zap': Zap,
    'chart-bar': ChartBar,
    'store': Store,
    'credit-card': CreditCard,
    'check-circle': CheckCircle,
    'message-square': MessageSquare,
    'search': Search,
    'tag': Tag,
    'camera': Camera,
    'scan': Scan,
    'upload': Upload,
    'qrcode': Tag,
    'file-text': FileText,
    'users': Users,
    'video': Video,
    'calendar': Calendar,
    'history': History,
};

function Icone({ nome, className = 'w-5 h-5' }: { nome: string; className?: string }) {
    const C = ICONES[nome] || Sparkles;
    return <C className={className} aria-hidden="true" />;
}

function formatarPreco(preco: number | string): string {
    const n = typeof preco === 'string' ? parseFloat(preco) : preco;
    if (isNaN(n) || n <= 0) return 'Grátis';
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 })
        .format(n)
        .replace('AOA', 'Kz');
}

export default function ShowComercial({ feature, subscription }: Props) {
    const { comercial } = feature;
    const [iniciandoTrial, setIniciandoTrial] = useState(false);
    const [solicitandoActivacao, setSolicitandoActivacao] = useState(false);
    const estaActiva = subscription?.esta_activa === true;

    const iniciarTrial = () => {
        setIniciandoTrial(true);
        router.post(`/funcionalidades/${feature.slug}/trial`, {}, {
            preserveScroll: true,
            onFinish: () => setIniciandoTrial(false),
        });
    };

    const solicitarActivacao = () => {
        setSolicitandoActivacao(true);
        router.post(`/funcionalidades/${feature.slug}/activar`, {}, {
            preserveScroll: true,
            onFinish: () => setSolicitandoActivacao(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={feature.nome} />

            <div className="max-w-4xl mx-auto py-6 px-4">
                {/* Breadcrumb */}
                <Link href="/funcionalidades" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar à loja
                </Link>

                {/* HERO */}
                <div className="rounded-2xl p-6 mb-6 border border-zinc-700/50" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(168,85,247,0.08) 50%, rgba(236,72,153,0.05) 100%)' }}>
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded bg-purple-500/15 text-purple-300">
                            {feature.categoria_label}
                        </span>
                        {estaActiva && (
                            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded bg-emerald-500/15 text-emerald-300">
                                Activa
                            </span>
                        )}
                        {!estaActiva && !feature.em_breve && (
                            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded bg-cyan-500/15 text-cyan-300">
                                Disponível
                            </span>
                        )}
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #06b6d4, #a855f7)' }}>
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-semibold text-white mb-1">{feature.nome}</h1>
                            <p className="text-sm text-zinc-300 leading-relaxed mb-4">{comercial.tagline}</p>

                            {estaActiva ? (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm text-emerald-300 font-medium">
                                        Funcionalidade activa
                                        {subscription?.expira_em && ` — expira em ${new Date(subscription.expira_em).toLocaleDateString('pt-PT')}`}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={iniciarTrial} disabled={iniciandoTrial} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-wait transition-all" style={{ background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)' }}>
                                        <Gift className="w-4 h-4" />
                                        {iniciandoTrial ? 'A activar...' : 'Experimentar 7 dias grátis'}
                                    </button>
                                    <button type="button" onClick={solicitarActivacao} disabled={solicitandoActivacao} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 transition-all disabled:opacity-50 disabled:cursor-wait">
                                        Activar subscrição · {formatarPreco(feature.preco_base)}/mês
                                    </button>
                                </div>
                            )}
                            <p className="text-[11px] text-zinc-500 mt-2">Sem cartão de crédito · Cancele a qualquer momento</p>
                        </div>
                    </div>
                </div>

                {/* PROBLEMA / SOLUÇÃO */}
                <div className="mb-8">
                    <div className="mb-5">
                        <div className="text-[10px] tracking-[1.5px] uppercase text-zinc-500 font-semibold mb-2">O problema</div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{comercial.problema}</p>
                    </div>
                    <div>
                        <div className="text-[10px] tracking-[1.5px] uppercase text-zinc-500 font-semibold mb-2">A solução</div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{comercial.solucao}</p>
                    </div>
                </div>

                {/* BENEFÍCIOS GRID */}
                <div className="mb-8">
                    <div className="text-[10px] tracking-[1.5px] uppercase text-zinc-500 font-semibold mb-3">O que está incluído</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {comercial.beneficios.map((b, i) => (
                            <div key={i} className="bg-zinc-900/40 border border-zinc-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Icone nome={b.icone} className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm text-white font-medium">{b.titulo}</span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">{b.descricao}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DEMO PASSOS */}
                <div className="mb-8 bg-zinc-900/40 border border-zinc-700/50 rounded-xl p-5">
                    <div className="text-[10px] tracking-[1.5px] uppercase text-zinc-500 font-semibold mb-3">Vê em acção</div>
                    <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                        {comercial.demo_passos.map((p, i) => (
                            <div key={i} className="contents">
                                <div className="flex-1 min-w-0 rounded-lg py-5 px-3 flex flex-col items-center text-center gap-2" style={{ background: `linear-gradient(135deg, rgba(${i === 0 ? '6,182,212' : i === 1 ? '168,85,247' : '236,72,153'},0.15), rgba(${i === 0 ? '168,85,247' : i === 1 ? '236,72,153' : '6,182,212'},0.15))` }}>
                                    <Icone nome={p.icone} className="w-7 h-7 text-white/80" />
                                    <div className="text-xs text-zinc-400 leading-tight">{p.label_longo}</div>
                                </div>
                                {i < comercial.demo_passos.length - 1 && <ArrowRight className="w-4 h-4 text-zinc-600 flex-shrink-0 hidden md:block" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* TESTEMUNHO (opcional) */}
                {comercial.testemunho && (
                    <div className="mb-8 rounded-xl p-5 border border-purple-500/20" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(6,182,212,0.05))' }}>
                        <div className="flex gap-3 items-start">
                            <Quote className="w-6 h-6 text-purple-400 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-zinc-200 leading-relaxed italic mb-2">"{comercial.testemunho.texto}"</p>
                                <p className="text-xs text-zinc-500">— {comercial.testemunho.autor}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* FAQ */}
                <div className="mb-8">
                    <div className="text-[10px] tracking-[1.5px] uppercase text-zinc-500 font-semibold mb-3">Perguntas frequentes</div>
                    <div>
                        {comercial.faq.map((item, i) => (
                            <details key={i} className="border-t border-zinc-700/50 py-3 group">
                                <summary className="cursor-pointer text-sm text-white font-medium flex items-center justify-between list-none">
                                    {item.pergunta}
                                    <ArrowRight className="w-4 h-4 text-zinc-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                                </summary>
                                <p className="text-xs text-zinc-400 leading-relaxed mt-2 pr-6">{item.resposta}</p>
                            </details>
                        ))}
                    </div>
                </div>

                {/* CTA FINAL */}
                {!estaActiva && (
                    <div className="rounded-2xl p-6 text-center border border-purple-500/30" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(168,85,247,0.12), rgba(236,72,153,0.08))' }}>
                        <h2 className="text-lg font-medium text-white mb-1">Pronto para experimentar?</h2>
                        <p className="text-sm text-zinc-400 mb-4">Active o trial de 7 dias agora. Sem cartão. Sem compromisso.</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <button onClick={iniciarTrial} disabled={iniciandoTrial} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-wait transition-all" style={{ background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)' }}>
                                <Gift className="w-4 h-4" />
                                {iniciandoTrial ? 'A activar...' : 'Experimentar 7 dias grátis'}
                            </button>
                            <button type="button" onClick={solicitarActivacao} disabled={solicitandoActivacao} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 transition-all disabled:opacity-50 disabled:cursor-wait">
                                Activar subscrição · {formatarPreco(feature.preco_base)}/mês
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
