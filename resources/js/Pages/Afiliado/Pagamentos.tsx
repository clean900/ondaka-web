import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Wallet, Landmark, CheckCircle2, FileText, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { fmtKz, fmtNum, fmtPct, fmtData, StatCard, PageHeader, Seccao, Vazio, Th, Td, PortalNav } from '@/Components/Afiliados/ui';
import type { Afiliado, ResumoAfiliado, ConfigAfiliados, Pagamento } from '@/types/afiliados';

interface Props {
    afiliado: Afiliado;
    resumo: ResumoAfiliado;
    pagamentos: Pagamento[];
    config: ConfigAfiliados;
}

export default function Pagamentos({ afiliado, resumo, pagamentos }: Props) {
    const [aberto, setAberto] = useState<number | null>(null);

    return (
        <AuthenticatedLayout>
            <Head title="Pagamentos" />
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader icon={Wallet} titulo="Pagamentos recebidos" subtitulo="Cada pagamento agrupa comissões aprovadas. O comprovativo fica disponível aqui." />
                <PortalNav activo="/afiliado/pagamentos" />

                {!afiliado.dados_pagamento_completos && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div><strong>Sem IBAN registado.</strong> A ONDAKA só consegue pagar quando os <Link href="/afiliado/dados" className="underline">dados de pagamento</Link> estiverem completos (IBAN, banco e titular).</div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <StatCard label="Total recebido (líquido)" valor={fmtKz(resumo.total_pago_liquido_kz, 0)} icon={Wallet} tom="verde" sub={`${pagamentos.length} pagamento(s)`} />
                    <StatCard label="Comissões pagas" valor={fmtNum(resumo.paga_n)} icon={CheckCircle2} tom="ciano" sub={fmtKz(resumo.paga_kz, 0) + ' bruto'} />
                    <StatCard label="Aprovado a aguardar" valor={fmtKz(resumo.aprovada_kz, 0)} icon={Landmark} tom={resumo.atinge_minimo ? 'verde' : 'amber'} sub={resumo.atinge_minimo ? 'Atinge o mínimo — entra no próximo lote' : `Mínimo ${fmtKz(resumo.pagamento_minimo_kz, 0)}`} />
                    <StatCard label="IBAN de destino" valor={<span className="font-mono text-sm">{afiliado.iban ?? '—'}</span>} icon={Landmark} tom="neutro" sub={afiliado.banco ?? (afiliado.iban ? '' : 'por preencher')} />
                </div>

                <Seccao titulo={`${pagamentos.length} pagamento(s)`}>
                    {pagamentos.length === 0 ? <Vazio titulo="Ainda sem pagamentos" texto={`Quando as suas comissões aprovadas atingirem ${fmtKz(resumo.pagamento_minimo_kz, 0)}, a ONDAKA paga por transferência e o registo aparece aqui com o comprovativo.`} /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10">
                                    <tr><Th>Nº</Th><Th>Data</Th><Th right>Comissões</Th><Th right>Bruto</Th><Th right>Retenção</Th><Th right>Líquido</Th><Th>Método</Th><Th>Referência</Th><Th>IBAN</Th><Th>Comprovativo</Th><Th></Th></tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pagamentos.map((p) => (
                                        <>
                                            <tr key={p.id} className="hover:bg-white/[0.02]">
                                                <Td><span className="font-mono text-white">{p.numero}</span></Td>
                                                <Td>{fmtData(p.pago_em)}</Td>
                                                <Td right mono>{p.num_comissoes}</Td>
                                                <Td right mono>{fmtKz(p.valor_bruto_kz)}</Td>
                                                <Td right mono><span className="text-white/50">{Number(p.retencao_valor_kz) > 0 ? `- ${fmtKz(p.retencao_valor_kz)} (${fmtPct(p.retencao_pct)})` : '—'}</span></Td>
                                                <Td right mono><span className="font-semibold text-emerald-300">{fmtKz(p.valor_liquido_kz)}</span></Td>
                                                <Td>{p.metodo_label}</Td>
                                                <Td><span className="font-mono text-xs">{p.referencia_bancaria ?? '—'}</span></Td>
                                                <Td><span className="font-mono text-xs">{p.iban_destino ?? '—'}</span></Td>
                                                <Td>{p.tem_comprovativo ? <a href={`/afiliado/pagamentos/${p.id}/comprovativo`} target="_blank" rel="noopener noreferrer" className="btn-ghost px-2 py-1 text-xs"><FileText className="h-3.5 w-3.5" /> Ver</a> : <span className="text-xs text-white/30">—</span>}</Td>
                                                <Td><button type="button" onClick={() => setAberto(aberto === p.id ? null : p.id)} className="btn-ghost px-2 py-1 text-xs">{aberto === p.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button></Td>
                                            </tr>
                                            {aberto === p.id && (
                                                <tr key={`${p.id}-d`} className="bg-white/[0.02]">
                                                    <td colSpan={11} className="px-4 py-3">
                                                        <div className="mb-2 text-xs uppercase tracking-wider text-white/40">Comissões incluídas</div>
                                                        <div className="grid gap-1 md:grid-cols-2 xl:grid-cols-3">
                                                            {(p.comissoes ?? []).map((c) => (
                                                                <div key={c.id} className="flex items-center justify-between gap-3 rounded-md bg-black/20 px-3 py-2 text-xs">
                                                                    <span className="truncate text-white/70">{c.origem_numero ? <span className="font-mono text-white">{c.origem_numero}</span> : null} {c.descricao}</span>
                                                                    <span className="shrink-0 font-mono text-emerald-300">{fmtKz(c.valor_comissao_kz)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {p.notas && <div className="mt-2 text-xs text-white/50">Notas: {p.notas}</div>}
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Seccao>
            </div>
        </AuthenticatedLayout>
    );
}
