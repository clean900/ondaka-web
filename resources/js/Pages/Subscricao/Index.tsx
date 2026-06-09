import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Building2,
    Calendar,
    CreditCard,
    Sparkles,
    CheckCircle,
    AlertCircle,
    Clock,
    Receipt,
    XCircle,
    RotateCcw,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    CalendarClock,
    RefreshCw,
} from 'lucide-react';


interface Calculo {
    num_imoveis: number;
    periodicidade: string;
    meses: number;
    preco_base_kz: number;
    escalao: {
        id: number;
        slug: string;
        nome: string;
        min_imoveis: number;
        max_imoveis: number | null;
    };
    desconto_qtd_pct: number;
    desconto_periodo_pct: number;
    subtotal_kz: number;
    imposto_aplicavel: boolean;
    imposto_tipo: string;
    imposto_taxa_pct: number;
    imposto_valor_kz: number;
    total_kz: number;
    total_mensal_equivalente_kz: number;
}

interface Escalao {
    id: number;
    slug: string;
    nome: string;
    descricao: string | null;
    min_imoveis: number;
    max_imoveis: number | null;
    desconto_pct: number;
    cor_badge: string | null;
}

interface Subscricao {
    id: number;
    estado: string;
    ciclo: string;
    num_imoveis: number;
    trial_inicia_em: string | null;
    trial_expira_em: string | null;
    activa_desde: string | null;
    em_trial: boolean;
    activa: boolean;
    tem_acesso: boolean;
    cancela_no_fim_periodo: string | null;
    cancelada_em: string | null;
    motivo_cancelamento: string | null;
    proximo_ciclo: 'mensal' | 'semestral' | 'anual' | null;
    proximo_ciclo_aplica_em: string | null;
}

interface Props {
    subscricao: Subscricao | null;
    empresa: { id: number; nome: string; slug: string; nif: string | null } | null;
    config: {
        preco_base_imovel_mes: number;
        desconto_periodo_mensal_pct: number;
        desconto_periodo_semestral_pct: number;
        desconto_periodo_anual_pct: number;
        trial_duracao_dias: number;
        imposto_aplicavel: boolean;
        imposto_tipo: string;
        imposto_taxa_pct: number;
    };
    escaloes: Escalao[];
    motivos_cancelamento: Record<string, string>;
}

type Periodo = 'mensal' | 'semestral' | 'anual';

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export default function Index({ subscricao, empresa, config, escaloes, motivos_cancelamento }: Props) {
    const [numImoveis, setNumImoveis] = useState<number>(subscricao?.num_imoveis || 30);
    const [periodicidade, setPeriodicidade] = useState<Periodo>('mensal');
    const [calculo, setCalculo] = useState<Calculo | null>(null);
    const [loading, setLoading] = useState(false);

    // Recalcula sempre que muda imóveis ou período (debounce 300ms)
    useEffect(() => {
        if (numImoveis < 1) return;

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
                const r = await fetch('/subscricao/calcular', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrf,
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({ num_imoveis: numImoveis, periodicidade }),
                });
                const data = await r.json();
                if (data.success) setCalculo(data.calculo);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [numImoveis, periodicidade]);

    const activarSubscricao = async () => {
        if (!confirm('Confirmar activação com ' + numImoveis + ' imóveis e período ' + periodicidade + '?')) return;
        setLoading(true);
        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const r = await fetch('/subscricao/activar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                credentials: 'same-origin',
                body: JSON.stringify({ num_imoveis: numImoveis, periodicidade }),
            });
            const data = await r.json();
            if (r.ok && data.success) {
                alert(data.message || 'Sucesso!');
                window.location.reload();
            } else {
                alert(data.message || 'Erro ao activar.');
            }
        } catch (err) {
            alert('Erro de ligação.');
        } finally {
            setLoading(false);
        }
    };

    const alterarImoveis = async () => {
        if (!subscricao) return;
        const diff = numImoveis - subscricao.num_imoveis;
        const aumento = diff > 0;
        const msg = aumento
            ? `Confirmar aumento para ${numImoveis} imóveis (+${diff})? Será cobrado um acréscimo proporcional na próxima factura.`
            : `Confirmar redução para ${numImoveis} imóveis (${diff})? Será gerado um crédito que será abatido na próxima factura.`;

        if (!confirm(msg)) return;
        setLoading(true);
        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const r = await fetch('/subscricao/alterar-imoveis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                credentials: 'same-origin',
                body: JSON.stringify({ num_imoveis: numImoveis }),
            });
            const data = await r.json();
            if (r.ok && data.success) {
                alert(data.message || 'Imóveis alterados.');
                window.location.reload();
            } else {
                alert(data.message || 'Erro ao alterar imóveis.');
            }
        } catch (err) {
            alert('Erro de ligação.');
        } finally {
            setLoading(false);
        }
    };

    const periodoLabel = (p: Periodo) =>
        p === 'mensal' ? '1 mês' : p === 'semestral' ? '6 meses' : '12 meses';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-zinc-100">
                    <CreditCard className="mr-2 inline h-5 w-5" />
                    Subscrição
                </h2>
            }
        >
            <Head title="Subscrição" />

            <div className="py-6">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Status atual da subscrição */}
                    {subscricao && (
                        <SubscricaoStatus subscricao={subscricao} trialDias={config.trial_duracao_dias} />
                    )}

                    {/* Card principal: configurar subscrição */}
                    <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                        <div className="border-b border-zinc-800 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-6">
                            <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
                                <Sparkles className="h-5 w-5 text-cyan-400" />
                                Configurar Subscrição
                            </h3>
                            <p className="mt-1 text-sm text-zinc-400">
                                Indique o nº de imóveis e escolha a periodicidade. Os descontos serão calculados automaticamente.
                            </p>
                        </div>

                        <div className="space-y-6 p-6">
                            {/* 1. Número de imóveis */}
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-200">
                                    <Building2 className="h-4 w-4 text-cyan-400" />
                                    1. Quantos imóveis vai gerir?
                                </label>
                                <input
                                    type="number"
                                    value={numImoveis}
                                    onChange={(e) => setNumImoveis(parseInt(e.target.value) || 0)}
                                    min={1}
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-lg text-white focus:border-cyan-500 focus:outline-none"
                                    placeholder="Ex: 50"
                                />
                                <p className="mt-1 text-xs text-zinc-500">
                                    Imóveis = total combinado de todos os condomínios que gere.
                                </p>
                            </div>

                            {/* 2. Periodicidade */}
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-200">
                                    <Calendar className="h-4 w-4 text-blue-400" />
                                    2. Periodicidade do pagamento
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <PeriodoCard
                                        active={periodicidade === 'mensal'}
                                        onClick={() => setPeriodicidade('mensal')}
                                        nome="Mensal"
                                        meses="1 mês"
                                        desconto={config.desconto_periodo_mensal_pct}
                                    />
                                    <PeriodoCard
                                        active={periodicidade === 'semestral'}
                                        onClick={() => setPeriodicidade('semestral')}
                                        nome="Semestral"
                                        meses="6 meses"
                                        desconto={config.desconto_periodo_semestral_pct}
                                    />
                                    <PeriodoCard
                                        active={periodicidade === 'anual'}
                                        onClick={() => setPeriodicidade('anual')}
                                        nome="Anual"
                                        meses="12 meses"
                                        desconto={config.desconto_periodo_anual_pct}
                                    />
                                </div>
                            </div>

                            {/* 3. Resumo do cálculo */}
                            {calculo && (
                                <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-5">
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-400">
                                        <Receipt className="h-4 w-4" />
                                        Resumo do cálculo
                                    </h4>

                                    <div className="space-y-2 text-sm">
                                        <ResumoLinha label={`${calculo.num_imoveis} imóveis × ${fmt(calculo.preco_base_kz)} Kz × ${calculo.meses} ${calculo.meses === 1 ? 'mês' : 'meses'}`} valor={fmt(calculo.num_imoveis * calculo.preco_base_kz * calculo.meses)} />
                                        {calculo.desconto_qtd_pct > 0 && (
                                            <ResumoLinha
                                                label={`Desconto qtd (${calculo.escalao.nome} - ${calculo.desconto_qtd_pct}%)`}
                                                valor={`-${fmt(calculo.num_imoveis * calculo.preco_base_kz * calculo.meses * (calculo.desconto_qtd_pct / 100))}`}
                                                tipo="desconto"
                                            />
                                        )}
                                        {calculo.desconto_periodo_pct > 0 && (
                                            <ResumoLinha
                                                label={`Desconto período (${calculo.desconto_periodo_pct}%)`}
                                                valor={`-${fmt((calculo.num_imoveis * calculo.preco_base_kz * calculo.meses * (1 - calculo.desconto_qtd_pct / 100)) * (calculo.desconto_periodo_pct / 100))}`}
                                                tipo="desconto"
                                            />
                                        )}
                                        <div className="my-3 border-t border-zinc-800" />
                                        <ResumoLinha label="Subtotal" valor={fmt(calculo.subtotal_kz)} forte />
                                        {calculo.imposto_aplicavel && (
                                            <ResumoLinha
                                                label={`${calculo.imposto_tipo} ${calculo.imposto_taxa_pct}%`}
                                                valor={`+${fmt(calculo.imposto_valor_kz)}`}
                                            />
                                        )}
                                        <div className="my-3 border-t border-zinc-800" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-semibold text-white">TOTAL a pagar</span>
                                            <span className="text-2xl font-bold text-cyan-400">{fmt(calculo.total_kz)} Kz</span>
                                        </div>
                                        {calculo.meses > 1 && (
                                            <p className="text-right text-xs text-zinc-500">
                                                = {fmt(calculo.total_mensal_equivalente_kz)} Kz/mês equivalente
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {loading && !calculo && (
                                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5 text-center text-sm text-zinc-500">
                                    A calcular...
                                </div>
                            )}

                            {/* 4. Botão de acção */}
                            {calculo && !subscricao?.activa && (
                                <button
                                    type="button"
                                    onClick={activarSubscricao}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg hover:from-cyan-400 hover:to-purple-500"
                                >
                                    <Sparkles className="h-5 w-5" />
                                    {subscricao?.em_trial ? 'Confirmar e activar subscrição' : `Iniciar trial de ${config.trial_duracao_dias} dias`}
                                </button>
                            )}

                            {calculo && subscricao?.activa && numImoveis !== subscricao.num_imoveis && (
                                <button
                                    type="button"
                                    onClick={alterarImoveis}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4 text-base font-semibold text-white shadow-lg hover:from-purple-400 hover:to-pink-500"
                                >
                                    <Sparkles className="h-5 w-5" />
                                    Alterar para {numImoveis} imóveis ({numImoveis > subscricao.num_imoveis ? '+' : ''}{numImoveis - subscricao.num_imoveis})
                                </button>
                            )}

                            {calculo && subscricao?.activa && numImoveis === subscricao.num_imoveis && (
                                <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-sm text-green-400">
                                    <CheckCircle className="mr-2 inline h-4 w-4" />
                                    A sua subscrição está activa com <strong>{subscricao.num_imoveis} imóveis</strong>. Para alterar, modifique o número acima.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabela informativa de escalões */}
                    <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <h3 className="mb-4 text-sm font-medium text-zinc-300">Escalões disponíveis</h3>
                        <div className="space-y-2">
                            {escaloes.map((e) => (
                                <div key={e.id} className="flex items-center justify-between rounded-lg border border-zinc-800 p-3">
                                    <div>
                                        <span className="font-medium text-white">{e.nome}</span>
                                        <span className="ml-2 text-xs text-zinc-500">
                                            {e.min_imoveis} - {e.max_imoveis ?? '∞'} imóveis
                                        </span>
                                    </div>
                                    {e.desconto_pct > 0 ? (
                                        <span className="text-sm font-semibold text-cyan-400">
                                            -{e.desconto_pct}% desconto
                                        </span>
                                    ) : (
                                        <span className="text-sm text-zinc-500">Preço base</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Secção Mudar Plano */}
                {subscricao && subscricao.estado !== 'cancelada' && (
                    <SeccaoMudarPlano subscricao={subscricao} />
                )}

                {/* Secção Gerir subscrição */}
                {subscricao && (
                    <SeccaoGerirSubscricao
                        subscricao={subscricao}
                        motivos={motivos_cancelamento}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}

// ============== STATUS BANNER ==============
function SubscricaoStatus({ subscricao, trialDias }: { subscricao: Subscricao; trialDias: number }) {
    if (subscricao.em_trial && subscricao.trial_expira_em) {
        const expira = new Date(subscricao.trial_expira_em);
        const dias = Math.max(0, Math.ceil((expira.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        return (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
                <Clock className="mr-2 inline h-4 w-4 text-orange-400" />
                <span className="text-sm text-orange-300">
                    Está em <strong>período de trial</strong>. Faltam <strong>{dias} dias</strong>.
                </span>
            </div>
        );
    }
    if (subscricao.activa) {
        return (
            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                <CheckCircle className="mr-2 inline h-4 w-4 text-green-400" />
                <span className="text-sm text-green-300">
                    Subscrição <strong>activa</strong>. Plano: {subscricao.ciclo}, {subscricao.num_imoveis} imóveis.
                </span>
            </div>
        );
    }
    return (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
            <AlertCircle className="mr-2 inline h-4 w-4 text-yellow-400" />
            <span className="text-sm text-yellow-300">
                A sua subscrição não está activa. Configure abaixo para começar.
            </span>
        </div>
    );
}

// ============== PERIODO CARD ==============
function PeriodoCard({
    active,
    onClick,
    nome,
    meses,
    desconto,
}: {
    active: boolean;
    onClick: () => void;
    nome: string;
    meses: string;
    desconto: number;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative rounded-lg border-2 p-4 text-left transition ${
                active
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
            }`}
        >
            <div className="text-sm font-semibold text-white">{nome}</div>
            <div className="text-xs text-zinc-400">{meses}</div>
            {desconto > 0 && (
                <div className="mt-2 inline-block rounded bg-cyan-500/20 px-2 py-0.5 text-xs font-medium text-cyan-400">
                    -{desconto}% desconto
                </div>
            )}
        </button>
    );
}

// ============== RESUMO LINHA ==============
function ResumoLinha({ label, valor, tipo, forte }: { label: string; valor: string; tipo?: string; forte?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className={`${forte ? 'text-zinc-200' : 'text-zinc-400'}`}>{label}</span>
            <span
                className={`${forte ? 'font-semibold text-white' : tipo === 'desconto' ? 'text-cyan-400' : 'text-zinc-300'}`}
            >
                {valor} Kz
            </span>
        </div>
    );
}


function SeccaoGerirSubscricao({
    subscricao,
    motivos,
}: {
    subscricao: Subscricao;
    motivos: Record<string, string>;
}) {
    const [modalCancelar, setModalCancelar] = useState(false);
    const [modalReverter, setModalReverter] = useState(false);

    return (
        <div className="mt-8">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="mb-2 text-lg font-bold text-zinc-100">Gerir subscrição</h3>
                <p className="mb-4 text-sm text-zinc-400">
                    Pode cancelar a subscrição a qualquer momento. Mantém o acesso até ao fim do período pago.
                </p>

                {subscricao.cancela_no_fim_periodo ? (
                    <div className="space-y-3">
                        <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-400" />
                                <div className="flex-1">
                                    <div className="font-semibold text-orange-300">
                                        Cancelamento agendado
                                    </div>
                                    <div className="mt-1 text-sm text-zinc-300">
                                        Subscrição cancelada em{' '}
                                        {subscricao.cancelada_em
                                            ? new Date(subscricao.cancelada_em).toLocaleDateString('pt-PT')
                                            : '—'}
                                        . Mantém acesso até ao fim do período pago.
                                    </div>
                                    {subscricao.motivo_cancelamento && (
                                        <div className="mt-2 text-xs text-zinc-400">
                                            <strong>Motivo:</strong> {subscricao.motivo_cancelamento}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setModalReverter(true)}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-blue-400 hover:to-purple-500"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reverter cancelamento
                        </button>
                    </div>
                ) : (
                    subscricao.estado !== 'cancelada' && (
                        <button
                            onClick={() => setModalCancelar(true)}
                            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:border-red-500 hover:bg-red-500/10"
                        >
                            <XCircle className="h-4 w-4" />
                            Cancelar subscrição
                        </button>
                    )
                )}
            </div>

            {modalCancelar && (
                <ModalCancelarSubscricao
                    motivos={motivos}
                    onClose={() => setModalCancelar(false)}
                />
            )}
            {modalReverter && <ModalReverterCancelamento onClose={() => setModalReverter(false)} />}
        </div>
    );
}

function ModalCancelarSubscricao({
    motivos,
    onClose,
}: {
    motivos: Record<string, string>;
    onClose: () => void;
}) {
    const { data, setData, post, processing, errors } = useForm({
        motivo_chave: '',
        detalhes: '',
        confirma: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.confirma || !data.motivo_chave) return;
        post(route('subscricao.cancelar'), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <form
                onSubmit={submit}
                className="w-full max-w-lg rounded-2xl border border-red-500/30 bg-zinc-900 p-6"
            >
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-red-300">
                    <AlertTriangle className="h-5 w-5" /> Cancelar subscrição
                </h3>
                <div className="mb-4 rounded-lg bg-orange-500/10 border border-orange-500/30 p-3 text-xs text-orange-200">
                    A sua subscrição mantém-se activa até ao fim do período pago. Após essa data o acesso será limitado.
                </div>

                <label className="mb-1 block text-xs font-semibold text-zinc-300">
                    Motivo do cancelamento *
                </label>
                <select
                    value={data.motivo_chave}
                    onChange={(e) => setData('motivo_chave', e.target.value)}
                    required
                    className="mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                >
                    <option value="">Seleccionar motivo...</option>
                    {Object.entries(motivos).map(([k, v]) => (
                        <option key={k} value={k}>
                            {v}
                        </option>
                    ))}
                </select>
                {errors.motivo_chave && <p className="mb-2 text-xs text-red-400">{errors.motivo_chave}</p>}

                <label className="mb-1 block text-xs font-semibold text-zinc-300">
                    Detalhes adicionais (opcional)
                </label>
                <textarea
                    value={data.detalhes}
                    onChange={(e) => setData('detalhes', e.target.value)}
                    rows={3}
                    placeholder="Ajude-nos a melhorar..."
                    className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                />

                <label className="mb-4 flex cursor-pointer items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                    <input
                        type="checkbox"
                        checked={data.confirma}
                        onChange={(e) => setData('confirma', e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-red-500"
                    />
                    <span className="text-xs text-zinc-300">
                        Confirmo que quero cancelar a subscrição. Mantenho acesso até ao fim do período pago.
                    </span>
                </label>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm"
                    >
                        Voltar
                    </button>
                    <button
                        type="submit"
                        disabled={processing || !data.confirma || !data.motivo_chave}
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {processing ? 'A processar...' : 'Confirmar cancelamento'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function ModalReverterCancelamento({ onClose }: { onClose: () => void }) {
    const [processing, setProcessing] = useState(false);

    const reverter = () => {
        setProcessing(true);
        router.post(
            route('subscricao.reverter-cancelamento'),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: onClose,
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-blue-300">
                    <RotateCcw className="h-5 w-5" /> Reverter cancelamento
                </h3>
                <p className="mb-6 text-sm text-zinc-400">
                    A sua subscrição voltará a renovar-se automaticamente no fim do período pago. Tem a certeza?
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm"
                    >
                        Voltar
                    </button>
                    <button
                        onClick={reverter}
                        disabled={processing}
                        className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {processing ? 'A processar...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SeccaoMudarPlano({ subscricao }: { subscricao: Subscricao }) {
    const [modalAberto, setModalAberto] = useState(false);

    const cicloLabel: Record<string, string> = {
        mensal: 'Mensal',
        semestral: 'Semestral',
        anual: 'Anual',
    };

    return (
        <div className="mt-8">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="mb-2 text-lg font-bold text-zinc-100">Mudar plano</h3>
                <p className="mb-4 text-sm text-zinc-400">
                    Pode mudar entre Mensal, Semestral e Anual. Upgrades aplicam-se imediatamente; downgrades passam a vigorar no fim do período actual.
                </p>

                <div className="mb-4 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                    <div className="flex-1">
                        <div className="text-xs uppercase tracking-wider text-zinc-500">Plano actual</div>
                        <div className="font-semibold text-white">{cicloLabel[subscricao.ciclo] ?? subscricao.ciclo}</div>
                    </div>
                </div>

                {subscricao.proximo_ciclo ? (
                    <div className="space-y-3">
                        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
                            <div className="flex items-start gap-2">
                                <CalendarClock className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                                <div className="flex-1">
                                    <div className="font-semibold text-blue-300">Mudança agendada</div>
                                    <div className="mt-1 text-sm text-zinc-300">
                                        Passa para <strong>{cicloLabel[subscricao.proximo_ciclo]}</strong> em{' '}
                                        {subscricao.proximo_ciclo_aplica_em
                                            ? new Date(subscricao.proximo_ciclo_aplica_em).toLocaleDateString('pt-PT')
                                            : '—'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => router.post(route('subscricao.cancelar-downgrade'), {}, { preserveScroll: true })}
                            className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-600"
                        >
                            Cancelar mudança agendada
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setModalAberto(true)}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-blue-400 hover:to-purple-500"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Mudar plano
                    </button>
                )}
            </div>

            {modalAberto && (
                <ModalMudarPlano
                    cicloActual={subscricao.ciclo}
                    onClose={() => setModalAberto(false)}
                />
            )}
        </div>
    );
}

function ModalMudarPlano({ cicloActual, onClose }: { cicloActual: string; onClose: () => void }) {
    const [cicloNovo, setCicloNovo] = useState<string>('');
    const [preview, setPreview] = useState<any>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const cicloLabel: Record<string, string> = {
        mensal: 'Mensal',
        semestral: 'Semestral',
        anual: 'Anual',
    };

    // Buscar preview quando muda o ciclo escolhido
    useEffect(() => {
        if (!cicloNovo) {
            setPreview(null);
            return;
        }
        setLoadingPreview(true);
        fetch(route('subscricao.mudar-plano.preview'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ ciclo_novo: cicloNovo }),
        })
            .then((r) => r.json())
            .then((data) => {
                setPreview(data);
                setLoadingPreview(false);
            })
            .catch(() => setLoadingPreview(false));
    }, [cicloNovo]);

    const submit = () => {
        if (!cicloNovo || !preview?.valida) return;
        setSubmitting(true);
        router.post(route('subscricao.mudar-plano'), { ciclo_novo: cicloNovo }, {
            preserveScroll: true,
            onSuccess: onClose,
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold">
                    <RefreshCw className="h-5 w-5 text-blue-400" /> Mudar plano
                </h3>
                <p className="mb-4 text-sm text-zinc-400">Plano actual: <strong>{cicloLabel[cicloActual]}</strong></p>

                <label className="mb-2 block text-xs font-semibold text-zinc-300">Escolha o novo plano</label>
                <div className="mb-4 grid grid-cols-3 gap-2">
                    {(['mensal', 'semestral', 'anual'] as const).map((c) => (
                        <button
                            key={c}
                            type="button"
                            disabled={c === cicloActual}
                            onClick={() => setCicloNovo(c)}
                            className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                                cicloNovo === c
                                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/10 text-white'
                                    : c === cicloActual
                                      ? 'border-zinc-800 bg-zinc-950 text-zinc-600 cursor-not-allowed'
                                      : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                            }`}
                        >
                            {cicloLabel[c]}
                            {c === cicloActual && <div className="text-[10px] font-normal text-zinc-500 mt-1">Actual</div>}
                        </button>
                    ))}
                </div>

                {/* Preview */}
                {loadingPreview && (
                    <div className="mb-4 rounded-lg bg-zinc-800/50 p-3 text-center text-xs text-zinc-500">
                        A calcular...
                    </div>
                )}

                {preview && preview.valida && (
                    <div className="mb-4 space-y-2">
                        {preview.tipo === 'upgrade' && (
                            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-4 w-4 text-green-400" />
                                    <span className="font-semibold text-green-300 text-sm">Upgrade imediato</span>
                                </div>
                                <div className="text-xs text-zinc-300 mb-2">
                                    O upgrade aplica-se imediatamente. Será gerada uma factura para concluir o upgrade.
                                </div>
                                <div className="rounded bg-zinc-900/50 p-3 mt-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-400">Valor a pagar agora</span>
                                        <span className="font-bold text-green-300">
                                            {Math.round(preview.pro_rata_estimado_kz ?? 0).toLocaleString('pt-AO')} Kz
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1">
                                        <span className="text-zinc-500">Valor próximo ciclo completo</span>
                                        <span className="text-zinc-400">
                                            {Math.round(preview.valor_proximo_ciclo_kz ?? 0).toLocaleString('pt-AO')} Kz
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {preview.tipo === 'downgrade' && (
                            <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="h-4 w-4 text-orange-400" />
                                    <span className="font-semibold text-orange-300 text-sm">Downgrade agendado</span>
                                </div>
                                <div className="text-xs text-zinc-300">
                                    Mantém o plano actual até{' '}
                                    {preview.aplica_em
                                        ? new Date(preview.aplica_em).toLocaleDateString('pt-PT')
                                        : '—'}
                                    . A partir dessa data passa para {cicloLabel[preview.ciclo_novo]}.
                                </div>
                                <div className="rounded bg-zinc-900/50 p-3 mt-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-400">Valor próximo ciclo</span>
                                        <span className="font-bold text-orange-300">
                                            {Math.round(preview.valor_proximo_ciclo_kz ?? 0).toLocaleString('pt-AO')} Kz
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {preview && !preview.valida && preview.erro && (
                    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
                        {preview.erro}
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm">
                        Voltar
                    </button>
                    <button
                        onClick={submit}
                        disabled={submitting || !cicloNovo || !preview?.valida}
                        className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {submitting ? 'A processar...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
