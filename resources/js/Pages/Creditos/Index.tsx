import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Wallet, Building2, CheckCircle2, Filter, X, AlertCircle, ArrowRight, Loader2, Send,
} from 'lucide-react';
import { useState, FormEventHandler } from 'react';

interface Fraccao { id: number; identificador: string; }
interface Condominio { id: number; nome: string; }
interface Condomino { id: number; nome_completo: string; }
interface PagamentoOrigem { id: number; referencia: string; }
interface CreatedBy { id: number; name: string; }

interface LancamentoOpcao {
    id: number;
    tipo: string;
    descricao: string;
    valor: string;
    valor_pago: string;
    em_divida: string;
    data_vencimento: string | null;
}

interface Credito {
    id: number;
    fraccao_id: number;
    valor: string;
    valor_usado: string;
    descricao: string;
    motivo: string | null;
    created_at: string;
    fraccao: Fraccao | null;
    condominio: Condominio | null;
    condomino: Condomino | null;
    pagamento_origem: PagamentoOrigem | null;
    created_by: CreatedBy | null;
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
    com_saldo: number;
    esgotados: number;
    saldo_total_disponivel: string;
}

interface Props {
    creditos: Paginacao<Credito>;
    stats: Stats;
    condominios: Condominio[];
    lancamentosPorFraccao: Record<number, LancamentoOpcao[]>;
    filtros: { condominio_id: string | null; fraccao_id: string | null; com_saldo: string | null };
    flash?: { success?: string };
}

const formatarKz = (valor: string | number): string => {
    const n = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' Kz';
};

const calcularSaldo = (c: Credito): string => {
    const saldo = parseFloat(c.valor) - parseFloat(c.valor_usado);
    return saldo.toFixed(2);
};

const tipoLabel: Record<string, string> = {
    quota_base: 'Taxa base',
    fundo_reserva: 'Fundo reserva',
    despesa_extra: 'Despesa extra',
    multa: 'Multa',
    juros: 'Juros',
    ajuste_credito: 'Ajuste crédito',
    ajuste_debito: 'Ajuste débito',
};

export default function CreditosIndex({ creditos, stats, condominios, lancamentosPorFraccao, filtros, flash }: Props) {
    const [condominioFiltro, setCondominioFiltro] = useState(filtros.condominio_id || '');
    const [comSaldoFiltro, setComSaldoFiltro] = useState(filtros.com_saldo || '');
    const [creditoSeleccionado, setCreditoSeleccionado] = useState<Credito | null>(null);

    const handleFiltrar: FormEventHandler = (e) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (condominioFiltro) params.condominio_id = condominioFiltro;
        if (comSaldoFiltro) params.com_saldo = comSaldoFiltro;
        router.get(route('creditos.index'), params, { preserveState: true });
    };

    const handleLimpar = () => {
        setCondominioFiltro(''); setComSaldoFiltro('');
        router.get(route('creditos.index'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Créditos" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Créditos dos Imóveis</h1>
                            <p className="text-sm text-zinc-400 mt-1">Saldos a favor dos condóminos (devolução de pagamentos)</p>
                        </div>
                    </div>

                    {flash?.success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex gap-3">
                            <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={18} />
                            <span className="text-emerald-400 text-sm">{flash.success}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatCard icon={<Wallet size={18} />} label="Total créditos" value={stats.total.toString()} color="zinc" />
                        <StatCard icon={<CheckCircle2 size={18} />} label="Com saldo" value={stats.com_saldo.toString()} color="emerald" />
                        <StatCard icon={<X size={18} />} label="Esgotados" value={stats.esgotados.toString()} color="zinc" />
                        <StatCard icon={<Wallet size={18} />} label="Saldo disponível" value={formatarKz(stats.saldo_total_disponivel)} color="cyan" />
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
                        <form onSubmit={handleFiltrar} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <select value={condominioFiltro} onChange={(e) => setCondominioFiltro(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                <option value="">Todos os condomínios</option>
                                {condominios.map((c) => (<option key={c.id} value={c.id}>{c.nome}</option>))}
                            </select>
                            <select value={comSaldoFiltro} onChange={(e) => setComSaldoFiltro(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                <option value="">Todos os créditos</option>
                                <option value="1">Apenas com saldo</option>
                            </select>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 flex-1 justify-center">
                                    <Filter size={14} /> Filtrar
                                </button>
                                {(condominioFiltro || comSaldoFiltro) && (
                                    <button type="button" onClick={handleLimpar} className="text-zinc-400 hover:text-white px-3 py-2 text-sm">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        {creditos.data.length === 0 ? (
                            <div className="p-12 text-center text-zinc-500">
                                <Wallet size={48} className="mx-auto mb-4 opacity-30" />
                                <p>Sem créditos com estes filtros.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-800">
                                {creditos.data.map((c) => {
                                    const saldo = calcularSaldo(c);
                                    const temSaldo = parseFloat(saldo) > 0;
                                    const lancamentosDisponiveis = lancamentosPorFraccao[c.fraccao_id] || [];
                                    return (
                                        <div key={c.id} className="block p-4 hover:bg-zinc-800/30 transition-colors">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                        <span className="font-bold text-white">Crédito #{c.id}</span>
                                                        {temSaldo ? (
                                                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400">Com saldo</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-500/10 text-zinc-400">Esgotado</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                                                        <span className="flex items-center gap-1">
                                                            <Building2 size={12} />
                                                            {c.condominio?.nome} · Imóvel {c.fraccao?.identificador}
                                                        </span>
                                                        {c.condomino && (<span>· {c.condomino.nome_completo}</span>)}
                                                        {c.pagamento_origem && (
                                                            <span className="flex items-center gap-1">
                                                                <ArrowRight size={12} /> Origem: {c.pagamento_origem.referencia}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {c.descricao && (
                                                        <p className="text-xs text-zinc-500 mt-1 truncate">{c.descricao}</p>
                                                    )}
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-base font-bold text-white">{formatarKz(saldo)}</div>
                                                    <div className="text-xs text-zinc-400">de {formatarKz(c.valor)}</div>
                                                    {parseFloat(c.valor_usado) > 0 && (
                                                        <div className="text-xs text-amber-400">Usado: {formatarKz(c.valor_usado)}</div>
                                                    )}
                                                    {temSaldo && (
                                                        <button
                                                            onClick={() => setCreditoSeleccionado(c)}
                                                            disabled={lancamentosDisponiveis.length === 0}
                                                            className="mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                                                            title={lancamentosDisponiveis.length === 0 ? 'Sem lançamentos em aberto nesta fracção' : 'Aplicar este crédito a um lançamento'}
                                                        >
                                                            <Send size={12} /> Usar crédito
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {creditos.last_page > 1 && (
                            <div className="border-t border-zinc-800 px-4 py-3 flex items-center justify-between">
                                <span className="text-xs text-zinc-500">
                                    Página {creditos.current_page} de {creditos.last_page} ({creditos.total} créditos)
                                </span>
                                <div className="flex gap-1">
                                    {creditos.links.map((link, i) => (
                                        <button key={i} onClick={() => link.url && router.get(link.url)} disabled={!link.url} className={`px-3 py-1 rounded text-xs ${link.active ? 'bg-cyan-500 text-white' : 'text-zinc-400 hover:text-white disabled:opacity-30'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                        <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                        <div className="text-xs text-blue-300/90">
                            <p className="font-semibold mb-1">Como funciona</p>
                            <p>Os créditos são gerados quando um pagamento confirmado é convertido em saldo. Para usar, clica em "Usar crédito" e escolhe um lançamento em aberto da mesma fracção.</p>
                        </div>
                    </div>
                </div>
            </div>

            {creditoSeleccionado && (
                <ModalUsarCredito
                    credito={creditoSeleccionado}
                    saldo={calcularSaldo(creditoSeleccionado)}
                    lancamentos={lancamentosPorFraccao[creditoSeleccionado.fraccao_id] || []}
                    onClose={() => setCreditoSeleccionado(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}

function ModalUsarCredito({ credito, saldo, lancamentos, onClose }: { credito: Credito; saldo: string; lancamentos: LancamentoOpcao[]; onClose: () => void }) {
    const form = useForm({
        lancamento_id: lancamentos[0]?.id?.toString() || '',
        valor: '',
    });

    const lancamentoEscolhido = lancamentos.find((l) => l.id.toString() === form.data.lancamento_id);
    const maxValor = lancamentoEscolhido
        ? Math.min(parseFloat(saldo), parseFloat(lancamentoEscolhido.em_divida)).toFixed(2)
        : saldo;

    const handlePreencherMax = () => {
        form.setData('valor', maxValor);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('creditos.usar', credito.id), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-lg w-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Usar crédito #{credito.id}</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-3 mb-4 text-xs">
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Saldo disponível:</span>
                        <span className="text-emerald-400 font-bold">{formatarKz(saldo)}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-zinc-400">Imóvel:</span>
                        <span className="text-white">{credito.condominio?.nome} · {credito.fraccao?.identificador}</span>
                    </div>
                </div>

                {form.errors.usar_credito && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3 text-xs text-red-400">
                        {form.errors.usar_credito}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Aplicar a lançamento</label>
                        <select value={form.data.lancamento_id} onChange={(e) => form.setData('lancamento_id', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                            {lancamentos.map((l) => (
                                <option key={l.id} value={l.id}>
                                    [{tipoLabel[l.tipo] || l.tipo}] {l.descricao} — em dívida: {formatarKz(l.em_divida)}
                                </option>
                            ))}
                        </select>
                        {form.errors.lancamento_id && <p className="text-xs text-red-400 mt-1">{form.errors.lancamento_id}</p>}
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">
                            Valor a aplicar (Kz) — máx: {formatarKz(maxValor)}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={maxValor}
                                value={form.data.valor}
                                onChange={(e) => form.setData('valor', e.target.value)}
                                placeholder="0.00"
                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                            />
                            <button type="button" onClick={handlePreencherMax} className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg text-xs font-semibold">
                                Máx
                            </button>
                        </div>
                        {form.errors.valor && <p className="text-xs text-red-400 mt-1">{form.errors.valor}</p>}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={form.processing} className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                            {form.processing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {form.processing ? 'A processar...' : 'Confirmar utilização'}
                        </button>
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-zinc-400 hover:text-white">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'zinc' | 'emerald' | 'cyan' | 'amber' }) {
    const colors = {
        zinc: 'text-zinc-400 bg-zinc-500/10',
        emerald: 'text-emerald-400 bg-emerald-500/10',
        cyan: 'text-cyan-400 bg-cyan-500/10',
        amber: 'text-amber-400 bg-amber-500/10',
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
