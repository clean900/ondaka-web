import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    TriangleAlert,
    Package,
    Settings,
    Receipt,
    Send,
    Plus,
    BarChart3,
    Globe,
    Palette,
    ShoppingBag,
    Bot,
    Scan,
    UserCheck,
    Fingerprint,
    Camera,
    Smartphone,
    RefreshCw,
    Video,
    Phone,
    MessageSquare,
    ChevronRight,
} from 'lucide-react';

function formatData(iso: string | null): string {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(iso));
}

interface Feature {
    id: number;
    slug: string;
    nome: string;
    icone: string | null;
    categoria_label: string;
    estado: 'activa' | 'pendente' | 'expirada' | 'esgotada' | 'cancelada' | 'suspensa';
    estado_label: string;
    esta_activa: boolean;
    modelo_cobranca: 'subscription' | 'consumable' | 'one_time';
    saldo_baixo: boolean;
    recarga_automatica: boolean;
    saldo_actual: number;
    saldo_inicial: number;
    saldo_utilizado: number;
    percentagem_usada: number;
    unidade: string;
    expira_em: string | null;
}

interface Totais {
    activas: number;
    saldo_baixo: number;
    expiram_breve: number;
}

interface Props {
    features: Feature[];
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

export default function FuncionalidadesMinhas({ features = [], totais }: Props) {
    const activas = features.filter((f) => f.esta_activa);
    const inactivas = features.filter((f) => !f.esta_activa);

    return (
        <AuthenticatedLayout>
            <Head title="As minhas funcionalidades" />

            <div className="max-w-6xl mx-auto space-y-6 pt-2">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight">
                            As minhas funcionalidades
                        </h1>
                        <p className="text-sm text-white/60 mt-1">
                            Add-ons activos, saldos, renovações e consumo.
                        </p>
                    </div>

                    <Link
                        href="/funcionalidades"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#8FE7FF] text-sm hover:bg-[#00D4FF]/15 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Explorar loja
                    </Link>
                </div>

                {totais.saldo_baixo > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                        <TriangleAlert className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-amber-200 mb-0.5">
                                {totais.saldo_baixo}{' '}
                                {totais.saldo_baixo === 1 ? 'funcionalidade' : 'funcionalidades'} com saldo baixo
                            </h3>
                            <p className="text-sm text-white/70">
                                Recarregue antes que o saldo esgote para evitar interrupções.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <StatCard label="Activas" valor={totais.activas} cor="emerald" />
                    <StatCard
                        label="Saldo baixo"
                        valor={totais.saldo_baixo}
                        cor={totais.saldo_baixo > 0 ? 'amber' : 'white/60'}
                    />
                    <StatCard
                        label="Expiram em breve"
                        valor={totais.expiram_breve}
                        cor={totais.expiram_breve > 0 ? 'cyan' : 'white/60'}
                    />
                </div>

                {activas.length > 0 && (
                    <section>
                        <h2 className="text-xs font-medium text-white/50 uppercase tracking-wide mb-3">
                            Activas ({activas.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {activas.map((f) => (
                                <FeatureCard key={f.id} f={f} />
                            ))}
                        </div>
                    </section>
                )}

                {inactivas.length > 0 && (
                    <section>
                        <h2 className="text-xs font-medium text-white/50 uppercase tracking-wide mb-3">
                            Expiradas / esgotadas ({inactivas.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {inactivas.map((f) => (
                                <FeatureCard key={f.id} f={f} inactiva />
                            ))}
                        </div>
                    </section>
                )}

                {features.length === 0 && (
                    <div className="p-12 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                        <Package className="w-12 h-12 text-white/30 mx-auto mb-4" />
                        <h3 className="text-base font-medium text-white mb-2">Ainda sem funcionalidades</h3>
                        <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
                            Explore a loja e active add-ons para expandir as capacidades do ONDAKA — SMS personalizados,
                            pagamentos automáticos, assembleias virtuais e muito mais.
                        </p>
                        <Link
                            href="/funcionalidades"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF] text-black font-medium text-sm hover:bg-[#8FE7FF] transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Ver loja
                        </Link>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

interface StatCardProps {
    label: string;
    valor: number;
    cor?: 'white' | 'emerald' | 'cyan' | 'amber' | 'white/60';
}

function StatCard({ label, valor, cor = 'white' }: StatCardProps) {
    const corClasses: Record<string, string> = {
        white: 'text-white',
        emerald: 'text-emerald-300',
        cyan: 'text-[#00D4FF]',
        amber: 'text-amber-300',
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

interface FeatureCardProps {
    f: Feature;
    inactiva?: boolean;
}

function FeatureCard({ f, inactiva = false }: FeatureCardProps) {
    const Icon = (f.icone && ICON_MAP[f.icone]) ?? Settings;

    const estadoStyles: Record<string, string> = {
        activa: 'bg-emerald-500/15 text-emerald-300',
        pendente: 'bg-amber-500/15 text-amber-300',
        expirada: 'bg-white/10 text-white/60',
        esgotada: 'bg-red-500/15 text-red-300',
        cancelada: 'bg-white/5 text-white/50',
        suspensa: 'bg-white/5 text-white/50',
    };
    const estadoStyle = estadoStyles[f.estado] ?? 'bg-white/10 text-white/70';

    return (
        <Link
            href={`/funcionalidades/${f.slug}`}
            className={`group block p-4 rounded-xl border transition-all ${
                inactiva
                    ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] opacity-70'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
            }`}
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#00D4FF]" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-medium text-white truncate">{f.nome}</h3>
                        <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">{f.categoria_label}</div>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${estadoStyle}`}>
                    {f.estado_label.toUpperCase()}
                </span>
                {f.saldo_baixo && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-medium">
                        SALDO BAIXO
                    </span>
                )}
                {f.recarga_automatica && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/60 font-medium">
                        🔄 RECARGA AUTO
                    </span>
                )}
            </div>

            {f.modelo_cobranca === 'consumable' && f.saldo_inicial > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-baseline justify-between mb-1.5 text-xs">
                        <span className="text-white/60">Saldo</span>
                        <span className="text-white">
                            {f.saldo_actual.toLocaleString('pt-PT')} / {f.saldo_inicial.toLocaleString('pt-PT')}{' '}
                            {f.unidade}
                        </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${
                                f.saldo_baixo ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${100 - f.percentagem_usada}%` }}
                        />
                    </div>
                    <div className="flex items-baseline justify-between mt-1.5 text-[10px] text-white/40">
                        <span>{f.saldo_utilizado.toLocaleString('pt-PT')} utilizados</span>
                        <span>{100 - f.percentagem_usada}% disponível</span>
                    </div>
                </div>
            )}

            {f.expira_em && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/60">Expira em</span>
                    <span className="text-white">{formatData(f.expira_em)}</span>
                </div>
            )}
        </Link>
    );
}
