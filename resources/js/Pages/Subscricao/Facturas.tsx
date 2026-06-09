import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Receipt, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Factura {
    id: number;
    numero: string;
    periodo_inicio: string;
    periodo_fim: string;
    num_imoveis: number;
    subtotal_kz: number;
    imposto_tipo: string | null;
    imposto_taxa_pct: number;
    imposto_valor_kz: number;
    valor_total_kz: number;
    estado: 'pendente' | 'paga' | 'anulada';
    data_emissao: string;
    data_vencimento: string;
    data_pagamento: string | null;
    tem_referencia_pagamento: boolean;
}

interface Subscricao {
    id: number;
    estado: string;
    ciclo: string;
    num_imoveis: number;
}

interface Props {
    facturas: Factura[];
    subscricao: Subscricao | null;
}

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const fmtData = (v: string) => {
    if (!v) return '—';
    const d = new Date(v);
    return d.toLocaleDateString('pt-PT');
};

export default function Facturas({ facturas, subscricao }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-zinc-100">
                    <Receipt className="mr-2 inline h-5 w-5" />
                    Facturas da Subscrição
                </h2>
            }
        >
            <Head title="Facturas Subscrição" />

            <div className="py-6">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">As suas facturas</h1>
                            <p className="mt-1 text-sm text-zinc-400">
                                Histórico de facturas emitidas da sua subscrição ONDAKA.
                            </p>
                        </div>
                        <Link
                            href="/subscricao"
                            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
                        >
                            ← Voltar à subscrição
                        </Link>
                    </div>

                    {/* Lista vazia */}
                    {facturas.length === 0 && (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
                            <FileText className="mx-auto h-12 w-12 text-zinc-700" />
                            <h3 className="mt-4 text-base font-medium text-zinc-200">Sem facturas ainda</h3>
                            <p className="mt-1 text-sm text-zinc-500">
                                {subscricao?.estado === 'trial'
                                    ? 'Está em período de trial. Não há facturas a pagar até o trial terminar.'
                                    : 'Quando uma factura for emitida, aparecerá aqui.'}
                            </p>
                        </div>
                    )}

                    {/* Lista de facturas */}
                    {facturas.length > 0 && (
                        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                            <table className="w-full">
                                <thead className="border-b border-zinc-800 bg-zinc-950/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Factura</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Período</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Imóveis</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500">Total</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase text-zinc-500">Estado</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Vencimento</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {facturas.map((f) => (
                                        <tr key={f.id} className="hover:bg-zinc-850">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-white">{f.numero}</div>
                                                <div className="text-xs text-zinc-500">Emitida {fmtData(f.data_emissao)}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-300">
                                                {fmtData(f.periodo_inicio)} <br />
                                                <span className="text-xs text-zinc-500">a {fmtData(f.periodo_fim)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-300">{f.num_imoveis}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="font-semibold text-white">{fmt(f.valor_total_kz)} Kz</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <EstadoBadge estado={f.estado} />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-300">
                                                {fmtData(f.data_vencimento)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/subscricao/facturas/${f.id}`}
                                                    className="text-sm text-cyan-400 hover:text-cyan-300"
                                                >
                                                    Ver →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function EstadoBadge({ estado }: { estado: string }) {
    const config: Record<string, { Icon: any; cor: string; bg: string; label: string }> = {
        pendente: { Icon: Clock, cor: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Pendente' },
        paga: { Icon: CheckCircle2, cor: 'text-green-400', bg: 'bg-green-500/20', label: 'Paga' },
        anulada: { Icon: XCircle, cor: 'text-red-400', bg: 'bg-red-500/20', label: 'Anulada' },
    };
    const { Icon, cor, bg, label } = config[estado] || { Icon: AlertCircle, cor: 'text-zinc-400', bg: 'bg-zinc-700', label: estado };

    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${cor}`}>
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}
