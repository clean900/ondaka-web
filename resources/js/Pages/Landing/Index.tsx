import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    PieChart, FileText, Users, ShieldCheck, Smartphone, Globe2,
    CreditCard, MessageSquare, DoorOpen, TrendingUp, Wrench, Bell
} from 'lucide-react';

interface Escalao {
    nome: string;
    slug: string;
    descricao: string;
    imoveis_min: number;
    imoveis_max: number | null;
    desconto_qtd_pct: number;
    preco_unit_mensal_kz: number;
    preco_unit_semestral_kz: number;
    preco_unit_anual_kz: number;
    cor_badge: string;
    destaque: boolean;
}

interface Config {
    preco_base_kz: number;
    desconto_mensal_pct: number;
    desconto_semestral_pct: number;
    desconto_anual_pct: number;
    trial_dias: number;
    imposto_aplicavel: boolean;
    imposto_tipo: string;
    imposto_taxa_pct: number;
}

interface Props {
    pricing: { escaloes: Escalao[]; config: Config };
}

type Periodo = "mensal" | "semestral" | "anual";

const fmt = (v: number) =>
    new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);

export default function Landing({ pricing }: Props) {
    const [periodo, setPeriodo] = useState<Periodo>("mensal");
    const [numImoveis, setNumImoveis] = useState<number>(1);
    const { escaloes, config } = pricing;

    const precoUnitParaPeriodo = (e: Escalao): number => {
        return periodo === "mensal" ? e.preco_unit_mensal_kz
            : periodo === "semestral" ? e.preco_unit_semestral_kz
            : e.preco_unit_anual_kz;
    };

    const mesesPeriodo = periodo === "mensal" ? 1 : periodo === "semestral" ? 6 : 12;

    const escalaoAplicavel = useMemo(() => {
        return escaloes.find((e) => {
            const max = e.imoveis_max ?? 999999;
            return numImoveis >= e.imoveis_min && numImoveis <= max;
        }) ?? escaloes[0];
    }, [numImoveis, escaloes]);

    const precoUnit = precoUnitParaPeriodo(escalaoAplicavel);
    const subtotal = precoUnit * numImoveis * mesesPeriodo;
    const totalComImposto = config.imposto_aplicavel ? subtotal * (1 + config.imposto_taxa_pct / 100) : subtotal;

    const heroBenefits = [
        { Icon: PieChart, label: "Dashboard completo" },
        { Icon: FileText, label: "Controle financeiro elevado" },
        { Icon: Users, label: "Comunicação integrada" },
        { Icon: ShieldCheck, label: "Segurança e conformidade" },
        { Icon: Smartphone, label: "Acesso fácil e mobile" },
    ];

    const moreFeatures = [
        { Icon: CreditCard, label: "Multicaixa Express" },
        { Icon: MessageSquare, label: "Chatbot inteligente" },
        { Icon: DoorOpen, label: "Visitantes & QR" },
        { Icon: TrendingUp, label: "Analytics" },
        { Icon: Wrench, label: "Manutenção" },
        { Icon: FileText, label: "Documentos" },
        { Icon: Bell, label: "Notificações" },
        { Icon: Globe2, label: "Glossário PT-AO" },
    ];

    const features = [
        { Icon: PieChart, titulo: "Dashboard completo", desc: "Visão clara de receitas, despesas e indicadores em tempo real." },
        { Icon: FileText, titulo: "Controle financeiro", desc: "Pagamentos via Multicaixa Express, taxas, multas e fundo de reserva." },
        { Icon: Users, titulo: "Comunicação integrada", desc: "Chat tempo real, avisos, assembleias digitais e chatbot inteligente." },
        { Icon: ShieldCheck, titulo: "Segurança e conformidade", desc: "2FA por SMS, encriptação E2E, RGPD e DP 141/15." },
        { Icon: Smartphone, titulo: "Acesso fácil e mobile", desc: "App iOS e Android para condóminos e gestores. Tudo na palma da mão." },
        { Icon: Globe2, titulo: "Feito para Angola", desc: "Kwanzas, IVA/IPC configurável, glossário PT-AO, 100% local." },
    ];

    return (
        <>
            <Head title="ONDAKA · Gestão inteligente para o seu condomínio" />

            <div className="min-h-screen bg-[#0a0a1a] text-zinc-100" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", system-ui, sans-serif" }}>
                {/* TOP BAR */}
                <header className="sticky top-0 z-50 border-b border-blue-900/30 bg-[#0a0a1a]/90 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-3">
                            <img src="/img/ondaka-logo.png" alt="ONDAKA" className="h-9 w-9 rounded" />
                            <div>
                                <div className="text-base font-bold tracking-wide">ONDAKA</div>
                                <div className="text-[10px] text-zinc-500">Soluções Simples, Lda</div>
                            </div>
                        </div>
                        <nav className="hidden gap-8 text-sm md:flex">
                            <a href="#features" className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80">Funcionalidades</a>
                            <Link href="/catalogo" className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80">Catálogo</Link>
                            <Link href="/loja" className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80">Loja</Link>
                            <a href="#pricing" className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80">Preços</a>
                            <Link href="/login" className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80">Entrar</Link>
                        </nav>
                        <Link
                            href="/registo"
                            className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-purple-500"
                        >
                            Trial {config.trial_dias} dias →
                        </Link>
                    </div>
                </header>

                {/* HERO — IMAGEM FULL BACKGROUND */}
                <section className="relative overflow-hidden">
                    {/* Imagem hero como background full — qualidade original */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: "url(\"/img/ondaka-hero-bg.png\")",
                        }}
                    />

                    {/* Overlay subtil à DIREITA para legibilidade do texto */}
                    <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a1a]/85 via-[#0a0a1a]/40 to-transparent" />

                    {/* Overlay base para garantir cor de fundo se imagem não carregar */}
                    <div className="absolute inset-0 -z-10 bg-[#0a0a1a]" />

                    <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
                        {/* Texto sobreposto à DIREITA */}
                        <div className="ml-auto max-w-2xl text-right">
                            <div className="mb-6 flex items-center justify-end gap-3">
                                <span className="text-4xl font-bold tracking-wider text-white drop-shadow-2xl">ONDAKA</span>
                                <img src="/img/ondaka-logo.png" alt="ONDAKA" className="h-14 w-14 rounded-lg shadow-lg shadow-blue-500/40" />
                            </div>

                            <h1 className="mb-5 text-5xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-2xl md:text-6xl">
                                Gestão{" "}
                                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
                                    inteligente
                                </span>
                                <br />
                                para o seu condomínio
                            </h1>

                            <p className="mb-2 text-lg text-zinc-100 drop-shadow-lg md:text-xl">
                                Mais eficiência, transparência e controle
                            </p>
                            <p className="mb-6 text-lg text-zinc-100 drop-shadow-lg md:text-xl">
                                na palma da sua mão.
                            </p>

                            <div className="mb-8 ml-auto h-1 w-48 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />

                            <div className="flex flex-wrap justify-end gap-3">
                                <a
                                    href="#features"
                                    className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-7 py-3.5 font-semibold backdrop-blur-sm transition hover:border-blue-400 hover:bg-blue-500/20"
                                >
                                    Ver funcionalidades
                                </a>
                                <Link
                                    href="/registo"
                                    className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-7 py-3.5 font-semibold shadow-xl shadow-blue-500/40 transition hover:from-blue-400 hover:to-purple-500"
                                >
                                    Trial de {config.trial_dias} dias →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 5 ÍCONES — sobre o final da imagem */}
                    <div className="relative border-t border-blue-900/30 bg-[#0a0a1a]/80 backdrop-blur-md">
                        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-6 py-10 md:grid-cols-5 md:divide-x md:divide-blue-900/30">
                            {heroBenefits.map((b) => {
                                const Icon = b.Icon;
                                return (
                                    <div key={b.label} className="flex flex-col items-center px-4 text-center">
                                        <Icon className="mb-3 h-9 w-9 text-blue-400" strokeWidth={1.3} />
                                        <div className="text-sm font-medium leading-tight text-zinc-200">{b.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 12 funcionalidades secundárias */}
                    <div className="relative border-t border-blue-900/30 bg-[#0a0a1a]/60 backdrop-blur">
                        <div className="mx-auto max-w-7xl px-6 py-8">
                            <div className="grid grid-cols-4 gap-x-3 gap-y-5 md:grid-cols-8">
                                {moreFeatures.map((b) => {
                                    const Icon = b.Icon;
                                    return (
                                        <div key={b.label} className="group flex flex-col items-center text-center">
                                            <div className="mb-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-2 ring-1 ring-blue-500/20 transition group-hover:from-blue-500/20 group-hover:to-purple-500/20">
                                                <Icon className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
                                            </div>
                                            <div className="text-[10px] font-medium leading-tight text-zinc-400">{b.label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES */}
                <section id="features" className="border-y border-zinc-800 bg-zinc-900/30 py-20">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-12 text-center">
                            <h2 className="mb-3 text-3xl font-bold md:text-4xl">Tudo que precisa para gerir condomínios</h2>
                            <p className="text-zinc-400">Desde a primeira taxa cobrada à última acta assinada</p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {features.map((f) => {
                                const Icon = f.Icon;
                                return (
                                    <div
                                        key={f.titulo}
                                        className="group relative rounded-xl border border-blue-900/30 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 transition hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
                                    >
                                        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-1 ring-blue-500/20">
                                            <Icon className="h-6 w-6 text-blue-400" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="mb-2 font-semibold">{f.titulo}</h3>
                                        <p className="text-sm text-zinc-400">{f.desc}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-12 text-center">
                            <Link
                                href="/catalogo"
                                className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-6 py-3 font-semibold transition hover:border-blue-400 hover:bg-blue-500/10"
                            >
                                Ver catálogo completo
                                <span className="text-blue-400">→</span>
                            </Link>
                            <p className="mt-3 text-xs text-zinc-500">Mais de 60 funcionalidades — em produção, em breve e no roadmap</p>
                        </div>
                    </div>
                </section>

                {/* PRICING + CALCULADORA */}
                <section id="pricing" className="border-b border-zinc-800 py-20">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-12 text-center">
                            <h2 className="mb-3 text-3xl font-bold md:text-4xl">Calcule a sua subscrição</h2>
                            <p className="text-zinc-400">Diga-nos quantos imóveis gere e qual o período. Veja o preço em tempo real.</p>
                        </div>

                        <div className="mb-10 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-8">
                            <div className="grid gap-8 md:grid-cols-2">
                                <div>
                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-semibold text-zinc-300">
                                            Quantos imóveis gere?
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                min={1}
                                                max={2000}
                                                value={numImoveis}
                                                onChange={(e) => setNumImoveis(Math.max(1, Math.min(2000, parseInt(e.target.value) || 1)))}
                                                className="w-28 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-center text-2xl font-bold text-white focus:border-blue-500 focus:outline-none"
                                            />
                                            <span className="text-zinc-500">imóveis</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min={1}
                                        max={1000}
                                        value={numImoveis}
                                        onChange={(e) => setNumImoveis(parseInt(e.target.value))}
                                        className="mb-3 w-full accent-blue-500"
                                    />
                                    <div className="mb-6 flex justify-between text-[10px] text-zinc-500">
                                        <span>1</span>
                                        <span>250</span>
                                        <span>500</span>
                                        <span>750</span>
                                        <span>1000+</span>
                                    </div>

                                    <label className="mb-2 block text-sm font-semibold text-zinc-300">Período de pagamento</label>
                                    <div className="flex gap-1 rounded-lg bg-zinc-900 p-1 ring-1 ring-zinc-800">
                                        {(["mensal", "semestral", "anual"] as Periodo[]).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPeriodo(p)}
                                                className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition ${
                                                    periodo === p
                                                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                                                        : "text-zinc-400 hover:text-white"
                                                }`}
                                            >
                                                {p.charAt(0).toUpperCase() + p.slice(1)}
                                                {p === "semestral" && config.desconto_semestral_pct > 0 && (
                                                    <span className="ml-1 text-[10px]">-{config.desconto_semestral_pct}%</span>
                                                )}
                                                {p === "anual" && config.desconto_anual_pct > 0 && (
                                                    <span className="ml-1 text-[10px]">-{config.desconto_anual_pct}%</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 ring-1 ring-blue-500/20">
                                    <div className="mb-1 text-[10px] uppercase tracking-widest text-zinc-500">Escalão aplicável</div>
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="text-lg font-bold text-blue-300">{escalaoAplicavel.nome}</span>
                                        {escalaoAplicavel.desconto_qtd_pct > 0 && (
                                            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                                                -{escalaoAplicavel.desconto_qtd_pct}% qtd
                                            </span>
                                        )}
                                    </div>
                                    <div className="mb-5 text-xs text-zinc-500">
                                        {escalaoAplicavel.imoveis_min}{escalaoAplicavel.imoveis_max ? `-${escalaoAplicavel.imoveis_max}` : "+"} imóveis · {fmt(precoUnit)} Kz por imóvel/mês
                                    </div>

                                    <div className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
                                        Total {periodo} ({mesesPeriodo} {mesesPeriodo === 1 ? "mês" : "meses"})
                                    </div>
                                    <div className="mb-1 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                                        {fmt(totalComImposto)} Kz
                                    </div>
                                    {config.imposto_aplicavel && (
                                        <div className="text-xs text-zinc-500">
                                            Subtotal: {fmt(subtotal)} Kz · {config.imposto_tipo} {config.imposto_taxa_pct}%: {fmt(totalComImposto - subtotal)} Kz
                                        </div>
                                    )}
                                    <Link
                                        href="/registo"
                                        className="mt-5 block rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-center font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-purple-500"
                                    >
                                        Começar trial de {config.trial_dias} dias →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6 text-center">
                            <h3 className="text-lg font-semibold text-zinc-300">Todos os escalões disponíveis</h3>
                            <p className="text-xs text-zinc-500">Preço por imóvel/mês · Período {periodo}</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                            {escaloes.map((e) => {
                                const isActive = escalaoAplicavel.slug === e.slug;
                                return (
                                    <div
                                        key={e.slug}
                                        className={`relative rounded-2xl border p-5 transition ${
                                            isActive
                                                ? "border-blue-500 bg-gradient-to-br from-blue-500/15 to-purple-500/10 shadow-xl shadow-blue-500/30 ring-2 ring-blue-500/40"
                                                : e.destaque
                                                ? "border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5"
                                                : "border-zinc-800 bg-zinc-900/50"
                                        }`}
                                    >
                                        {isActive && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                                ✓ O seu plano
                                            </div>
                                        )}
                                        {!isActive && e.destaque && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-zinc-800 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                                                ⭐ Popular
                                            </div>
                                        )}
                                        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                            {e.nome}
                                        </div>
                                        <div className="mb-3 text-xs text-zinc-500">
                                            {e.imoveis_min}{e.imoveis_max ? `-${e.imoveis_max}` : "+"} imóveis
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">
                                                {fmt(precoUnitParaPeriodo(e))} <span className="text-xs text-zinc-500">Kz</span>
                                            </div>
                                            <div className="text-[10px] text-zinc-500">por imóvel/mês</div>
                                            {e.desconto_qtd_pct > 0 && (
                                                <div className="mt-1 text-[10px] text-blue-400">
                                                    -{e.desconto_qtd_pct}% qtd
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 text-center text-xs text-zinc-500">
                            Trial de {config.trial_dias} dias 100% grátis
                            {config.imposto_aplicavel && ` · ${config.imposto_tipo} ${config.imposto_taxa_pct}% aplicável`}
                        </div>
                    </div>
                </section>

                {/* CTA FINAL */}
                <section className="relative overflow-hidden py-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-purple-900/30" />
                    <div className="relative mx-auto max-w-4xl px-6 text-center">
                        <h2 className="mb-4 text-3xl font-bold md:text-5xl">
                            Pronto para simplificar a sua{" "}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">gestão?</span>
                        </h2>
                        <p className="mb-8 text-zinc-400">{config.trial_dias} dias 100% grátis. Sem compromisso, cancele quando quiser.</p>
                        <Link
                            href="/registo"
                            className="inline-block rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-blue-500/40 transition hover:from-blue-400 hover:to-purple-500"
                        >
                            Começar agora →
                        </Link>
                    </div>
                </section>

                {/* DESCARREGAR APP */}
                <section className="border-t border-blue-900/30 py-16">
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <h2 className="mb-3 text-2xl font-bold md:text-3xl">
                            Descarregue a <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">app móvel</span>
                        </h2>
                        <p className="mb-8 text-zinc-400">Condóminos, guardas e prestadores: leve o ONDAKA no bolso.</p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <a href="https://play.google.com/store/apps/details?id=ao.ondaka.ondaka_app" target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 transition hover:bg-white/10">
                                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="#fff" aria-hidden="true"><path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z"/></svg>
                                <div className="text-left leading-tight">
                                    <div className="text-[10px] uppercase tracking-wide text-zinc-400">Disponível no</div>
                                    <div className="text-sm font-semibold text-white">Google Play</div>
                                </div>
                            </a>
                            <a href="https://apps.apple.com/app/id6782891593" target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 transition hover:bg-white/10">
                                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="#fff" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.036-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/></svg>
                                <div className="text-left leading-tight">
                                    <div className="text-[10px] uppercase tracking-wide text-zinc-400">Descarregar na</div>
                                    <div className="text-sm font-semibold text-white">App Store</div>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="border-t border-blue-900/30 py-10">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="flex flex-col items-center justify-between gap-4 text-sm text-zinc-500 md:flex-row">
                            <div className="flex items-center gap-3">
                                <img src="/img/ondaka-logo.png" alt="ONDAKA" className="h-8 w-8 rounded" />
                                <div>
                                    <div className="text-zinc-300">ONDAKA</div>
                                    <div className="text-xs">© {new Date().getFullYear()} Soluções Simples, Lda · Todos os direitos reservados</div>
                                </div>
                            </div>
                            <div className="flex gap-6 text-xs">
                                <a href="#features" className="hover:text-white">Funcionalidades</a>
                                <Link href="/catalogo" className="hover:text-white">Catálogo</Link>
                                <Link href="/loja" className="hover:text-white">Loja</Link>
                                <a href="#pricing" className="hover:text-white">Preços</a>
                                <Link href="/login" className="hover:text-white">Entrar</Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
