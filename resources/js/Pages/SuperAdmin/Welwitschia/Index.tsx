import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Building2, TrendingUp, Wallet, AlertCircle, FileText, Link2, Users } from 'lucide-react';

interface Reconciliacao {
    faturado: number;
    recebido: number;
    em_divida: number;
    num_facturas: number;
    gerado_em?: string;
}
interface Factura {
    invoice_number: string;
    total_amount: string;
    paid_amount: string;
    balance_amount: string;
    status: string;
    display_status: string;
    invoice_date: string;
}
interface Cliente { id: number; name: string; email?: string | null; }

interface Props {
    ligado: boolean;
    erro: string | null;
    identidade: { filial: string | null; tenant_id: number | null; branch_id: number | null } | null;
    reconciliacao: Reconciliacao | null;
    facturas: Factura[];
    clientes: Cliente[];
}

const kz = (v: number | string) =>
    new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(Number(v)) + ' Kz';

const estadoCor: Record<string, string> = {
    paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    overdue: 'bg-red-500/15 text-red-300 border-red-500/30',
    draft: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
    partial: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
};

export default function Index({ ligado, erro, identidade, reconciliacao, facturas, clientes }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="ERP Welwitschia" />

            <div className="mb-6 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)', border: '0.5px solid rgba(16,185,129,0.3)' }}>
                    <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">ERP Welwitschia</h1>
                    <p className="text-sm text-white/60 mt-1">Consolidação financeira do ONDAKA no ERP central.</p>
                </div>
                {ligado && identidade && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        <Link2 className="w-3.5 h-3.5" /> Ligado · filial {identidade.filial}
                    </span>
                )}
            </div>

            {!ligado ? (
                <div className="card flex items-center gap-3 text-white/70">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span>{erro ?? 'Sem ligação à Welwitschia.'}</span>
                </div>
            ) : (
                <>
                    {/* KPIs */}
                    {reconciliacao && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                            <Kpi label="Faturado" valor={kz(reconciliacao.faturado)} icon={FileText} cor="#00D4FF" />
                            <Kpi label="Recebido" valor={kz(reconciliacao.recebido)} icon={TrendingUp} cor="#10B981" />
                            <Kpi label="Em dívida" valor={kz(reconciliacao.em_divida)} icon={AlertCircle} cor="#EF4444" />
                            <Kpi label="Nº de faturas" valor={String(reconciliacao.num_facturas)} icon={Wallet} cor="#A855F7" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Faturas */}
                        <div className="lg:col-span-2 card">
                            <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">Faturas ({facturas.length})</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                                            <th className="text-left py-2 pr-2">Fatura</th>
                                            <th className="text-right px-2">Total</th>
                                            <th className="text-right px-2">Pago</th>
                                            <th className="text-right px-2">Saldo</th>
                                            <th className="text-right pl-2">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {facturas.map((f) => (
                                            <tr key={f.invoice_number} className="border-b border-white/5">
                                                <td className="py-2 pr-2 text-white/80 font-mono text-[12px]">{f.invoice_number}</td>
                                                <td className="text-right px-2 text-white/80">{kz(f.total_amount)}</td>
                                                <td className="text-right px-2 text-emerald-300/90">{kz(f.paid_amount)}</td>
                                                <td className="text-right px-2 text-white/70">{kz(f.balance_amount)}</td>
                                                <td className="text-right pl-2">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${estadoCor[f.display_status] ?? estadoCor.draft}`}>
                                                        {f.display_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {facturas.length === 0 && (
                                            <tr><td colSpan={5} className="py-6 text-center text-white/40">Sem faturas.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Clientes */}
                        <div className="card">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-white/60" />
                                <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Clientes ({clientes.length})</h2>
                            </div>
                            <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
                                {clientes.map((c) => (
                                    <div key={c.id} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                                        <div className="text-sm text-white truncate">{c.name}</div>
                                        {c.email && <div className="text-[11px] text-white/40 truncate">{c.email}</div>}
                                    </div>
                                ))}
                                {clientes.length === 0 && <div className="text-white/40 text-sm">Sem clientes.</div>}
                            </div>
                        </div>
                    </div>
                    {reconciliacao?.gerado_em && (
                        <p className="text-[11px] text-white/30 mt-4">Dados da Welwitschia · atualizado {new Date(reconciliacao.gerado_em).toLocaleString('pt-PT')}</p>
                    )}
                </>
            )}
        </AuthenticatedLayout>
    );
}

function Kpi({ label, valor, icon: Icon, cor }: { label: string; valor: string; icon: React.ElementType; cor: string }) {
    return (
        <div className="rounded-xl p-4" style={{ background: `linear-gradient(135deg, ${cor}12 0%, ${cor}04 100%)`, border: `0.5px solid ${cor}30` }}>
            <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-4 h-4" style={{ color: cor }} />
                <span className="text-[10px] uppercase tracking-wider text-white/50">{label}</span>
            </div>
            <div className="text-xl font-bold text-white">{valor}</div>
        </div>
    );
}
