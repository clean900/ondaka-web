import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, FormEvent } from 'react';
import { Check, X, Plus, Edit, Trash2, CheckCircle, DollarSign, Ban, Filter, Receipt } from 'lucide-react';

type Despesa = {
    id: number;
    tipo: 'condominio' | 'empresa';
    condominio_id: number | null;
    categoria_id: number | null;
    conta_bancaria_id: number;
    data_despesa: string;
    valor: string;
    descricao: string;
    fornecedor: string | null;
    estado: 'pendente' | 'aprovada' | 'paga' | 'cancelada';
    notas: string | null;
    categoria?: { id: number; nome: string; cor: string | null; icone: string | null };
    condominio?: { id: number; nome: string };
    conta_bancaria?: { id: number; nome: string; banco: string };
    criada_por?: { id: number; name: string };
    aprovada_em: string | null;
    paga_em: string | null;
    cancelada_em: string | null;
};

type Categoria = { id: number; nome: string; slug: string; icone: string | null; cor: string | null };
type Conta = { id: number; nome: string; banco: string; moeda: string; saldo_actual: string; principal: boolean; condominio_id: number };
type Condominio = { id: number; nome: string };

type Props = {
    despesas: { data: Despesa[]; links: { url: string | null; label: string; active: boolean }[]; meta?: any };
    stats: { total: number; pendentes: number; aprovadas: number; pagas_mes: number };
    categorias: Categoria[];
    contas: Conta[];
    condominios: Condominio[];
    filtros: { estado: string | null; tipo: string | null; categoria_id: number | null; condominio_id: number | null };
};

const ESTADO_COR: Record<string, { bg: string; text: string; label: string }> = {
    pendente: { bg: 'rgba(250,204,21,0.12)', text: '#facc15', label: 'Pendente' },
    aprovada: { bg: 'rgba(6,182,212,0.12)', text: '#06b6d4', label: 'Aprovada' },
    paga: { bg: 'rgba(34,197,94,0.12)', text: '#22c55e', label: 'Paga' },
    cancelada: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', label: 'Cancelada' },
};

function formatarKz(valor: string | number): string {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + ' Kz';
}

function formatarData(d: string): string {
    return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DespesasIndex({ despesas, stats, categorias, contas, condominios, filtros }: Props) {
    const [modalNova, setModalNova] = useState(false);
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [confirmandoPaga, setConfirmandoPaga] = useState<Despesa | null>(null);
    const [metodoPagamento, setMetodoPagamento] = useState('transferencia');
    const [contaPagamento, setContaPagamento] = useState<number | null>(null);
    const [comprovativo, setComprovativo] = useState<File | null>(null);

    const abrirPagamento = (d: Despesa) => {
        setContaPagamento(d.conta_bancaria_id);
        setComprovativo(null);
        setConfirmandoPaga(d);
    };

    const form = useForm({
        tipo: 'condominio' as 'condominio' | 'empresa',
        condominio_id: null as number | null,
        categoria_id: null as number | null,
        conta_bancaria_id: contas.find(c => c.principal)?.id ?? contas[0]?.id ?? null,
        data_despesa: new Date().toISOString().split('T')[0],
        valor: '',
        descricao: '',
        fornecedor: '',
        notas: '',
    });

    const formEditar = useForm({
        tipo: 'condominio' as 'condominio' | 'empresa',
        condominio_id: null as number | null,
        categoria_id: null as number | null,
        conta_bancaria_id: null as number | null,
        data_despesa: '',
        valor: '',
        descricao: '',
        fornecedor: '',
        notas: '',
    });

    const submitNova = (e: FormEvent) => {
        e.preventDefault();
        form.post('/despesas', {
            preserveScroll: true,
            onSuccess: () => { form.reset(); setModalNova(false); },
        });
    };

    const abrirEditar = (d: Despesa) => {
        formEditar.setData({
            tipo: d.tipo,
            condominio_id: d.condominio_id,
            categoria_id: d.categoria_id,
            conta_bancaria_id: d.conta_bancaria_id,
            data_despesa: d.data_despesa.split('T')[0],
            valor: d.valor,
            descricao: d.descricao,
            fornecedor: d.fornecedor ?? '',
            notas: d.notas ?? '',
        });
        setEditandoId(d.id);
    };

    const submitEditar = (e: FormEvent) => {
        e.preventDefault();
        if (editandoId === null) return;
        formEditar.put(`/despesas/${editandoId}`, {
            preserveScroll: true,
            onSuccess: () => { setEditandoId(null); formEditar.reset(); },
        });
    };

    const aprovar = (id: number) => {
        router.post(`/despesas/${id}/aprovar`, {}, { preserveScroll: true });
    };

    const marcarPaga = () => {
        if (!confirmandoPaga) return;
        router.post(`/despesas/${confirmandoPaga.id}/pagar`, {
            metodo_pagamento: metodoPagamento,
            conta_bancaria_id: contaPagamento,
            ...(comprovativo ? { comprovativo } : {}),
        }, {
            preserveScroll: true,
            forceFormData: !!comprovativo,
            onSuccess: () => setConfirmandoPaga(null),
        });
    };

    const cancelar = (id: number) => {
        const motivo = window.prompt('Motivo do cancelamento (opcional):') ?? '';
        router.post(`/despesas/${id}/cancelar`, { motivo }, { preserveScroll: true });
    };

    const eliminar = (id: number) => {
        if (!window.confirm('Eliminar esta despesa? Esta acção não pode ser desfeita.')) return;
        router.delete(`/despesas/${id}`, { preserveScroll: true });
    };

    const aplicarFiltro = (campo: string, valor: any) => {
        router.get('/despesas', { ...filtros, [campo]: valor || undefined }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Despesas" />

            <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium text-white flex items-center gap-2">
                            <Receipt className="h-6 w-6 text-purple-400" />
                            Despesas
                        </h1>
                        <p className="text-sm text-white/50 mt-1">Registo e gestão de despesas do condomínio e da empresa</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/despesas/categorias"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/70 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10"
                        >
                            Gerir categorias
                        </Link>
                        <button
                            onClick={() => setModalNova(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium"
                            style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)' }}
                        >
                            <Plus className="h-4 w-4" /> Nova despesa
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-lg p-4 border border-white/10 bg-white/5">
                        <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Total</div>
                        <div className="text-2xl font-medium text-white">{stats.total}</div>
                    </div>
                    <div className="rounded-lg p-4 border border-yellow-500/20 bg-yellow-500/5">
                        <div className="text-[10px] text-yellow-300 uppercase tracking-wider mb-1">Pendentes</div>
                        <div className="text-2xl font-medium text-yellow-200">{stats.pendentes}</div>
                    </div>
                    <div className="rounded-lg p-4 border border-cyan-500/20 bg-cyan-500/5">
                        <div className="text-[10px] text-cyan-300 uppercase tracking-wider mb-1">Aprovadas</div>
                        <div className="text-2xl font-medium text-cyan-200">{stats.aprovadas}</div>
                    </div>
                    <div className="rounded-lg p-4 border border-green-500/20 bg-green-500/5">
                        <div className="text-[10px] text-green-300 uppercase tracking-wider mb-1">Pagas este mês</div>
                        <div className="text-xl font-medium text-green-200">{formatarKz(stats.pagas_mes)}</div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="rounded-lg p-3 border border-white/10 bg-white/5 flex flex-wrap items-center gap-2">
                    <Filter className="h-4 w-4 text-white/40" />
                    <select value={filtros.estado ?? ''} onChange={e => aplicarFiltro('estado', e.target.value)} className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs">
                        <option value="">Todos os estados</option>
                        <option value="pendente">Pendentes</option>
                        <option value="aprovada">Aprovadas</option>
                        <option value="paga">Pagas</option>
                        <option value="cancelada">Canceladas</option>
                    </select>
                    <select value={filtros.tipo ?? ''} onChange={e => aplicarFiltro('tipo', e.target.value)} className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs">
                        <option value="">Todos os tipos</option>
                        <option value="condominio">Condomínio</option>
                        <option value="empresa">Empresa</option>
                    </select>
                    <select value={filtros.categoria_id ?? ''} onChange={e => aplicarFiltro('categoria_id', e.target.value)} className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs">
                        <option value="">Todas as categorias</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <select value={filtros.condominio_id ?? ''} onChange={e => aplicarFiltro('condominio_id', e.target.value)} className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs">
                        <option value="">Todos os condomínios</option>
                        {condominios.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>

                {/* Lista */}
                <div className="rounded-lg border border-white/10 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr className="text-left text-[10px] uppercase tracking-wider text-white/50">
                                <th className="px-3 py-2.5">Data</th>
                                <th className="px-3 py-2.5">Descrição</th>
                                <th className="px-3 py-2.5">Categoria</th>
                                <th className="px-3 py-2.5">Tipo</th>
                                <th className="px-3 py-2.5">Conta</th>
                                <th className="px-3 py-2.5 text-right">Valor</th>
                                <th className="px-3 py-2.5">Estado</th>
                                <th className="px-3 py-2.5 text-right">Acções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {despesas.data.length === 0 && (
                                <tr><td colSpan={8} className="px-3 py-12 text-center text-white/40 text-sm">Sem despesas registadas.</td></tr>
                            )}
                            {despesas.data.map(d => {
                                const cor = ESTADO_COR[d.estado];
                                return (
                                    <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="px-3 py-2.5 text-white/80 text-xs">{formatarData(d.data_despesa)}</td>
                                        <td className="px-3 py-2.5">
                                            <div className="text-white text-sm">{d.descricao}</div>
                                            {d.fornecedor && <div className="text-white/40 text-[11px]">Fornecedor: {d.fornecedor}</div>}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            {d.categoria ? (
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px]" style={{ background: (d.categoria.cor ?? '#a855f7') + '22', color: d.categoria.cor ?? '#a855f7' }}>{d.categoria.nome}</span>
                                            ) : <span className="text-white/30 text-xs">—</span>}
                                        </td>
                                        <td className="px-3 py-2.5 text-white/70 text-xs">
                                            {d.tipo === 'condominio' ? (d.condominio?.nome ?? 'Condomínio') : 'Empresa'}
                                        </td>
                                        <td className="px-3 py-2.5 text-white/60 text-xs">{d.conta_bancaria?.nome ?? '—'}</td>
                                        <td className="px-3 py-2.5 text-right text-white text-sm font-medium">{formatarKz(d.valor)}</td>
                                        <td className="px-3 py-2.5">
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: cor.bg, color: cor.text }}>{cor.label}</span>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center justify-end gap-1">
                                                {d.estado === 'pendente' && (
                                                    <button onClick={() => aprovar(d.id)} title="Aprovar" className="p-1.5 rounded text-cyan-300 hover:bg-cyan-500/10"><CheckCircle className="h-4 w-4" /></button>
                                                )}
                                                {(d.estado === 'pendente' || d.estado === 'aprovada') && (
                                                    <button onClick={() => abrirPagamento(d)} title="Marcar paga" className="p-1.5 rounded text-green-300 hover:bg-green-500/10"><DollarSign className="h-4 w-4" /></button>
                                                )}
                                                {(d.estado === 'pendente' || d.estado === 'aprovada') && (
                                                    <button onClick={() => abrirEditar(d)} title="Editar" className="p-1.5 rounded text-white/50 hover:bg-white/10 hover:text-white"><Edit className="h-4 w-4" /></button>
                                                )}
                                                {(d.estado === 'pendente' || d.estado === 'aprovada') && (
                                                    <button onClick={() => cancelar(d.id)} title="Cancelar" className="p-1.5 rounded text-orange-300 hover:bg-orange-500/10"><Ban className="h-4 w-4" /></button>
                                                )}
                                                {d.estado !== 'paga' && (
                                                    <button onClick={() => eliminar(d.id)} title="Eliminar" className="p-1.5 rounded text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                {despesas.links && despesas.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                        {despesas.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                className={`px-3 py-1 text-xs rounded ${link.active ? 'bg-purple-500/20 text-purple-200' : 'text-white/60 hover:text-white'} ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Nova Despesa */}
            {modalNova && (
                <ModalDespesa
                    titulo="Nova despesa"
                    form={form}
                    onSubmit={submitNova}
                    onClose={() => setModalNova(false)}
                    categorias={categorias}
                    contas={contas}
                    condominios={condominios}
                    submitLabel="Registar"
                />
            )}

            {/* Modal Editar Despesa */}
            {editandoId !== null && (
                <ModalDespesa
                    titulo="Editar despesa"
                    form={formEditar}
                    onSubmit={submitEditar}
                    onClose={() => { setEditandoId(null); formEditar.reset(); }}
                    categorias={categorias}
                    contas={contas}
                    condominios={condominios}
                    submitLabel="Guardar"
                />
            )}

            {/* Modal Confirmar Pagamento */}
            {confirmandoPaga && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0F0F23] border border-green-500/30 rounded-xl p-5 w-full max-w-md">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-white text-base font-medium">Confirmar pagamento</h2>
                            <button onClick={() => setConfirmandoPaga(null)} className="text-white/40 hover:text-white p-1"><X className="h-4 w-4" /></button>
                        </div>
                        <p className="text-sm text-white/70 mb-3">Vai marcar esta despesa como paga. Isto cria um movimento de <strong className="text-green-300">saída</strong> de <strong className="text-white">{formatarKz(confirmandoPaga.valor)}</strong> na conta escolhida abaixo.</p>
                        <p className="text-xs text-white/40 mb-4">O saldo da conta será actualizado automaticamente.</p>
                        <div className="mb-4">
                            <label className="block text-xs text-white/60 mb-1">Conta bancária</label>
                            <select value={contaPagamento ?? ''} onChange={(e) => setContaPagamento(e.target.value ? parseInt(e.target.value) : null)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white">
                                {contas
                                    .filter((c) => confirmandoPaga.condominio_id == null || c.condominio_id === confirmandoPaga.condominio_id)
                                    .map((c) => <option key={c.id} value={c.id}>{c.nome}{c.principal ? ' (principal)' : ''} — {c.banco}</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs text-white/60 mb-1">Método de pagamento</label>
                            <select value={metodoPagamento} onChange={(e) => setMetodoPagamento(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white">
                                <option value="transferencia">Transferência</option>
                                <option value="deposito">Depósito</option>
                                <option value="numerario">Numerário</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs text-white/60 mb-1">Comprovativo de pagamento (opcional)</label>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => setComprovativo(e.target.files?.[0] ?? null)}
                                className="w-full text-sm text-white/70 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-white/20"
                            />
                            {comprovativo && <p className="mt-1 text-xs text-white/40">{comprovativo.name}</p>}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setConfirmandoPaga(null)} className="px-4 py-2 rounded text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10">Cancelar</button>
                            <button onClick={marcarPaga} className="px-5 py-2 rounded text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                                <Check className="inline h-4 w-4 mr-1 -mt-0.5" /> Confirmar pagamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function ModalDespesa({ titulo, form, onSubmit, onClose, categorias, contas, condominios, submitLabel }: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#0F0F23] border border-purple-500/30 rounded-xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-base font-medium">{titulo}</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white p-1"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Tipo</label>
                            <select value={form.data.tipo} onChange={e => form.setData('tipo', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm">
                                <option value="condominio">Condomínio</option>
                                <option value="empresa">Empresa</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Data</label>
                            <input type="date" required value={form.data.data_despesa} onChange={e => form.setData('data_despesa', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm" />
                        </div>
                    </div>

                    {form.data.tipo === 'condominio' && (
                        <div>
                            <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Condomínio</label>
                            <select required value={form.data.condominio_id ?? ''} onChange={e => form.setData('condominio_id', e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm">
                                <option value="">— escolher —</option>
                                {condominios.map((c: Condominio) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Categoria</label>
                        <select required value={form.data.categoria_id ?? ''} onChange={e => form.setData('categoria_id', e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm">
                            <option value="">— escolher —</option>
                            {categorias.map((c: Categoria) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Conta bancária (saída)</label>
                        <select required value={form.data.conta_bancaria_id ?? ''} onChange={e => form.setData('conta_bancaria_id', e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm">
                            <option value="">— escolher —</option>
                            {contas.map((c: Conta) => <option key={c.id} value={c.id}>{c.nome}{c.principal ? ' (principal)' : ''} — {c.banco}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Valor (Kz)</label>
                        <input type="number" required step="0.01" min="0" value={form.data.valor} onChange={e => form.setData('valor', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm" />
                    </div>

                    <div>
                        <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Descrição</label>
                        <input type="text" required maxLength={500} value={form.data.descricao} onChange={e => form.setData('descricao', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm" />
                    </div>

                    <div>
                        <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Fornecedor (opcional)</label>
                        <input type="text" maxLength={200} value={form.data.fornecedor} onChange={e => form.setData('fornecedor', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm" />
                    </div>

                    <div>
                        <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Notas (opcional)</label>
                        <textarea rows={2} value={form.data.notas} onChange={e => form.setData('notas', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm" />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10">Cancelar</button>
                        <button type="submit" disabled={form.processing} className="px-5 py-2 rounded-md text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)' }}>
                            <Check className="inline h-4 w-4 mr-1 -mt-0.5" /> {form.processing ? 'A guardar...' : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
