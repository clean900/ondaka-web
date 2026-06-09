import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Users,
    TriangleAlert,
    Clock,
    CircleCheck,
    TrendingUp,
    CircleX,
    Archive,
    ChevronRight,
} from 'lucide-react';

function formatDataRelativa(iso: string | null): string {
    if (!iso) return '—';
    const data = new Date(iso);
    const agora = new Date();
    const dias = Math.round((data.getTime() - agora.getTime()) / 86_400_000);
    const dataFormatada = new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'short',
    }).format(data);

    if (dias < -1) return `${dataFormatada} (há ${Math.abs(dias)}d)`;
    if (dias === 0) return `${dataFormatada} (hoje)`;
    if (dias === 1) return `${dataFormatada} (amanhã)`;
    if (dias > 0) return `${dataFormatada} (em ${dias}d)`;
    return dataFormatada;
}

type EstadoSubscricao =
    | 'trial'
    | 'grace'
    | 'activa'
    | 'em_atraso'
    | 'suspensa'
    | 'cancelada'
    | 'arquivada';

interface Empresa {
    nome: string | null;
    nif: string | null;
}

interface Subscricao {
    id: number;
    empresa: Empresa;
    estado: EstadoSubscricao;
    estado_label: string;
    ciclo_label: string;
    trial_expira_em: string | null;
    grace_expira_em: string | null;
    periodo_actual_fim: string | null;
    preco_customizado_por_fraccao: number | null;
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
    trial: number;
    grace: number;
    activa: number;
    em_atraso: number;
    suspensa: number;
    cancelada: number;
}

interface Props {
    subscricoes: Paginator<Subscricao>;
    filtro_estado: string | null;
    contadores: Contadores;
}

function EstadoBadge({ estado, label }: { estado: EstadoSubscricao; label: string }) {
    const estilos: Record<EstadoSubscricao, string> = {
        trial: 'bg-[#00D4FF]/15 text-[#8FE7FF]',
        grace: 'bg-[#EC4899]/15 text-[#FDA4CF]',
        activa: 'bg-emerald-500/15 text-emerald-300',
        em_atraso: 'bg-amber-500/15 text-amber-300',
        suspensa: 'bg-red-500/15 text-red-300',
        cancelada: 'bg-white/10 text-white/70',
        arquivada: 'bg-white/5 text-white/50',
    };
    const estilo = estilos[estado] ?? 'bg-white/10 text-white/70';
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${estilo}`}>
            {label}
        </span>
    );
}

export default function AdminSubscricoesIndex({ subscricoes, filtro_estado, contadores }: Props) {
    const aplicarFiltro = (estado: string | null) => {
        router.get('/admin/subscricoes', estado ? { estado } : {}, { preserveState: false });
    };

    const filtros = [
        { key: null as string | null, label: 'Todas', valor: contadores.total, icon: Users, cor: 'text-white' },
        { key: 'trial', label: 'Em trial', valor: contadores.trial, icon: Clock, cor: 'text-[#8FE7FF]' },
        {
            key: 'grace',
            label: 'Em grace',
            valor: contadores.grace,
            icon: TriangleAlert,
            cor: 'text-[#FDA4CF]',
        },
        {
            key: 'activa',
            label: 'Activas',
            valor: contadores.activa,
            icon: CircleCheck,
            cor: 'text-emerald-300',
        },
        {
            key: 'em_atraso',
            label: 'Em atraso',
            valor: contadores.em_atraso,
            icon: TrendingUp,
            cor: 'text-amber-300',
        },
        {
            key: 'suspensa',
            label: 'Suspensas',
            valor: contadores.suspensa,
            icon: CircleX,
            cor: 'text-red-300',
        },
        {
            key: 'cancelada',
            label: 'Canceladas',
            valor: contadores.cancelada,
            icon: Archive,
            cor: 'text-white/60',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Subscrições" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight">Subscrições</h1>
                    <p className="text-sm text-white/60 mt-1">
                        Painel de administração — todas as empresas clientes
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {filtros.map((f) => {
                        const Icon = f.icon;
                        const activo =
                            filtro_estado === f.key || (filtro_estado === null && f.key === null);
                        return (
                            <button
                                key={f.label}
                                onClick={() => aplicarFiltro(f.key)}
                                className={`p-4 rounded-xl border text-left transition-all ${
                                    activo
                                        ? 'bg-white/10 border-white/20'
                                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Icon className={`w-4 h-4 ${f.cor}`} />
                                </div>
                                <div className={`text-2xl font-semibold ${f.cor}`}>{f.valor}</div>
                                <div className="text-[11px] text-white/50 mt-0.5">{f.label}</div>
                            </button>
                        );
                    })}
                </div>

                <div className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-white/[0.02] border-b border-white/10">
                                <tr className="text-left text-[11px] uppercase tracking-wide text-white/50">
                                    <th className="px-4 py-3 font-medium">Empresa</th>
                                    <th className="px-4 py-3 font-medium">Estado</th>
                                    <th className="px-4 py-3 font-medium">Ciclo</th>
                                    <th className="px-4 py-3 font-medium">Data crítica</th>
                                    <th className="px-4 py-3 font-medium">Preço</th>
                                    <th className="px-4 py-3 font-medium w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscricoes.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-white/50">
                                            Nenhuma subscrição encontrada.
                                        </td>
                                    </tr>
                                )}
                                {subscricoes.data.map((sub) => {
                                    const dataCritica =
                                        sub.estado === 'trial'
                                            ? sub.trial_expira_em
                                            : sub.estado === 'grace'
                                              ? sub.grace_expira_em
                                              : sub.periodo_actual_fim;
                                    return (
                                        <tr
                                            key={sub.id}
                                            className="border-b border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer"
                                            onClick={() => router.get(`/admin/subscricoes/${sub.id}`)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-white">
                                                    {sub.empresa.nome ?? '—'}
                                                </div>
                                                {sub.empresa.nif && (
                                                    <div className="text-[11px] text-white/50 font-mono mt-0.5">
                                                        NIF {sub.empresa.nif}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <EstadoBadge estado={sub.estado} label={sub.estado_label} />
                                            </td>
                                            <td className="px-4 py-3 text-white/80">{sub.ciclo_label}</td>
                                            <td className="px-4 py-3 text-white/70">
                                                {formatDataRelativa(dataCritica)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {sub.preco_customizado_por_fraccao ? (
                                                    <span className="text-[#8FE7FF]">Customizado</span>
                                                ) : (
                                                    <span className="text-white/60">Tabela</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <ChevronRight className="w-4 h-4 text-white/30" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {subscricoes.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-sm">
                            <div className="text-white/60">
                                {subscricoes.from}–{subscricoes.to} de {subscricoes.total}
                            </div>
                            <div className="flex gap-1">
                                {subscricoes.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        className={`px-3 py-1 rounded text-xs ${
                                            link.active
                                                ? 'bg-white/15 text-white'
                                                : link.url
                                                  ? 'text-white/70 hover:bg-white/10'
                                                  : 'text-white/30 cursor-not-allowed'
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
