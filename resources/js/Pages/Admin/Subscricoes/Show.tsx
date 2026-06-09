import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Building, Mail, Phone, Clock, RefreshCw, PenLine } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';

function formatMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(valor) + ' Kz';
}

function formatDataHora(iso: string | null): string {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));
}

interface Empresa {
    nome: string | null;
    email_contacto: string | null;
    telefone: string | null;
}

interface Subscricao {
    id: number;
    estado: string;
    estado_label: string;
    ciclo_label: string;
    dia_aniversario: number;
    renovacao_automatica: boolean;
    converteu_do_trial: boolean;
    trial_inicia_em: string | null;
    trial_expira_em: string | null;
    grace_expira_em: string | null;
    activa_desde: string | null;
    periodo_actual_fim: string | null;
    cancelada_em: string | null;
    preco_customizado_por_fraccao: number | null;
    nota_preco_customizado: string | null;
    desconto_anual_pct: number;
}

interface Periodo {
    id: number;
    inicio_em: string | null;
    fim_em: string | null;
    ciclo: string;
    fraccoes_cobradas: number;
    valor_total: number;
    estado: 'pago' | string;
}

interface PrecoMensal {
    numero_fraccoes: number;
    escalao_nome: string | null;
    preco_por_fraccao: number;
    valor_mensal: number;
}

interface PrecoAnual {
    valor_anual: number | null;
    desconto_pct: number;
}

interface Props {
    subscricao: Subscricao;
    empresa: Empresa | null;
    periodos: Periodo[];
    preco_mensal: PrecoMensal | null;
    preco_anual: PrecoAnual | null;
}

export default function AdminSubscricoesShow({
    subscricao,
    empresa,
    periodos,
    preco_mensal,
    preco_anual,
}: Props) {
    const [modalTrialAberto, setModalTrialAberto] = useState(false);
    const [modalPrecoAberto, setModalPrecoAberto] = useState(false);

    const formTrial = useForm({ dias: 7 });
    const formPreco = useForm({
        preco_customizado_por_fraccao: subscricao.preco_customizado_por_fraccao ?? '',
        nota_preco_customizado: subscricao.nota_preco_customizado ?? '',
    });

    const reactivar = () => {
        if (confirm('Reactivar subscrição? A empresa voltará ao estado activa.')) {
            router.post(`/admin/subscricoes/${subscricao.id}/reactivar`);
        }
    };

    const submeterTrial = (e: FormEvent) => {
        e.preventDefault();
        formTrial.post(`/admin/subscricoes/${subscricao.id}/estender-trial`, {
            onSuccess: () => setModalTrialAberto(false),
        });
    };

    const submeterPreco = (e: FormEvent) => {
        e.preventDefault();
        formPreco.patch(`/admin/subscricoes/${subscricao.id}/preco-customizado`, {
            onSuccess: () => setModalPrecoAberto(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Subscrição — ${empresa?.nome ?? ''}`} />

            <div className="max-w-5xl mx-auto space-y-6">
                <Link
                    href="/admin/subscricoes"
                    className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar à lista
                </Link>

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Building className="w-4 h-4 text-white/50" />
                            <span className="text-sm text-white/60">#{subscricao.id}</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-white">{empresa?.nome ?? '—'}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                            {empresa?.email_contacto && (
                                <span className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" />
                                    {empresa.email_contacto}
                                </span>
                            )}
                            {empresa?.telefone && (
                                <span className="flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" />
                                    {empresa.telefone}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-white/10 text-sm text-white">
                            {subscricao.estado_label}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {(subscricao.estado === 'trial' || subscricao.estado === 'grace') && (
                        <button
                            onClick={() => setModalTrialAberto(true)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#8FE7FF] text-sm hover:bg-[#00D4FF]/15 transition-colors"
                        >
                            <Clock className="w-4 h-4" />
                            Estender trial
                        </button>
                    )}

                    {subscricao.estado === 'suspensa' && (
                        <button
                            onClick={reactivar}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm hover:bg-emerald-500/15 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reactivar
                        </button>
                    )}

                    <button
                        onClick={() => setModalPrecoAberto(true)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-white/10 transition-colors"
                    >
                        <PenLine className="w-4 h-4" />
                        Preço customizado
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <InfoCard titulo="Estado">
                        <InfoRow label="Estado" valor={subscricao.estado_label} />
                        <InfoRow label="Ciclo" valor={subscricao.ciclo_label} />
                        <InfoRow label="Dia aniversário" valor={`Dia ${subscricao.dia_aniversario}`} />
                        <InfoRow
                            label="Renovação automática"
                            valor={subscricao.renovacao_automatica ? 'Sim' : 'Não'}
                        />
                        <InfoRow
                            label="Converteu do trial"
                            valor={subscricao.converteu_do_trial ? 'Sim' : 'Não'}
                        />
                    </InfoCard>

                    <InfoCard titulo="Datas">
                        <InfoRow label="Trial começou" valor={formatDataHora(subscricao.trial_inicia_em)} />
                        <InfoRow label="Trial expira" valor={formatDataHora(subscricao.trial_expira_em)} />
                        <InfoRow label="Grace expira" valor={formatDataHora(subscricao.grace_expira_em)} />
                        <InfoRow label="Activa desde" valor={formatDataHora(subscricao.activa_desde)} />
                        <InfoRow
                            label="Período actual até"
                            valor={formatDataHora(subscricao.periodo_actual_fim)}
                        />
                        {subscricao.cancelada_em && (
                            <InfoRow
                                label="Cancelada em"
                                valor={formatDataHora(subscricao.cancelada_em)}
                            />
                        )}
                    </InfoCard>

                    {preco_mensal && (
                        <InfoCard titulo="Preço actual (cálculo)">
                            <InfoRow
                                label="Nº fracções"
                                valor={String(preco_mensal.numero_fraccoes)}
                            />
                            <InfoRow label="Escalão" valor={preco_mensal.escalao_nome ?? '—'} />
                            <InfoRow
                                label="Preço/fracção"
                                valor={formatMoeda(preco_mensal.preco_por_fraccao)}
                            />
                            <InfoRow
                                label="Valor mensal"
                                valor={formatMoeda(preco_mensal.valor_mensal)}
                                destaque
                            />
                            {preco_anual && (
                                <InfoRow
                                    label={`Valor anual (−${preco_anual.desconto_pct}%)`}
                                    valor={formatMoeda(preco_anual.valor_anual ?? 0)}
                                    destaque
                                />
                            )}
                        </InfoCard>
                    )}

                    {subscricao.preco_customizado_por_fraccao && (
                        <InfoCard titulo="Preço customizado">
                            <InfoRow
                                label="Por fracção"
                                valor={formatMoeda(subscricao.preco_customizado_por_fraccao)}
                                destaque
                            />
                            <InfoRow
                                label="Desconto anual"
                                valor={`${subscricao.desconto_anual_pct}%`}
                            />
                            {subscricao.nota_preco_customizado && (
                                <InfoRow label="Nota" valor={subscricao.nota_preco_customizado} />
                            )}
                        </InfoCard>
                    )}
                </div>

                {periodos.length > 0 && (
                    <div className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10">
                            <h2 className="text-sm font-medium text-white">Histórico de períodos</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-white/[0.02]">
                                    <tr className="text-left text-[11px] uppercase tracking-wide text-white/50">
                                        <th className="px-4 py-2 font-medium">Período</th>
                                        <th className="px-4 py-2 font-medium">Ciclo</th>
                                        <th className="px-4 py-2 font-medium">Fracções</th>
                                        <th className="px-4 py-2 font-medium">Total</th>
                                        <th className="px-4 py-2 font-medium">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {periodos.map((p) => (
                                        <tr key={p.id} className="border-t border-white/5">
                                            <td className="px-4 py-2 text-white/80">
                                                {formatDataHora(p.inicio_em)} → {formatDataHora(p.fim_em)}
                                            </td>
                                            <td className="px-4 py-2 text-white/70">{p.ciclo}</td>
                                            <td className="px-4 py-2 text-white/70">{p.fraccoes_cobradas}</td>
                                            <td className="px-4 py-2 font-medium text-white">
                                                {formatMoeda(p.valor_total)}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`text-[11px] px-2 py-0.5 rounded ${
                                                        p.estado === 'pago'
                                                            ? 'bg-emerald-500/15 text-emerald-300'
                                                            : 'bg-amber-500/15 text-amber-300'
                                                    }`}
                                                >
                                                    {p.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal estender trial */}
            {modalTrialAberto && (
                <Modal onClose={() => setModalTrialAberto(false)} titulo="Estender trial">
                    <form onSubmit={submeterTrial} className="space-y-4">
                        <div>
                            <label className="text-sm text-white/80 block mb-2">Dias adicionais</label>
                            <input
                                type="number"
                                min={1}
                                max={90}
                                value={formTrial.data.dias}
                                onChange={(e) => formTrial.setData('dias', parseInt(e.target.value || '0'))}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                            />
                            {formTrial.errors.dias && (
                                <p className="text-xs text-red-400 mt-1">{formTrial.errors.dias}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setModalTrialAberto(false)}
                                className="px-3 py-2 text-sm text-white/70 hover:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={formTrial.processing}
                                className="px-4 py-2 rounded-lg bg-[#00D4FF] text-black text-sm font-medium hover:bg-[#8FE7FF] transition-colors disabled:opacity-50"
                            >
                                Estender
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Modal preço customizado */}
            {modalPrecoAberto && (
                <Modal onClose={() => setModalPrecoAberto(false)} titulo="Preço customizado">
                    <form onSubmit={submeterPreco} className="space-y-4">
                        <div>
                            <label className="text-sm text-white/80 block mb-2">
                                Preço por fracção (Kz)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={formPreco.data.preco_customizado_por_fraccao}
                                onChange={(e) =>
                                    formPreco.setData(
                                        'preco_customizado_por_fraccao',
                                        e.target.value,
                                    )
                                }
                                placeholder="Vazio para usar tabela"
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                            />
                            <p className="text-xs text-white/50 mt-1">
                                Deixar vazio para usar os escalões standard.
                            </p>
                        </div>

                        <div>
                            <label className="text-sm text-white/80 block mb-2">Nota (opcional)</label>
                            <textarea
                                rows={2}
                                value={formPreco.data.nota_preco_customizado}
                                onChange={(e) =>
                                    formPreco.setData('nota_preco_customizado', e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                                placeholder="Ex: Contrato Enterprise Boa Vida, aprovado em..."
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setModalPrecoAberto(false)}
                                className="px-3 py-2 text-sm text-white/70 hover:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={formPreco.processing}
                                className="px-4 py-2 rounded-lg bg-[#00D4FF] text-black text-sm font-medium hover:bg-[#8FE7FF] transition-colors disabled:opacity-50"
                            >
                                Guardar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}

function InfoCard({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <h3 className="text-xs uppercase tracking-wide text-white/50 mb-3">{titulo}</h3>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function InfoRow({
    label,
    valor,
    destaque,
}: {
    label: string;
    valor: string;
    destaque?: boolean;
}) {
    return (
        <div className="flex justify-between gap-3 text-sm">
            <span className="text-white/60">{label}</span>
            <span className={destaque ? 'text-[#8FE7FF] font-medium' : 'text-white'}>{valor}</span>
        </div>
    );
}

function Modal({
    titulo,
    children,
    onClose,
}: {
    titulo: string;
    children: ReactNode;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-[#0A0A1A] border border-white/10 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-medium text-white mb-4">{titulo}</h2>
                {children}
            </div>
        </div>
    );
}
