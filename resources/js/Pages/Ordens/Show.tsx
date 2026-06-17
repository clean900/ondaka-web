import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CreditCard,
    CheckCircle2,
    Clock,
    Copy,
    Download,
    FileText,
    Info,
    XCircle,
    AlertCircle,
    Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface Feature {
    slug: string;
    nome: string;
    unidade: string;
}

interface Pacote {
    nome: string;
    quantidade: number;
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
    moeda: string;
    estado: string;
    estado_label: string;
    data_transacao: string | null;
    tem_comprovativo: boolean;
    comprovativo_nome: string | null;
    comprovativo_tamanho: string | null;
    motivo_rejeicao: string | null;
    created_at: string;
}

interface ReferenciaProxyPay {
    id: number;
    reference_id: number;
    reference_formatada: string;
    entity_id: number;
    entity_formatada: string;
    amount: number;
    status: 'activa' | 'paga' | 'expirada' | 'cancelada';
    status_label: string;
    expira_em: string;
    expirada: boolean;
    pago_em: string | null;
    terminal_type: string | null;
}

interface Ordem {
    id: number;
    numero: string;
    tipo_item: string;
    tipo_item_label: string;
    descricao_item: string;
    meses_contratados: number | null;
    valor_base: number;
    valor_activacao: number;
    valor_iva: number;
    valor_total: number;
    estado: string;
    estado_label: string;
    prazo_pagamento: string | null;
    aprovada_em: string | null;
    rejeitada_em: string | null;
    cancelada_em: string | null;
    motivo_rejeicao: string | null;
    notas_cliente: string | null;
    total_pago: number;
    saldo_em_falta: number;
    expirou: boolean;
    pode_cancelar: boolean;
    esta_aprovada: boolean;
    esta_totalmente_paga: boolean;
    created_at: string;
    feature: Feature | null;
    pacote: Pacote | null;
    factura: Factura | null;
    pagamentos: Pagamento[];
}

interface Props {
    ordem: Ordem;
    referencia_proxypay: ReferenciaProxyPay | null;
}

function formatKz(valor: number): string {
    return new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(valor) + ' Kz';
}

function formatData(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDataHora(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function EstadoBadge({ estado, estado_label }: { estado: string; estado_label: string }) {
    const styles: Record<string, string> = {
        em_revisao: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        aprovada: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        rejeitada: 'bg-red-500/10 text-red-400 border-red-500/30',
        cancelada: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
        expirada: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
    };
    const style = styles[estado] ?? styles.em_revisao;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${style}`}>
            {estado_label}
        </span>
    );
}

export default function OrdemShow({ ordem, referencia_proxypay }: Props) {
    const [gerando, setGerando] = useState(false);
    const [cancelando, setCancelando] = useState(false);

    const copiar = (texto: string, label: string) => {
        navigator.clipboard.writeText(texto);
        toast.success(`${label} copiado`);
    };

    const gerarReferencia = () => {
        if (gerando) return;
        setGerando(true);
        router.post(
            route('ordens.gerar-referencia', ordem.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setGerando(false),
            }
        );
    };

    const cancelarOrdem = () => {
        if (!confirm('Cancelar esta ordem? Não poderás reverter esta ação.')) return;
        setCancelando(true);
        router.post(
            route('ordens.cancelar', ordem.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setCancelando(false),
            }
        );
    };

    const podeGerarReferencia =
        !referencia_proxypay &&
        !['aprovada', 'rejeitada', 'cancelada', 'expirada'].includes(ordem.estado);

    const referenciaNumerica = referencia_proxypay?.reference_id.toString() ?? '';
    const entityNumerica = referencia_proxypay?.entity_id.toString() ?? '';

    return (
        <AuthenticatedLayout>
            <Head title={`Ordem ${ordem.numero}`} />

            <div className="min-h-screen bg-[#0A0A1A] py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('ordens.minhas')}
                        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-cyan-400 transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        As minhas ordens
                    </Link>

                    <div className="mb-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-6 backdrop-blur">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="text-xs uppercase tracking-wider text-zinc-500">
                                    Ordem de compra
                                </div>
                                <h1 className="mt-1 text-2xl font-medium text-white">{ordem.numero}</h1>
                                <p className="mt-1 text-sm text-zinc-400">{ordem.descricao_item}</p>
                            </div>
                            <EstadoBadge estado={ordem.estado} estado_label={ordem.estado_label} />
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-xl bg-zinc-800/40 p-3">
                                <div className="text-xs text-zinc-500">Valor base</div>
                                <div className="mt-1 text-sm font-medium text-white">
                                    {formatKz(ordem.valor_base)}
                                </div>
                            </div>
                            {ordem.valor_activacao > 0 && (
                                <div className="rounded-xl bg-zinc-800/40 p-3">
                                    <div className="text-xs text-zinc-500">Activação</div>
                                    <div className="mt-1 text-sm font-medium text-white">
                                        {formatKz(ordem.valor_activacao)}
                                    </div>
                                </div>
                            )}
                            <div className="rounded-xl bg-zinc-800/40 p-3">
                                <div className="text-xs text-zinc-500">IPS 6,5%</div>
                                <div className="mt-1 text-sm font-medium text-white">
                                    {formatKz(ordem.valor_iva)}
                                </div>
                            </div>
                            <div className="rounded-xl bg-zinc-800/40 p-3">
                                <div className="text-xs text-zinc-500">Total</div>
                                <div className="mt-1 text-sm font-medium bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                    {formatKz(ordem.valor_total)}
                                </div>
                            </div>
                        </div>

                        {ordem.prazo_pagamento && !ordem.esta_totalmente_paga && (
                            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
                                <Clock className="h-4 w-4" />
                                Prazo de pagamento: <span className="font-medium text-white">{formatData(ordem.prazo_pagamento)}</span>
                            </div>
                        )}

                        {ordem.aprovada_em && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Aprovada em {formatDataHora(ordem.aprovada_em)}
                            </div>
                        )}

                        {ordem.rejeitada_em && ordem.motivo_rejeicao && (
                            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                                <div className="font-medium text-red-400">Ordem rejeitada</div>
                                <div className="mt-1">{ordem.motivo_rejeicao}</div>
                            </div>
                        )}
                    </div>

                    {podeGerarReferencia && (
                        <div className="mb-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-6 backdrop-blur">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                                <CreditCard className="h-3.5 w-3.5" />
                                Pagamento
                            </div>
                            <h2 className="mt-1 text-lg font-medium text-white">
                                Pagar via Multicaixa · ProxyPay
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                                Gera uma referência única para pagares em qualquer ATM, Multicaixa Express ou homebanking.
                                O pagamento é confirmado automaticamente em poucos minutos.
                            </p>
                            <button
                                onClick={gerarReferencia}
                                disabled={gerando}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2.5 text-sm font-medium text-white hover:from-cyan-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <CreditCard className="h-4 w-4" />
                                {gerando ? 'A gerar…' : 'Gerar referência de pagamento'}
                            </button>
                        </div>
                    )}

                    {referencia_proxypay && referencia_proxypay.status === 'activa' && !referencia_proxypay.expirada && (
                        <div className="mb-6 rounded-2xl border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 p-6 backdrop-blur">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-zinc-400">
                                        Referência ProxyPay
                                    </div>
                                    <h2 className="mt-1 text-lg font-medium text-white">Pronta para pagar</h2>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400">
                                    Activa
                                </span>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-xl bg-zinc-900/60 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-zinc-500">Entidade</div>
                                        <button
                                            onClick={() => copiar(entityNumerica, 'Entidade')}
                                            className="text-zinc-500 hover:text-cyan-400 transition"
                                            title="Copiar entidade"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="mt-2 font-mono text-2xl tracking-wider text-white">
                                        {referencia_proxypay.entity_formatada}
                                    </div>
                                </div>

                                <div className="rounded-xl bg-zinc-900/60 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-zinc-500">Referência</div>
                                        <button
                                            onClick={() => copiar(referenciaNumerica, 'Referência')}
                                            className="text-zinc-500 hover:text-cyan-400 transition"
                                            title="Copiar referência"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="mt-2 font-mono text-2xl tracking-wider text-white">
                                        {referencia_proxypay.reference_formatada}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 rounded-xl bg-zinc-900/60 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-zinc-500">Montante</div>
                                        <div className="mt-1 text-lg font-medium text-white">
                                            {formatKz(referencia_proxypay.amount)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-zinc-500">Válida até</div>
                                        <div className="mt-1 text-sm text-white">
                                            {formatData(referencia_proxypay.expira_em)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl bg-zinc-900/40 p-4">
                                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                                    <Info className="h-4 w-4 text-cyan-400" />
                                    Como pagar
                                </div>
                                <ol className="space-y-1.5 text-xs leading-relaxed text-zinc-400">
                                    <li>1. Num ATM: Pagamentos → Outros serviços → Pagamentos por referência</li>
                                    <li>2. Insere a Entidade <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-white">{entityNumerica}</span></li>
                                    <li>3. Insere a Referência <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-white">{referenciaNumerica}</span></li>
                                    <li>4. Confirma o montante <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-white">{formatKz(referencia_proxypay.amount)}</span></li>
                                </ol>
                                <div className="mt-3 text-xs text-zinc-500">
                                    Também podes pagar via Multicaixa Express ou homebanking usando os mesmos dados.
                                </div>
                            </div>
                        </div>
                    )}

                    {referencia_proxypay && referencia_proxypay.status === 'paga' && (
                        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-zinc-400">
                                        Referência ProxyPay
                                    </div>
                                    <h2 className="mt-1 flex items-center gap-2 text-lg font-medium text-emerald-400">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Pagamento confirmado
                                    </h2>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                                    Paga
                                </span>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-xl bg-zinc-900/40 p-3">
                                    <div className="text-xs text-zinc-500">Entidade</div>
                                    <div className="mt-1 font-mono text-sm text-white">{referencia_proxypay.entity_formatada}</div>
                                </div>
                                <div className="rounded-xl bg-zinc-900/40 p-3">
                                    <div className="text-xs text-zinc-500">Referência</div>
                                    <div className="mt-1 font-mono text-sm text-white">{referencia_proxypay.reference_formatada}</div>
                                </div>
                                <div className="rounded-xl bg-zinc-900/40 p-3">
                                    <div className="text-xs text-zinc-500">Paga em</div>
                                    <div className="mt-1 text-sm text-white">{formatDataHora(referencia_proxypay.pago_em)}</div>
                                </div>
                                <div className="rounded-xl bg-zinc-900/40 p-3">
                                    <div className="text-xs text-zinc-500">Terminal</div>
                                    <div className="mt-1 text-sm text-white">{referencia_proxypay.terminal_type ?? '—'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {referencia_proxypay && (referencia_proxypay.status === 'expirada' || referencia_proxypay.expirada) && (
                        <div className="mb-6 rounded-2xl border border-zinc-700 bg-zinc-900/30 p-6">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <AlertCircle className="h-5 w-5" />
                                <span className="font-medium">Referência expirada</span>
                            </div>
                            <p className="mt-2 text-sm text-zinc-500">
                                A referência anterior expirou. Gera uma nova para pagar esta ordem.
                            </p>
                            <button
                                onClick={gerarReferencia}
                                disabled={gerando}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2.5 text-sm font-medium text-white hover:from-cyan-400 hover:to-purple-400 disabled:opacity-50 transition"
                            >
                                <CreditCard className="h-4 w-4" />
                                {gerando ? 'A gerar…' : 'Gerar nova referência'}
                            </button>
                        </div>
                    )}

                    {ordem.pagamentos.length > 0 && (
                        <div className="mb-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-6 backdrop-blur">
                            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                                <Banknote className="h-3.5 w-3.5" />
                                Histórico de pagamentos
                            </div>
                            <div className="divide-y divide-zinc-800/50">
                                {ordem.pagamentos.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <div className="text-sm font-medium text-white">{p.referencia}</div>
                                            <div className="mt-0.5 text-xs text-zinc-500">
                                                {p.metodo_label} · {formatData(p.data_transacao ?? p.created_at)}
                                            </div>
                                            {p.motivo_rejeicao && (
                                                <div className="mt-1 text-xs text-red-400">
                                                    Rejeitado: {p.motivo_rejeicao}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-white">
                                                {formatKz(p.valor)}
                                            </div>
                                            <div className="mt-0.5 text-xs text-zinc-400">{p.estado_label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {ordem.factura && (
                        <div className="mb-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-6 backdrop-blur">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                                        <FileText className="h-3.5 w-3.5" />
                                        Factura
                                    </div>
                                    <div className="mt-1 text-sm font-medium text-white">
                                        {ordem.factura.numero}
                                    </div>
                                    <div className="mt-0.5 text-xs text-zinc-500">
                                        {ordem.factura.tipo_documento_label} · {formatData(ordem.factura.data_emissao)}
                                    </div>
                                </div>
                                <a
                                    href={route('facturas.download-attachment', ordem.factura.id)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white hover:bg-zinc-800 transition"
                                >
                                    <Download className="h-4 w-4" />
                                    Descarregar
                                </a>
                            </div>
                        </div>
                    )}

                    {ordem.pode_cancelar && (
                        <div className="flex justify-end">
                            <button
                                onClick={cancelarOrdem}
                                disabled={cancelando}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition"
                            >
                                <XCircle className="h-4 w-4" />
                                {cancelando ? 'A cancelar…' : 'Cancelar ordem'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
