import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Calendar, Plus, Building2, FileText, CheckCircle2, Clock, Filter,
    X, Loader2, AlertCircle,
} from 'lucide-react';
import { useState, FormEventHandler } from 'react';

interface Fraccao { id: number; identificador: string; }
interface Condominio { id: number; nome: string; }

interface Quota {
    id: number;
    ano: number;
    mes: number;
    valor_total: string;
    valor_pago: string;
    estado: 'aberta' | 'paga_parcial' | 'paga' | 'cancelada';
    data_vencimento: string | null;
    fraccao: Fraccao | null;
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
    total: number;
    abertas: number;
    pagas_parcial: number;
    pagas: number;
    mes_actual: number;
}

interface Props {
    quotas: Paginacao<Quota>;
    stats: Stats;
    condominios: Condominio[];
    filtros: { condominio_id: string | null; estado: string | null; ano: string | null; mes: string | null };
    flash?: { success?: string };
}

const formatarKz = (valor: string | number): string => {
    const n = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' Kz';
};

const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const estadoStyle: Record<string, { bg: string; text: string; label: string }> = {
    aberta: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Aberta' },
    paga_parcial: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Paga parcial' },
    paga: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Paga' },
    cancelada: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', label: 'Cancelada' },
};

export default function QuotasIndex({ quotas, stats, condominios, filtros, flash }: Props) {
    const [showGerar, setShowGerar] = useState(false);
    const [condominioFiltro, setCondominioFiltro] = useState(filtros.condominio_id || '');
    const [estadoFiltro, setEstadoFiltro] = useState(filtros.estado || '');
    const [anoFiltro, setAnoFiltro] = useState(filtros.ano || '');
    const [mesFiltro, setMesFiltro] = useState(filtros.mes || '');

    const handleFiltrar: FormEventHandler = (e) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (condominioFiltro) params.condominio_id = condominioFiltro;
        if (estadoFiltro) params.estado = estadoFiltro;
        if (anoFiltro) params.ano = anoFiltro;
        if (mesFiltro) params.mes = mesFiltro;
        router.get(route('quotas.index'), params, { preserveState: true });
    };

    const handleLimpar = () => {
        setCondominioFiltro(''); setEstadoFiltro(''); setAnoFiltro(''); setMesFiltro('');
        router.get(route('quotas.index'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Taxas de Condomínio" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Taxas de Condomínio</h1>
                            <p className="text-sm text-zinc-400 mt-1">Geração mensal automática + manual</p>
                        </div>
                        <button
                            onClick={() => setShowGerar(true)}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2"
                        >
                            <Plus size={16} /> Gerar Taxas
                        </button>
                    </div>

                    {flash?.success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex gap-3">
                            <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={18} />
                            <span className="text-emerald-400 text-sm">{flash.success}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <StatCard icon={<FileText size={18} />} label="Total" value={stats.total.toString()} color="zinc" />
                        <StatCard icon={<Clock size={18} />} label="Abertas" value={stats.abertas.toString()} color="amber" />
                        <StatCard icon={<Calendar size={18} />} label="Parciais" value={stats.pagas_parcial.toString()} color="blue" />
                        <StatCard icon={<CheckCircle2 size={18} />} label="Pagas" value={stats.pagas.toString()} color="emerald" />
                        <StatCard icon={<Calendar size={18} />} label="Mês actual" value={stats.mes_actual.toString()} color="cyan" />
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
                        <form onSubmit={handleFiltrar} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            <select value={condominioFiltro} onChange={(e) => setCondominioFiltro(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                <option value="">Todos os condomínios</option>
                                {condominios.map((c) => (<option key={c.id} value={c.id}>{c.nome}</option>))}
                            </select>
                            <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                <option value="">Todos os estados</option>
                                <option value="aberta">Aberta</option>
                                <option value="paga_parcial">Paga parcial</option>
                                <option value="paga">Paga</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                            <select value={anoFiltro} onChange={(e) => setAnoFiltro(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                <option value="">Todos os anos</option>
                                {[2024, 2025, 2026, 2027].map((a) => (<option key={a} value={a}>{a}</option>))}
                            </select>
                            <select value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                <option value="">Todos os meses</option>
                                {meses.map((m, i) => (<option key={i + 1} value={i + 1}>{m}</option>))}
                            </select>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 flex-1 justify-center">
                                    <Filter size={14} /> Filtrar
                                </button>
                                {(condominioFiltro || estadoFiltro || anoFiltro || mesFiltro) && (
                                    <button type="button" onClick={handleLimpar} className="text-zinc-400 hover:text-white px-3 py-2 text-sm">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        {quotas.data.length === 0 ? (
                            <div className="p-12 text-center text-zinc-500">
                                <FileText size={48} className="mx-auto mb-4 opacity-30" />
                                <p>Sem quotas com estes filtros.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-800">
                                {quotas.data.map((q) => (
                                    <Link key={q.id} href={route('quotas.show', q.id)} className="block p-4 hover:bg-zinc-800/30 transition-colors">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-bold text-white">{meses[q.mes - 1]} {q.ano}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${estadoStyle[q.estado]?.bg} ${estadoStyle[q.estado]?.text}`}>
                                                        {estadoStyle[q.estado]?.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <Building2 size={12} />
                                                        {q.condominio?.nome} · Imóvel {q.fraccao?.identificador}
                                                    </span>
                                                    {q.data_vencimento && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} /> Vence {new Date(q.data_vencimento).toLocaleDateString('pt-PT')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-base font-bold text-white">{formatarKz(q.valor_total)}</div>
                                                {parseFloat(q.valor_pago) > 0 && (
                                                    <div className="text-xs text-emerald-400">Pago: {formatarKz(q.valor_pago)}</div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {quotas.last_page > 1 && (
                            <div className="border-t border-zinc-800 px-4 py-3 flex items-center justify-between">
                                <span className="text-xs text-zinc-500">
                                    Página {quotas.current_page} de {quotas.last_page} ({quotas.total} taxas)
                                </span>
                                <div className="flex gap-1">
                                    {quotas.links.map((link, i) => (
                                        <button key={i} onClick={() => link.url && router.get(link.url)} disabled={!link.url} className={`px-3 py-1 rounded text-xs ${link.active ? 'bg-cyan-500 text-white' : 'text-zinc-400 hover:text-white disabled:opacity-30'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showGerar && <ModalGerar condominios={condominios} onClose={() => setShowGerar(false)} />}
        </AuthenticatedLayout>
    );
}

function ModalGerar({ condominios, onClose }: { condominios: Condominio[]; onClose: () => void }) {
    const form = useForm({
        condominio_id: condominios[0]?.id?.toString() || '',
        ano: new Date().getFullYear().toString(),
        mes: (new Date().getMonth() + 1).toString(),
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('quotas.gerar'), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Gerar Taxas</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                </div>

                <p className="text-sm text-zinc-400 mb-4">
                    Gera quotas para todas as fracções com contrato activo do condomínio.
                    A operação é <strong>idempotente</strong> — não duplica quotas existentes.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Condomínio</label>
                        <select value={form.data.condominio_id} onChange={(e) => form.setData('condominio_id', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                            {condominios.map((c) => (<option key={c.id} value={c.id}>{c.nome}</option>))}
                        </select>
                        {form.errors.condominio_id && <p className="text-xs text-red-400 mt-1">{form.errors.condominio_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Ano</label>
                            <select value={form.data.ano} onChange={(e) => form.setData('ano', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                {[2024, 2025, 2026, 2027].map((a) => (<option key={a} value={a}>{a}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Mês</label>
                            <select value={form.data.mes} onChange={(e) => form.setData('mes', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                {meses.map((m, i) => (<option key={i + 1} value={i + 1}>{m}</option>))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex gap-2 text-xs text-amber-300/90">
                        <AlertCircle className="flex-shrink-0" size={14} />
                        <span>Gera 2 lançamentos por fracção: quota base + fundo reserva (Decreto 141/15).</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={form.processing} className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                            {form.processing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {form.processing ? 'A gerar...' : 'Gerar Taxas'}
                        </button>
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-zinc-400 hover:text-white">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'zinc' | 'amber' | 'blue' | 'emerald' | 'cyan' }) {
    const colors = {
        zinc: 'text-zinc-400 bg-zinc-500/10',
        amber: 'text-amber-400 bg-amber-500/10',
        blue: 'text-blue-400 bg-blue-500/10',
        emerald: 'text-emerald-400 bg-emerald-500/10',
        cyan: 'text-cyan-400 bg-cyan-500/10',
    };
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded ${colors[color]}`}>{icon}</div>
                <span className="text-xs text-zinc-400 font-semibold">{label}</span>
            </div>
            <div className="text-xl font-bold text-white">{value}</div>
        </div>
    );
}
