import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft, Building2, Calendar, FileText, XCircle, AlertCircle,
    CheckCircle2, X, Receipt, User as UserIcon, Loader2, Hash,
} from 'lucide-react';
import { useState, FormEventHandler } from 'react';

interface Imputacao {
    id: number;
    valor: string;
    pagamento: {
        id: number;
        referencia: string;
        estado: string;
        valor: string;
        data_pagamento: string;
        condomino: { id: number; nome_completo: string } | null;
    } | null;
}

interface Lancamento {
    id: number;
    tipo: string;
    descricao: string;
    valor: string;
    valor_pago: string;
    data_lancamento: string;
    data_vencimento: string | null;
    estado: string;
    motivo_cancelamento?: string | null;
    imputacoes: Imputacao[];
}

interface Quota {
    id: number;
    ano: number;
    mes: number;
    valor_total: string;
    valor_pago: string;
    estado: string;
    data_vencimento: string | null;
    fraccao: { id: number; identificador: string; condominio_id: number } | null;
    condominio: { id: number; nome: string } | null;
    lancamentos: Lancamento[];
    tem_pagamentos_imputados: boolean;
}

interface Props {
    quota: Quota;
    flash?: { success?: string };
}

const formatarKz = (valor: string | number): string => {
    const n = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' Kz';
};

const formatarData = (d: string): string =>
    new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });

const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const tipoLabel: Record<string, string> = {
    quota_base: 'Taxa mensal',
    fundo_reserva: 'Fundo reserva',
    despesa_extra: 'Despesa extra',
    multa: 'Multa',
    juros: 'Juros',
    ajuste_credito: 'Crédito',
    ajuste_debito: 'Débito',
};

const tipoColor: Record<string, string> = {
    quota_base: 'bg-cyan-500/10 text-cyan-400',
    fundo_reserva: 'bg-purple-500/10 text-purple-400',
    despesa_extra: 'bg-amber-500/10 text-amber-400',
    multa: 'bg-red-500/10 text-red-400',
    juros: 'bg-orange-500/10 text-orange-400',
};

const estadoQuotaColor: Record<string, { bg: string; text: string; label: string }> = {
    aberta: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'Aberta' },
    paga_parcial: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', label: 'Paga parcial' },
    paga: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'Paga' },
    cancelada: { bg: 'bg-zinc-500/10 border-zinc-500/30', text: 'text-zinc-400', label: 'Cancelada' },
};

export default function QuotaShow({ quota, flash }: Props) {
    const [showCancelar, setShowCancelar] = useState(false);
    const podeCancelar = quota.estado !== 'cancelada' && !quota.tem_pagamentos_imputados;
    const estado = estadoQuotaColor[quota.estado] || estadoQuotaColor.aberta;

    return (
        <AuthenticatedLayout>
            <Head title={`Quota ${meses[quota.mes - 1]} ${quota.ano}`} />

            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('quotas.index')}
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4"
                    >
                        <ArrowLeft size={14} /> Voltar à lista
                    </Link>

                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Quota — {meses[quota.mes - 1]} {quota.ano}
                            </h1>
                            <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
                                <Building2 size={14} /> {quota.condominio?.nome}
                                <span className="text-zinc-600">·</span>
                                <Hash size={14} /> Imóvel {quota.fraccao?.identificador}
                                {quota.data_vencimento && (
                                    <>
                                        <span className="text-zinc-600">·</span>
                                        <Calendar size={14} /> Vence {formatarData(quota.data_vencimento)}
                                    </>
                                )}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg border ${estado.bg} ${estado.text} text-sm font-bold`}>
                            {estado.label}
                        </span>
                    </div>

                    {flash?.success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex gap-3">
                            <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={18} />
                            <span className="text-emerald-400 text-sm">{flash.success}</span>
                        </div>
                    )}

                    {/* Resumo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <SummaryCard label="Valor total" value={formatarKz(quota.valor_total)} color="zinc" />
                        <SummaryCard label="Valor pago" value={formatarKz(quota.valor_pago)} color="emerald" />
                        <SummaryCard
                            label="Em dívida"
                            value={formatarKz(parseFloat(quota.valor_total) - parseFloat(quota.valor_pago))}
                            color={parseFloat(quota.valor_total) - parseFloat(quota.valor_pago) > 0 ? 'amber' : 'emerald'}
                        />
                    </div>

                    {/* Lançamentos */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6">
                        <div className="p-4 border-b border-zinc-800">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <FileText size={16} /> Lançamentos ({quota.lancamentos.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-zinc-800">
                            {quota.lancamentos.map((l) => (
                                <div key={l.id} className="p-4">
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${tipoColor[l.tipo] || 'bg-zinc-700 text-zinc-300'}`}>
                                                    {tipoLabel[l.tipo] || l.tipo}
                                                </span>
                                                {l.estado === 'cancelado' && (
                                                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-400">Cancelado</span>
                                                )}
                                            </div>
                                            <div className={`text-sm ${l.estado === 'cancelado' ? 'line-through text-zinc-500' : 'text-white'}`}>
                                                {l.descricao}
                                            </div>
                                            {l.motivo_cancelamento && (
                                                <p className="text-xs text-zinc-500 mt-1">
                                                    Motivo: {l.motivo_cancelamento}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-bold ${l.estado === 'cancelado' ? 'line-through text-zinc-500' : 'text-white'}`}>
                                                {formatarKz(l.valor)}
                                            </div>
                                            {parseFloat(l.valor_pago) > 0 && (
                                                <div className="text-xs text-emerald-400">
                                                    Pago: {formatarKz(l.valor_pago)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Imputações */}
                                    {l.imputacoes && l.imputacoes.length > 0 && (
                                        <div className="mt-3 ml-2 pl-3 border-l-2 border-zinc-800 space-y-1">
                                            <div className="text-xs text-zinc-500 mb-1">Pagamentos aplicados:</div>
                                            {l.imputacoes.map((i) => (
                                                <div key={i.id} className="text-xs text-zinc-400 flex items-center gap-2 flex-wrap">
                                                    <Receipt size={11} className="text-emerald-400 flex-shrink-0" />
                                                    <Link
                                                        href={`/pagamentos/${i.pagamento?.id}`}
                                                        className="text-cyan-400 hover:text-cyan-300 font-semibold"
                                                    >
                                                        {i.pagamento?.referencia}
                                                    </Link>
                                                    <span>·</span>
                                                    <span className="text-emerald-400">{formatarKz(i.valor)}</span>
                                                    {i.pagamento?.condomino && (
                                                        <>
                                                            <span>·</span>
                                                            <UserIcon size={10} />
                                                            <span>{i.pagamento.condomino.nome_completo}</span>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Acções */}
                    {quota.estado !== 'cancelada' && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                            <h2 className="text-sm font-bold text-white mb-3">Acções</h2>

                            {quota.tem_pagamentos_imputados ? (
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex gap-3">
                                    <AlertCircle className="text-blue-400 flex-shrink-0" size={16} />
                                    <div className="text-blue-300/90 text-sm">
                                        <strong>Não é possível cancelar.</strong> Esta quota tem pagamentos aplicados.
                                        Para cancelar, primeiro rejeita ou devolve os pagamentos relacionados.
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowCancelar(true)}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-lg font-bold flex items-center gap-2"
                                >
                                    <XCircle size={16} /> Cancelar quota
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showCancelar && podeCancelar && (
                <ModalCancelar quotaId={quota.id} onClose={() => setShowCancelar(false)} />
            )}
        </AuthenticatedLayout>
    );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: 'zinc' | 'emerald' | 'amber' }) {
    const colors = {
        zinc: 'text-white',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
    };
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-400 font-semibold mb-1">{label}</div>
            <div className={`text-lg font-bold ${colors[color]}`}>{value}</div>
        </div>
    );
}

function ModalCancelar({ quotaId, onClose }: { quotaId: number; onClose: () => void }) {
    const form = useForm({ motivo: '' });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('quotas.cancelar', quotaId), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <XCircle size={18} className="text-red-400" /> Cancelar Quota
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                </div>

                <p className="text-sm text-zinc-400 mb-4">
                    Esta acção <strong>cancela a quota e todos os lançamentos</strong> associados.
                    Não é reversível pela UI. O motivo fica registado no audit trail.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Motivo (mínimo 5 caracteres)</label>
                        <textarea
                            value={form.data.motivo}
                            onChange={(e) => form.setData('motivo', e.target.value)}
                            placeholder="Ex: Erro de geração, fracção desocupada antes do mês..."
                            rows={3}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                        />
                        {form.errors.motivo && <p className="text-xs text-red-400 mt-1">{form.errors.motivo}</p>}
                        {form.errors.cancelar && <p className="text-xs text-red-400 mt-1">{form.errors.cancelar}</p>}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={form.processing || form.data.motivo.length < 5}
                            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                        >
                            {form.processing ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                            {form.processing ? 'A cancelar...' : 'Confirmar cancelamento'}
                        </button>
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-zinc-400 hover:text-white">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
