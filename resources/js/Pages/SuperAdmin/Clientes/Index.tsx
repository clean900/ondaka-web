import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Search, Filter, Building2, User as UserIcon, ChevronRight, Eye } from 'lucide-react';

interface Cliente {
    id: number;
    nome: string;
    tipo_cliente: 'empresa_gestora' | 'admin_independente';
    nif: string;
    documento_tipo: string;
    email_contacto: string;
    telefone: string;
    provincia: string;
    empresa_activa: boolean;
    empresa_created: string;
    subscricao_id: number | null;
    sub_estado: string | null;
    sub_ciclo: string | null;
    sub_num_imoveis: number | null;
    sub_trial_expira: string | null;
    sub_activa_desde: string | null;
    sub_cancelada_em: string | null;
    mrr_kz: number;
    trial_dias_restantes: number | null;
}

interface Filtros {
    busca?: string;
    estado?: string;
    tipo?: string;
    order_by?: string;
    order_dir?: string;
}

interface Props {
    clientes: {
        data: Cliente[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filtros: Filtros;
}

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);

const fmtData = (v: string | null) => {
    if (!v) return '—';
    return new Date(v).toLocaleDateString('pt-PT');
};

export default function Index({ clientes, filtros }: Props) {
    const [busca, setBusca] = useState(filtros.busca || '');
    const [estado, setEstado] = useState(filtros.estado || 'todos');
    const [tipo, setTipo] = useState(filtros.tipo || 'todos');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get('/super-admin/clientes', { busca, estado, tipo }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 400);
        return () => clearTimeout(t);
    }, [busca, estado, tipo]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-100">Clientes B2B</h2>
                    <span className="text-xs text-zinc-500">{clientes.total} {clientes.total === 1 ? 'cliente' : 'clientes'}</span>
                </div>
            }
        >
            <Head title="Clientes B2B" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
                    {/* Filtros */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            {/* Busca */}
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome, NIF ou email..."
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Estado */}
                            <select
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value="todos">Todos os estados</option>
                                <option value="trial">Trial</option>
                                <option value="activa">Activa</option>
                                <option value="limitado">Limitado</option>
                                <option value="cancelada">Cancelada</option>
                                <option value="sem_subscricao">Sem subscrição</option>
                            </select>

                            {/* Tipo */}
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value="todos">Todos os tipos</option>
                                <option value="empresa_gestora">Empresa Gestora</option>
                                <option value="admin_independente">Admin Independente</option>
                            </select>
                        </div>
                    </div>

                    {/* Tabela */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                        {clientes.data.length === 0 ? (
                            <div className="p-12 text-center text-sm text-zinc-500">
                                Nenhum cliente encontrado com estes filtros.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-zinc-800 bg-zinc-900/50">
                                        <tr className="text-xs uppercase tracking-wider text-zinc-500">
                                            <th className="px-4 py-3 text-left">Cliente</th>
                                            <th className="px-4 py-3 text-left">Tipo</th>
                                            <th className="px-4 py-3 text-left">Plano</th>
                                            <th className="px-4 py-3 text-right">Imóveis</th>
                                            <th className="px-4 py-3 text-right">MRR</th>
                                            <th className="px-4 py-3 text-left">Estado</th>
                                            <th className="px-4 py-3 text-left">Trial / Desde</th>
                                            <th className="px-4 py-3 text-right">Acção</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800 text-sm">
                                        {clientes.data.map((c) => (
                                            <tr key={c.id} className="hover:bg-zinc-800/30 transition">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-zinc-100">{c.nome}</div>
                                                    <div className="text-xs text-zinc-500">{c.documento_tipo} {c.nif}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <TipoBadge tipo={c.tipo_cliente} />
                                                </td>
                                                <td className="px-4 py-3 text-zinc-300">
                                                    {c.sub_ciclo ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right text-zinc-300">
                                                    {c.sub_num_imoveis ?? 0}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-white">
                                                    {fmt(c.mrr_kz)} <span className="text-xs text-zinc-500">Kz</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <EstadoBadge estado={c.sub_estado} />
                                                </td>
                                                <td className="px-4 py-3 text-xs text-zinc-500">
                                                    {c.sub_estado === 'trial' && c.trial_dias_restantes !== null ? (
                                                        <span className={c.trial_dias_restantes <= 7 ? 'text-orange-400' : 'text-zinc-400'}>
                                                            {c.trial_dias_restantes}d restantes
                                                        </span>
                                                    ) : (
                                                        fmtData(c.sub_activa_desde ?? c.empresa_created)
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={`/super-admin/clientes/${c.id}`}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-blue-500 hover:text-white"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        Detalhe
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Paginação */}
                        {clientes.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500">
                                <span>
                                    Mostrando {clientes.from}-{clientes.to} de {clientes.total}
                                </span>
                                <div className="flex gap-2">
                                    {Array.from({ length: clientes.last_page }, (_, i) => i + 1).map((p) => (
                                        <Link
                                            key={p}
                                            href={`/super-admin/clientes?page=${p}&busca=${busca}&estado=${estado}&tipo=${tipo}`}
                                            className={`rounded px-2.5 py-1 ${
                                                p === clientes.current_page
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                            }`}
                                        >
                                            {p}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function TipoBadge({ tipo }: { tipo: string }) {
    if (tipo === 'admin_independente') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                <UserIcon className="h-3 w-3" />
                Admin
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
            <Building2 className="h-3 w-3" />
            Empresa
        </span>
    );
}

function EstadoBadge({ estado }: { estado: string | null }) {
    if (!estado) {
        return <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">Sem subscrição</span>;
    }
    const config: Record<string, { color: string; label: string }> = {
        trial: { color: 'bg-yellow-500/20 text-yellow-300', label: '● Trial' },
        activa: { color: 'bg-green-500/20 text-green-300', label: '● Activa' },
        limitado: { color: 'bg-orange-500/20 text-orange-300', label: '● Limitado' },
        cancelada: { color: 'bg-red-500/20 text-red-300', label: '● Cancelada' },
    };
    const c = config[estado] ?? { color: 'bg-zinc-700 text-zinc-300', label: estado };
    return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.color}`}>{c.label}</span>;
}
