import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Receipt, Plus, Clock, CircleAlert, CircleCheck, CircleX, Ban } from 'lucide-react';

function formatMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(valor) + ' Kz';
}

interface Ordem {
    id: number;
    numero: string;
    estado: string;
    estado_label: string;
    descricao_item: string;
    valor_total: number;
    saldo_em_falta: number;
    created_at: string;
    prazo_pagamento: string | null;
    expirou: boolean;
    tem_pagamentos: boolean;
    pagamentos_count: number;
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
    expiradas: number;
}

interface Props {
    ordens: Paginator<Ordem>;
    contadores: Contadores;
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

export default function OrdensMinhas({ ordens, contadores }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="As minhas ordens" />

            <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-100">As minhas ordens</h1>
                            <p className="text-sm text-zinc-500">Histórico de compras e subscrições</p>
                        </div>
                    </div>
                    <Link
                        href={route('funcionalidades.index')}
                        className="rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white text-sm font-medium px-4 py-2"
                    >
                        <Plus className="h-4 w-4 inline mr-1.5" />
                        Loja de add-ons
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 uppercase tracking-wide">Total</div>
                        <div className="text-2xl font-semibold text-zinc-100 mt-1">{contadores.total}</div>
                    </div>
                    <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-4">
                        <div className="text-xs text-amber-400/80 uppercase tracking-wide">Pendentes</div>
                        <div className="text-2xl font-semibold text-amber-300 mt-1">{contadores.pendentes}</div>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4">
                        <div className="text-xs text-emerald-400/80 uppercase tracking-wide">Aprovadas</div>
                        <div className="text-2xl font-semibold text-emerald-300 mt-1">{contadores.aprovadas}</div>
                    </div>
                    <div className="bg-zinc-700/30 border border-zinc-700 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 uppercase tracking-wide">Expiradas</div>
                        <div className="text-2xl font-semibold text-zinc-400 mt-1">{contadores.expiradas}</div>
                    </div>
                </div>

                {ordens.data.length === 0 ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
                        <Receipt className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                        <h3 className="text-lg font-medium text-zinc-300 mb-1">Ainda sem ordens</h3>
                        <p className="text-sm text-zinc-500 mb-4">Explore a loja de add-ons para começar</p>
                        <Link
                            href={route('funcionalidades.index')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white text-sm font-medium px-4 py-2"
                        >
                            <Plus className="h-4 w-4" />
                            Ver add-ons
                        </Link>
                    </div>
                ) : (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="divide-y divide-zinc-800">
                            {ordens.data.map((ordem) => {
                                const Icon = ESTADO_ICONS[ordem.estado] ?? Receipt;
                                return (
                                    <Link
                                        key={ordem.id}
                                        href={route('ordens.show', ordem.id)}
                                        className="block p-4 hover:bg-zinc-800/30 transition"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`shrink-0 h-9 w-9 rounded-lg border flex items-center justify-center ${ESTADO_STYLES[ordem.estado] ?? ''}`}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-mono text-zinc-200">
                                                        {ordem.numero}
                                                    </span>
                                                    <span
                                                        className={`text-[10px] px-2 py-0.5 rounded border ${ESTADO_STYLES[ordem.estado] ?? ''}`}
                                                    >
                                                        {ordem.estado_label}
                                                    </span>
                                                    {ordem.tem_pagamentos && (
                                                        <span className="text-[10px] text-zinc-500">
                                                            · {ordem.pagamentos_count} comprovativo
                                                            {ordem.pagamentos_count !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-zinc-300 truncate">{ordem.descricao_item}</p>
                                                <p className="text-xs text-zinc-500 mt-1">
                                                    {new Date(ordem.created_at).toLocaleDateString('pt-PT')}
                                                    {ordem.prazo_pagamento &&
                                                        ['pendente', 'em_revisao'].includes(ordem.estado) && (
                                                            <>
                                                                {' '}·{' '}
                                                                <span
                                                                    className={
                                                                        ordem.expirou ? 'text-rose-400' : 'text-amber-400'
                                                                    }
                                                                >
                                                                    Prazo:{' '}
                                                                    {new Date(ordem.prazo_pagamento).toLocaleDateString(
                                                                        'pt-PT',
                                                                    )}
                                                                </span>
                                                            </>
                                                        )}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-sm font-semibold text-zinc-200">
                                                    {formatMoeda(ordem.valor_total)}
                                                </div>
                                                {ordem.saldo_em_falta > 0 &&
                                                    ['pendente', 'em_revisao'].includes(ordem.estado) && (
                                                        <div className="text-xs text-amber-400 mt-0.5">
                                                            Em falta: {formatMoeda(ordem.saldo_em_falta)}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
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
