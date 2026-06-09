import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Receipt,
    ArrowLeft,
    CircleX,
    CircleCheck,
    MessageSquare,
    File,
    Building,
    ShieldCheck,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

function formatMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(valor) + ' Kz';
}

interface Owner {
    nome: string;
    nif: string | null;
    email: string | null;
}

interface Factura {
    id: number;
    numero: string;
    tipo_documento_label: string;
    data_emissao: string | null;
}

interface Pagamento {
    id: number;
    referencia: string;
    metodo_label: string;
    valor: number;
    estado: string;
    estado_label: string;
    data_transacao: string | null;
    referencia_externa: string | null;
    banco_origem: string | null;
    nome_ordenante: string | null;
    tem_comprovativo: boolean;
    comprovativo_nome: string | null;
    comprovativo_tamanho: string | null;
    notas: string | null;
    motivo_rejeicao: string | null;
}

interface Ordem {
    id: number;
    numero: string;
    estado: string;
    estado_label: string;
    tipo_item: string;
    tipo_item_label: string;
    descricao_item: string;
    valor_base: number;
    valor_activacao: number;
    valor_iva: number;
    valor_total: number;
    total_pago: number;
    saldo_em_falta: number;
    notas_cliente: string | null;
    notas_admin: string | null;
    motivo_rejeicao: string | null;
    created_at: string;
    prazo_pagamento: string | null;
    aprovada_em: string | null;
    rejeitada_em: string | null;
    expirou: boolean;
    esta_aprovada: boolean;
    feature_subscription_id: number | null;
    aprovada_por: string | null;
    criada_por: string | null;
    owner: Owner;
    factura: Factura | null;
    pagamentos: Pagamento[];
}

interface Props {
    ordem: Ordem;
}

const ESTADO_STYLES: Record<string, string> = {
    pendente: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    em_revisao: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    aprovada: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    rejeitada: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    cancelada: 'bg-zinc-700/30 border-zinc-700 text-zinc-400',
    expirada: 'bg-zinc-700/30 border-zinc-700 text-zinc-400',
};

const PAGAMENTO_ESTADOS: Record<string, string> = {
    registado: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    em_analise: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    confirmado: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    rejeitado: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    devolvido: 'bg-zinc-700/30 border-zinc-700 text-zinc-400',
};

type PagamentoAcao = { id: number; acao: 'confirmar' | 'rejeitar' } | null;

export default function AdminOrdensShow({ ordem }: Props) {
    const [showAprovar, setShowAprovar] = useState(false);
    const [showRejeitar, setShowRejeitar] = useState(false);
    const [pagamentoAcao, setPagamentoAcao] = useState<PagamentoAcao>(null);

    const formAprovar = useForm({ notas_admin: '' });
    const formRejeitar = useForm({ motivo: '' });
    const formConfirmarPag = useForm({ notas: '' });
    const formRejeitarPag = useForm({ motivo: '' });

    const aprovar = (e: FormEvent) => {
        e.preventDefault();
        formAprovar.post(route('admin.ordens.aprovar', ordem.id), {
            onSuccess: () => setShowAprovar(false),
        });
    };

    const rejeitar = (e: FormEvent) => {
        e.preventDefault();
        formRejeitar.post(route('admin.ordens.rejeitar', ordem.id), {
            onSuccess: () => setShowRejeitar(false),
        });
    };

    const confirmarPagamento = (pagamentoId: number) => (e: FormEvent) => {
        e.preventDefault();
        formConfirmarPag.post(route('admin.ordens.pagamentos.confirmar', [ordem.id, pagamentoId]), {
            onSuccess: () => setPagamentoAcao(null),
        });
    };

    const rejeitarPagamento = (pagamentoId: number) => (e: FormEvent) => {
        e.preventDefault();
        formRejeitarPag.post(route('admin.ordens.pagamentos.rejeitar', [ordem.id, pagamentoId]), {
            onSuccess: () => setPagamentoAcao(null),
        });
    };

    const podeGerir = !['aprovada', 'rejeitada', 'cancelada', 'expirada'].includes(ordem.estado);

    return (
        <AuthenticatedLayout>
            <Head title={`Admin — ${ordem.numero}`} />

            <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
                <div>
                    <Link
                        href={route('admin.ordens.index')}
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-3"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar à lista
                    </Link>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                                <Receipt className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-zinc-100 flex items-center gap-3">
                                    {ordem.numero}
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full border ${ESTADO_STYLES[ordem.estado] ?? ''}`}
                                    >
                                        {ordem.estado_label}
                                    </span>
                                </h1>
                                <p className="text-sm text-zinc-500">{ordem.tipo_item_label}</p>
                            </div>
                        </div>

                        {podeGerir && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowAprovar(true)}
                                    className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-1.5 transition"
                                >
                                    <ShieldCheck className="h-3.5 w-3.5 inline mr-1" />
                                    Aprovar directamente
                                </button>
                                <button
                                    onClick={() => setShowRejeitar(true)}
                                    className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg px-3 py-1.5 transition"
                                >
                                    <CircleX className="h-3.5 w-3.5 inline mr-1" />
                                    Rejeitar ordem
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {ordem.esta_aprovada && (
                    <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                        <CircleCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-emerald-300">Ordem aprovada</h3>
                            <p className="text-xs text-emerald-200/80 mt-1">
                                FeatureSubscription #{ordem.feature_subscription_id} activada para {ordem.owner.nome}.
                                {ordem.aprovada_por && (
                                    <>
                                        {' '}Aprovada por <strong>{ordem.aprovada_por}</strong>.
                                    </>
                                )}
                            </p>
                        </div>
                        {ordem.feature_subscription_id && (
                            <Link
                                href={route('admin.features.show', ordem.feature_subscription_id)}
                                className="text-xs text-emerald-300 hover:text-emerald-200 underline shrink-0"
                            >
                                Ver subscription →
                            </Link>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Item</h3>
                            <p className="text-zinc-200 font-medium">{ordem.descricao_item}</p>

                            {ordem.notas_cliente && (
                                <div className="mt-4 pt-4 border-t border-zinc-800">
                                    <div className="flex items-start gap-2 text-sm">
                                        <MessageSquare className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-1">Notas do cliente</p>
                                            <p className="text-zinc-300">{ordem.notas_cliente}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {ordem.notas_admin && (
                                <div className="mt-3 p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg text-xs text-zinc-400 whitespace-pre-wrap">
                                    <strong className="text-zinc-300">Notas admin:</strong> {ordem.notas_admin}
                                </div>
                            )}
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-4">Valores</h3>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-zinc-400">Valor base</dt>
                                    <dd className="text-zinc-200">{formatMoeda(ordem.valor_base)}</dd>
                                </div>
                                {ordem.valor_activacao > 0 && (
                                    <div className="flex justify-between">
                                        <dt className="text-zinc-400">Activação</dt>
                                        <dd className="text-zinc-200">{formatMoeda(ordem.valor_activacao)}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <dt className="text-zinc-400">IVA (14%)</dt>
                                    <dd className="text-zinc-200">{formatMoeda(ordem.valor_iva)}</dd>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-zinc-800">
                                    <dt className="text-zinc-300 font-medium">Total</dt>
                                    <dd className="text-lg font-semibold text-zinc-100">
                                        {formatMoeda(ordem.valor_total)}
                                    </dd>
                                </div>
                                {ordem.total_pago > 0 && (
                                    <div className="flex justify-between text-emerald-400">
                                        <dt>Pago confirmado</dt>
                                        <dd>{formatMoeda(ordem.total_pago)}</dd>
                                    </div>
                                )}
                                {ordem.saldo_em_falta > 0 && (
                                    <div className="flex justify-between text-amber-400">
                                        <dt>Em falta</dt>
                                        <dd>{formatMoeda(ordem.saldo_em_falta)}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-4">
                                Pagamentos ({ordem.pagamentos.length})
                            </h3>

                            {ordem.pagamentos.length === 0 ? (
                                <div className="text-center py-6 text-sm text-zinc-500">
                                    Cliente ainda não submeteu comprovativo.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {ordem.pagamentos.map((pag) => (
                                        <div key={pag.id} className="border border-zinc-800 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-mono text-zinc-300">
                                                            {pag.referencia}
                                                        </span>
                                                        <span
                                                            className={`text-[10px] px-2 py-0.5 rounded border ${PAGAMENTO_ESTADOS[pag.estado] ?? ''}`}
                                                        >
                                                            {pag.estado_label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500">
                                                        {pag.metodo_label}
                                                        {pag.data_transacao &&
                                                            ` · ${new Date(pag.data_transacao).toLocaleDateString('pt-PT')}`}
                                                    </p>
                                                </div>
                                                <span className="text-base font-semibold text-zinc-100">
                                                    {formatMoeda(pag.valor)}
                                                </span>
                                            </div>

                                            <dl className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-zinc-800">
                                                {pag.referencia_externa && (
                                                    <div>
                                                        <dt className="text-zinc-500">Ref. externa</dt>
                                                        <dd className="text-zinc-300 font-mono">
                                                            {pag.referencia_externa}
                                                        </dd>
                                                    </div>
                                                )}
                                                {pag.banco_origem && (
                                                    <div>
                                                        <dt className="text-zinc-500">Banco</dt>
                                                        <dd className="text-zinc-300">{pag.banco_origem}</dd>
                                                    </div>
                                                )}
                                                {pag.nome_ordenante && (
                                                    <div>
                                                        <dt className="text-zinc-500">Ordenante</dt>
                                                        <dd className="text-zinc-300">{pag.nome_ordenante}</dd>
                                                    </div>
                                                )}
                                            </dl>

                                            {pag.tem_comprovativo && (
                                                <a
                                                    href={route('pagamentos.comprovativo', pag.id)}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 mt-3"
                                                >
                                                    <File className="h-3.5 w-3.5" />
                                                    {pag.comprovativo_nome}
                                                    <span className="text-zinc-500">({pag.comprovativo_tamanho})</span>
                                                </a>
                                            )}

                                            {pag.notas && (
                                                <p className="text-xs text-zinc-400 mt-2 italic">"{pag.notas}"</p>
                                            )}

                                            {pag.motivo_rejeicao && (
                                                <div className="mt-3 p-2 rounded bg-rose-500/5 border border-rose-500/20 text-xs text-rose-300">
                                                    <strong>Rejeitado:</strong> {pag.motivo_rejeicao}
                                                </div>
                                            )}

                                            {['registado', 'em_analise'].includes(pag.estado) &&
                                                pagamentoAcao?.id !== pag.id && (
                                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800">
                                                        <button
                                                            onClick={() =>
                                                                setPagamentoAcao({ id: pag.id, acao: 'confirmar' })
                                                            }
                                                            className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-1.5"
                                                        >
                                                            <CircleCheck className="h-3 w-3 inline mr-1" />
                                                            Confirmar
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setPagamentoAcao({ id: pag.id, acao: 'rejeitar' })
                                                            }
                                                            className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg px-3 py-1.5"
                                                        >
                                                            <CircleX className="h-3 w-3 inline mr-1" />
                                                            Rejeitar
                                                        </button>
                                                    </div>
                                                )}

                                            {pagamentoAcao?.id === pag.id && pagamentoAcao.acao === 'confirmar' && (
                                                <form
                                                    onSubmit={confirmarPagamento(pag.id)}
                                                    className="mt-3 pt-3 border-t border-zinc-800 space-y-2"
                                                >
                                                    <label className="text-xs text-zinc-400">Notas (opcional)</label>
                                                    <textarea
                                                        value={formConfirmarPag.data.notas}
                                                        onChange={(e) =>
                                                            formConfirmarPag.setData('notas', e.target.value)
                                                        }
                                                        rows={2}
                                                        maxLength={500}
                                                        className="w-full rounded bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-200 px-2 py-1.5"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="submit"
                                                            disabled={formConfirmarPag.processing}
                                                            className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded px-3 py-1 disabled:opacity-50"
                                                        >
                                                            {formConfirmarPag.processing
                                                                ? 'A confirmar...'
                                                                : 'Confirmar pagamento'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setPagamentoAcao(null);
                                                                formConfirmarPag.reset();
                                                            }}
                                                            className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </form>
                                            )}

                                            {pagamentoAcao?.id === pag.id && pagamentoAcao.acao === 'rejeitar' && (
                                                <form
                                                    onSubmit={rejeitarPagamento(pag.id)}
                                                    className="mt-3 pt-3 border-t border-zinc-800 space-y-2"
                                                >
                                                    <label className="text-xs text-zinc-400">
                                                        Motivo da rejeição *
                                                    </label>
                                                    <textarea
                                                        value={formRejeitarPag.data.motivo}
                                                        onChange={(e) =>
                                                            formRejeitarPag.setData('motivo', e.target.value)
                                                        }
                                                        rows={2}
                                                        maxLength={500}
                                                        required
                                                        placeholder="Ex: Valor não corresponde, comprovativo inválido..."
                                                        className="w-full rounded bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-200 px-2 py-1.5"
                                                    />
                                                    {formRejeitarPag.errors.motivo && (
                                                        <p className="text-xs text-rose-400">
                                                            {formRejeitarPag.errors.motivo}
                                                        </p>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="submit"
                                                            disabled={formRejeitarPag.processing}
                                                            className="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded px-3 py-1 disabled:opacity-50"
                                                        >
                                                            {formRejeitarPag.processing
                                                                ? 'A rejeitar...'
                                                                : 'Rejeitar pagamento'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setPagamentoAcao(null);
                                                                formRejeitarPag.reset();
                                                            }}
                                                            className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {ordem.factura && (
                            <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-400/80 mb-3">
                                    Factura emitida
                                </h3>
                                <div className="flex items-start gap-2 mb-3">
                                    <File className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-mono text-zinc-200 truncate">
                                            {ordem.factura.numero}
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            {ordem.factura.tipo_documento_label}
                                            {ordem.factura.data_emissao &&
                                                ` · ${new Date(ordem.factura.data_emissao).toLocaleDateString('pt-PT')}`}
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={route('facturas.download', ordem.factura.id)}
                                    target="_blank"
                                    className="text-xs rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 inline-block"
                                >
                                    Abrir PDF
                                </a>
                            </div>
                        )}

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                                Cliente
                            </h3>
                            <div className="flex items-start gap-2">
                                <Building className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                                <div className="text-sm">
                                    <p className="text-zinc-200 font-medium">{ordem.owner.nome}</p>
                                    {ordem.owner.nif && (
                                        <p className="text-xs text-zinc-500">NIF: {ordem.owner.nif}</p>
                                    )}
                                    {ordem.owner.email && (
                                        <p className="text-xs text-zinc-500 mt-1">{ordem.owner.email}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                                Timeline
                            </h3>
                            <dl className="space-y-2 text-xs">
                                <div>
                                    <dt className="text-zinc-500">Criada</dt>
                                    <dd className="text-zinc-300">
                                        {new Date(ordem.created_at).toLocaleString('pt-PT')}
                                    </dd>
                                    {ordem.criada_por && (
                                        <dd className="text-zinc-500">por {ordem.criada_por}</dd>
                                    )}
                                </div>
                                {ordem.prazo_pagamento && !ordem.esta_aprovada && (
                                    <div>
                                        <dt className="text-zinc-500">Prazo pagamento</dt>
                                        <dd className={ordem.expirou ? 'text-rose-400' : 'text-amber-400'}>
                                            {new Date(ordem.prazo_pagamento).toLocaleDateString('pt-PT')}
                                        </dd>
                                    </div>
                                )}
                                {ordem.aprovada_em && (
                                    <div>
                                        <dt className="text-zinc-500">Aprovada</dt>
                                        <dd className="text-emerald-400">
                                            {new Date(ordem.aprovada_em).toLocaleString('pt-PT')}
                                        </dd>
                                    </div>
                                )}
                                {ordem.rejeitada_em && (
                                    <div>
                                        <dt className="text-zinc-500">Rejeitada</dt>
                                        <dd className="text-rose-400">
                                            {new Date(ordem.rejeitada_em).toLocaleString('pt-PT')}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {ordem.motivo_rejeicao && (
                            <div className="bg-rose-500/5 border border-rose-500/30 rounded-xl p-4">
                                <p className="text-xs font-medium text-rose-300 mb-1">Motivo da rejeição</p>
                                <p className="text-xs text-rose-200/80">{ordem.motivo_rejeicao}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Aprovar */}
            {showAprovar && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <form
                        onSubmit={aprovar}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-6 w-6 text-emerald-400" />
                            <h2 className="text-lg font-semibold text-zinc-100">Aprovar directamente</h2>
                        </div>
                        <p className="text-sm text-zinc-400">
                            Esta acção aprova a ordem e activa a feature sem confirmar pagamentos individuais. Use
                            apenas em casos excepcionais (ex: pagamento recebido fora do sistema).
                        </p>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Justificação *</label>
                            <textarea
                                value={formAprovar.data.notas_admin}
                                onChange={(e) => formAprovar.setData('notas_admin', e.target.value)}
                                rows={3}
                                maxLength={500}
                                required
                                placeholder="Ex: Pagamento confirmado por telefone..."
                                className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2"
                            />
                            {formAprovar.errors.notas_admin && (
                                <p className="text-xs text-rose-400 mt-1">{formAprovar.errors.notas_admin}</p>
                            )}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAprovar(false);
                                    formAprovar.reset();
                                }}
                                className="text-sm text-zinc-400 hover:text-zinc-200 px-3 py-2"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={formAprovar.processing}
                                className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-sm font-medium px-4 py-2 disabled:opacity-50"
                            >
                                {formAprovar.processing ? 'A aprovar...' : 'Aprovar ordem'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Rejeitar */}
            {showRejeitar && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <form
                        onSubmit={rejeitar}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <CircleX className="h-6 w-6 text-rose-400" />
                            <h2 className="text-lg font-semibold text-zinc-100">Rejeitar ordem</h2>
                        </div>
                        <p className="text-sm text-zinc-400">
                            O cliente será notificado por email com o motivo. Esta acção não pode ser revertida.
                        </p>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Motivo *</label>
                            <textarea
                                value={formRejeitar.data.motivo}
                                onChange={(e) => formRejeitar.setData('motivo', e.target.value)}
                                rows={3}
                                maxLength={500}
                                required
                                className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2"
                            />
                            {formRejeitar.errors.motivo && (
                                <p className="text-xs text-rose-400 mt-1">{formRejeitar.errors.motivo}</p>
                            )}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRejeitar(false);
                                    formRejeitar.reset();
                                }}
                                className="text-sm text-zinc-400 hover:text-zinc-200 px-3 py-2"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={formRejeitar.processing}
                                className="rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-sm font-medium px-4 py-2 disabled:opacity-50"
                            >
                                {formRejeitar.processing ? 'A rejeitar...' : 'Rejeitar ordem'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
