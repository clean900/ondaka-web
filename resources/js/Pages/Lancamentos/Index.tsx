import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Plus, Building2, FileText, CheckCircle2, Clock, Filter, X, Loader2, AlertCircle,
    Receipt, TrendingUp, TrendingDown, Minus, Trash2, Calendar,
} from 'lucide-react';
import { useState, FormEventHandler, useMemo } from 'react';

interface Fraccao { id: number; identificador: string; }
interface Condominio { id: number; nome: string; }
interface Condomino { id: number; nome_completo: string; }
interface CriadoPor { id: number; name: string; }

interface Lancamento {
    id: number;
    tipo: string;
    descricao: string;
    valor: string;
    valor_pago: string;
    data_lancamento: string;
    data_vencimento: string | null;
    estado: string;
    fraccao: Fraccao | null;
    condominio: Condominio | null;
    condomino: Condomino | null;
    criado_por: CriadoPor | null;
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
    em_aberto: number;
    pagos: number;
    cancelados: number;
    valor_em_aberto: string;
}

interface DashboardCategoria { descricao: string; qty: number; total: string; }
interface DashboardLancamento { id: number; descricao: string; valor: string; data_lancamento: string | null; estado: string; }
interface Dashboard {
    total_ano: string;
    total_mes: string;
    total_mes_anterior: string;
    variacao_pct: number;
    mensais: Record<string, string>;
    top_categorias: DashboardCategoria[];
    top_lancamentos: DashboardLancamento[];
}

interface Props {
    lancamentos: Paginacao<Lancamento>;
    stats: Stats;
    dashboard?: Dashboard;
    condominios: Condominio[];
    fraccoesPorCondominio: Record<number, Fraccao[]>;
    filtros: { condominio_id: string | null; fraccao_id: string | null; tipo: string | null; estado: string | null };
    flash?: { success?: string };
}

const formatarKz = (valor: string | number): string => {
    const n = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' Kz';
};

const formatarData = (data: string): string => {
    return new Date(data).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
};

const tipoStyle: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
    despesa_extra: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Despesa extra', icon: <Receipt size={12} /> },
    ajuste_debito: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Ajuste débito', icon: <TrendingUp size={12} /> },
    ajuste_credito: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Ajuste crédito', icon: <TrendingDown size={12} /> },
};

const estadoStyle: Record<string, { bg: string; text: string; label: string }> = {
    em_aberto: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Em aberto' },
    pago_parcial: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Pago parcial' },
    pago: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Pago' },
    cancelado: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', label: 'Cancelado' },
};

export default function LancamentosIndex({ lancamentos, stats, dashboard, condominios, fraccoesPorCondominio, filtros, flash }: Props) {
    const [showNovo, setShowNovo] = useState(false);
    const [cancelarTarget, setCancelarTarget] = useState<Lancamento | null>(null);
    const [condominioFiltro, setCondominioFiltro] = useState(filtros.condominio_id || '');
    const [tipoFiltro, setTipoFiltro] = useState(filtros.tipo || '');
    const [estadoFiltro, setEstadoFiltro] = useState(filtros.estado || '');

    const handleFiltrar: FormEventHandler = (e) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (condominioFiltro) params.condominio_id = condominioFiltro;
        if (tipoFiltro) params.tipo = tipoFiltro;
        if (estadoFiltro) params.estado = estadoFiltro;
        router.get(route('lancamentos.index'), params, { preserveState: true });
    };

    const handleLimpar = () => {
        setCondominioFiltro(''); setTipoFiltro(''); setEstadoFiltro('');
        router.get(route('lancamentos.index'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Lançamentos manuais" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Lançamentos manuais</h1>
                            <p className="text-sm text-zinc-400 mt-1">Despesas extras, ajustes débito e crédito</p>
                        </div>
                        <button
                            onClick={() => setShowNovo(true)}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2"
                        >
                            <Plus size={16} /> Novo lançamento
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
                        <StatCard icon={<Clock size={18} />} label="Em aberto" value={stats.em_aberto.toString()} color="amber" />
                        <StatCard icon={<CheckCircle2 size={18} />} label="Pagos" value={stats.pagos.toString()} color="emerald" />
                        <StatCard icon={<X size={18} />} label="Cancelados" value={stats.cancelados.toString()} color="zinc" />
                        <StatCard icon={<Receipt size={18} />} label="Valor em aberto" value={formatarKz(stats.valor_em_aberto)} color="cyan" />
                    </div>

                    {/* === DASHBOARD DE DESPESAS === */}
                    {dashboard && (
                        <DashboardDespesas dashboard={dashboard} />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mt-6 mb-6" style={{ display: 'none' }}>
                        <StatCard icon={<FileText size={18} />} label="placeholder" value="0" color="zinc" />
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
                        <form onSubmit={handleFiltrar} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <select value={condominioFiltro} onChange={(e) => setCondominioFiltro(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                <option value="">Todos os condomínios</option>
                                {condominios.map((c) => (<option key={c.id} value={c.id}>{c.nome}</option>))}
                            </select>
                            <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                <option value="">Todos os tipos</option>
                                <option value="despesa_extra">Despesa extra</option>
                                <option value="ajuste_debito">Ajuste débito</option>
                                <option value="ajuste_credito">Ajuste crédito</option>
                            </select>
                            <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                <option value="">Todos os estados</option>
                                <option value="em_aberto">Em aberto</option>
                                <option value="pago_parcial">Pago parcial</option>
                                <option value="pago">Pago</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 flex-1 justify-center">
                                    <Filter size={14} /> Filtrar
                                </button>
                                {(condominioFiltro || tipoFiltro || estadoFiltro) && (
                                    <button type="button" onClick={handleLimpar} className="text-zinc-400 hover:text-white px-3 py-2 text-sm">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        {lancamentos.data.length === 0 ? (
                            <div className="p-12 text-center text-zinc-500">
                                <Receipt size={48} className="mx-auto mb-4 opacity-30" />
                                <p>Sem lançamentos com estes filtros.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-800">
                                {lancamentos.data.map((l) => {
                                    const tipoEstilo = tipoStyle[l.tipo] || { bg: 'bg-zinc-500/10', text: 'text-zinc-400', label: l.tipo, icon: <Minus size={12} /> };
                                    const estadoEstilo = estadoStyle[l.estado];
                                    const podeCancel = l.estado === 'em_aberto';
                                    return (
                                        <div key={l.id} className="block p-4 hover:bg-zinc-800/30 transition-colors">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${tipoEstilo.bg} ${tipoEstilo.text}`}>
                                                            {tipoEstilo.icon} {tipoEstilo.label}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${estadoEstilo?.bg} ${estadoEstilo?.text}`}>
                                                            {estadoEstilo?.label}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm font-semibold text-white mb-1">{l.descricao}</div>
                                                    <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                                                        <span className="flex items-center gap-1">
                                                            <Building2 size={12} /> {l.condominio?.nome} · Imóvel {l.fraccao?.identificador}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} /> {formatarData(l.data_lancamento)}
                                                        </span>
                                                        {l.data_vencimento && (
                                                            <span>· Vence {formatarData(l.data_vencimento)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-base font-bold text-white">{formatarKz(l.valor)}</div>
                                                    {parseFloat(l.valor_pago) > 0 && (
                                                        <div className="text-xs text-emerald-400">Pago: {formatarKz(l.valor_pago)}</div>
                                                    )}
                                                    {podeCancel && (
                                                        <button onClick={() => setCancelarTarget(l)} className="mt-2 text-red-400 hover:text-red-300 text-xs flex items-center gap-1 ml-auto">
                                                            <Trash2 size={12} /> Cancelar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {lancamentos.last_page > 1 && (
                            <div className="border-t border-zinc-800 px-4 py-3 flex items-center justify-between">
                                <span className="text-xs text-zinc-500">
                                    Página {lancamentos.current_page} de {lancamentos.last_page} ({lancamentos.total} lançamentos)
                                </span>
                                <div className="flex gap-1">
                                    {lancamentos.links.map((link, i) => (
                                        <button key={i} onClick={() => link.url && router.get(link.url)} disabled={!link.url} className={`px-3 py-1 rounded text-xs ${link.active ? 'bg-cyan-500 text-white' : 'text-zinc-400 hover:text-white disabled:opacity-30'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showNovo && (
                <ModalNovoLancamento
                    condominios={condominios}
                    fraccoesPorCondominio={fraccoesPorCondominio}
                    onClose={() => setShowNovo(false)}
                />
            )}

            {cancelarTarget && (
                <ModalCancelar
                    lancamento={cancelarTarget}
                    onClose={() => setCancelarTarget(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}

function ModalNovoLancamento({ condominios, fraccoesPorCondominio, onClose }: { condominios: Condominio[]; fraccoesPorCondominio: Record<number, Fraccao[]>; onClose: () => void }) {
    const form = useForm({
        condominio_id: condominios[0]?.id?.toString() || '',
        fraccao_ids: [] as number[],
        tipo: 'despesa_extra',
        descricao: '',
        valor: '',
        data_vencimento: '',
        detalhes: '',
        observacoes: '',
    });

    const fraccoesDoCondominio = useMemo(() => {
        const id = parseInt(form.data.condominio_id);
        return fraccoesPorCondominio[id] || [];
    }, [form.data.condominio_id, fraccoesPorCondominio]);

    const todasSeleccionadas = fraccoesDoCondominio.length > 0 && form.data.fraccao_ids.length === fraccoesDoCondominio.length;

    const toggleTodas = () => {
        if (todasSeleccionadas) {
            form.setData('fraccao_ids', []);
        } else {
            form.setData('fraccao_ids', fraccoesDoCondominio.map((f) => f.id));
        }
    };

    const toggleFraccao = (id: number) => {
        const current = form.data.fraccao_ids;
        if (current.includes(id)) {
            form.setData('fraccao_ids', current.filter((x) => x !== id));
        } else {
            form.setData('fraccao_ids', [...current, id]);
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('lancamentos.store'), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />
            <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Novo lançamento manual</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                </div>

                {form.errors.store && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3 text-xs text-red-400">
                        {form.errors.store}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Condomínio</label>
                            <select value={form.data.condominio_id} onChange={(e) => { form.setData('condominio_id', e.target.value); form.setData('fraccao_ids', []); }} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                {condominios.map((c) => (<option key={c.id} value={c.id}>{c.nome}</option>))}
                            </select>
                            {form.errors.condominio_id && <p className="text-xs text-red-400 mt-1">{form.errors.condominio_id}</p>}
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Tipo</label>
                            <select value={form.data.tipo} onChange={(e) => form.setData('tipo', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                <option value="despesa_extra">Despesa extra</option>
                                <option value="ajuste_debito">Ajuste débito (cobrança extra)</option>
                                <option value="ajuste_credito">Ajuste crédito (redução de dívida)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs text-zinc-400 font-semibold">Fracções alvo ({form.data.fraccao_ids.length} de {fraccoesDoCondominio.length})</label>
                            <button type="button" onClick={toggleTodas} className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
                                {todasSeleccionadas ? 'Desmarcar todas' : 'Seleccionar todas'}
                            </button>
                        </div>
                        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 max-h-40 overflow-y-auto">
                            {fraccoesDoCondominio.length === 0 ? (
                                <p className="text-xs text-zinc-500">Sem fracções para este condomínio.</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {fraccoesDoCondominio.map((f) => (
                                        <label key={f.id} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:text-white">
                                            <input
                                                type="checkbox"
                                                checked={form.data.fraccao_ids.includes(f.id)}
                                                onChange={() => toggleFraccao(f.id)}
                                                className="rounded bg-zinc-700 border-zinc-600 text-cyan-500"
                                            />
                                            {f.identificador}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        {form.errors.fraccao_ids && <p className="text-xs text-red-400 mt-1">{form.errors.fraccao_ids}</p>}
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Descrição</label>
                        <input type="text" value={form.data.descricao} onChange={(e) => form.setData('descricao', e.target.value)} placeholder="Ex: Reparação portão automático" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                        {form.errors.descricao && <p className="text-xs text-red-400 mt-1">{form.errors.descricao}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Valor (Kz) — por fracção</label>
                            <input type="number" step="0.01" min="0.01" value={form.data.valor} onChange={(e) => form.setData('valor', e.target.value)} placeholder="0.00" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                            {form.errors.valor && <p className="text-xs text-red-400 mt-1">{form.errors.valor}</p>}
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Data de vencimento (opcional)</label>
                            <input type="date" value={form.data.data_vencimento} onChange={(e) => form.setData('data_vencimento', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Observações (opcional)</label>
                        <textarea value={form.data.observacoes} onChange={(e) => form.setData('observacoes', e.target.value)} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex gap-2 text-xs text-amber-300/90">
                        <AlertCircle className="flex-shrink-0" size={14} />
                        <span>Vai criar <strong>{form.data.fraccao_ids.length}</strong> lançamento(s), um por cada fracção seleccionada com o mesmo valor.</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={form.processing || form.data.fraccao_ids.length === 0} className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                            {form.processing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {form.processing ? 'A criar...' : `Criar ${form.data.fraccao_ids.length} lançamento(s)`}
                        </button>
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-zinc-400 hover:text-white">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ModalCancelar({ lancamento, onClose }: { lancamento: Lancamento; onClose: () => void }) {
    const form = useForm({ motivo: '' });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('lancamentos.cancelar', lancamento.id), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Cancelar lançamento #{lancamento.id}</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                </div>

                <p className="text-sm text-zinc-400 mb-4">Vais cancelar o lançamento "{lancamento.descricao}" no valor de {formatarKz(lancamento.valor)}.</p>

                {form.errors.cancelar && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3 text-xs text-red-400">
                        {form.errors.cancelar}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Motivo (mínimo 5 caracteres)</label>
                        <textarea value={form.data.motivo} onChange={(e) => form.setData('motivo', e.target.value)} rows={3} placeholder="Ex: Erro de lançamento — valor incorrecto" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500" />
                        {form.errors.motivo && <p className="text-xs text-red-400 mt-1">{form.errors.motivo}</p>}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={form.processing || form.data.motivo.length < 5} className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                            {form.processing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            Confirmar cancelamento
                        </button>
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-zinc-400 hover:text-white">Manter</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'zinc' | 'amber' | 'emerald' | 'cyan' }) {
    const colors = {
        zinc: 'text-zinc-400 bg-zinc-500/10',
        amber: 'text-amber-400 bg-amber-500/10',
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


// ============= DASHBOARD DE DESPESAS =============
function DashboardDespesas({ dashboard }: { dashboard: Dashboard }) {
    const totalAno = parseFloat(dashboard.total_ano);
    const totalMes = parseFloat(dashboard.total_mes);

    // Pad mensais para 12 meses
    const meses12: Array<{ mes: string; label: string; valor: number }> = [];
    const hoje = new Date();
    for (let i = 11; i >= 0; i--) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('pt-PT', { month: 'short' });
        meses12.push({ mes: key, label, valor: parseFloat(dashboard.mensais[key] ?? '0') });
    }
    const maxValor = Math.max(...meses12.map((m) => m.valor), 1);

    const totalCategorias = dashboard.top_categorias.reduce((sum, c) => sum + parseFloat(c.total), 0) || 1;

    return (
        <div className="mt-6 mb-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-100">📊 Dashboard de Despesas</h2>
                <div className="text-xs text-zinc-500 italic">
                    Análise avançada disponível no add-on Dashboard BI
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 p-4">
                    <p className="text-xs text-zinc-400 uppercase tracking-wide">Despesas este mês</p>
                    <p className="text-2xl font-bold text-red-300 mt-1">{formatarKz(dashboard.total_mes)}</p>
                    <p className={`text-xs mt-1 ${dashboard.variacao_pct >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {dashboard.variacao_pct >= 0 ? '↑' : '↓'} {Math.abs(dashboard.variacao_pct)}% vs mês anterior
                    </p>
                </div>
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                    <p className="text-xs text-zinc-400 uppercase tracking-wide">Despesas no ano</p>
                    <p className="text-2xl font-bold text-zinc-100 mt-1">{formatarKz(dashboard.total_ano)}</p>
                    <p className="text-xs text-zinc-500 mt-1">{dashboard.top_lancamentos.length} maiores listados abaixo</p>
                </div>
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                    <p className="text-xs text-zinc-400 uppercase tracking-wide">Mês anterior</p>
                    <p className="text-2xl font-bold text-zinc-300 mt-1">{formatarKz(dashboard.total_mes_anterior)}</p>
                </div>
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                    <p className="text-xs text-zinc-400 uppercase tracking-wide">Top categoria</p>
                    <p className="text-base font-bold text-zinc-100 mt-1 truncate">
                        {dashboard.top_categorias[0]?.descricao ?? '—'}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                        {dashboard.top_categorias[0] ? formatarKz(dashboard.top_categorias[0].total) : ''}
                    </p>
                </div>
            </div>

            {/* Gráfico de barras mensal */}
            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
                <h3 className="text-sm font-semibold text-zinc-100 mb-4">Despesas por mês — últimos 12 meses</h3>
                <div className="flex items-end gap-2 h-40">
                    {meses12.map((m) => {
                        const altura = (m.valor / maxValor) * 100;
                        return (
                            <div key={m.mes} className="flex-1 flex flex-col items-center group">
                                <div
                                    className="w-full bg-gradient-to-t from-red-500/40 to-orange-400/30 hover:from-red-500/70 hover:to-orange-400/60 rounded-t transition cursor-pointer relative"
                                    style={{ height: `${altura}%`, minHeight: m.valor > 0 ? '4px' : '0' }}
                                >
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 whitespace-nowrap z-10">
                                        {formatarKz(m.valor.toString())}
                                    </div>
                                </div>
                                <span className="text-[10px] text-zinc-500 mt-2">{m.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top categorias + Top lançamentos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
                    <h3 className="text-sm font-semibold text-zinc-100 mb-3">Top 5 categorias do ano</h3>
                    {dashboard.top_categorias.length === 0 ? (
                        <p className="text-xs text-zinc-500">Sem despesas este ano.</p>
                    ) : (
                        <div className="space-y-2">
                            {dashboard.top_categorias.map((cat, idx) => {
                                const pct = (parseFloat(cat.total) / totalCategorias) * 100;
                                return (
                                    <div key={idx}>
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-zinc-200 truncate flex-1">{cat.descricao}</span>
                                            <span className="text-zinc-400 ml-2">{formatarKz(cat.total)}</span>
                                        </div>
                                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-red-500 to-orange-400" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
                    <h3 className="text-sm font-semibold text-zinc-100 mb-3">Top 10 maiores do ano</h3>
                    {dashboard.top_lancamentos.length === 0 ? (
                        <p className="text-xs text-zinc-500">Sem despesas este ano.</p>
                    ) : (
                        <div className="space-y-1.5 max-h-64 overflow-y-auto">
                            {dashboard.top_lancamentos.map((l) => (
                                <div key={l.id} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/50 last:border-0">
                                    <div className="flex-1 truncate pr-2">
                                        <p className="text-zinc-200 truncate">{l.descricao}</p>
                                        <p className="text-zinc-500">{l.data_lancamento}</p>
                                    </div>
                                    <span className="text-zinc-100 font-medium">{formatarKz(l.valor)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Banner upgrade BI */}
            <div className="rounded-xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/30 p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-zinc-100">Quer mais? Active o Dashboard BI Avançado</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Receitas vs Despesas, Cash Flow, Aging, Top devedores, Demonstração de Resultados, exportação Excel/PDF e mais...
                    </p>
                </div>
                <a href="/loja" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-lg border border-cyan-500/30 hover:border-cyan-500/50">
                    Ver na Loja →
                </a>
            </div>
        </div>
    );
}
