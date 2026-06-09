import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Package,
    TriangleAlert,
    CircleCheck,
    Clock,
    Pause,
    Archive,
    Plus,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

function formatData(iso: string | null): string {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(iso));
}

function formatMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-PT').format(valor) + ' Kz';
}

type EstadoSubscription =
    | 'activa'
    | 'pendente'
    | 'suspensa'
    | 'expirada'
    | 'esgotada'
    | 'cancelada';

interface Feature {
    slug?: string;
    nome: string;
    categoria_label: string;
    modelo_cobranca: 'subscription' | 'consumable' | 'one_time';
    unidade: string;
}

interface Owner {
    nome: string;
    tipo: 'empresa' | 'condominio';
}

interface Subscription {
    id: number;
    feature: Feature;
    owner: Owner;
    estado: EstadoSubscription;
    estado_label: string;
    saldo_baixo: boolean;
    saldo_actual: number;
    saldo_inicial: number;
    expira_em: string | null;
    valor_pago_total: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginator<T> {
    data: T[];
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: PaginationLink[];
}

interface Contadores {
    total: number;
    activa: number;
    pendente: number;
    saldo_baixo: number;
    suspensa: number;
    expirada: number;
    cancelada: number;
}

interface FeatureDropdown {
    slug: string;
    nome: string;
}

interface Filtros {
    estado?: string;
    feature?: string;
    tipo_owner?: string;
}

interface Props {
    subscriptions: Paginator<Subscription>;
    contadores: Contadores;
    features_dropdown: FeatureDropdown[];
    filtros: Filtros;
}

function EstadoBadge({ estado, label }: { estado: EstadoSubscription; label: string }) {
    const estilos: Record<EstadoSubscription, string> = {
        activa: 'bg-emerald-500/15 text-emerald-300',
        pendente: 'bg-amber-500/15 text-amber-300',
        suspensa: 'bg-white/10 text-white/60',
        expirada: 'bg-white/10 text-white/60',
        esgotada: 'bg-red-500/15 text-red-300',
        cancelada: 'bg-white/5 text-white/50',
    };
    const estilo = estilos[estado] ?? 'bg-white/10 text-white/70';
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${estilo}`}>
            {label}
        </span>
    );
}

export default function AdminFeaturesIndex({
    subscriptions,
    contadores,
    features_dropdown,
    filtros,
}: Props) {
    const [estado, setEstado] = useState(filtros.estado ?? '');
    const [feature, setFeature] = useState(filtros.feature ?? '');
    const [tipoOwner, setTipoOwner] = useState(filtros.tipo_owner ?? '');

    const aplicarFiltros = () => {
        router.get(
            '/admin/features',
            {
                estado: estado || undefined,
                feature: feature || undefined,
                tipo_owner: tipoOwner || undefined,
            },
            { preserveState: true },
        );
    };

    const limparFiltros = () => {
        setEstado('');
        setFeature('');
        setTipoOwner('');
        router.get('/admin/features');
    };

    const statCards = [
        { label: 'Total', valor: contadores.total, icon: Package, cor: 'text-white' },
        { label: 'Activas', valor: contadores.activa, icon: CircleCheck, cor: 'text-emerald-300' },
        { label: 'Pendentes', valor: contadores.pendente, icon: Clock, cor: 'text-amber-300' },
        {
            label: 'Saldo baixo',
            valor: contadores.saldo_baixo,
            icon: TriangleAlert,
            cor: contadores.saldo_baixo > 0 ? 'text-amber-300' : 'text-white/60',
        },
        { label: 'Suspensas', valor: contadores.suspensa, icon: Pause, cor: 'text-white/60' },
        { label: 'Expiradas', valor: contadores.expirada, icon: Clock, cor: 'text-white/60' },
        { label: 'Canceladas', valor: contadores.cancelada, icon: Archive, cor: 'text-white/60' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Admin — Features" />

            <div className="max-w-6xl mx-auto space-y-6 pt-2">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight">Admin · Features</h1>
                        <p className="text-sm text-white/60 mt-1">
                            Gerir todas as subscriptions de features do sistema
                        </p>
                    </div>

                    <Link
                        href="/admin/features/nova"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00D4FF] text-black text-sm font-medium hover:bg-[#8FE7FF] transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Activar feature
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.label}
                                className="p-4 rounded-xl bg-white/[0.03] border border-white/10"
                            >
                                <Icon className={`w-4 h-4 ${card.cor} mb-2`} />
                                <div className={`text-2xl font-semibold ${card.cor}`}>{card.valor}</div>
                                <div className="text-[11px] text-white/50 mt-0.5">{card.label}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs text-white/60 mb-1">Estado</label>
                            <select
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                            >
                                <option value="">Todos</option>
                                <option value="activa">Activa</option>
                                <option value="pendente">Pendente</option>
                                <option value="suspensa">Suspensa</option>
                                <option value="expirada">Expirada</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-white/60 mb-1">Feature</label>
                            <select
                                value={feature}
                                onChange={(e) => setFeature(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                            >
                                <option value="">Todas</option>
                                {features_dropdown.map((f) => (
                                    <option key={f.slug} value={f.slug}>
                                        {f.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-white/60 mb-1">Tipo owner</label>
                            <select
                                value={tipoOwner}
                                onChange={(e) => setTipoOwner(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                            >
                                <option value="">Ambos</option>
                                <option value="empresa">Empresa</option>
                                <option value="condominio">Condomínio</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={aplicarFiltros}
                                className="flex-1 px-3 py-2 rounded-lg bg-[#00D4FF] text-black text-sm font-medium hover:bg-[#8FE7FF]"
                            >
                                Filtrar
                            </button>
                            <button
                                onClick={limparFiltros}
                                className="px-3 py-2 rounded-lg bg-white/5 text-white/70 text-sm hover:bg-white/10"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-white/[0.02] border-b border-white/10">
                                <tr className="text-left text-[11px] uppercase tracking-wide text-white/50">
                                    <th className="px-4 py-3 font-medium">#</th>
                                    <th className="px-4 py-3 font-medium">Feature</th>
                                    <th className="px-4 py-3 font-medium">Owner</th>
                                    <th className="px-4 py-3 font-medium">Estado</th>
                                    <th className="px-4 py-3 font-medium">Saldo / Expira</th>
                                    <th className="px-4 py-3 font-medium">Valor pago</th>
                                    <th className="px-4 py-3 font-medium w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-white/50">
                                            Nenhuma subscription encontrada.
                                        </td>
                                    </tr>
                                )}
                                {subscriptions.data.map((sub) => (
                                    <tr
                                        key={sub.id}
                                        className="border-b border-white/5 hover:bg-white/[0.04] cursor-pointer"
                                        onClick={() => router.get(`/admin/features/${sub.id}`)}
                                    >
                                        <td className="px-4 py-3 text-white/60 font-mono text-xs">#{sub.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-white">{sub.feature.nome}</div>
                                            <div className="text-[11px] text-white/50">
                                                {sub.feature.categoria_label}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-white/90">{sub.owner.nome}</div>
                                            <div className="text-[11px] text-white/50 capitalize">
                                                {sub.owner.tipo}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <EstadoBadge estado={sub.estado} label={sub.estado_label} />
                                            {sub.saldo_baixo && (
                                                <div className="mt-1">
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-medium">
                                                        SALDO BAIXO
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-white/80 text-xs">
                                            {sub.feature.modelo_cobranca === 'consumable' ? (
                                                <>
                                                    {sub.saldo_actual.toLocaleString('pt-PT')} /{' '}
                                                    {sub.saldo_inicial.toLocaleString('pt-PT')}
                                                    <span className="text-white/40 ml-1">
                                                        {sub.feature.unidade}
                                                    </span>
                                                </>
                                            ) : sub.expira_em ? (
                                                formatData(sub.expira_em)
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-white/80">
                                            {formatMoeda(sub.valor_pago_total)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <ChevronRight className="w-4 h-4 text-white/30" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {subscriptions.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-sm">
                            <div className="text-white/60">
                                {subscriptions.from}–{subscriptions.to} de {subscriptions.total}
                            </div>
                            <div className="flex gap-1">
                                {subscriptions.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        className={`px-3 py-1 rounded text-xs ${
                                            link.active
                                                ? 'bg-white/15 text-white'
                                                : link.url
                                                  ? 'text-white/70 hover:bg-white/10'
                                                  : 'text-white/30'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
