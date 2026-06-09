import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Receipt,
    Search,
    Clock,
    CircleAlert,
    CircleCheck,
    CircleX,
    Ban,
    FileCheck,
    DollarSign,
} from 'lucide-react';
import { useState, KeyboardEvent } from 'react';

function formatMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(valor) + ' Kz';
}

interface Owner {
    nome: string;
}

interface Ordem {
    id: number;
    numero: string;
    owner: Owner;
    descricao_item: string;
    valor_total: number;
    estado: string;
    estado_label: string;
    created_at: string;
    pagamentos_pendentes: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginator<T> {
    data: T[];
    last_page: number;
    links: PaginationLink[];
}

interface Contadores {
    total: number;
    pendentes: number;
    aprovadas: number;
    comprovativos_a_validar: number;
    valor_aprovado_total: number;
}

interface Filtros {
    busca?: string;
    estado?: string;
    apenas_pendentes?: boolean;
}

interface Props {
    ordens: Paginator<Ordem>;
    contadores: Contadores;
    filtros: Filtros;
}

const ESTADO_STYLES: Record<string, string> = {
    pendente: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    em_revisao: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    aprovada: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    rejeitada: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    cancelada: 'bg-zinc-700/30 border-zinc-700 text-zinc-400',
    expirada: 'bg-zinc-700/30 border-zinc-700 text-zinc-400',
};

const ESTADO_ICONS: Record<string, typeof Clock> = {
    pendente: Clock,
    em_revisao: CircleAlert,
    aprovada: CircleCheck,
    rejeitada: CircleX,
    cancelada: Ban,
    expirada: Clock,
};

export default function AdminOrdensIndex({ ordens, contadores, filtros }: Props) {
    const [busca, setBusca] = useState(filtros.busca ?? '');
    const [estado, setEstado] = useState(filtros.estado ?? '');

    const navegar = (novoEstado?: string, novaBusca?: string, apenasPendentes?: boolean) => {
        router.get(
            route('admin.ordens.index'),
            {
                estado: novoEstado ?? estado ?? undefined,
                busca: novaBusca ?? busca ?? undefined,
                apenas_pendentes: apenasPendentes ? '1' : undefined,
            },
            { preserveState: true },
        );
    };

    const handleBuscaKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navegar(undefined, busca);
        }
    };

    const limparFiltros = () => {
        setBusca('');
        setEstado('');
        router.get(route('admin.ordens.index'));
    };

    const temFiltros = busca || estado || filtros.apenas_pendentes;

    return (
        <AuthenticatedLayout>
            <Head title="Admin — Ordens de compra" />

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-100">Ordens de compra</h1>
                        <p className="text-sm text-zinc-500">Gestão e aprovação de compras</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 uppercase tracking-wide">Total</div>
                        <div className="text-2xl font-semibold text-zinc-100 mt-1">{contadores.total}</div>
                    </div>

                    <button
                        onClick={() => navegar('', undefined, true)}
                        className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-4 text-left hover:bg-amber-500/10 transition"
                    >
                        <div className="text-xs text-amber-400/80 uppercase tracking-wide flex items-center gap-1">
                            <CircleAlert className="h-3 w-3" /> Pendentes
                        </div>
                        <div className="text-2xl font-semibold text-amber-300 mt-1">{contadores.pendentes}</div>
                    </button>

                    <button
                        onClick={() => navegar('aprovada')}
                        className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4 text-left hover:bg-emerald-500/10 transition"
                    >
                        <div className="text-xs text-emerald-400/80 uppercase tracking-wide">Aprovadas</div>
                        <div className="text-2xl font-semibold text-emerald-300 mt-1">{contadores.aprovadas}</div>
                    </button>

                    <div className="bg-cyan-500/5 border border-cyan-500/30 rounded-xl p-4">
                        <div className="text-xs text-cyan-400/80 uppercase tracking-wide flex items-center gap-1">
                            <FileCheck className="h-3 w-3" /> Por validar
                        </div>
                        <div className="text-2xl font-semibold text-cyan-300 mt-1">
                            {contadores.comprovativos_a_validar}
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 col-span-2 md:col-span-1">
                        <div className="text-xs text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Valor aprovado
                        </div>
                        <div className="text-lg font-semibold text-zinc-100 mt-1">
                            {formatMoeda(contadores.valor_aprovado_total)}
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-zinc-500" />
                        <input
                            type="text"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            onKeyDown={handleBuscaKeyDown}
                            placeholder="Pesquisar por número ou descrição..."
                            className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-600 pl-9 pr-3 py-2"
                        />
                    </div>

                    <select
                        value={estado}
                        onChange={(e) => {
                            setEstado(e.target.value);
                            navegar(e.target.value);
                        }}
                        className="rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2"
                    >
                        <option value="">Todos os estados</option>
                        <option value="pendente">Pendente</option>
                        <option value="em_revisao">Em análise</option>
                        <option value="aprovada">Aprovada</option>
                        <option value="rejeitada">Rejeitada</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="expirada">Expirada</option>
                    </select>

                    {temFiltros && (
                        <button
                            onClick={limparFiltros}
                            className="rounded-lg border border-zinc-800 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 px-3 py-2"
                        >
                            Limpar
                        </button>
                    )}
                </div>

                {ordens.data.length === 0 ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
                        <Receipt className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                        <p className="text-sm text-zinc-500">Nenhuma ordem encontrada com estes filtros.</p>
                    </div>
                ) : (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-950/40 text-xs uppercase tracking-wide text-zinc-500">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Número</th>
                                    <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                    <th className="px-4 py-3 text-left font-medium">Item</th>
                                    <th className="px-4 py-3 text-right font-medium">Valor</th>
                                    <th className="px-4 py-3 text-left font-medium">Estado</th>
                                    <th className="px-4 py-3 text-left font-medium">Criada</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {ordens.data.map((ordem) => {
                                    const Icon = ESTADO_ICONS[ordem.estado] ?? Receipt;
                                    return (
                                        <tr key={ordem.id} className="hover:bg-zinc-800/30 transition">
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={route('admin.ordens.show', ordem.id)}
                                                    className="font-mono text-xs text-zinc-200 hover:text-cyan-300"
                                                >
                                                    {ordem.numero}
                                                </Link>
                                                {ordem.pagamentos_pendentes > 0 && (
                                                    <div className="text-[10px] text-amber-400 mt-0.5">
                                                        {ordem.pagamentos_pendentes} comprovativo
                                                        {ordem.pagamentos_pendentes !== 1 ? 's' : ''} por validar
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-300">{ordem.owner.nome}</td>
                                            <td
                                                className="px-4 py-3 text-zinc-300 max-w-xs truncate"
                                                title={ordem.descricao_item}
                                            >
                                                {ordem.descricao_item}
                                            </td>
                                            <td className="px-4 py-3 text-right text-zinc-200 font-medium">
                                                {formatMoeda(ordem.valor_total)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${ESTADO_STYLES[ordem.estado] ?? ''}`}
                                                >
                                                    <Icon className="h-3 w-3" />
                                                    {ordem.estado_label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-zinc-500">
                                                {new Date(ordem.created_at).toLocaleDateString('pt-PT')}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={route('admin.ordens.show', ordem.id)}
                                                    className="text-xs text-cyan-400 hover:text-cyan-300"
                                                >
                                                    Abrir →
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {ordens.last_page > 1 && (
                            <div className="p-3 border-t border-zinc-800 flex items-center justify-center gap-2">
                                {ordens.links.map((link, i) =>
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1 text-xs rounded ${
                                                link.active
                                                    ? 'bg-cyan-500/20 text-cyan-300'
                                                    : 'text-zinc-400 hover:bg-zinc-800'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="px-3 py-1 text-xs text-zinc-600"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
