import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { DollarSign, Search, Clock, CheckCircle2, Wallet, XCircle } from 'lucide-react';
import { fmtKz, fmtPct, fmtData, StatCard, PageHeader, Seccao, Vazio, Th, Td, PortalNav, Paginacao, EstadoComissaoBadge } from '@/Components/Afiliados/ui';
import type { Afiliado, ConfigAfiliados, Comissao, Paginado, TotaisComissoes } from '@/types/afiliados';

interface Filtros { estado?: string; origem?: string; de?: string; ate?: string; busca?: string }
interface Props {
    afiliado: Afiliado;
    comissoes: Paginado<Comissao>;
    totais: TotaisComissoes;
    filtros: Filtros;
    config: ConfigAfiliados;
}

export default function Comissoes({ comissoes, totais, filtros, config }: Props) {
    const [f, setF] = useState<Filtros>({ estado: filtros.estado ?? 'todos', origem: filtros.origem ?? 'todas', de: filtros.de ?? '', ate: filtros.ate ?? '', busca: filtros.busca ?? '' });

    const aplicar = (over: Partial<Filtros> = {}) => {
        const params: Record<string, string> = { ...f, ...over } as Record<string, string>;
        Object.keys(params).forEach((k) => { if (!params[k] || params[k] === 'todos' || params[k] === 'todas') delete params[k]; });
        router.get('/afiliado/comissoes', params, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Comissões" />
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader icon={DollarSign} titulo="Comissões" subtitulo={`Uma linha por pagamento do cliente · calculadas sobre o valor sem imposto · carência de ${config.carencia_dias} dias`} />
                <PortalNav activo="/afiliado/comissoes" />

                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <StatCard label="Em carência" valor={fmtKz(totais.pendente.total_kz, 0)} icon={Clock} tom="amber" sub={`${totais.pendente.n} comissão(ões)`} />
                    <StatCard label="Aprovadas (a pagar)" valor={fmtKz(totais.aprovada.total_kz, 0)} icon={CheckCircle2} tom="ciano" sub={`${totais.aprovada.n} comissão(ões)`} />
                    <StatCard label="Pagas" valor={fmtKz(totais.paga.total_kz, 0)} icon={Wallet} tom="verde" sub={`${totais.paga.n} comissão(ões)`} />
                    <StatCard label="Anuladas" valor={fmtKz(totais.anulada.total_kz, 0)} icon={XCircle} tom="vermelho" sub={`${totais.anulada.n} comissão(ões)`} />
                    <StatCard label="Total (não anuladas)" valor={fmtKz(totais.total_nao_anulada_kz, 0)} icon={DollarSign} tom="roxo" sub={`base: ${fmtKz(Number(totais.pendente.base_kz) + Number(totais.aprovada.base_kz) + Number(totais.paga.base_kz), 0)}`} />
                </div>

                <Seccao>
                    <form onSubmit={(e) => { e.preventDefault(); aplicar(); }} className="grid gap-3 p-4 md:grid-cols-6">
                        <div className="relative md:col-span-2">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                            <input className="input pl-9" placeholder="Cliente, documento, descrição…" value={f.busca} onChange={(e) => setF({ ...f, busca: e.target.value })} />
                        </div>
                        <select className="input" value={f.estado} onChange={(e) => { setF({ ...f, estado: e.target.value }); aplicar({ estado: e.target.value }); }}>
                            <option value="todos">Todos os estados</option>
                            <option value="pendente">Em carência</option>
                            <option value="aprovada">Aprovadas</option>
                            <option value="paga">Pagas</option>
                            <option value="anulada">Anuladas</option>
                        </select>
                        <select className="input" value={f.origem} onChange={(e) => { setF({ ...f, origem: e.target.value }); aplicar({ origem: e.target.value }); }}>
                            <option value="todas">Todas as origens</option>
                            <option value="plataforma_factura">Subscrição</option>
                            <option value="ordem_compra">Loja / add-ons / SMS</option>
                        </select>
                        <input type="date" className="input" value={f.de} onChange={(e) => setF({ ...f, de: e.target.value })} title="De" />
                        <div className="flex gap-2">
                            <input type="date" className="input" value={f.ate} onChange={(e) => setF({ ...f, ate: e.target.value })} title="Até" />
                            <button type="submit" className="btn-secondary shrink-0">Filtrar</button>
                        </div>
                    </form>
                </Seccao>

                <Seccao titulo={`${comissoes.total} comissão(ões)`}>
                    {comissoes.data.length === 0 ? <Vazio titulo="Sem comissões para estes filtros" texto="As comissões são criadas automaticamente quando um cliente indicado paga uma factura de subscrição ou uma ordem da loja." /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10">
                                    <tr><Th>Data</Th><Th>Cliente</Th><Th>Documento</Th><Th>Origem</Th><Th right>Pago (c/ imp.)</Th><Th right>Imposto</Th><Th right>Base (s/ imp.)</Th><Th right>Taxa</Th><Th right>Comissão</Th><Th>Estado</Th><Th>Detalhe</Th></tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {comissoes.data.map((c) => (
                                        <tr key={c.id} className="hover:bg-white/[0.02]">
                                            <Td>{fmtData(c.pago_pelo_cliente_em ?? c.created_at)}</Td>
                                            <Td><span className="font-medium text-white">{c.empresa?.nome ?? '—'}</span></Td>
                                            <Td><div className="font-mono text-xs text-white">{c.origem_numero ?? '—'}</div><div className="line-clamp-2 text-xs text-white/50">{c.descricao}</div></Td>
                                            <Td>{c.origem_label}</Td>
                                            <Td right mono>{fmtKz(c.valor_pago_total_kz)}</Td>
                                            <Td right mono><span className="text-white/50">{fmtKz(c.valor_imposto_kz)}</span></Td>
                                            <Td right mono>{fmtKz(c.valor_base_kz)}</Td>
                                            <Td right mono>{fmtPct(c.taxa_pct)}</Td>
                                            <Td right mono><span className="font-semibold text-emerald-300">{fmtKz(c.valor_comissao_kz)}</span></Td>
                                            <Td><EstadoComissaoBadge estado={c.estado} /></Td>
                                            <Td>
                                                <div className="text-xs text-white/50">
                                                    {c.estado === 'pendente' && <>Aprovada a {fmtData(c.disponivel_em)}</>}
                                                    {c.estado === 'aprovada' && <>Aprovada {fmtData(c.aprovada_em)} · aguarda pagamento</>}
                                                    {c.estado === 'paga' && <>Pag. {c.pagamento?.numero ?? ''} · {fmtData(c.paga_em)}</>}
                                                    {c.estado === 'anulada' && <>{c.motivo_anulacao ?? 'Anulada'} · {fmtData(c.anulada_em)}</>}
                                                </div>
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Paginacao links={comissoes.links} from={comissoes.from} to={comissoes.to} total={comissoes.total} />
                </Seccao>
            </div>
        </AuthenticatedLayout>
    );
}
