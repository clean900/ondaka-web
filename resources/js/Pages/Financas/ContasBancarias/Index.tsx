import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Building2, Plus, Edit, Trash2, ArrowDownCircle, ArrowUpCircle, Star, X, Check, ArrowLeftRight, ShieldCheck } from 'lucide-react';

type Conta = {
    id: number;
    nome: string;
    banco: string;
    iban: string | null;
    tipo: 'corrente' | 'poupanca';
    moeda: string;
    saldo_inicial: string;
    saldo_actual: string;
    notas: string | null;
    activa: boolean;
    principal: boolean;
    e_fundo_reserva: boolean;
    aceita_proxypay: boolean;
    aceita_manual: boolean;
    instrucoes_pagamento: string | null;
};

type Movimento = {
    id: number;
    data: string;
    tipo: 'entrada' | 'saida';
    descricao: string;
    valor: string;
    saldo_apos: string;
    origem_tipo: 'manual' | 'proxypay' | 'pagamento_aprovado' | 'despesa' | 'transferencia' | 'fundo_reserva';
    origem_id: number | null;
    criado_por: { id: number; name: string } | null;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Props = {
    condominio: { id: number; nome: string };
    condominios: { id: number; nome: string }[];
    contas: Conta[];
    contaSeleccionadaId: number | null;
    movimentos: Paginated<Movimento> | null;
};

const formatKz = (valor: string | number) => {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
};

const formatData = (data: string) => {
    const d = new Date(data);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
};

const ORIGEM_LABELS: Record<string, { label: string; color: string }> = {
    manual: { label: 'Manual', color: 'rgba(255,255,255,0.6)' },
    proxypay: { label: 'ProxyPay', color: '#67E8F9' },
    pagamento_aprovado: { label: 'Pag. aprov.', color: '#C4B5FD' },
    despesa: { label: 'Despesa', color: '#FCA5A5' },
    transferencia: { label: 'Transfer.', color: '#7DD3FC' },
    fundo_reserva: { label: 'Fundo res.', color: '#86EFAC' },
};

export default function Index({ condominio, condominios, contas, contaSeleccionadaId, movimentos }: Props) {
    const [modalNovaConta, setModalNovaConta] = useState(false);
    const [modalTransferir, setModalTransferir] = useState(false);
    const [modalReservar, setModalReservar] = useState(false);
    const [editandoConta, setEditandoConta] = useState<number | null>(null);

    const contaActual = contas.find((c) => c.id === contaSeleccionadaId);

    const formCriar = useForm({
        nome: '',
        banco: '',
        iban: '',
        tipo: 'corrente' as 'corrente' | 'poupanca',
        moeda: 'AOA',
        saldo_inicial: '',
        principal: contas.length === 0,
        e_fundo_reserva: false,
        aceita_proxypay: true,
        aceita_manual: true,
        instrucoes_pagamento: '',
    });

    const formMovimento = useForm({
        data: new Date().toISOString().split('T')[0],
        tipo: 'entrada' as 'entrada' | 'saida',
        descricao: '',
        valor: '',
    });

    const formTransferir = useForm({
        conta_origem_id: contaSeleccionadaId ?? (contas[0]?.id ?? null) as number | null,
        conta_destino_id: null as number | null,
        data: new Date().toISOString().split('T')[0],
        descricao: '',
        valor: '',
    });

    const formEditar = useForm({
        nome: '',
        banco: '',
        iban: '',
        tipo: 'corrente' as 'corrente' | 'poupanca',
        moeda: 'AOA',
        saldo_inicial: '',
        principal: false,
        e_fundo_reserva: false,
        aceita_proxypay: true,
        aceita_manual: true,
        instrucoes_pagamento: '',
    });

    const formReservar = useForm({
        conta_origem_id: null as number | null,
        data: new Date().toISOString().split('T')[0],
        descricao: '',
        valor: '',
    });

    useEffect(() => {
        if (editandoConta !== null) {
            const conta = contas.find(c => c.id === editandoConta);
            if (conta) {
                formEditar.setData({
                    nome: conta.nome,
                    banco: conta.banco,
                    iban: conta.iban || '',
                    tipo: conta.tipo,
                    moeda: conta.moeda,
                    saldo_inicial: conta.saldo_inicial,
                    principal: conta.principal,
                    e_fundo_reserva: conta.e_fundo_reserva,
                    aceita_proxypay: conta.aceita_proxypay,
                    aceita_manual: conta.aceita_manual,
                    instrucoes_pagamento: conta.instrucoes_pagamento || '',
                });
            }
        }
    }, [editandoConta]);

    const fecharModalEditar = () => {
        setEditandoConta(null);
        formEditar.reset();
    };

    const submitEditar = (e: React.FormEvent) => {
        e.preventDefault();
        if (editandoConta === null) return;
        formEditar.put(`/financas/contas-bancarias/${editandoConta}`, {
            preserveScroll: true,
            onSuccess: () => fecharModalEditar(),
        });
    };

    const submitCriar: FormEventHandler = (e) => {
        e.preventDefault();
        formCriar.post('/financas/contas-bancarias', {
            onSuccess: () => {
                setModalNovaConta(false);
                formCriar.reset();
            },
        });
    };

    const submitMovimento: FormEventHandler = (e) => {
        e.preventDefault();
        if (!contaActual) return;
        formMovimento.post(`/financas/contas-bancarias/${contaActual.id}/movimentos`, {
            preserveScroll: true,
            onSuccess: () => formMovimento.reset('descricao', 'valor'),
        });
    };

    const submitTransferir: FormEventHandler = (e) => {
        e.preventDefault();
        formTransferir.post('/financas/contas-bancarias/transferir', {
            preserveScroll: true,
            onSuccess: () => { setModalTransferir(false); formTransferir.reset('descricao', 'valor', 'conta_destino_id'); },
        });
    };

    const contaFundo = contas.find((c) => c.e_fundo_reserva);

    const submitReservar: FormEventHandler = (e) => {
        e.preventDefault();
        formReservar.post('/financas/contas-bancarias/reservar-fundo', {
            preserveScroll: true,
            onSuccess: () => { setModalReservar(false); formReservar.reset('descricao', 'valor'); },
        });
    };

    const seleccionarConta = (id: number) => {
        router.visit(`/financas/contas-bancarias?conta_id=${id}`, { preserveState: false });
    };

    const marcarPrincipal = (conta: Conta) => {
        router.patch(`/financas/contas-bancarias/${conta.id}/marcar-principal`, {}, { preserveScroll: true });
    };

    const apagarConta = (conta: Conta) => {
        if (!confirm(`Apagar a conta "${conta.nome}"? Todos os movimentos serão eliminados.`)) return;
        router.delete(`/financas/contas-bancarias/${conta.id}`);
    };

    const apagarMovimento = (movId: number) => {
        if (!confirm('Apagar este movimento? Os saldos serão recalculados.')) return;
        router.delete(`/financas/contas-bancarias/movimentos/${movId}`, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Contas Bancárias · ONDAKA" />

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-medium">
                        <span style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #A855F7 60%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            Contas Bancárias
                        </span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5">
                        <select
                            value={condominio.id}
                            onChange={(e) => router.post('/financas/contas-bancarias/trocar-condominio', { condominio_id: Number(e.target.value) }, { preserveScroll: true })}
                            className="bg-white/[0.04] border border-white/10 rounded-md text-sm text-white px-3 py-1.5 focus:outline-none focus:border-purple-400/50"
                        >
                            {condominios.map((cond) => (
                                <option key={cond.id} value={cond.id} className="bg-[#16163A]">
                                    {cond.nome}
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-white/50">
                            · {contas.length} {contas.length === 1 ? 'conta registada' : 'contas registadas'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {contaFundo && contas.length >= 2 && (
                        <button
                            onClick={() => setModalReservar(true)}
                            className="px-4 py-2.5 rounded-md text-white text-sm font-medium bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30"
                        >
                            <ShieldCheck className="inline h-4 w-4 mr-1 -mt-0.5" /> Reservar fundo
                        </button>
                    )}
                    {contas.length >= 2 && (
                        <button
                            onClick={() => setModalTransferir(true)}
                            className="px-4 py-2.5 rounded-md text-white text-sm font-medium bg-white/10 hover:bg-white/15 border border-white/10"
                        >
                            <ArrowLeftRight className="inline h-4 w-4 mr-1 -mt-0.5" /> Transferir
                        </button>
                    )}
                    <button
                        onClick={() => setModalNovaConta(true)}
                        className="px-5 py-2.5 rounded-md text-white text-sm font-medium"
                        style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)' }}
                    >
                        <Plus className="inline h-4 w-4 mr-1 -mt-0.5" /> Nova conta
                    </button>
                </div>
            </div>

            {contas.length === 0 ? (
                <div className="bg-[#0F0F23] border border-purple-500/15 rounded-xl p-8 text-center">
                    <Building2 className="h-12 w-12 text-purple-400/40 mx-auto mb-3" />
                    <div className="text-white font-medium mb-1">Ainda não tens contas bancárias</div>
                    <p className="text-sm text-white/50 mb-4">Clica em "Nova conta" para registar a primeira conta do condomínio.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {contas.map((conta) => {
                            const isSelected = conta.id === contaSeleccionadaId;
                            const saldo = parseFloat(conta.saldo_actual);
                            return (
                                <div
                                    key={conta.id}
                                    onClick={() => seleccionarConta(conta.id)}
                                    className="cursor-pointer rounded-xl p-4 transition-all"
                                    style={{
                                        background: isSelected
                                            ? 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(168,85,247,0.08))'
                                            : 'rgba(255,255,255,0.03)',
                                        border: isSelected ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                        borderLeft: conta.principal ? '3px solid #00D4FF' : undefined,
                                    }}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-1.5">
                                            {conta.principal ? (
                                                <span className="text-[9px] font-medium tracking-wider px-2 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)' }}>
                                                    PRINCIPAL
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-white/40 uppercase tracking-wider">Secundária</span>
                                            )}
                                            {conta.e_fundo_reserva && (
                                                <span className="text-[9px] font-medium tracking-wider px-2 py-0.5 rounded-full text-emerald-200 bg-emerald-500/20 border border-emerald-500/30">
                                                    FUNDO RESERVA
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            {!conta.principal && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); marcarPrincipal(conta); }}
                                                    className="text-white/40 hover:text-cyan-300 p-0.5"
                                                    title="Tornar principal"
                                                >
                                                    <Star className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditandoConta(conta.id); }}
                                                className="text-white/40 hover:text-white p-0.5"
                                                title="Editar"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); apagarConta(conta); }}
                                                className="text-white/40 hover:text-red-300 p-0.5"
                                                title="Apagar"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-white font-medium text-sm">{conta.banco} · {conta.tipo === 'corrente' ? 'Corrente' : 'Poupança'}</div>
                                    {conta.iban && <div className="text-[11px] font-mono text-white/40 mt-0.5">{conta.iban}</div>}
                                    <div className="text-base font-medium mt-2 mb-2" style={{ color: saldo >= 0 ? '#6EE7B7' : '#FCA5A5' }}>
                                        {formatKz(conta.saldo_actual)} {conta.moeda === 'AOA' ? 'Kz' : conta.moeda}
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium ${conta.aceita_proxypay ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30' : 'text-white/40 bg-white/5 border border-white/10'}`}>
                                            {conta.aceita_proxypay ? 'ProxyPay' : 'ProxyPay off'}
                                        </span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium ${conta.aceita_manual ? 'text-purple-200 bg-purple-500/15 border border-purple-500/30' : 'text-white/40 bg-white/5 border border-white/10'}`}>
                                            {conta.aceita_manual ? 'Manual' : 'Manual off'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {contaActual && (
                        <>
                            <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-lg p-3 mb-5">
                                <form onSubmit={submitMovimento}>
                                    <div className="text-xs text-white/70 font-medium mb-2.5">
                                        <Plus className="inline h-3 w-3 mr-1 -mt-0.5" /> Adicionar movimento à conta <span className="text-cyan-300">{contaActual.banco}</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '120px 110px 1fr 130px 100px', gap: '8px' }}>
                                        <input type="date" className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white" value={formMovimento.data.data} onChange={(e) => formMovimento.setData('data', e.target.value)} required max={new Date().toISOString().split('T')[0]} />
                                        <select className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white" value={formMovimento.data.tipo} onChange={(e) => formMovimento.setData('tipo', e.target.value as 'entrada' | 'saida')}>
                                            <option value="entrada">Entrada</option>
                                            <option value="saida">Saída</option>
                                        </select>
                                        <input className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white" placeholder="Descrição (ex: Quota Maio · Fracção 12)" value={formMovimento.data.descricao} onChange={(e) => formMovimento.setData('descricao', e.target.value)} required />
                                        <input type="number" step="0.01" min="0.01" className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white" placeholder="Valor (Kz)" value={formMovimento.data.valor} onChange={(e) => formMovimento.setData('valor', e.target.value)} required />
                                        <button type="submit" disabled={formMovimento.processing} className="rounded-md text-white text-xs font-medium" style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)' }}>
                                            {formMovimento.processing ? '...' : 'Adicionar'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white text-sm font-medium">
                                    Movimentos · {contaActual.banco}
                                </h3>
                                {movimentos && <span className="text-[11px] text-white/40">{movimentos.data.length} de {movimentos.total}</span>}
                            </div>

                            {(!movimentos || movimentos.data.length === 0) ? (
                                <div className="text-center py-6 text-white/40 text-sm bg-[#0F0F23] border border-white/5 rounded-lg">Nenhum movimento ainda. Adiciona o primeiro acima.</div>
                            ) : (
                                <div className="bg-[#0F0F23] border border-purple-500/15 rounded-xl p-3">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="text-white/40 text-[10px] uppercase tracking-wider">
                                                <th className="text-left p-2 border-b border-white/10 font-normal">Data</th>
                                                <th className="text-left p-2 border-b border-white/10 font-normal">Tipo</th>
                                                <th className="text-left p-2 border-b border-white/10 font-normal">Descrição</th>
                                                <th className="text-left p-2 border-b border-white/10 font-normal">Origem</th>
                                                <th className="text-right p-2 border-b border-white/10 font-normal">Valor</th>
                                                <th className="text-right p-2 border-b border-white/10 font-normal">Saldo</th>
                                                <th className="border-b border-white/10"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {movimentos.data.map((mov) => {
                                                const origem = ORIGEM_LABELS[mov.origem_tipo] ?? ORIGEM_LABELS.manual;
                                                return (
                                                    <tr key={mov.id} className="border-b border-white/[0.04]">
                                                        <td className="p-2 text-white/75">{formatData(mov.data)}</td>
                                                        <td className="p-2">
                                                            {mov.tipo === 'entrada' ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(34,197,94,0.15)', color: '#86EFAC' }}>
                                                                    <ArrowDownCircle className="h-3 w-3" /> ENTRADA
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5' }}>
                                                                    <ArrowUpCircle className="h-3 w-3" /> SAÍDA
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-2 text-white/85">{mov.descricao}</td>
                                                        <td className="p-2"><span className="text-[10px] uppercase tracking-wider" style={{ color: origem.color }}>{origem.label}</span></td>
                                                        <td className="p-2 text-right font-medium" style={{ color: mov.tipo === 'entrada' ? '#6EE7B7' : '#FCA5A5' }}>
                                                            {mov.tipo === 'entrada' ? '+' : '−'}{formatKz(mov.valor)}
                                                        </td>
                                                        <td className="p-2 text-right text-white/85">{formatKz(mov.saldo_apos)}</td>
                                                        <td className="p-2 text-right">
                                                            {mov.origem_tipo === 'manual' && (
                                                                <button onClick={() => apagarMovimento(mov.id)} className="px-1.5 py-0.5 rounded text-white/40 hover:text-red-300 hover:bg-red-500/10" title="Apagar movimento">
                                                                    <Trash2 className="h-3 w-3" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {movimentos.last_page > 1 && (
                                        <div className="flex items-center justify-center gap-1 mt-4">
                                            {movimentos.links.map((link, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                                    disabled={!link.url}
                                                    className={`px-2 py-1 text-xs rounded ${link.active ? 'bg-purple-500/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'} ${!link.url && 'opacity-30 cursor-not-allowed'}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {modalTransferir && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#0F0F23] border border-purple-500/30 rounded-xl p-5 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-semibold">Transferir entre contas</h3>
                            <button onClick={() => setModalTransferir(false)} className="text-white/40 hover:text-white p-1"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={submitTransferir} className="space-y-3">
                            <div>
                                <label className="block text-xs text-white/60 mb-1">Conta de origem</label>
                                <select value={formTransferir.data.conta_origem_id ?? ''} onChange={(e) => formTransferir.setData('conta_origem_id', e.target.value ? parseInt(e.target.value) : null)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white">
                                    {contas.map((c) => <option key={c.id} value={c.id}>{c.nome} — {formatKz(c.saldo_actual)} {c.moeda}</option>)}
                                </select>
                                {formTransferir.errors.conta_origem_id && <p className="text-xs text-red-400 mt-1">{formTransferir.errors.conta_origem_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs text-white/60 mb-1">Conta de destino</label>
                                <select value={formTransferir.data.conta_destino_id ?? ''} onChange={(e) => formTransferir.setData('conta_destino_id', e.target.value ? parseInt(e.target.value) : null)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white">
                                    <option value="">— Escolher —</option>
                                    {contas.filter((c) => c.id !== formTransferir.data.conta_origem_id).map((c) => <option key={c.id} value={c.id}>{c.nome} — {formatKz(c.saldo_actual)} {c.moeda}</option>)}
                                </select>
                                {formTransferir.errors.conta_destino_id && <p className="text-xs text-red-400 mt-1">{formTransferir.errors.conta_destino_id}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-white/60 mb-1">Valor</label>
                                    <input type="number" step="0.01" min="0.01" value={formTransferir.data.valor} onChange={(e) => formTransferir.setData('valor', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white" />
                                    {formTransferir.errors.valor && <p className="text-xs text-red-400 mt-1">{formTransferir.errors.valor}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs text-white/60 mb-1">Data</label>
                                    <input type="date" value={formTransferir.data.data} onChange={(e) => formTransferir.setData('data', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-white/60 mb-1">Descrição (opcional)</label>
                                <input type="text" value={formTransferir.data.descricao} onChange={(e) => formTransferir.setData('descricao', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white" placeholder="Ex: Reforço do fundo de reserva" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setModalTransferir(false)} className="px-4 py-2 rounded text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10">Cancelar</button>
                                <button type="submit" disabled={formTransferir.processing} className="px-5 py-2 rounded text-white text-sm font-medium disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)' }}>
                                    <ArrowLeftRight className="inline h-4 w-4 mr-1 -mt-0.5" /> {formTransferir.processing ? 'A transferir...' : 'Transferir'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalReservar && contaFundo && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#0F0F23] border border-emerald-500/30 rounded-xl p-5 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-semibold">Reservar para o Fundo de Reserva</h3>
                            <button onClick={() => setModalReservar(false)} className="text-white/40 hover:text-white p-1"><X className="h-5 w-5" /></button>
                        </div>
                        <p className="text-xs text-white/50 mb-3">Move um valor para a conta do fundo de reserva: <strong className="text-emerald-300">{contaFundo.nome}</strong>.</p>
                        <form onSubmit={submitReservar} className="space-y-3">
                            <div>
                                <label className="block text-xs text-white/60 mb-1">Conta de origem</label>
                                <select value={formReservar.data.conta_origem_id ?? ''} onChange={(e) => formReservar.setData('conta_origem_id', e.target.value ? parseInt(e.target.value) : null)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white">
                                    <option value="">— Escolher —</option>
                                    {contas.filter((c) => c.id !== contaFundo.id).map((c) => <option key={c.id} value={c.id}>{c.nome} — {formatKz(c.saldo_actual)} {c.moeda}</option>)}
                                </select>
                                {formReservar.errors.conta_origem_id && <p className="text-xs text-red-400 mt-1">{formReservar.errors.conta_origem_id}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-white/60 mb-1">Valor</label>
                                    <input type="number" step="0.01" min="0.01" value={formReservar.data.valor} onChange={(e) => formReservar.setData('valor', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white" />
                                    {formReservar.errors.valor && <p className="text-xs text-red-400 mt-1">{formReservar.errors.valor}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs text-white/60 mb-1">Data</label>
                                    <input type="date" value={formReservar.data.data} onChange={(e) => formReservar.setData('data', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-white/60 mb-1">Descrição (opcional)</label>
                                <input type="text" value={formReservar.data.descricao} onChange={(e) => formReservar.setData('descricao', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white" placeholder="Ex: Reserva de Junho" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setModalReservar(false)} className="px-4 py-2 rounded text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10">Cancelar</button>
                                <button type="submit" disabled={formReservar.processing} className="px-5 py-2 rounded text-white text-sm font-medium disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500">
                                    <ShieldCheck className="inline h-4 w-4 mr-1 -mt-0.5" /> {formReservar.processing ? 'A reservar...' : 'Reservar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalNovaConta && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#0F0F23] border border-purple-500/30 rounded-xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-white text-base font-medium">Nova conta bancária</h2>
                            <button onClick={() => setModalNovaConta(false)} className="text-white/40 hover:text-white p-1">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={submitCriar} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-white/60 block mb-1">Nome</label>
                                    <input className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white" placeholder="ex: Conta Principal BAI" value={formCriar.data.nome} onChange={(e) => formCriar.setData('nome', e.target.value)} required />
                                    {formCriar.errors.nome && <span className="text-red-400 text-xs">{formCriar.errors.nome}</span>}
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-white/60 block mb-1">Banco</label>
                                    <input className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white" placeholder="BAI, BFA, BIC..." value={formCriar.data.banco} onChange={(e) => formCriar.setData('banco', e.target.value)} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-white/60 block mb-1">IBAN (opcional)</label>
                                    <input className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white font-mono" placeholder="AO06 ..." value={formCriar.data.iban} onChange={(e) => formCriar.setData('iban', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-white/60 block mb-1">Tipo</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white" value={formCriar.data.tipo} onChange={(e) => formCriar.setData('tipo', e.target.value as 'corrente' | 'poupanca')}>
                                        <option value="corrente">Corrente</option>
                                        <option value="poupanca">Poupança</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-white/60 block mb-1">Moeda</label>
                                    <input className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white" value={formCriar.data.moeda} onChange={(e) => formCriar.setData('moeda', e.target.value)} maxLength={3} />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-white/60 block mb-1">Saldo inicial (Kz)</label>
                                    <input type="number" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white" placeholder="0,00" value={formCriar.data.saldo_inicial} onChange={(e) => formCriar.setData('saldo_inicial', e.target.value)} />
                                </div>
                            </div>

                            <div className="bg-white/[0.02] border border-purple-500/20 rounded-lg p-3">
                                <div className="text-[10px] uppercase tracking-wider text-white/70 mb-2 font-medium">Configuração de pagamentos</div>
                                <label className="flex items-center gap-2 text-sm text-white/80 mb-2 cursor-pointer">
                                    <input type="checkbox" checked={formCriar.data.principal} onChange={(e) => formCriar.setData('principal', e.target.checked)} className="accent-purple-500" />
                                    Marcar como conta principal
                                </label>
                                <label className="flex items-center gap-2 text-sm text-white/80 mb-2 cursor-pointer">
                                    <input type="checkbox" checked={formCriar.data.e_fundo_reserva} onChange={(e) => formCriar.setData('e_fundo_reserva', e.target.checked)} className="accent-emerald-500" />
                                    Conta do Fundo de Reserva
                                </label>
                                <label className="flex items-center gap-2 text-sm text-white/80 mb-2 cursor-pointer">
                                    <input type="checkbox" checked={formCriar.data.aceita_proxypay} onChange={(e) => formCriar.setData('aceita_proxypay', e.target.checked)} className="accent-purple-500" />
                                    Recebe pagamentos ProxyPay
                                </label>
                                <label className="flex items-center gap-2 text-sm text-white/80 mb-3 cursor-pointer">
                                    <input type="checkbox" checked={formCriar.data.aceita_manual} onChange={(e) => formCriar.setData('aceita_manual', e.target.checked)} className="accent-purple-500" />
                                    Aceita transferências/depósitos manuais
                                </label>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-white/60 block mb-1">Instruções aos condóminos (opcional)</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white"
                                        rows={2}
                                        placeholder="ex: Faça transferência para AO06... e envie comprovativo na app"
                                        value={formCriar.data.instrucoes_pagamento}
                                        onChange={(e) => formCriar.setData('instrucoes_pagamento', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setModalNovaConta(false)} className="px-4 py-2 rounded-md text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={formCriar.processing} className="px-5 py-2 rounded-md text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)' }}>
                                    <Check className="inline h-4 w-4 mr-1 -mt-0.5" />
                                    {formCriar.processing ? 'A criar...' : 'Criar conta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Editar Conta */}
            {editandoConta !== null && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#0F0F23] border border-purple-500/30 rounded-xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-white text-base font-medium">Editar conta bancária</h2>
                            <button onClick={fecharModalEditar} className="text-white/40 hover:text-white p-1">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={submitEditar} className="space-y-3">
                            <div>
                                <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Nome</label>
                                <input type="text" value={formEditar.data.nome} onChange={e => formEditar.setData('nome', e.target.value)} required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-purple-500/50" />
                            </div>
                            <div>
                                <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Banco</label>
                                <input type="text" value={formEditar.data.banco} onChange={e => formEditar.setData('banco', e.target.value)} required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-purple-500/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">IBAN (opcional)</label>
                                    <input type="text" value={formEditar.data.iban} onChange={e => formEditar.setData('iban', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-purple-500/50" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Tipo</label>
                                    <select value={formEditar.data.tipo} onChange={e => formEditar.setData('tipo', e.target.value as 'corrente' | 'poupanca')} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-purple-500/50">
                                        <option value="corrente">Corrente</option>
                                        <option value="poupanca">Poupança</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Moeda</label>
                                    <input type="text" value={formEditar.data.moeda} onChange={e => formEditar.setData('moeda', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-purple-500/50" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Saldo inicial (Kz)</label>
                                    <input type="number" step="0.01" value={formEditar.data.saldo_inicial} onChange={e => formEditar.setData('saldo_inicial', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-purple-500/50" />
                                </div>
                            </div>
                            <div className="border border-white/10 rounded-md p-3 space-y-2">
                                <p className="text-[10px] text-white/60 uppercase tracking-wider">Configuração de pagamentos</p>
                                <label className="flex items-center gap-2 text-sm text-white/90">
                                    <input type="checkbox" checked={formEditar.data.principal} onChange={e => formEditar.setData('principal', e.target.checked)} className="rounded" />
                                    Marcar como conta principal
                                </label>
                                <label className="flex items-center gap-2 text-sm text-white/90">
                                    <input type="checkbox" checked={formEditar.data.e_fundo_reserva} onChange={e => formEditar.setData('e_fundo_reserva', e.target.checked)} className="rounded" />
                                    Conta do Fundo de Reserva
                                </label>
                                <label className="flex items-center gap-2 text-sm text-white/90">
                                    <input type="checkbox" checked={formEditar.data.aceita_proxypay} onChange={e => formEditar.setData('aceita_proxypay', e.target.checked)} className="rounded" />
                                    Recebe pagamentos ProxyPay
                                </label>
                                <label className="flex items-center gap-2 text-sm text-white/90">
                                    <input type="checkbox" checked={formEditar.data.aceita_manual} onChange={e => formEditar.setData('aceita_manual', e.target.checked)} className="rounded" />
                                    Aceita transferências/depósitos manuais
                                </label>
                            </div>
                            <div>
                                <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Instruções aos condóminos (opcional)</label>
                                <textarea value={formEditar.data.instrucoes_pagamento} onChange={e => formEditar.setData('instrucoes_pagamento', e.target.value)} placeholder="ex: Faça transferência para AO06... e envie comprovativo na app" rows={2} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-purple-500/50" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={fecharModalEditar} className="px-4 py-2 rounded-md text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={formEditar.processing} className="px-5 py-2 rounded-md text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)' }}>
                                    <Check className="inline h-4 w-4 mr-1 -mt-0.5" />
                                    {formEditar.processing ? 'A guardar...' : 'Guardar alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
