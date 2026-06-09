import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft, CheckCircle2, XCircle, FileText, User as UserIcon,
    Building2, Calendar, CreditCard, AlertCircle, Receipt,
} from 'lucide-react';
import { useState, FormEventHandler } from 'react';

interface Imputacao {
    lancamento_id: number;
    valor: string;
    lancamento?: {
        id: number;
        descricao: string;
        tipo: string;
    };
}

interface LancamentoEmAberto {
    id: number;
    tipo: string;
    descricao: string;
    data_vencimento: string | null;
    valor: string;
    valor_pago: string;
    valor_em_divida: string;
    em_atraso: boolean;
}

interface Pagamento {
    id: number;
    referencia: string;
    metodo: string;
    valor: string;
    data_pagamento: string;
    estado: string;
    referencia_externa: string | null;
    banco_origem: string | null;
    notas_condomino: string | null;
    notas_admin: string | null;
    motivo_rejeicao: string | null;
    confirmado_em: string | null;
    rejeitado_em: string | null;
    comprovativo_url: string | null;
    comprovativo_nome_original: string | null;
    comprovativo_mime: string | null;
    fraccao: { id: number; identificador: string } | null;
    condomino: { id: number; nome_completo: string; bi_passport: string | null } | null;
    condominio: { id: number; nome: string } | null;
    imputacoes: Imputacao[];
    registado_por: { id: number; name: string } | null;
    confirmado_por: { id: number; name: string } | null;
}

interface Props {
    pagamento: Pagamento;
    lancamentos_em_aberto: LancamentoEmAberto[];
}

const formatarKz = (valor: string | number): string => {
    const n = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' Kz';
};

const formatarData = (data: string): string => {
    return new Date(data).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatarDataHora = (data: string): string => {
    return new Date(data).toLocaleString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const metodoLabel: Record<string, string> = {
    transferencia_bancaria: 'Transferência bancária',
    deposito_bancario: 'Depósito bancário',
    proxypay_rps: 'Multicaixa Express',
    dinheiro: 'Dinheiro',
    outro: 'Outro',
};

const tipoLabel: Record<string, string> = {
    quota_base: 'Quota mensal',
    fundo_reserva: 'Fundo reserva',
    despesa_extra: 'Despesa extra',
    multa: 'Multa',
};

export default function Show({ pagamento, lancamentos_em_aberto }: Props) {
    const [imputacoes, setImputacoes] = useState<Record<number, string>>(() => {
        // Pré-preencher com imputações sugeridas
        const inicial: Record<number, string> = {};
        pagamento.imputacoes?.forEach((i) => {
            inicial[i.lancamento_id] = i.valor;
        });
        return inicial;
    });

    const [motivoRejeicao, setMotivoRejeicao] = useState('');
    const [showRejeitar, setShowRejeitar] = useState(false);

    const totalImputado = Object.values(imputacoes).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
    const valorPagamento = parseFloat(pagamento.valor);
    const diff = valorPagamento - totalImputado;

    const podeAccionar = pagamento.estado === 'pendente' || pagamento.estado === 'em_revisao';

    const handleImputacaoChange = (lancamentoId: number, valor: string) => {
        const next = { ...imputacoes };
        if (valor === '' || valor === '0') {
            delete next[lancamentoId];
        } else {
            next[lancamentoId] = valor;
        }
        setImputacoes(next);
    };

    const handleConfirmar: FormEventHandler = (e) => {
        e.preventDefault();
        const imputacoesArray = Object.entries(imputacoes)
            .filter(([_, v]) => parseFloat(v) > 0)
            .map(([id, v]) => ({ lancamento_id: parseInt(id), valor: v }));

        router.post(route('pagamentos.confirmar', pagamento.id), {
            imputacoes: imputacoesArray.length > 0 ? imputacoesArray : null,
        });
    };

    const handleRejeitar: FormEventHandler = (e) => {
        e.preventDefault();
        if (motivoRejeicao.length < 5) return;
        router.post(route('pagamentos.rejeitar', pagamento.id), {
            motivo: motivoRejeicao,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Pagamento ${pagamento.referencia}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('pagamentos.index')}
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4"
                    >
                        <ArrowLeft size={14} /> Voltar
                    </Link>

                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{pagamento.referencia}</h1>
                            <p className="text-sm text-zinc-400 mt-1">
                                Submetido em {formatarDataHora(pagamento.data_pagamento)}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <EstadoBadge estado={pagamento.estado} />
                        </div>
                    </div>

                    {pagamento.estado === 'rejeitado' && pagamento.motivo_rejeicao && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex gap-3">
                            <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
                            <div>
                                <div className="text-red-400 font-semibold text-sm">Pagamento rejeitado</div>
                                <div className="text-red-300/80 text-sm mt-1">{pagamento.motivo_rejeicao}</div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Coluna esquerda — Detalhes + comprovativo */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* Card detalhes pagamento */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <CreditCard size={16} /> Detalhes
                                </h2>
                                <dl className="space-y-3 text-sm">
                                    <Field label="Valor">
                                        <span className="text-lg font-bold text-white">{formatarKz(pagamento.valor)}</span>
                                    </Field>
                                    <Field label="Método">{metodoLabel[pagamento.metodo] || pagamento.metodo}</Field>
                                    <Field label="Data pagamento">{formatarData(pagamento.data_pagamento)}</Field>
                                    {pagamento.referencia_externa && <Field label="Ref. externa">{pagamento.referencia_externa}</Field>}
                                    {pagamento.banco_origem && <Field label="Banco origem">{pagamento.banco_origem}</Field>}
                                    {pagamento.notas_condomino && <Field label="Notas condómino">{pagamento.notas_condomino}</Field>}
                                </dl>
                            </div>

                            {/* Card condómino + fracção */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <UserIcon size={16} /> Condómino
                                </h2>
                                <dl className="space-y-3 text-sm">
                                    <Field label="Nome">{pagamento.condomino?.nome_completo}</Field>
                                    {pagamento.condomino?.bi_passport && <Field label="BI/Passaporte">{pagamento.condomino.bi_passport}</Field>}
                                    <Field label="Condomínio">{pagamento.condominio?.nome}</Field>
                                    <Field label="Fracção">{pagamento.fraccao?.identificador}</Field>
                                </dl>
                            </div>

                            {/* Card comprovativo */}
                            {pagamento.comprovativo_url && (
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                                    <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                        <FileText size={16} /> Comprovativo
                                    </h2>
                                    {pagamento.comprovativo_mime?.startsWith('image/') ? (
                                        <a href={pagamento.comprovativo_url} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={pagamento.comprovativo_url}
                                                alt="Comprovativo"
                                                className="rounded-lg w-full hover:opacity-90 transition-opacity cursor-pointer"
                                            />
                                        </a>
                                    ) : (
                                            <a
                                            href={pagamento.comprovativo_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 transition-colors"
                                        >
                                            <FileText size={32} className="text-cyan-400" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-white truncate">
                                                    {pagamento.comprovativo_nome_original || 'Abrir comprovativo'}
                                                </div>
                                                <div className="text-xs text-zinc-400">{pagamento.comprovativo_mime}</div>
                                            </div>
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Audit */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                                <h2 className="text-sm font-bold text-white mb-4">Histórico</h2>
                                <dl className="space-y-2 text-xs text-zinc-400">
                                    {pagamento.registado_por && (
                                        <div>Submetido por <span className="text-white">{pagamento.registado_por.name}</span></div>
                                    )}
                                    {pagamento.confirmado_em && (
                                        <div>Confirmado em {formatarDataHora(pagamento.confirmado_em)} por <span className="text-white">{pagamento.confirmado_por?.name}</span></div>
                                    )}
                                    {pagamento.rejeitado_em && (
                                        <div>Rejeitado em {formatarDataHora(pagamento.rejeitado_em)} por <span className="text-white">{pagamento.confirmado_por?.name}</span></div>
                                    )}
                                </dl>
                            </div>
                        </div>

                        {/* Coluna direita — Imputação + acções */}
                        <div className="lg:col-span-2">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                                <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                                    <Receipt size={16} /> Imputação a lançamentos
                                </h2>
                                <p className="text-xs text-zinc-400 mb-4">
                                    {podeAccionar
                                        ? 'Indica quanto deste pagamento vai para cada lançamento. As imputações sugeridas pelo condómino estão pré-preenchidas.'
                                        : 'Imputações finais aplicadas a este pagamento.'}
                                </p>

                                {lancamentos_em_aberto.length === 0 && pagamento.imputacoes.length === 0 ? (
                                    <div className="text-center py-8 text-zinc-500 text-sm">
                                        Sem lançamentos em aberto nesta fracção.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {/* Lançamentos em aberto */}
                                        {lancamentos_em_aberto.map((l) => (
                                            <div
                                                key={l.id}
                                                className={`bg-zinc-800/50 rounded-lg p-3 border ${imputacoes[l.id] ? 'border-cyan-500/40' : 'border-zinc-700/50'}`}
                                            >
                                                <div className="flex items-center justify-between gap-3 mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300">{tipoLabel[l.tipo] || l.tipo}</span>
                                                            {l.em_atraso && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">Em atraso</span>}
                                                        </div>
                                                        <div className="text-sm text-white">{l.descricao}</div>
                                                        <div className="text-xs text-zinc-400 mt-0.5">
                                                            Em dívida: <span className="text-white">{formatarKz(l.valor_em_divida)}</span>
                                                            {l.data_vencimento && ` · Vence ${formatarData(l.data_vencimento)}`}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {podeAccionar ? (
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max={l.valor_em_divida}
                                                                placeholder="0,00"
                                                                value={imputacoes[l.id] || ''}
                                                                onChange={(e) => handleImputacaoChange(l.id, e.target.value)}
                                                                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white w-32 text-right focus:outline-none focus:border-cyan-500"
                                                            />
                                                        ) : (
                                                            <span className="text-sm text-zinc-400">—</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {podeAccionar && imputacoes[l.id] && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleImputacaoChange(l.id, l.valor_em_divida)}
                                                        className="text-xs text-cyan-400 hover:text-cyan-300"
                                                    >
                                                        Imputar tudo ({formatarKz(l.valor_em_divida)})
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {/* Imputações de pagamento JÁ confirmado/rejeitado (read-only) */}
                                        {!podeAccionar && pagamento.imputacoes.length > 0 && (
                                            <div className="space-y-2">
                                                {pagamento.imputacoes.map((i) => (
                                                    <div key={i.lancamento_id} className="bg-zinc-800/50 rounded-lg p-3 flex items-center justify-between">
                                                        <span className="text-sm text-white">{i.lancamento?.descricao || `Lançamento #${i.lancamento_id}`}</span>
                                                        <span className="text-sm font-bold text-white">{formatarKz(i.valor)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Total */}
                                {podeAccionar && (
                                    <div className="mt-4 pt-4 border-t border-zinc-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-zinc-400">Valor do pagamento</span>
                                            <span className="text-sm font-bold text-white">{formatarKz(pagamento.valor)}</span>
                                        </div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-zinc-400">Total imputado</span>
                                            <span className="text-sm font-bold text-cyan-400">{formatarKz(totalImputado.toFixed(2))}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-zinc-400">Não imputado</span>
                                            <span className={`text-sm font-bold ${Math.abs(diff) < 0.01 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {formatarKz(diff.toFixed(2))}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Acções */}
                            {podeAccionar && (
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mt-4">
                                    <h2 className="text-sm font-bold text-white mb-4">Acções</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <form onSubmit={handleConfirmar}>
                                            <button
                                                type="submit"
                                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={16} /> Confirmar pagamento
                                            </button>
                                        </form>
                                        <button
                                            onClick={() => setShowRejeitar(!showRejeitar)}
                                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={16} /> Rejeitar
                                        </button>
                                    </div>

                                    {showRejeitar && (
                                        <form onSubmit={handleRejeitar} className="mt-4 space-y-2">
                                            <textarea
                                                value={motivoRejeicao}
                                                onChange={(e) => setMotivoRejeicao(e.target.value)}
                                                placeholder="Motivo da rejeição (mínimo 5 caracteres)..."
                                                rows={3}
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                                            />
                                            <button
                                                type="submit"
                                                disabled={motivoRejeicao.length < 5}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Confirmar rejeição
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <dt className="text-xs text-zinc-500 mb-0.5">{label}</dt>
            <dd className="text-sm text-white">{children}</dd>
        </div>
    );
}

function EstadoBadge({ estado }: { estado: string }) {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
        pendente: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'Pendente' },
        em_revisao: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', label: 'Em revisão' },
        confirmado: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'Confirmado' },
        rejeitado: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', label: 'Rejeitado' },
        devolvido: { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400', label: 'Devolvido' },
    };
    const style = styles[estado] || styles.pendente;
    return (
        <span className={`px-3 py-1 rounded-lg border ${style.bg} ${style.text} text-sm font-bold`}>
            {style.label}
        </span>
    );
}
