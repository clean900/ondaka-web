import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Receipt, Clock, CheckCircle2, XCircle, AlertCircle, CreditCard, Building2 } from 'lucide-react';

interface Factura {
    id: number;
    numero: string;
    periodo_inicio: string;
    periodo_fim: string;
    num_imoveis: number;
    preco_base_kz: number;
    desconto_qtd_pct: number;
    desconto_periodo_pct: number;
    subtotal_kz: number;
    imposto_tipo: string | null;
    imposto_taxa_pct: number;
    imposto_valor_kz: number;
    valor_total_kz: number;
    estado: 'pendente' | 'paga' | 'anulada';
    data_emissao: string;
    data_vencimento: string;
    data_pagamento: string | null;
    breakdown: any;
    tem_referencia_pagamento: boolean;
    proxypay_referencia_id: number | null;
    referencia_dados: { reference_id: number; entity_id: string; amount: number; status: string; expira_em: string } | null;
}

interface Empresa {
    id: number;
    nome: string;
    slug: string;
    nif: string | null;
}

interface Banco {
    beneficiario: string;
    nif: string;
    banco: string;
    iban: string;
    moeda: string;
    email_comprovativo: string;
}

interface Props {
    factura: Factura;
    empresa: Empresa | null;
    banco: Banco;
}

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const fmtData = (v: string) => {
    if (!v) return '—';
    const d = new Date(v);
    return d.toLocaleDateString('pt-PT');
};

export default function FacturaShow({ factura, empresa, banco }: Props) {
    const copiar = (texto: string) => {
        try {
            navigator.clipboard?.writeText(texto);
        } catch {
            /* clipboard indisponível — ignora */
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-zinc-100">
                    <Receipt className="mr-2 inline h-5 w-5" />
                    Factura {factura.numero}
                </h2>
            }
        >
            <Head title={`Factura ${factura.numero}`} />

            <div className="py-6">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href="/subscricao/facturas"
                            className="text-sm text-zinc-400 hover:text-zinc-200"
                        >
                            ← Voltar às facturas
                        </Link>
                    </div>

                    {/* Estado da factura */}
                    {factura.estado === 'paga' && (
                        <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                            <CheckCircle2 className="h-6 w-6 text-green-400" />
                            <div>
                                <div className="font-medium text-green-300">Factura paga</div>
                                <div className="text-sm text-green-400/80">
                                    Pagamento recebido em {fmtData(factura.data_pagamento || '')}.
                                </div>
                            </div>
                        </div>
                    )}

                    {factura.estado === 'pendente' && (
                        <div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                            <Clock className="h-6 w-6 text-yellow-400" />
                            <div className="flex-1">
                                <div className="font-medium text-yellow-300">Factura pendente</div>
                                <div className="text-sm text-yellow-400/80">
                                    Vencimento: {fmtData(factura.data_vencimento)}
                                </div>
                            </div>
                        </div>
                    )}

                    {factura.estado === 'anulada' && (
                        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                            <XCircle className="h-6 w-6 text-red-400" />
                            <div>
                                <div className="font-medium text-red-300">Factura anulada</div>
                            </div>
                        </div>
                    )}

                    {/* Cabeçalho factura */}
                    <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-wider text-zinc-500">Factura</div>
                                <div className="mt-1 font-mono text-2xl font-bold text-white">{factura.numero}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs uppercase tracking-wider text-zinc-500">Total a pagar</div>
                                <div className="mt-1 text-3xl font-bold text-cyan-400">{fmt(factura.valor_total_kz)} Kz</div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4 text-sm">
                            <div>
                                <div className="text-zinc-500">Emissão</div>
                                <div className="font-medium text-zinc-300">{fmtData(factura.data_emissao)}</div>
                            </div>
                            <div>
                                <div className="text-zinc-500">Vencimento</div>
                                <div className="font-medium text-zinc-300">{fmtData(factura.data_vencimento)}</div>
                            </div>
                            <div>
                                <div className="text-zinc-500">Período cobrado</div>
                                <div className="font-medium text-zinc-300">
                                    {fmtData(factura.periodo_inicio)} – {fmtData(factura.periodo_fim)}
                                </div>
                            </div>
                            <div>
                                <div className="text-zinc-500">Imóveis facturados</div>
                                <div className="font-medium text-zinc-300">{factura.num_imoveis}</div>
                            </div>
                        </div>
                    </div>

                    {/* Cliente */}
                    {empresa && (
                        <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                            <h3 className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                                <Building2 className="h-3.5 w-3.5" />
                                Cliente
                            </h3>
                            <div className="text-sm">
                                <div className="font-medium text-white">{empresa.nome}</div>
                                {empresa.nif && <div className="text-zinc-400">NIF: {empresa.nif}</div>}
                            </div>
                        </div>
                    )}

                    {/* Detalhe do cálculo */}
                    <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <h3 className="mb-4 text-xs uppercase tracking-wider text-zinc-500">Detalhe</h3>

                        <div className="space-y-2 text-sm">
                            <Linha
                                label={`${factura.num_imoveis} imóveis × ${fmt(factura.preco_base_kz)} Kz`}
                                valor={fmt(factura.num_imoveis * factura.preco_base_kz)}
                            />
                            {factura.desconto_qtd_pct > 0 && (
                                <Linha
                                    label={`Desconto qtd (${factura.desconto_qtd_pct}%)`}
                                    valor={`-${fmt(factura.num_imoveis * factura.preco_base_kz * (factura.desconto_qtd_pct / 100))}`}
                                    tipo="desconto"
                                />
                            )}
                            {factura.desconto_periodo_pct > 0 && (
                                <Linha
                                    label={`Desconto período (${factura.desconto_periodo_pct}%)`}
                                    valor={`-—`}
                                    tipo="desconto"
                                />
                            )}
                            <div className="my-3 border-t border-zinc-800" />
                            <Linha label="Subtotal" valor={fmt(factura.subtotal_kz)} forte />
                            {factura.imposto_taxa_pct > 0 && (
                                <Linha
                                    label={`${factura.imposto_tipo} ${factura.imposto_taxa_pct}%`}
                                    valor={`+${fmt(factura.imposto_valor_kz)}`}
                                />
                            )}
                            <div className="my-3 border-t-2 border-cyan-500/30" />
                            <div className="flex items-center justify-between">
                                <span className="text-base font-semibold text-white">TOTAL</span>
                                <span className="text-2xl font-bold text-cyan-400">{fmt(factura.valor_total_kz)} Kz</span>
                            </div>
                        </div>
                    </div>

                    {/* Pagar por transferência bancária (KayanTec) */}
                    {factura.estado === 'pendente' && (
                        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-6">
                            <h3 className="mb-3 flex items-center gap-2 text-base font-medium text-cyan-300">
                                <CreditCard className="h-5 w-5" />
                                Pagar por transferência bancária
                            </h3>

                            <p className="mb-4 text-sm text-zinc-300">
                                Faça uma transferência no valor de{' '}
                                <span className="font-semibold text-white">{fmt(factura.valor_total_kz)} Kz</span>{' '}
                                para a conta abaixo e envie o comprovativo, indicando o número da factura{' '}
                                <span className="font-mono text-white">{factura.numero}</span>.
                            </p>

                            <div className="rounded-lg border border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-5">
                                <DadoBanco label="Beneficiário" valor={banco.beneficiario} />
                                <DadoBanco label="NIF" valor={banco.nif} onCopiar={() => copiar(banco.nif)} />
                                <DadoBanco label="Banco" valor={banco.banco} />
                                <DadoBanco label="IBAN" valor={banco.iban} mono onCopiar={() => copiar(banco.iban.replace(/\s/g, ''))} />
                                <DadoBanco label="Moeda" valor={banco.moeda} />
                            </div>

                            <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 text-sm">
                                <p className="font-medium text-zinc-200">Depois de transferir:</p>
                                <ul className="mt-2 space-y-1.5 text-zinc-400">
                                    <li>• Envie o comprovativo para <span className="text-cyan-300">{banco.email_comprovativo}</span></li>
                                    <li>• Indique o número da factura: <span className="font-mono text-zinc-200">{factura.numero}</span></li>
                                </ul>
                                <p className="mt-3 text-xs text-zinc-500">
                                    Após confirmarmos a transferência, a factura é marcada como paga.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function DadoBanco({ label, valor, mono, onCopiar }: { label: string; valor: string; mono?: boolean; onCopiar?: () => void }) {
    return (
        <div className="flex items-center justify-between border-b border-cyan-500/10 py-2 last:border-0">
            <span className="text-xs uppercase tracking-wider text-cyan-400/70">{label}</span>
            <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold text-white ${mono ? 'font-mono' : ''}`}>{valor}</span>
                {onCopiar && (
                    <button
                        onClick={onCopiar}
                        className="rounded border border-cyan-500/30 px-2 py-0.5 text-[11px] text-cyan-300 hover:bg-cyan-500/10"
                        title="Copiar"
                    >
                        Copiar
                    </button>
                )}
            </div>
        </div>
    );
}

function Linha({ label, valor, tipo, forte }: { label: string; valor: string; tipo?: string; forte?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className={`${forte ? 'text-zinc-200' : 'text-zinc-400'}`}>{label}</span>
            <span className={`${forte ? 'font-semibold text-white' : tipo === 'desconto' ? 'text-cyan-400' : 'text-zinc-300'}`}>
                {valor} Kz
            </span>
        </div>
    );
}
