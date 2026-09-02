import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Wallet, FileText, Receipt, Percent, Landmark } from 'lucide-react';
import { fmtKz, fmtNum, fmtPct, fmtData, StatCard, PageHeader, Seccao, Vazio, Th, Td, AdminNav, Paginacao } from '@/Components/Afiliados/ui';
import type { Pagamento, Paginado } from '@/types/afiliados';

interface Filtros { afiliado_id?: string; de?: string; ate?: string }
interface Props {
    pagamentos: Paginado<Pagamento>;
    totais: { n: number; comissoes: number; bruto_kz: string; retencao_kz: string; liquido_kz: string };
    filtros: Filtros;
    afiliados: { id: number; nome: string; codigo: string }[];
}

export default function Pagamentos({ pagamentos, totais, filtros, afiliados }: Props) {
    const [f, setF] = useState<Filtros>({ afiliado_id: filtros.afiliado_id ?? '', de: filtros.de ?? '', ate: filtros.ate ?? '' });
    const aplicar = (over: Partial<Filtros> = {}) => {
        const p: Record<string, string> = { ...f, ...over } as Record<string, string>;
        Object.keys(p).forEach((k) => { if (!p[k]) delete p[k]; });
        router.get('/super-admin/afiliados/pagamentos', p, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pagamentos a afiliados" />
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader icon={Wallet} titulo="Pagamentos a afiliados" subtitulo="Cada pagamento liquida um lote de comissões aprovadas. Registam-se na ficha do afiliado." />
                <AdminNav activo="/super-admin/afiliados/pagamentos" />

                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <StatCard label="Pagamentos" valor={fmtNum(totais.n)} icon={Receipt} tom="neutro" sub={`${totais.comissoes} comissão(ões) liquidadas`} />
                    <StatCard label="Bruto" valor={fmtKz(totais.bruto_kz, 0)} icon={Wallet} tom="ciano" />
                    <StatCard label="Retenção na fonte" valor={fmtKz(totais.retencao_kz, 0)} icon={Percent} tom="amber" />
                    <StatCard label="Líquido pago" valor={fmtKz(totais.liquido_kz, 0)} icon={Landmark} tom="verde" />
                    <StatCard label="Filtro" valor={<span className="text-base">{f.afiliado_id ? afiliados.find((a) => String(a.id) === String(f.afiliado_id))?.nome ?? '—' : 'Todos os afiliados'}</span>} tom="roxo" sub={f.de || f.ate ? `${f.de || '…'} → ${f.ate || '…'}` : 'todo o período'} />
                </div>

                <Seccao>
                    <form onSubmit={(e) => { e.preventDefault(); aplicar(); }} className="grid gap-3 p-4 md:grid-cols-4">
                        <select className="input md:col-span-2" value={f.afiliado_id} onChange={(e) => { setF({ ...f, afiliado_id: e.target.value }); aplicar({ afiliado_id: e.target.value }); }}>
                            <option value="">Todos os afiliados</option>
                            {afiliados.map((a) => <option key={a.id} value={a.id}>{a.nome} ({a.codigo})</option>)}
                        </select>
                        <input type="date" className="input" value={f.de} onChange={(e) => setF({ ...f, de: e.target.value })} />
                        <div className="flex gap-2"><input type="date" className="input" value={f.ate} onChange={(e) => setF({ ...f, ate: e.target.value })} /><button type="submit" className="btn-secondary shrink-0">Filtrar</button></div>
                    </form>
                </Seccao>

                <Seccao titulo={`${pagamentos.total} pagamento(s)`}>
                    {pagamentos.data.length === 0 ? <Vazio titulo="Ainda não há pagamentos registados" texto="Registe pagamentos na ficha de cada afiliado (botão «Registar pagamento») seleccionando as comissões aprovadas." /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10"><tr><Th>Nº</Th><Th>Data</Th><Th>Afiliado</Th><Th right>Comissões</Th><Th right>Bruto</Th><Th right>Retenção</Th><Th right>Líquido</Th><Th>Método</Th><Th>Referência</Th><Th>IBAN</Th><Th>Comprovativo</Th><Th>Registado por</Th></tr></thead>
                                <tbody className="divide-y divide-white/5">
                                    {pagamentos.data.map((p) => (
                                        <tr key={p.id} className="hover:bg-white/[0.02]">
                                            <Td><span className="font-mono text-white">{p.numero}</span></Td>
                                            <Td>{fmtData(p.pago_em)}</Td>
                                            <Td>{p.afiliado ? <Link href={`/super-admin/afiliados/${p.afiliado.id}`} className="text-white hover:text-cyan-300">{p.afiliado.nome}</Link> : '—'}<div className="font-mono text-xs text-white/40">{p.afiliado?.codigo}</div></Td>
                                            <Td right mono>{p.num_comissoes}</Td>
                                            <Td right mono>{fmtKz(p.valor_bruto_kz)}</Td>
                                            <Td right mono><span className="text-white/50">{Number(p.retencao_valor_kz) > 0 ? `${fmtKz(p.retencao_valor_kz)} (${fmtPct(p.retencao_pct)})` : '—'}</span></Td>
                                            <Td right mono><span className="font-semibold text-emerald-300">{fmtKz(p.valor_liquido_kz)}</span></Td>
                                            <Td>{p.metodo_label}</Td>
                                            <Td><span className="font-mono text-xs">{p.referencia_bancaria ?? '—'}</span></Td>
                                            <Td><span className="font-mono text-xs">{p.iban_destino ?? '—'}</span></Td>
                                            <Td>{p.tem_comprovativo ? <a href={`/super-admin/afiliados/pagamentos/${p.id}/comprovativo`} target="_blank" rel="noopener noreferrer" className="btn-ghost px-2 py-1 text-xs"><FileText className="h-3.5 w-3.5" /> Ver</a> : <span className="text-xs text-white/30">—</span>}</Td>
                                            <Td>{p.registado_por ?? '—'}{p.notas && <div className="text-xs text-white/40">{p.notas}</div>}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Paginacao links={pagamentos.links} from={pagamentos.from} to={pagamentos.to} total={pagamentos.total} />
                </Seccao>
            </div>
        </AuthenticatedLayout>
    );
}
