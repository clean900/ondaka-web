import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Wallet, Receipt, AlertCircle, CheckCircle2, Clock, XCircle, TrendingUp, FileText, CreditCard } from 'lucide-react';
import { useState } from 'react';

interface Item {
    id: number;
    tipo_item: 'quota' | 'lancamento';
    tipo?: string;
    tipo_label?: string;
    titulo: string;
    descricao: string;
    data_lancamento: string;
    data_vencimento: string | null;
    valor: string;
    valor_pago: string;
    valor_em_falta: string;
    estado: string;
    pago_em: string | null;
}

interface Kpis {
    total_em_aberto: string;
    total_pagas: number;
    total_abertas: number;
    credito: string;
}

interface PageProps {
    quotas: Item[];
    lancamentos: Item[];
    credito_total: string;
    kpis: Kpis;
}

const ESTADO_LABELS: Record<string, { label: string; cor: string; icon: any }> = {
    aberta: { label: 'Em aberto', cor: 'text-amber-300 bg-amber-500/10 border-amber-500/30', icon: Clock },
    em_aberto: { label: 'Em aberto', cor: 'text-amber-300 bg-amber-500/10 border-amber-500/30', icon: Clock },
    paga_parcial: { label: 'Pago parcial', cor: 'text-blue-300 bg-blue-500/10 border-blue-500/30', icon: Clock },
    pago_parcial: { label: 'Pago parcial', cor: 'text-blue-300 bg-blue-500/10 border-blue-500/30', icon: Clock },
    paga: { label: 'Paga', cor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
    pago: { label: 'Pago', cor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
    cancelada: { label: 'Cancelada', cor: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30', icon: XCircle },
    cancelado: { label: 'Cancelado', cor: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30', icon: XCircle },
};

const formatarKz = (valor: string) => {
    const num = parseFloat(valor);
    if (isNaN(num)) return '0 Kz';
    return new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num) + ' Kz';
};

const formatarData = (data: string | null) => {
    if (!data) return '—';
    const d = new Date(data);
    return d.toLocaleDateString('pt-PT');
};

export default function MinhasQuotas({ quotas, lancamentos, credito_total, kpis }: PageProps) {
    const todosItens = [...quotas, ...lancamentos];
    const [filtroEstado, setFiltroEstado] = useState<'todos' | 'aberto' | 'pago' | 'cancelado'>('aberto');

    const itensFiltrados = todosItens.filter((i) => {
        if (filtroEstado === 'aberto') return ['aberta', 'em_aberto', 'paga_parcial', 'pago_parcial'].includes(i.estado);
        if (filtroEstado === 'pago') return ['paga', 'pago'].includes(i.estado);
        if (filtroEstado === 'cancelado') return ['cancelada', 'cancelado'].includes(i.estado);
        return true;
    });

    const totalEmAbertoNum = parseFloat(kpis.total_em_aberto);
    const creditoNum = parseFloat(kpis.credito);
    const saldoLiquido = totalEmAbertoNum - creditoNum;

    return (
        <AuthenticatedLayout>
            <Head title="Minhas Quotas — ONDAKA" />
            <div className="p-6 md:p-8 max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">Minhas quotas e pagamentos</h1>
                        <p className="text-sm text-zinc-500">Veja todas as suas obrigações e o seu saldo</p>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 border border-amber-500/25 p-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                            <AlertCircle className="h-3 w-3" />
                            Em aberto
                        </p>
                        <p className="text-2xl font-bold text-amber-300">{formatarKz(kpis.total_em_aberto)}</p>
                        <p className="text-xs text-zinc-500 mt-1">{kpis.total_abertas} {kpis.total_abertas === 1 ? 'item' : 'itens'}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/5 border border-emerald-500/25 p-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3 w-3" />
                            Pagas
                        </p>
                        <p className="text-2xl font-bold text-emerald-300">{kpis.total_pagas}</p>
                        <p className="text-xs text-zinc-500 mt-1">{kpis.total_pagas === 1 ? 'item liquidado' : 'itens liquidados'}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-cyan-500/15 to-purple-500/5 border border-cyan-500/25 p-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                            <TrendingUp className="h-3 w-3" />
                            Crédito disponível
                        </p>
                        <p className="text-2xl font-bold text-cyan-300">{formatarKz(kpis.credito)}</p>
                        <p className="text-xs text-zinc-500 mt-1">A favor</p>
                    </div>
                    <div className={`rounded-xl bg-gradient-to-br ${saldoLiquido > 0 ? 'from-red-500/15 to-pink-500/5 border-red-500/25' : 'from-emerald-500/15 to-cyan-500/5 border-emerald-500/25'} border p-4`}>
                        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                            <Receipt className="h-3 w-3" />
                            Saldo líquido
                        </p>
                        <p className={`text-2xl font-bold ${saldoLiquido > 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                            {formatarKz(String(Math.abs(saldoLiquido)))}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">{saldoLiquido > 0 ? 'a pagar' : saldoLiquido < 0 ? 'a favor' : 'em dia'}</p>
                    </div>
                </div>

                {/* Botão Pagar Tudo */}
                {totalEmAbertoNum > 0 && (
                    <div className="mb-6 rounded-xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/30 p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-zinc-100">Pague tudo de uma vez</p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Receba uma única referência ProxyPay para liquidar {formatarKz(kpis.total_em_aberto)}
                            </p>
                        </div>
                        <button
                            disabled
                            title="Em desenvolvimento"
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2.5 text-sm font-medium shadow-lg opacity-60 cursor-not-allowed"
                        >
                            <CreditCard className="h-4 w-4" />
                            Pagar tudo (em breve)
                        </button>
                    </div>
                )}

                {/* Filtros */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    <button onClick={() => setFiltroEstado('aberto')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filtroEstado === 'aberto' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'}`}>
                        Em aberto ({kpis.total_abertas})
                    </button>
                    <button onClick={() => setFiltroEstado('pago')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filtroEstado === 'pago' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'}`}>
                        Pagas ({kpis.total_pagas})
                    </button>
                    <button onClick={() => setFiltroEstado('cancelado')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filtroEstado === 'cancelado' ? 'bg-zinc-700/30 text-zinc-300 border border-zinc-600/40' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'}`}>
                        Canceladas
                    </button>
                    <button onClick={() => setFiltroEstado('todos')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filtroEstado === 'todos' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'}`}>
                        Todas
                    </button>
                </div>

                {/* Lista */}
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                    {itensFiltrados.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-500 text-sm">Sem itens nesta categoria.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-xs uppercase text-zinc-400">
                                <tr>
                                    <th className="text-left px-4 py-3">Item</th>
                                    <th className="text-left px-4 py-3 hidden md:table-cell">Vencimento</th>
                                    <th className="text-right px-4 py-3">Valor</th>
                                    <th className="text-right px-4 py-3 hidden md:table-cell">Em falta</th>
                                    <th className="text-left px-4 py-3">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itensFiltrados.map((i) => {
                                    const cfg = ESTADO_LABELS[i.estado] ?? { label: i.estado, cor: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30', icon: Clock };
                                    const EstadoIcon = cfg.icon;
                                    return (
                                        <tr key={`${i.tipo_item}-${i.id}`} className="border-b border-zinc-800/40 hover:bg-zinc-900/40">
                                            <td className="px-4 py-3">
                                                <p className="text-zinc-100 font-medium">{i.titulo}</p>
                                                <p className="text-xs text-zinc-500">{i.descricao}</p>
                                                {i.tipo_item === 'lancamento' && i.tipo_label && (
                                                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30">
                                                        {i.tipo_label}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-400 hidden md:table-cell text-xs">{formatarData(i.data_vencimento)}</td>
                                            <td className="px-4 py-3 text-right text-zinc-100 font-medium">{formatarKz(i.valor)}</td>
                                            <td className="px-4 py-3 text-right hidden md:table-cell">
                                                {parseFloat(i.valor_em_falta) > 0 ? (
                                                    <span className="text-amber-300 font-semibold">{formatarKz(i.valor_em_falta)}</span>
                                                ) : (
                                                    <span className="text-zinc-600">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${cfg.cor}`}>
                                                    <EstadoIcon className="h-3 w-3" />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
