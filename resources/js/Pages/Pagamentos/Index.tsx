import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    DollarSign, Clock, CheckCircle2, TrendingUp, Search, Filter,
    Receipt, Building2, User as UserIcon, Calendar,
} from 'lucide-react';
import { useState, FormEventHandler } from 'react';

interface Fraccao { id: number; identificador: string; }
interface Condomino { id: number; nome_completo: string; }
interface Condominio { id: number; nome: string; }

interface Pagamento {
    id: number;
    referencia: string;
    metodo: string;
    valor: string;
    data_pagamento: string;
    estado: 'pendente' | 'em_revisao' | 'confirmado' | 'rejeitado' | 'devolvido';
    created_at: string;
    fraccao: Fraccao | null;
    condomino: Condomino | null;
    condominio: Condominio | null;
}

interface Paginacao<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    total: number;
}

interface Stats {
    pendentes: number;
    em_revisao: number;
    confirmados_mes: number;
    valor_confirmado_mes: string;
}

interface Filtros {
    estado: string | null;
    fraccao_id: string | null;
    condominio_id: string | null;
    q: string | null;
}

interface Props {
    pagamentos: Paginacao<Pagamento>;
    stats: Stats;
    filtros: Filtros;
}

const formatarKz = (valor: string | number): string => {
    const n = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'AOA',
        currencyDisplay: 'narrowSymbol',
    }).format(n).replace('AOA', 'Kz');
};

const formatarData = (data: string): string => {
    return new Date(data).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const metodoLabel: Record<string, string> = {
    transferencia_bancaria: 'Transferência',
    deposito_bancario: 'Depósito',
    proxypay_rps: 'Multicaixa',
    dinheiro: 'Dinheiro',
    outro: 'Outro',
};

const estadoStyle: Record<string, { bg: string; text: string; label: string }> = {
    pendente: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Pendente' },
    em_revisao: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Em revisão' },
    confirmado: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Confirmado' },
    rejeitado: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Rejeitado' },
    devolvido: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Devolvido' },
};

export default function Index({ pagamentos, stats, filtros }: Props) {
    const [search, setSearch] = useState(filtros.q || '');
    const [estado, setEstado] = useState(filtros.estado || '');

    const handleFiltrar: FormEventHandler = (e) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (search) params.q = search;
        if (estado) params.estado = estado;
        router.get(route('pagamentos.index'), params, { preserveState: true });
    };

    const handleLimpar = () => {
        setSearch('');
        setEstado('');
        router.get(route('pagamentos.index'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pagamentos" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-white">Pagamentos</h1>
                        <p className="text-sm text-zinc-400 mt-1">Validar pagamentos submetidos pelos condóminos</p>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            icon={<Clock size={18} />}
                            label="Pendentes"
                            value={stats.pendentes.toString()}
                            color="amber"
                            onClick={() => { setEstado('pendente'); router.get(route('pagamentos.index'), { estado: 'pendente' }); }}
                            highlighted
                        />
                        <StatCard
                            icon={<Receipt size={18} />}
                            label="Em revisão"
                            value={stats.em_revisao.toString()}
                            color="blue"
                            onClick={() => { setEstado('em_revisao'); router.get(route('pagamentos.index'), { estado: 'em_revisao' }); }}
                        />
                        <StatCard
                            icon={<CheckCircle2 size={18} />}
                            label="Confirmados (mês)"
                            value={stats.confirmados_mes.toString()}
                            color="emerald"
                        />
                        <StatCard
                            icon={<TrendingUp size={18} />}
                            label="Total recebido (mês)"
                            value={formatarKz(stats.valor_confirmado_mes)}
                            color="cyan"
                        />
                    </div>

                    {/* Filtros */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
                        <form onSubmit={handleFiltrar} className="flex flex-wrap gap-3 items-center">
                            <div className="flex-1 min-w-[200px] relative">
                                <Search size={16} className="absolute left-3 top-3 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar por referência ou condómino..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                            <select
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                            >
                                <option value="">Todos os estados</option>
                                <option value="pendente">Pendente</option>
                                <option value="em_revisao">Em revisão</option>
                                <option value="confirmado">Confirmado</option>
                                <option value="rejeitado">Rejeitado</option>
                            </select>
                            <button
                                type="submit"
                                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                            >
                                <Filter size={14} /> Filtrar
                            </button>
                            {(search || estado) && (
                                <button
                                    type="button"
                                    onClick={handleLimpar}
                                    className="text-zinc-400 hover:text-white px-3 py-2 text-sm"
                                >
                                    Limpar
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Lista */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        {pagamentos.data.length === 0 ? (
                            <div className="p-12 text-center text-zinc-500">
                                <Receipt size={48} className="mx-auto mb-4 opacity-30" />
                                <p>Sem pagamentos com estes filtros.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-800">
                                {pagamentos.data.map((p) => (
                                    <Link
                                        key={p.id}
                                        href={route('pagamentos.show', p.id)}
                                        className="block hover:bg-zinc-800/50 transition-colors p-4"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-bold text-white">{p.referencia}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${estadoStyle[p.estado]?.bg} ${estadoStyle[p.estado]?.text}`}>
                                                        {estadoStyle[p.estado]?.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <UserIcon size={12} /> {p.condomino?.nome_completo || '—'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Building2 size={12} /> {p.condominio?.nome} · Fracção {p.fraccao?.identificador}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} /> {formatarData(p.data_pagamento)}
                                                    </span>
                                                    <span>{metodoLabel[p.metodo] || p.metodo}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-white">{formatarKz(p.valor)}</div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Paginação */}
                        {pagamentos.last_page > 1 && (
                            <div className="border-t border-zinc-800 px-4 py-3 flex items-center justify-between">
                                <span className="text-xs text-zinc-500">
                                    Página {pagamentos.current_page} de {pagamentos.last_page} ({pagamentos.total} pagamentos)
                                </span>
                                <div className="flex gap-1">
                                    {pagamentos.links.map((link, i) => (
                                        <button
                                            key={i}
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            className={`px-3 py-1 rounded text-xs ${link.active ? 'bg-cyan-500 text-white' : 'text-zinc-400 hover:text-white disabled:opacity-30'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
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

function StatCard({
    icon, label, value, color, onClick, highlighted,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: 'amber' | 'blue' | 'emerald' | 'cyan';
    onClick?: () => void;
    highlighted?: boolean;
}) {
    const colors = {
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    };

    const Component = onClick ? 'button' : 'div';
    return (
        <Component
            onClick={onClick}
            className={`text-left bg-zinc-900 border ${highlighted ? colors[color].split(' ')[2] : 'border-zinc-800'} rounded-xl p-4 ${onClick ? 'hover:bg-zinc-800/50 transition-colors cursor-pointer' : ''}`}
        >
            <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded ${colors[color]}`}>{icon}</div>
                <span className="text-xs text-zinc-400 font-semibold">{label}</span>
            </div>
            <div className="text-xl font-bold text-white">{value}</div>
        </Component>
    );
}
