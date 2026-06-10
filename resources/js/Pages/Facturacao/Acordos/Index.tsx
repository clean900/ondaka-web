import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Handshake, Check, X, ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle, MessageSquare, BookOpen } from 'lucide-react';

interface Prestacao {
    numero: number;
    valor: string;
    data_vencimento: string;
    estado: string;
}

interface Proposta {
    autor: string;
    ronda: number;
    num_prestacoes: number;
    valor_com_juro: string | null;
    valor_entrada: string | null;
    observacoes: string | null;
    created_at: string;
}

interface Acordo {
    id: number;
    condomino_nome: string;
    condominio_nome: string;
    valor_total: string;
    valor_com_juro: string | null;
    valor_entrada: string | null;
    num_prestacoes: number;
    estado: string;
    rondas_condomino: number;
    rondas_gestor: number;
    observacoes: string | null;
    created_at: string;
    propostas: Proposta[];
    prestacoes: Prestacao[];
}

interface Props {
    acordos: Acordo[];
    estadoFiltro: string;
}

const ESTADOS: Record<string, { label: string; cor: string }> = {
    aguarda_gestor: { label: 'Aguarda resposta', cor: 'text-amber-400 bg-amber-400/10' },
    aguarda_condomino: { label: 'Com o condómino', cor: 'text-purple-400 bg-purple-400/10' },
    aprovado: { label: 'Aprovado', cor: 'text-cyan-400 bg-cyan-400/10' },
    em_cumprimento: { label: 'Em cumprimento', cor: 'text-blue-400 bg-blue-400/10' },
    cumprido: { label: 'Cumprido', cor: 'text-emerald-400 bg-emerald-400/10' },
    recusado: { label: 'Recusado', cor: 'text-red-400 bg-red-400/10' },
    quebrado: { label: 'Quebrado', cor: 'text-red-400 bg-red-400/10' },
    sem_acordo: { label: 'Sem acordo', cor: 'text-zinc-400 bg-zinc-700' },
};

const FILTROS = ['aguarda_gestor', 'aguarda_condomino', 'aprovado', 'em_cumprimento', 'cumprido', 'recusado', 'todos'];

export default function AcordosIndex({ acordos, estadoFiltro }: Props) {
    const [expandido, setExpandido] = useState<number | null>(null);
    const [processando, setProcessando] = useState<number | null>(null);
    const [modalAceitar, setModalAceitar] = useState<number | null>(null);
    const [modalContrapor, setModalContrapor] = useState<number | null>(null);
    const [modalRecusar, setModalRecusar] = useState<number | null>(null);
    const [numContra, setNumContra] = useState<number>(3);
    const [obsContra, setObsContra] = useState<string>('');
    const [motivoRec, setMotivoRec] = useState<string>('');
    const [modalGuia, setModalGuia] = useState<boolean>(false);

    function mudarFiltro(estado: string) {
        router.get('/acordos', { estado }, { preserveScroll: true, preserveState: true });
    }

    function aceitar(id: number) {
        setModalAceitar(id);
    }
    function confirmarAceitar() {
        const id = modalAceitar;
        if (id === null) return;
        setModalAceitar(null);
        setProcessando(id);
        router.post(`/acordos/${id}/aprovar`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessando(null),
        });
    }

    function contrapropor(id: number) {
        setNumContra(3);
        setObsContra('');
        setModalContrapor(id);
    }
    function confirmarContrapor() {
        const id = modalContrapor;
        if (id === null) return;
        setModalContrapor(null);
        setProcessando(id);
        router.post(`/acordos/${id}/contrapropor`, { num_prestacoes: numContra, observacoes: obsContra }, {
            preserveScroll: true,
            onFinish: () => setProcessando(null),
        });
    }

    function recusar(id: number) {
        setMotivoRec('');
        setModalRecusar(id);
    }
    function confirmarRecusar() {
        const id = modalRecusar;
        if (id === null) return;
        setModalRecusar(null);
        setProcessando(id);
        router.post(`/acordos/${id}/recusar`, { motivo: motivoRec }, {
            preserveScroll: true,
            onFinish: () => setProcessando(null),
        });
    }

    function fmt(v: string | null) {
        if (v === null) return '—';
        return new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2 }).format(parseFloat(v)) + ' Kz';
    }

    return (
        <AuthenticatedLayout>
            <Head title="Acordos de pagamento" />

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500">
                        <Handshake className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">Acordos de pagamento</h1>
                        <p className="text-sm text-zinc-400">Negociação de dívida dos condóminos.</p>
                    </div>
                    <button
                        onClick={() => setModalGuia(true)}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm"
                    >
                        <BookOpen className="w-4 h-4" /> Guia
                    </button>
                </div>

                <div className="flex gap-2 mb-6 flex-wrap">
                    {FILTROS.map((f) => (
                        <button
                            key={f}
                            onClick={() => mudarFiltro(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm ${
                                estadoFiltro === f
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            }`}
                        >
                            {f === 'todos' ? 'Todos' : (ESTADOS[f]?.label ?? f)}
                        </button>
                    ))}
                </div>

                {acordos.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500">
                        <Handshake className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Nenhum acordo {estadoFiltro !== 'todos' ? `(${ESTADOS[estadoFiltro]?.label ?? estadoFiltro})` : ''}.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {acordos.map((a) => {
                            const est = ESTADOS[a.estado] ?? { label: a.estado, cor: 'text-zinc-400 bg-zinc-700' };
                            const aberto = expandido === a.id;
                            const podeAgir = a.estado === 'aguarda_gestor';
                            return (
                                <div key={a.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                                    <div className="p-4 flex items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-zinc-100">{a.condomino_nome}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${est.cor}`}>{est.label}</span>
                                            </div>
                                            <p className="text-sm text-zinc-400">
                                                {a.condominio_nome} · dívida {fmt(a.valor_total)}{a.valor_com_juro && parseFloat(a.valor_com_juro) > parseFloat(a.valor_total) ? ` · juro ${fmt((parseFloat(a.valor_com_juro) - parseFloat(a.valor_total)).toFixed(2))} · total ${fmt(a.valor_com_juro)}` : ''} · {a.num_prestacoes} prestações
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-0.5">
                                                Rondas: condómino {a.rondas_condomino}/3 · gestor {a.rondas_gestor}/3
                                            </p>
                                        </div>

                                        {podeAgir && (
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => aceitar(a.id)}
                                                    disabled={processando === a.id}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-sm disabled:opacity-50"
                                                >
                                                    <Check className="w-4 h-4" /> Aceitar
                                                </button>
                                                <button
                                                    onClick={() => contrapropor(a.id)}
                                                    disabled={processando === a.id}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 text-sm disabled:opacity-50"
                                                >
                                                    <MessageSquare className="w-4 h-4" /> Contrapropor
                                                </button>
                                                <button
                                                    onClick={() => recusar(a.id)}
                                                    disabled={processando === a.id}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-sm disabled:opacity-50"
                                                >
                                                    <X className="w-4 h-4" /> Recusar
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setExpandido(aberto ? null : a.id)}
                                            className="text-zinc-500 hover:text-zinc-300 shrink-0"
                                        >
                                            {aberto ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {aberto && (
                                        <div className="border-t border-zinc-800 px-4 py-3 bg-zinc-900/30 space-y-4">
                                            <div>
                                                <h4 className="text-xs font-bold text-zinc-400 mb-2 uppercase">Histórico da negociação</h4>
                                                <div className="space-y-2">
                                                    {a.propostas.map((p, i) => (
                                                        <div key={i} className={`flex gap-3 text-sm ${p.autor === 'gestor' ? 'flex-row-reverse text-right' : ''}`}>
                                                            <div className={`px-3 py-2 rounded-lg max-w-md ${p.autor === 'gestor' ? 'bg-cyan-500/10' : 'bg-zinc-800'}`}>
                                                                <p className="text-xs text-zinc-500 mb-0.5">
                                                                    {p.autor === 'gestor' ? 'Gestão' : 'Condómino'} · ronda {p.ronda} · {p.created_at}
                                                                </p>
                                                                <p className="text-zinc-200">{p.num_prestacoes} prestações · total {fmt(p.valor_com_juro)}{parseFloat(p.valor_entrada ?? '0') > 0 ? ` · entrada ${fmt(p.valor_entrada)}` : ''}</p>
                                                                {p.observacoes && <p className="text-xs text-zinc-400 italic mt-1">"{p.observacoes}"</p>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {a.prestacoes.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-zinc-400 mb-2 uppercase">Prestações</h4>
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="text-zinc-500 text-xs">
                                                                <th className="text-left py-1">#</th>
                                                                <th className="text-left py-1">Valor</th>
                                                                <th className="text-left py-1">Vencimento</th>
                                                                <th className="text-left py-1">Estado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {a.prestacoes.map((p) => (
                                                                <tr key={p.numero} className="text-zinc-300 border-t border-zinc-800/50">
                                                                    <td className="py-1.5">{p.numero}</td>
                                                                    <td className="py-1.5">{fmt(p.valor)}</td>
                                                                    <td className="py-1.5">{p.data_vencimento}</td>
                                                                    <td className="py-1.5">
                                                                        {p.estado === 'paga' ? (
                                                                            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Paga</span>
                                                                        ) : p.estado === 'atrasada' ? (
                                                                            <span className="text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> Atrasada</span>
                                                                        ) : (
                                                                            <span className="text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {modalAceitar !== null && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setModalAceitar(null)}>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-zinc-100 mb-2">Aceitar proposta</h3>
                        <p className="text-sm text-zinc-400 mb-5">Aceitar esta proposta como está? Serão criadas as prestações do acordo.</p>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setModalAceitar(null)} className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm">Cancelar</button>
                            <button onClick={confirmarAceitar} className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 text-sm font-semibold">Aceitar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalContrapor !== null && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setModalContrapor(null)}>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-zinc-100 mb-3">Contraproposta</h3>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Número de prestações</label>
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {[2, 3, 4, 5, 6].map((n) => (
                                <button key={n} onClick={() => setNumContra(n)} className={`w-10 h-10 rounded-lg text-sm font-bold ${numContra === n ? 'bg-cyan-500 text-white' : 'bg-zinc-800 text-zinc-300'}`}>{n}</button>
                            ))}
                        </div>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Observação (opcional)</label>
                        <textarea value={obsContra} onChange={(e) => setObsContra(e.target.value)} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 mb-5" />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setModalContrapor(null)} className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm">Cancelar</button>
                            <button onClick={confirmarContrapor} className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 text-sm font-semibold">Enviar contraproposta</button>
                        </div>
                    </div>
                </div>
            )}

            {modalRecusar !== null && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setModalRecusar(null)}>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-zinc-100 mb-3">Recusar acordo</h3>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Motivo (opcional)</label>
                        <textarea value={motivoRec} onChange={(e) => setMotivoRec(e.target.value)} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 mb-5" />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setModalRecusar(null)} className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm">Cancelar</button>
                            <button onClick={confirmarRecusar} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm font-semibold">Recusar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalGuia && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setModalGuia(false)}>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-zinc-100 mb-4">Acordos de Pagamento — Guia</h3>

                        <h4 className="text-sm font-bold text-cyan-400 mb-1">O que é</h4>
                        <ul className="text-sm text-zinc-300 mb-3 list-disc pl-5 space-y-1">
                            <li>Plano para pagar a dívida existente (Taxas em atraso). Pode ter entrada, prestações e juro.</li>
                        </ul>

                        <h4 className="text-sm font-bold text-cyan-400 mb-1">Negociação</h4>
                        <ul className="text-sm text-zinc-300 mb-3 list-disc pl-5 space-y-1">
                            <li>Condómino propõe → aceita / recusa / contrapõe (até 3 rondas de cada lado).</li>
                            <li>Equilíbrio: plano exigente demais falha; folgado demais atrasa a recuperação.</li>
                            <li>Negociação esgotada → prevalece a última proposta da gestão.</li>
                        </ul>

                        <h4 className="text-sm font-bold text-cyan-400 mb-1">Configuração (por condomínio)</h4>
                        <ul className="text-sm text-zinc-300 mb-3 list-disc pl-5 space-y-1">
                            <li>Defina min/máx de prestações, % de entrada e % de juro.</li>
                        </ul>

                        <h4 className="text-sm font-bold text-cyan-400 mb-1">Desbloqueio</h4>
                        <ul className="text-sm text-zinc-300 mb-3 list-disc pl-5 space-y-1">
                            <li>Pagamento que põe o condómino em dia → acesso restabelecido automaticamente.</li>
                            <li>Cada prestação tem 10 dias de tolerância.</li>
                        </ul>

                        <h4 className="text-sm font-bold text-amber-400 mb-1">Incumprimento (explique sempre ao condómino)</h4>
                        <ul className="text-sm text-zinc-300 mb-3 list-disc pl-5 space-y-1">
                            <li>Prestação com +10 dias de atraso → acordo quebrado (renegociar).</li>
                            <li>Taxa do mês não paga em 10 dias → acesso limitado, mesmo com acordo em dia.</li>
                        </ul>

                        <h4 className="text-sm font-bold text-cyan-400 mb-1">Enquadramento</h4>
                        <ul className="text-sm text-zinc-300 mb-4 list-disc pl-5 space-y-1">
                            <li>Taxas regem-se pelo Dec. 141/15. Mantenha sempre disponível ao condómino o extrato, o pagamento e o contacto com a gestão.</li>
                        </ul>

                        <div className="flex justify-end">
                            <button onClick={() => setModalGuia(false)} className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 text-sm font-semibold">Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
