import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Info, Clock, CircleCheck, Receipt } from 'lucide-react';
import { FormEvent } from 'react';

function formatMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(valor) + ' Kz';
}

interface Feature {
    id: number;
    slug: string;
    nome: string;
    descricao_curta: string | null;
}

interface Pacote {
    id: number;
    nome: string;
    quantidade: number;
}

interface Resumo {
    tipo_item: string;
    descricao: string;
    meses: number | null;
    primeira_compra: boolean;
    valor_base: number;
    valor_activacao: number;
    subtotal: number;
    valor_iva: number;
    taxa_iva: number;
    valor_total: number;
    prazo_pagamento_dias: number;
}

interface DadosBancarios {
    beneficiario: string;
    nif: string;
    banco: string;
    iban: string;
    moeda: string;
    observacao: string;
}

interface Props {
    feature: Feature;
    pacote: Pacote | null;
    resumo: Resumo;
    dados_bancarios: DadosBancarios;
}

export default function OrdensConfirmar({ feature, pacote, resumo, dados_bancarios }: Props) {
    const form = useForm({
        tipo_item: resumo.tipo_item,
        feature_id: feature.id,
        pacote_id: pacote?.id ?? null,
        meses: resumo.meses ?? null,
        notas_cliente: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(route('ordens.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Confirmar compra — ${feature.nome}`} />

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                <div>
                    <Link
                        href={route('funcionalidades.show', feature.slug)}
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-3"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar à loja
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-100">Confirmar compra</h1>
                            <p className="text-sm text-zinc-500">Reveja o resumo antes de confirmar</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-medium text-zinc-100">{feature.nome}</h2>
                                    {feature.descricao_curta && (
                                        <p className="text-sm text-zinc-500 mt-1">{feature.descricao_curta}</p>
                                    )}
                                </div>
                                {resumo.primeira_compra && (
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                        1ª compra
                                    </span>
                                )}
                            </div>
                            <div className="pt-4 border-t border-zinc-800">
                                <p className="text-sm text-zinc-400 mb-1">Item</p>
                                <p className="text-zinc-200">{resumo.descricao}</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-4">
                                Valores
                            </h3>
                            <dl className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <dt className="text-zinc-400">
                                        {resumo.tipo_item === 'pacote_consumivel'
                                            ? 'Valor do pacote'
                                            : `Subscrição (${resumo.meses} ${resumo.meses === 1 ? 'mês' : 'meses'})`}
                                    </dt>
                                    <dd className="text-zinc-200 font-medium">{formatMoeda(resumo.valor_base)}</dd>
                                </div>
                                {resumo.valor_activacao > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-zinc-400">Taxa de activação (uma única vez)</dt>
                                        <dd className="text-zinc-200 font-medium">
                                            {formatMoeda(resumo.valor_activacao)}
                                        </dd>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm pt-3 border-t border-zinc-800">
                                    <dt className="text-zinc-400">Subtotal</dt>
                                    <dd className="text-zinc-200 font-medium">{formatMoeda(resumo.subtotal)}</dd>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <dt className="text-zinc-400">IVA ({resumo.taxa_iva}%)</dt>
                                    <dd className="text-zinc-200 font-medium">{formatMoeda(resumo.valor_iva)}</dd>
                                </div>
                                <div className="flex justify-between pt-4 border-t border-zinc-800">
                                    <dt className="text-zinc-300 font-semibold">Total a pagar</dt>
                                    <dd className="text-2xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                        {formatMoeda(resumo.valor_total)}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-4">
                                Como pagar
                            </h3>
                            <p className="text-sm text-zinc-400 mb-4">
                                Transfira o valor total para a conta abaixo e submeta o comprovativo na ordem. Tem{' '}
                                <strong className="text-zinc-200">{resumo.prazo_pagamento_dias} dias</strong> para
                                completar o pagamento.
                            </p>
                            <dl className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <dt className="text-zinc-500 text-xs uppercase tracking-wide">Beneficiário</dt>
                                    <dd className="text-zinc-200 mt-1">{dados_bancarios.beneficiario}</dd>
                                </div>
                                <div>
                                    <dt className="text-zinc-500 text-xs uppercase tracking-wide">NIF</dt>
                                    <dd className="text-zinc-200 mt-1">{dados_bancarios.nif}</dd>
                                </div>
                                <div>
                                    <dt className="text-zinc-500 text-xs uppercase tracking-wide">Banco</dt>
                                    <dd className="text-zinc-200 mt-1">{dados_bancarios.banco}</dd>
                                </div>
                                <div>
                                    <dt className="text-zinc-500 text-xs uppercase tracking-wide">IBAN</dt>
                                    <dd className="text-zinc-200 mt-1 font-mono text-xs">{dados_bancarios.iban}</dd>
                                </div>
                            </dl>
                            <div className="mt-4 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-200">
                                <Info className="h-3 w-3 inline mr-1" />
                                {dados_bancarios.observacao}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sticky top-6">
                            <div className="space-y-3 mb-4">
                                <div className="flex items-start gap-2 text-xs text-zinc-400">
                                    <Clock className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" />
                                    <span>Prazo de {resumo.prazo_pagamento_dias} dias para pagamento</span>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-zinc-400">
                                    <CircleCheck className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />
                                    <span>Activação automática após aprovação</span>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-zinc-400">
                                    <Receipt className="h-4 w-4 mt-0.5 text-purple-400 shrink-0" />
                                    <span>Factura emitida após confirmação</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs text-zinc-400 mb-1">Notas (opcional)</label>
                                <textarea
                                    value={form.data.notas_cliente}
                                    onChange={(e) => form.setData('notas_cliente', e.target.value)}
                                    maxLength={500}
                                    rows={3}
                                    placeholder="Observações internas..."
                                    className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 px-3 py-2"
                                />
                            </div>

                            {form.errors.feature_id && (
                                <p className="text-xs text-rose-400 mb-3">{form.errors.feature_id}</p>
                            )}

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-medium px-4 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {form.processing ? 'A criar ordem…' : 'Confirmar e gerar ordem'}
                            </button>

                            <Link
                                href={route('funcionalidades.show', feature.slug)}
                                className="block text-center mt-3 text-xs text-zinc-500 hover:text-zinc-300"
                            >
                                Cancelar
                            </Link>
                        </div>

                        <div className="text-xs text-zinc-600 px-2">
                            Ao confirmar gera uma ordem com número único. Nenhum valor é debitado automaticamente. Será
                            necessário submeter comprovativo de transferência.
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
