import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Building, User, Plus, Pause, Play, CircleX } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';

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

function formatMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-PT').format(valor) + ' Kz';
}

interface Pacote {
    id: number;
    nome: string;
    quantidade: number;
    preco: number;
}

interface Feature {
    nome: string;
    categoria_label: string;
    modelo_cobranca: 'subscription' | 'consumable' | 'one_time';
    modelo_cobranca_label: string;
    unidade: string;
    pacotes: Pacote[];
}

interface Owner {
    nome: string;
    tipo: 'empresa' | 'condominio';
}

interface Subscription {
    id: number;
    estado: string;
    estado_label: string;
    feature: Feature;
    owner: Owner;
    saldo_actual: number;
    saldo_inicial: number;
    saldo_utilizado: number;
    saldo_baixo: boolean;
    valor_pago_total: number;
    renovacao_automatica: boolean;
    recarga_automatica: boolean;
    activada_em: string | null;
    expira_em: string | null;
    cancelada_em: string | null;
    activada_por_nome: string | null;
    notas_admin: string | null;
}

interface Usage {
    id: number;
    created_at: string;
    acao: string;
    quantidade: number;
    saldo_depois: number;
    user_nome: string | null;
}

interface Props {
    subscription: Subscription;
    usages: Usage[];
    consumo_diario?: unknown;
}

export default function AdminFeaturesShow({ subscription, usages }: Props) {
    const [modalSaldoAberto, setModalSaldoAberto] = useState(false);

    const form = useForm({
        quantidade: '',
        valor_pago: '',
        notas: '',
    });

    const executarAcao = (acao: string, mensagemConfirm: string) => {
        if (confirm(mensagemConfirm)) {
            router.post(`/admin/features/${subscription.id}/${acao}`);
        }
    };

    const submeterAdicaoSaldo = (e: FormEvent) => {
        e.preventDefault();
        form.post(`/admin/features/${subscription.id}/adicionar-saldo`, {
            onSuccess: () => {
                setModalSaldoAberto(false);
                form.reset();
            },
        });
    };

    const percentSaldo =
        subscription.saldo_inicial > 0
            ? Math.round((subscription.saldo_actual / subscription.saldo_inicial) * 100)
            : 0;

    return (
        <AuthenticatedLayout>
            <Head title={`#${subscription.id} — ${subscription.feature.nome}`} />

            <div className="max-w-5xl mx-auto space-y-6 pt-2">
                <Link
                    href="/admin/features"
                    className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar à lista
                </Link>

                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-white/50" />
                            <span className="text-sm text-white/60">#{subscription.id}</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-white">{subscription.feature.nome}</h1>
                        <div className="flex items-center gap-3 mt-2 text-sm text-white/60">
                            <span className="flex items-center gap-1.5">
                                {subscription.owner.tipo === 'empresa' ? (
                                    <Building className="w-3.5 h-3.5" />
                                ) : (
                                    <User className="w-3.5 h-3.5" />
                                )}
                                {subscription.owner.nome}
                            </span>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-sm text-white">
                        {subscription.estado_label}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {subscription.feature.modelo_cobranca === 'consumable' &&
                        subscription.estado === 'activa' && (
                            <button
                                onClick={() => setModalSaldoAberto(true)}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm hover:bg-emerald-500/15"
                            >
                                <Plus className="w-4 h-4" />
                                Adicionar saldo
                            </button>
                        )}

                    {subscription.estado === 'activa' && (
                        <button
                            onClick={() => executarAcao('suspender', 'Suspender esta feature?')}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm hover:bg-amber-500/15"
                        >
                            <Pause className="w-4 h-4" />
                            Suspender
                        </button>
                    )}

                    {['suspensa', 'cancelada', 'expirada'].includes(subscription.estado) && (
                        <button
                            onClick={() => executarAcao('reactivar', 'Reactivar esta feature?')}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#8FE7FF] text-sm hover:bg-[#00D4FF]/15"
                        >
                            <Play className="w-4 h-4" />
                            Reactivar
                        </button>
                    )}

                    {subscription.estado !== 'cancelada' && (
                        <button
                            onClick={() =>
                                executarAcao(
                                    'cancelar',
                                    'Cancelar esta feature? Esta acção não remove o histórico.',
                                )
                            }
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm hover:bg-red-500/15"
                        >
                            <CircleX className="w-4 h-4" />
                            Cancelar
                        </button>
                    )}
                </div>

                {subscription.feature.modelo_cobranca === 'consumable' &&
                    subscription.saldo_inicial > 0 && (
                        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                            <div className="flex items-baseline justify-between mb-2">
                                <span className="text-xs text-white/60 uppercase tracking-wide">Saldo</span>
                                <span className="text-sm text-white/80">
                                    {subscription.saldo_actual.toLocaleString('pt-PT')} /{' '}
                                    {subscription.saldo_inicial.toLocaleString('pt-PT')}{' '}
                                    {subscription.feature.unidade}
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${
                                        subscription.saldo_baixo ? 'bg-amber-400' : 'bg-emerald-400'
                                    }`}
                                    style={{ width: `${percentSaldo}%` }}
                                />
                            </div>
                            <div className="flex items-baseline justify-between mt-2 text-xs text-white/50">
                                <span>{subscription.saldo_utilizado.toLocaleString('pt-PT')} utilizados</span>
                                <span>{percentSaldo}% disponível</span>
                            </div>
                        </div>
                    )}

                <div className="grid md:grid-cols-2 gap-4">
                    <InfoCard titulo="Subscription">
                        <InfoRow label="Estado" valor={subscription.estado_label} />
                        <InfoRow label="Categoria" valor={subscription.feature.categoria_label} />
                        <InfoRow label="Modelo" valor={subscription.feature.modelo_cobranca_label} />
                        <InfoRow
                            label="Valor pago total"
                            valor={formatMoeda(subscription.valor_pago_total)}
                        />
                        {subscription.renovacao_automatica && (
                            <InfoRow label="Renovação auto" valor="Sim" />
                        )}
                        {subscription.recarga_automatica && (
                            <InfoRow label="Recarga auto" valor="Sim" />
                        )}
                    </InfoCard>

                    <InfoCard titulo="Datas">
                        <InfoRow label="Activada em" valor={formatDataHora(subscription.activada_em)} />
                        {subscription.expira_em && (
                            <InfoRow label="Expira em" valor={formatDataHora(subscription.expira_em)} />
                        )}
                        {subscription.cancelada_em && (
                            <InfoRow
                                label="Cancelada em"
                                valor={formatDataHora(subscription.cancelada_em)}
                            />
                        )}
                        {subscription.activada_por_nome && (
                            <InfoRow label="Activada por" valor={subscription.activada_por_nome} />
                        )}
                    </InfoCard>
                </div>

                {subscription.notas_admin && (
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="text-xs text-white/50 uppercase tracking-wide mb-2">
                            Notas administrativas
                        </div>
                        <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans">
                            {subscription.notas_admin}
                        </pre>
                    </div>
                )}

                {usages.length > 0 && (
                    <div className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10">
                            <h2 className="text-sm font-medium text-white">
                                Histórico de consumo (últimas {usages.length})
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-white/[0.02]">
                                    <tr className="text-left text-[11px] uppercase tracking-wide text-white/50">
                                        <th className="px-4 py-2 font-medium">Quando</th>
                                        <th className="px-4 py-2 font-medium">Acção</th>
                                        <th className="px-4 py-2 font-medium">Quantidade</th>
                                        <th className="px-4 py-2 font-medium">Saldo depois</th>
                                        <th className="px-4 py-2 font-medium">Utilizador</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usages.map((u) => (
                                        <tr key={u.id} className="border-t border-white/5">
                                            <td className="px-4 py-2 text-white/70">
                                                {formatDataHora(u.created_at)}
                                            </td>
                                            <td className="px-4 py-2 text-white font-mono text-xs">
                                                {u.acao}
                                            </td>
                                            <td className="px-4 py-2 text-white/80">-{u.quantidade}</td>
                                            <td className="px-4 py-2 text-white/80">
                                                {u.saldo_depois.toLocaleString('pt-PT')}
                                            </td>
                                            <td className="px-4 py-2 text-white/70">
                                                {u.user_nome ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal adicionar saldo */}
            {modalSaldoAberto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setModalSaldoAberto(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-[#0A0A1A] border border-white/10 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-medium text-white mb-4">Adicionar saldo</h2>
                        <form onSubmit={submeterAdicaoSaldo} className="space-y-4">
                            <div>
                                <label className="text-sm text-white/80 block mb-2">Quantidade</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.data.quantidade}
                                    onChange={(e) => form.setData('quantidade', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                                    placeholder={`Ex: 500 ${subscription.feature.unidade}`}
                                    required
                                />
                            </div>

                            {subscription.feature.pacotes.length > 0 && (
                                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                                    <div className="text-xs text-white/60 mb-2">Pacotes rápidos:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {subscription.feature.pacotes.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    form.setData('quantidade', String(p.quantidade));
                                                    form.setData('valor_pago', String(p.preco));
                                                }}
                                                className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-white/80"
                                            >
                                                {p.nome}: {p.quantidade} ({formatMoeda(p.preco)})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm text-white/80 block mb-2">
                                    Valor pago (Kz) — opcional
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.data.valor_pago}
                                    onChange={(e) => form.setData('valor_pago', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-white/80 block mb-2">Notas — opcional</label>
                                <textarea
                                    rows={2}
                                    value={form.data.notas}
                                    onChange={(e) => form.setData('notas', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModalSaldoAberto(false)}
                                    className="px-3 py-2 text-sm text-white/70"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-4 py-2 rounded-lg bg-[#00D4FF] text-black text-sm font-medium hover:bg-[#8FE7FF] disabled:opacity-50"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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

function InfoRow({ label, valor }: { label: string; valor: string }) {
    return (
        <div className="flex justify-between gap-3 text-sm">
            <span className="text-white/60">{label}</span>
            <span className="text-white">{valor}</span>
        </div>
    );
}
