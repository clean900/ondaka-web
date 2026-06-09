import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    DollarSign,
    Users,
    Building2,
    TrendingDown,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Receipt,
} from 'lucide-react';

interface Kpis {
    mrr_kz: number;
    arr_kz: number;
    clientes_activos: number;
    novos_este_mes: number;
    imoveis_total: number;
    imoveis_media_por_cliente: number;
    churn_rate_30d: number;
    cancelamentos_30d: number;
}

interface Pipeline {
    trial: number;
    activa: number;
    limitado: number;
    cancelada: number;
}

interface Escalao {
    nome: string;
    imoveis_min: number;
    imoveis_max: number | null;
    desconto_pct: number;
    num_clientes: number;
    mrr_kz: number;
    mrr_pct: number;
}

interface ClienteRecente {
    id: number;
    empresa_id: number;
    empresa_nome: string;
    tipo_cliente: 'empresa_gestora' | 'admin_independente';
    nif: string | null;
    estado: string;
    ciclo: string;
    num_imoveis: number;
    mrr_estimado_kz: number;
    desde: string;
}

interface Props {
    dados: {
        kpis: Kpis;
        pipeline: Pipeline;
        receita_por_escalao: Escalao[];
        clientes_recentes: ClienteRecente[];
        gerado_em: string;
    };
}

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const fmtData = (v: string) => {
    if (!v) return '—';
    return new Date(v).toLocaleDateString('pt-PT');
};

export default function Index({ dados }: Props) {
    const { kpis, pipeline, receita_por_escalao, clientes_recentes } = dados;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-100">
                        📊 Dashboard Super-Admin
                    </h2>
                    <span className="text-xs text-zinc-500">Soluções Simples · {new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}</span>
                </div>
            }
        >
            <Head title="Dashboard Super-Admin" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* KPIs principais */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-purple-900/20 to-zinc-900 p-5">
                            <div className="mb-1 flex items-center justify-between">
                                <div className="text-xs uppercase tracking-wider text-purple-300">MRR (Receita Recorrente Mensal)</div>
                                <DollarSign className="h-5 w-5 text-purple-400" />
                            </div>
                            <div className="text-3xl font-bold text-white">{fmt(kpis.mrr_kz)} Kz</div>
                            <div className="mt-1 text-xs text-zinc-400">ARR: {fmt(kpis.arr_kz)} Kz</div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                            <div className="mb-1 flex items-center justify-between">
                                <div className="text-xs uppercase tracking-wider text-zinc-500">Clientes B2B activos</div>
                                <Users className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div className="text-3xl font-bold text-white">{kpis.clientes_activos}</div>
                            <div className="mt-1 text-xs text-cyan-400">+{kpis.novos_este_mes} este mês</div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                            <div className="mb-1 flex items-center justify-between">
                                <div className="text-xs uppercase tracking-wider text-zinc-500">Imóveis sob gestão</div>
                                <Building2 className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="text-3xl font-bold text-white">{kpis.imoveis_total}</div>
                            <div className="mt-1 text-xs text-zinc-500">~{kpis.imoveis_media_por_cliente} por cliente</div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                            <div className="mb-1 flex items-center justify-between">
                                <div className="text-xs uppercase tracking-wider text-zinc-500">Churn (30 dias)</div>
                                <TrendingDown className={`h-5 w-5 ${kpis.churn_rate_30d > 5 ? 'text-red-400' : 'text-yellow-400'}`} />
                            </div>
                            <div className={`text-3xl font-bold ${kpis.churn_rate_30d > 5 ? 'text-red-400' : 'text-yellow-400'}`}>
                                {kpis.churn_rate_30d}%
                            </div>
                            <div className="mt-1 text-xs text-zinc-500">{kpis.cancelamentos_30d} cancelamento(s)</div>
                        </div>
                    </div>

                    {/* Pipeline + Receita por escalão */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Pipeline */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-semibold">Pipeline</h3>
                                <span className="text-xs text-zinc-500">Estado actual</span>
                            </div>
                            <div className="space-y-3">
                                <PipelineRow icon={<Clock className="h-4 w-4 text-yellow-400" />} label="Em trial" value={pipeline.trial} colorClass="text-yellow-400" />
                                <PipelineRow icon={<CheckCircle2 className="h-4 w-4 text-green-400" />} label="Activos pagantes" value={pipeline.activa} colorClass="text-green-400" />
                                <PipelineRow icon={<AlertTriangle className="h-4 w-4 text-orange-400" />} label="Modo limitado" value={pipeline.limitado} colorClass="text-orange-400" />
                                <PipelineRow icon={<XCircle className="h-4 w-4 text-red-400" />} label="Cancelados" value={pipeline.cancelada} colorClass="text-red-400" />
                            </div>
                        </div>

                        {/* Receita por escalão */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-semibold">Receita por escalão</h3>
                                <span className="text-xs text-zinc-500">MRR equivalente</span>
                            </div>
                            <div className="space-y-3">
                                {receita_por_escalao.map((e) => (
                                    <div key={e.nome}>
                                        <div className="mb-1 flex justify-between text-sm">
                                            <span className="text-zinc-400">
                                                {e.nome} <span className="text-xs text-zinc-600">({e.num_clientes} {e.num_clientes === 1 ? 'cliente' : 'clientes'})</span>
                                            </span>
                                            <span className="font-medium text-zinc-200">{fmt(e.mrr_kz)} Kz</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-zinc-800">
                                            <div
                                                className={`h-2 rounded-full ${e.mrr_pct > 0 ? 'bg-gradient-to-r from-cyan-500 to-purple-600' : 'bg-zinc-700'}`}
                                                style={{ width: `${Math.max(e.mrr_pct, 2)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Clientes recentes */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900">
                        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
                            <h3 className="font-semibold">Clientes B2B recentes</h3>
                            <a href="/super-admin/facturas-plataforma" className="text-xs text-cyan-400 hover:underline">
                                Ver facturas →
                            </a>
                        </div>
                        {clientes_recentes.length === 0 ? (
                            <div className="p-12 text-center text-sm text-zinc-500">Sem clientes ainda.</div>
                        ) : (
                            <table className="w-full">
                                <thead className="border-b border-zinc-800">
                                    <tr className="text-xs uppercase tracking-wider text-zinc-500">
                                        <th className="px-4 py-3 text-left">Cliente</th>
                                        <th className="px-4 py-3 text-left">Tipo</th>
                                        <th className="px-4 py-3 text-left">Plano</th>
                                        <th className="px-4 py-3 text-left">Imóveis</th>
                                        <th className="px-4 py-3 text-left">MRR</th>
                                        <th className="px-4 py-3 text-left">Estado</th>
                                        <th className="px-4 py-3 text-left">Desde</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800 text-sm">
                                    {clientes_recentes.map((c) => (
                                        <tr key={c.id} className="hover:bg-zinc-800/30">
                                            <td className="px-4 py-3 font-medium text-zinc-100">{c.empresa_nome}</td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded px-2 py-0.5 text-xs ${c.tipo_cliente === 'admin_independente' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                                    {c.tipo_cliente === 'admin_independente' ? '👤 Admin' : '🏢 Empresa'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-zinc-300">{c.ciclo}</td>
                                            <td className="px-4 py-3 text-zinc-300">{c.num_imoveis}</td>
                                            <td className="px-4 py-3 font-medium text-white">{fmt(c.mrr_estimado_kz)} Kz</td>
                                            <td className="px-4 py-3">
                                                <EstadoBadge estado={c.estado} />
                                            </td>
                                            <td className="px-4 py-3 text-xs text-zinc-500">{fmtData(c.desde)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function PipelineRow({ icon, label, value, colorClass }: { icon: React.ReactNode; label: string; value: number; colorClass: string }) {
    return (
        <div className="flex items-center justify-between rounded-lg bg-zinc-800/30 p-3">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm text-zinc-300">{label}</span>
            </div>
            <span className={`text-lg font-bold ${colorClass}`}>{value}</span>
        </div>
    );
}

function EstadoBadge({ estado }: { estado: string }) {
    const config: Record<string, { color: string; label: string }> = {
        trial: { color: 'bg-yellow-500/20 text-yellow-300', label: '● Trial' },
        activa: { color: 'bg-green-500/20 text-green-300', label: '● Activa' },
        limitado: { color: 'bg-orange-500/20 text-orange-300', label: '● Limitado' },
        cancelada: { color: 'bg-red-500/20 text-red-300', label: '● Cancelada' },
    };
    const c = config[estado] ?? { color: 'bg-zinc-700 text-zinc-300', label: estado };
    return <span className={`rounded-full px-2 py-0.5 text-xs ${c.color}`}>{c.label}</span>;
}
