import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    Receipt,
    Search,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Building2,
    DollarSign,
    TrendingUp,
    Wallet,
} from 'lucide-react';

interface Empresa {
    id: number;
    nome: string;
    slug: string;
    nif: string | null;
}

interface Factura {
    id: number;
    numero: string;
    periodo_inicio: string;
    periodo_fim: string;
    num_imoveis: number;
    subtotal_kz: number;
    imposto_valor_kz: number;
    valor_total_kz: number;
    estado: 'pendente' | 'paga' | 'anulada';
    data_emissao: string;
    data_vencimento: string;
    data_pagamento: string | null;
    tem_referencia_pagamento: boolean;
    empresa: Empresa;
    subscricao_estado: string;
    subscricao_ciclo: string;
}

interface PaginatedFacturas {
    data: Factura[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number;
    to: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Stats {
    total_facturas: number;
    pendentes: number;
    pagas: number;
    anuladas: number;
    valor_pendente_kz: number;
    valor_pago_kz: number;
    valor_pago_mes_actual_kz: number;
}

interface Props {
    facturas: PaginatedFacturas;
    stats: Stats;
    empresas: Empresa[];
    filtros: {
        estado: string | null;
        empresa_id: string | null;
        busca: string | null;
    };
}

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const fmtData = (v: string) => {
    if (!v) return '—';
    return new Date(v).toLocaleDateString('pt-PT');
};

export default function Index({ facturas, stats, empresas, filtros }: Props) {
    const [busca, setBusca] = useState(filtros.busca || '');
    const [estado, setEstado] = useState(filtros.estado || '');
    const [empresaId, setEmpresaId] = useState(filtros.empresa_id || '');

    const aplicarFiltros = (overrides: Partial<{ busca: string; estado: string; empresa_id: string }> = {}) => {
        const params: any = {
            busca: overrides.busca ?? busca,
            estado: overrides.estado ?? estado,
            empresa_id: overrides.empresa_id ?? empresaId,
        };
        Object.keys(params).forEach((k) => {
            if (!params[k]) delete params[k];
        });
        router.get('/super-admin/facturas-plataforma', params, { preserveState: true, replace: true });
    };

    const anularFactura = async (factura: Factura) => {
        const motivo = prompt(`Anular factura ${factura.numero}?\n\nIndique o motivo:`);
        if (!motivo) return;

        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const r = await fetch(`/super-admin/facturas-plataforma/${factura.id}/anular`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                credentials: 'same-origin',
                body: JSON.stringify({ motivo }),
            });
            const data = await r.json();
            if (r.ok && data.success) {
                alert(data.message);
                router.reload();
            } else {
                alert(data.message || 'Erro ao anular.');
            }
        } catch (err) {
            alert('Erro de ligação.');
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-zinc-100">
                    <Receipt className="mr-2 inline h-5 w-5" />
                    Facturas Plataforma (Super-Admin)
                </h2>
            }
        >
            <Head title="Facturas Plataforma" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <StatCard
                            label="Total Facturas"
                            valor={stats.total_facturas.toString()}
                            icon={<Receipt className="h-5 w-5 text-cyan-400" />}
                        />
                        <StatCard
                            label="Pendente (valor)"
                            valor={`${fmt(stats.valor_pendente_kz)} Kz`}
                            sublabel={`${stats.pendentes} facturas`}
                            icon={<Clock className="h-5 w-5 text-yellow-400" />}
                        />
                        <StatCard
                            label="Pago Total"
                            valor={`${fmt(stats.valor_pago_kz)} Kz`}
                            sublabel={`${stats.pagas} facturas`}
                            icon={<CheckCircle2 className="h-5 w-5 text-green-400" />}
                        />
                        <StatCard
                            label={`Pago em ${new Date().toLocaleDateString('pt-PT', { month: 'long' })}`}
                            valor={`${fmt(stats.valor_pago_mes_actual_kz)} Kz`}
                            icon={<TrendingUp className="h-5 w-5 text-purple-400" />}
                        />
                    </div>

                    {/* Filtros */}
                    <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-xs uppercase text-zinc-500">Pesquisar</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                                        placeholder="Número factura ou empresa..."
                                        className="w-full rounded border border-zinc-700 bg-zinc-800 py-2 pl-10 pr-3 text-sm text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs uppercase text-zinc-500">Estado</label>
                                <select
                                    value={estado}
                                    onChange={(e) => {
                                        setEstado(e.target.value);
                                        aplicarFiltros({ estado: e.target.value });
                                    }}
                                    className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                                >
                                    <option value="">Todos</option>
                                    <option value="pendente">Pendente</option>
                                    <option value="paga">Paga</option>
                                    <option value="anulada">Anulada</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs uppercase text-zinc-500">Empresa</label>
                                <select
                                    value={empresaId}
                                    onChange={(e) => {
                                        setEmpresaId(e.target.value);
                                        aplicarFiltros({ empresa_id: e.target.value });
                                    }}
                                    className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                                >
                                    <option value="">Todas</option>
                                    {empresas.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tabela */}
                    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                        {facturas.data.length === 0 ? (
                            <div className="p-12 text-center text-sm text-zinc-500">Sem facturas para mostrar.</div>
                        ) : (
                            <table className="w-full">
                                <thead className="border-b border-zinc-800 bg-zinc-950/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Factura</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Empresa</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Período</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500">Total</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase text-zinc-500">Estado</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Vencimento</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500">Acções</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {facturas.data.map((f) => (
                                        <tr key={f.id} className="hover:bg-zinc-850">
                                            <td className="px-4 py-3">
                                                <div className="font-mono text-sm font-medium text-white">{f.numero}</div>
                                                <div className="text-xs text-zinc-500">{fmtData(f.data_emissao)}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="font-medium text-zinc-100">{f.empresa.nome}</div>
                                                {f.empresa.nif && (
                                                    <div className="text-xs text-zinc-500">NIF: {f.empresa.nif}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-300">
                                                {fmtData(f.periodo_inicio)}
                                                <div className="text-xs text-zinc-500">a {fmtData(f.periodo_fim)}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-white">
                                                {fmt(f.valor_total_kz)} Kz
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <EstadoBadge estado={f.estado} />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-300">
                                                {fmtData(f.data_vencimento)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {f.estado === 'pendente' && (
                                                    <button
                                                        onClick={() => anularFactura(f)}
                                                        className="text-xs text-red-400 hover:text-red-300"
                                                    >
                                                        Anular
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Paginação */}
                    {facturas.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
                            <div>
                                Página {facturas.current_page} de {facturas.last_page} ({facturas.total} facturas)
                            </div>
                            <div className="flex gap-2">
                                {facturas.links.map((link, i) => (
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            preserveState
                                            className={`rounded px-3 py-1 ${link.active ? 'bg-cyan-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="rounded px-3 py-1 text-zinc-600"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, valor, sublabel, icon }: { label: string; valor: string; sublabel?: string; icon: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
                {icon}
            </div>
            <div className="mt-2 text-xl font-bold text-white">{valor}</div>
            {sublabel && <div className="mt-1 text-xs text-zinc-500">{sublabel}</div>}
        </div>
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
