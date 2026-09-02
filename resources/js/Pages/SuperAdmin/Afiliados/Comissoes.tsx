import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { DollarSign, Search, Clock, CheckCircle2, Wallet, XCircle, Download } from 'lucide-react';
import { fmtKz, fmtPct, fmtData, StatCard, PageHeader, Seccao, Vazio, Th, Td, AdminNav, Paginacao, EstadoComissaoBadge, Modal } from '@/Components/Afiliados/ui';
import type { Comissao, Paginado, TotaisComissoes, ConfigAfiliados } from '@/types/afiliados';

interface Filtros { afiliado_id?: string; empresa_id?: string; estado?: string; origem?: string; de?: string; ate?: string; busca?: string }
interface Props {
    comissoes: Paginado<Comissao>;
    totais: TotaisComissoes;
    filtros: Filtros;
    afiliados: { id: number; nome: string; codigo: string }[];
    config: ConfigAfiliados;
}

export default function Comissoes({ comissoes, totais, filtros, afiliados, config }: Props) {
    const [f, setF] = useState<Filtros>({ afiliado_id: filtros.afiliado_id ?? '', estado: filtros.estado ?? 'todos', origem: filtros.origem ?? 'todas', de: filtros.de ?? '', ate: filtros.ate ?? '', busca: filtros.busca ?? '', empresa_id: filtros.empresa_id ?? '' });
    const [anular, setAnular] = useState<Comissao | null>(null);
    const formAnular = useForm({ motivo: '' });

    const params = (over: Partial<Filtros> = {}) => {
        const p: Record<string, string> = { ...f, ...over } as Record<string, string>;
        Object.keys(p).forEach((k) => { if (!p[k] || p[k] === 'todos' || p[k] === 'todas') delete p[k]; });
        return p;
    };
    const aplicar = (over: Partial<Filtros> = {}) => router.get('/super-admin/afiliados/comissoes', params(over), { preserveState: true, replace: true });
    const urlExportar = '/super-admin/afiliados/comissoes/exportar?' + new URLSearchParams(params()).toString();

    return (
        <AuthenticatedLayout>
            <Head title="Comissões de afiliados" />
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader icon={DollarSign} titulo="Comissões de afiliados" subtitulo={`Livro-razão: uma linha por pagamento de cliente indicado · base sem imposto · carência ${config.carencia_dias} dias`} accoes={<a href={urlExportar} className="btn-secondary"><Download className="h-4 w-4" /> Exportar CSV</a>} />
                <AdminNav activo="/super-admin/afiliados/comissoes" />

                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <StatCard label="Em carência" valor={fmtKz(totais.pendente.total_kz, 0)} icon={Clock} tom="amber" sub={`${totais.pendente.n} · base ${fmtKz(totais.pendente.base_kz, 0)}`} />
                    <StatCard label="Aprovadas (a pagar)" valor={fmtKz(totais.aprovada.total_kz, 0)} icon={CheckCircle2} tom="ciano" sub={`${totais.aprovada.n} · base ${fmtKz(totais.aprovada.base_kz, 0)}`} />
                    <StatCard label="Pagas" valor={fmtKz(totais.paga.total_kz, 0)} icon={Wallet} tom="verde" sub={`${totais.paga.n} · base ${fmtKz(totais.paga.base_kz, 0)}`} />
                    <StatCard label="Anuladas" valor={fmtKz(totais.anulada.total_kz, 0)} icon={XCircle} tom="vermelho" sub={`${totais.anulada.n}`} />
                    <StatCard label="Total não anulado" valor={fmtKz(totais.total_nao_anulada_kz, 0)} icon={DollarSign} tom="roxo" sub="para os filtros actuais" />
                </div>

                <Seccao>
                    <form onSubmit={(e) => { e.preventDefault(); aplicar(); }} className="grid gap-3 p-4 md:grid-cols-7">
                        <div className="relative md:col-span-2">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                            <input className="input pl-9" placeholder="Cliente, afiliado, documento…" value={f.busca} onChange={(e) => setF({ ...f, busca: e.target.value })} />
                        </div>
                        <select className="input" value={f.afiliado_id} onChange={(e) => { setF({ ...f, afiliado_id: e.target.value }); aplicar({ afiliado_id: e.target.value }); }}>
                            <option value="">Todos os afiliados</option>
                            {afiliados.map((a) => <option key={a.id} value={a.id}>{a.nome} ({a.codigo})</option>)}
                        </select>
                        <select className="input" value={f.estado} onChange={(e) => { setF({ ...f, estado: e.target.value }); aplicar({ estado: e.target.value }); }}>
                            <option value="todos">Todos os estados</option><option value="pendente">Em carência</option><option value="aprovada">Aprovadas</option><option value="paga">Pagas</option><option value="anulada">Anuladas</option>
                        </select>
                        <select className="input" value={f.origem} onChange={(e) => { setF({ ...f, origem: e.target.value }); aplicar({ origem: e.target.value }); }}>
                            <option value="todas">Todas as origens</option><option value="plataforma_factura">Subscrição</option><option value="ordem_compra">Loja / add-ons / SMS</option>
                        </select>
                        <input type="date" className="input" value={f.de} onChange={(e) => setF({ ...f, de: e.target.value })} />
                        <div className="flex gap-2"><input type="date" className="input" value={f.ate} onChange={(e) => setF({ ...f, ate: e.target.value })} /><button type="submit" className="btn-secondary shrink-0">Filtrar</button></div>
                    </form>
                </Seccao>

                <Seccao titulo={`${comissoes.total} comissão(ões)`}>
                    {comissoes.data.length === 0 ? <Vazio titulo="Sem comissões para estes filtros" /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10">
                                    <tr><Th>Data</Th><Th>Afiliado</Th><Th>Cliente</Th><Th>Documento</Th><Th>Origem</Th><Th right>Pago c/ imp.</Th><Th right>Imposto</Th><Th right>Base</Th><Th right>Taxa</Th><Th right>Comissão</Th><Th>Estado</Th><Th>Detalhe</Th><Th></Th></tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {comissoes.data.map((c) => (
                                        <tr key={c.id} className="hover:bg-white/[0.02]">
                                            <Td>{fmtData(c.pago_pelo_cliente_em ?? c.created_at)}</Td>
                                            <Td>{c.afiliado ? <Link href={`/super-admin/afiliados/${c.afiliado.id}`} className="font-medium text-white hover:text-cyan-300">{c.afiliado.nome}</Link> : '—'}<div className="font-mono text-xs text-white/40">{c.afiliado?.codigo}</div></Td>
                                            <Td>{c.empresa ? <Link href={`/super-admin/clientes/${c.empresa.id}`} className="text-white hover:text-cyan-300">{c.empresa.nome}</Link> : '—'}</Td>
                                            <Td><div className="font-mono text-xs text-white">{c.origem_numero ?? '—'}</div><div className="line-clamp-2 max-w-[260px] text-xs text-white/50">{c.descricao}</div></Td>
                                            <Td>{c.origem_label}</Td>
                                            <Td right mono>{fmtKz(c.valor_pago_total_kz)}</Td>
                                            <Td right mono><span className="text-white/50">{fmtKz(c.valor_imposto_kz)}</span></Td>
                                            <Td right mono>{fmtKz(c.valor_base_kz)}</Td>
                                            <Td right mono>{fmtPct(c.taxa_pct)}</Td>
                                            <Td right mono><span className="font-semibold text-emerald-300">{fmtKz(c.valor_comissao_kz)}</span></Td>
                                            <Td><EstadoComissaoBadge estado={c.estado} /></Td>
                                            <Td><div className="text-xs text-white/50">
                                                {c.estado === 'pendente' && <>Aprova a {fmtData(c.disponivel_em)}</>}
                                                {c.estado === 'aprovada' && <>Aprovada {fmtData(c.aprovada_em)}</>}
                                                {c.estado === 'paga' && <>{c.pagamento?.numero} · {fmtData(c.paga_em)}</>}
                                                {c.estado === 'anulada' && <>{c.motivo_anulacao} · {fmtData(c.anulada_em)}</>}
                                            </div></Td>
                                            <Td><div className="flex justify-end gap-1">
                                                {c.estado === 'pendente' && <button type="button" onClick={() => { if (confirm('Aprovar esta comissão antes do fim da carência?')) router.post(`/super-admin/afiliados/comissoes/${c.id}/aprovar`, {}, { preserveScroll: true }); }} className="btn-ghost px-2 py-1 text-xs">Aprovar</button>}
                                                {(c.estado === 'pendente' || c.estado === 'aprovada') && <button type="button" onClick={() => { setAnular(c); formAnular.reset(); }} className="btn-ghost px-2 py-1 text-xs text-red-300">Anular</button>}
                                            </div></Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Paginacao links={comissoes.links} from={comissoes.from} to={comissoes.to} total={comissoes.total} />
                </Seccao>
            </div>

            <Modal aberto={!!anular} onClose={() => setAnular(null)} titulo="Anular comissão">
                {anular && (
                    <form onSubmit={(e) => { e.preventDefault(); formAnular.post(`/super-admin/afiliados/comissoes/${anular.id}/anular`, { preserveScroll: true, onSuccess: () => setAnular(null) }); }} className="space-y-3">
                        <div className="rounded-lg bg-white/[0.03] p-3 text-sm"><div className="text-white">{anular.descricao}</div><div className="text-xs text-white/50">{anular.afiliado?.nome} · {fmtKz(anular.valor_comissao_kz)}</div></div>
                        <div><label className="mb-1 block text-xs text-white/60">Motivo (visível ao afiliado)</label><input className="input" value={formAnular.data.motivo} onChange={(e) => formAnular.setData('motivo', e.target.value)} placeholder="Ex.: pagamento estornado pelo banco" required minLength={3} />{formAnular.errors.motivo && <div className="mt-1 text-xs text-red-400">{formAnular.errors.motivo}</div>}</div>
                        <div className="flex justify-end gap-2"><button type="button" onClick={() => setAnular(null)} className="btn-ghost">Cancelar</button><button type="submit" disabled={formAnular.processing} className="btn-danger">Anular comissão</button></div>
                    </form>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
