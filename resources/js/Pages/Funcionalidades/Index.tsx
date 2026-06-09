import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    CircleCheck,
    Receipt,
    Send,
    MessageSquare,
    Phone,
    Video,
    RefreshCw,
    Smartphone,
    Camera,
    Fingerprint,
    UserCheck,
    Scan,
    Bot,
    ShoppingBag,
    Palette,
    Globe,
    BarChart3,
    Settings,
} from 'lucide-react';
import { useState } from 'react';

function formatMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(valor) + ' Kz';
}

interface Feature {
    slug: string;
    nome: string;
    descricao: string | null;
    icone: string | null;
    em_breve: boolean;
    activa_para_empresa: boolean;
    requer_hardware: boolean;
    comprador_label: string;
    modelo_cobranca: 'subscription' | 'consumable' | 'one_time';
    preco_base: number | null;
    preco_activacao: number;
    saldo_actual: number | null;
    unidade: string;
}

interface Categoria {
    slug: string;
    nome: string;
    features: Feature[];
}

interface Totais {
    total: number;
    disponivel: number;
    em_breve: number;
    activas_empresa: number;
}

interface Props {
    categorias: Categoria[];
    totais: Totais;
}

const ICON_MAP: Record<string, typeof MessageSquare> = {
    MessageSquare,
    Send,
    Phone,
    Video,
    Receipt,
    RefreshCw,
    Smartphone,
    Camera,
    Fingerprint,
    UserCheck,
    Scan,
    Bot,
    ShoppingBag,
    Palette,
    Globe,
    BarChart3,
};

const CATEGORIA_ICONS: Record<string, typeof MessageSquare> = {
    comunicacao: MessageSquare,
    pagamentos: Receipt,
    seguranca: Camera,
    gestao: Settings,
    personalizacao: Palette,
};

export default function FuncionalidadesIndex({ categorias, totais }: Props) {
    const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);

    const categoriasFiltradas = filtroCategoria
        ? categorias.filter((c) => c.slug === filtroCategoria)
        : categorias;

    return (
        <AuthenticatedLayout>
            <Head title="Loja de funcionalidades" />

            <div className="max-w-6xl mx-auto space-y-8 pt-2">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight">
                            Loja de funcionalidades
                        </h1>
                        <p className="text-sm text-white/60 mt-1">
                            Expanda o ONDAKA com add-ons dedicados — pague só pelo que usa.
                        </p>
                    </div>

                    <Link
                        href="/funcionalidades/minhas"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-white/10 transition-colors"
                    >
                        <CircleCheck className="w-4 h-4" />
                        As minhas funcionalidades
                        {totais.activas_empresa > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-medium">
                                {totais.activas_empresa}
                            </span>
                        )}
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Total" valor={totais.total} />
                    <StatCard label="Disponíveis" valor={totais.disponivel} cor="emerald" />
                    <StatCard label="Em breve" valor={totais.em_breve} cor="white/60" />
                    <StatCard label="Suas activas" valor={totais.activas_empresa} cor="cyan" />
                </div>

                <div className="flex gap-2 flex-wrap">
                    <FilterChip
                        label="Todas"
                        activo={filtroCategoria === null}
                        onClick={() => setFiltroCategoria(null)}
                    />
                    {categorias.map((c) => (
                        <FilterChip
                            key={c.slug}
                            label={c.nome}
                            count={c.features.length}
                            activo={filtroCategoria === c.slug}
                            onClick={() => setFiltroCategoria(c.slug)}
                        />
                    ))}
                </div>

                <div className="space-y-10">
                    {categoriasFiltradas.map((cat) => {
                        const CatIcon = CATEGORIA_ICONS[cat.slug] ?? Settings;
                        return (
                            <section key={cat.slug}>
                                <div className="flex items-center gap-2 mb-4">
                                    <CatIcon className="w-4 h-4 text-white/50" />
                                    <h2 className="text-sm font-medium text-white/80 uppercase tracking-wide">
                                        {cat.nome}
                                    </h2>
                                    <div className="flex-1 h-px bg-white/10" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {cat.features.map((feat) => (
                                        <FeatureCard key={feat.slug} feature={feat} />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

interface StatCardProps {
    label: string;
    valor: number;
    cor?: 'white' | 'emerald' | 'cyan' | 'white/60';
}

function StatCard({ label, valor, cor = 'white' }: StatCardProps) {
    const corClasses: Record<string, string> = {
        white: 'text-white',
        emerald: 'text-emerald-300',
        cyan: 'text-[#00D4FF]',
        'white/60': 'text-white/60',
    };
    const corClass = corClasses[cor] ?? 'text-white';

    return (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="text-[11px] text-white/50 uppercase tracking-wide mb-2">{label}</div>
            <div className={`text-2xl font-semibold ${corClass}`}>{valor}</div>
        </div>
    );
}

interface FilterChipProps {
    label: string;
    count?: number;
    activo: boolean;
    onClick: () => void;
}

function FilterChip({ label, count, activo, onClick }: FilterChipProps) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                activo
                    ? 'bg-white/10 border border-white/20 text-white'
                    : 'bg-white/[0.03] border border-white/10 text-white/70 hover:bg-white/[0.06]'
            }`}
        >
            {label}
            {count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-medium">
                    {count}
                </span>
            )}
        </button>
    );
}

interface FeatureCardProps {
    feature: Feature;
}

function FeatureCard({ feature }: FeatureCardProps) {
    const Icon = (feature.icone && ICON_MAP[feature.icone]) ?? Settings;

    const precoLabel =
        feature.modelo_cobranca === 'consumable'
            ? 'Pacotes a partir de 5.000 Kz'
            : feature.modelo_cobranca === 'subscription'
              ? formatMoeda(feature.preco_base ?? 0) + ' / mês'
              : feature.modelo_cobranca === 'one_time'
                ? formatMoeda(feature.preco_base ?? 0) + ' (único)'
                : '—';

    return (
        <Link
            href={`/funcionalidades/${feature.slug}`}
            className="group block p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#00D4FF]" />
                </div>

                <div className="flex flex-col items-end gap-1">
                    {feature.em_breve && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/60 font-medium">
                            EM BREVE
                        </span>
                    )}
                    {feature.activa_para_empresa && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-medium flex items-center gap-1">
                            <CircleCheck className="w-2.5 h-2.5" />
                            ACTIVA
                        </span>
                    )}
                    {feature.requer_hardware && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-medium">
                            HARDWARE
                        </span>
                    )}
                </div>
            </div>

            <h3 className="text-base font-medium text-white group-hover:text-[#8FE7FF] transition-colors">
                {feature.nome}
            </h3>

            {feature.descricao && (
                <p className="text-sm text-white/60 mt-1.5 line-clamp-3 min-h-[3.75rem]">
                    {feature.descricao}
                </p>
            )}

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <div>
                    <div className="text-white/40">{feature.comprador_label}</div>
                </div>
                <div className="text-right">
                    <div className="text-white/80 font-medium">{precoLabel}</div>
                    {feature.preco_activacao > 0 && (
                        <div className="text-white/40 text-[10px] mt-0.5">
                            + {formatMoeda(feature.preco_activacao)} activação
                        </div>
                    )}
                </div>
            </div>

            {feature.activa_para_empresa && feature.saldo_actual !== null && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-white/60">Saldo actual</span>
                    <span className="text-sm font-medium text-[#00D4FF]">
                        {feature.saldo_actual} {feature.unidade}
                    </span>
                </div>
            )}
        </Link>
    );
}
