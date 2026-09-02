import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Handshake, Users, Building2, Clock, CheckCircle2, Wallet, TrendingUp, Search, ArrowRight, AlertCircle } from 'lucide-react';
import { fmtKz, fmtNum, fmtPct, fmtData, StatCard, PageHeader, Seccao, Vazio, Th, Td, AdminNav, Paginacao, EstadoAfiliadoBadge, NivelBadge, BarrasMensais } from '@/Components/Afiliados/ui';
import type { AfiliadoLista, ResumoGlobal, Paginado, ConfigAfiliados } from '@/types/afiliados';

interface Props {
    afiliados: Paginado<AfiliadoLista>;
    resumo: ResumoGlobal;
    filtros: { busca?: string; estado?: string };
    config: ConfigAfiliados;
}

export default function Index({ afiliados, resumo, filtros }: Props) {
    const [busca, setBusca] = useState(filtros.busca ?? '');
    const [estado, setEstado] = useState(filtros.estado ?? 'todos');
    const [primeiro, setPrimeiro] = useState(true);

    useEffect(() => {
        if (primeiro) { setPrimeiro(false); return; }
        const t = setTimeout(() => {
            const params: Record<string, string> = {};
            if (busca) params.busca = busca;
            if (estado && estado !== 'todos') params.estado = estado;
            router.get('/super-admin/afiliados', params, { preserveState: true, preserveScroll: true, replace: true });
        }, 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busca, estado]);

    return (
        <AuthenticatedLayout>
            <Head title="Afiliados" />
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader icon={Handshake} titulo="Programa de Afiliados" subtitulo="Afiliados, clientes indicados e comissões da ONDAKA" accoes={<Link href="/afiliados" className="btn-secondary" target="_blank">Ver página pública</Link>} />
                <AdminNav activo="/super-admin/afiliados" />

                {resumo.afiliados_pendentes > 0 && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                        <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /> <strong>{resumo.afiliados_pendentes}</strong> candidatura(s) à espera de aprovação.</div>
                        <button type="button" onClick={() => setEstado('pendente')} className="btn-secondary text-xs">Ver pendentes</button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
                    <StatCard label="Afiliados activos" valor={fmtNum(resumo.afiliados_activos)} icon={Handshake} tom="roxo" sub={`${resumo.afiliados_pendentes} pendentes · ${resumo.afiliados_suspensos} suspensos`} />
                    <StatCard label="Clientes indicados" valor={fmtNum(resumo.clientes_indicados)} icon={Building2} tom="ciano" sub={`${resumo.mes_registos} este mês`} />
                    <StatCard label="Clientes pagantes" valor={fmtNum(resumo.clientes_pagantes)} icon={Users} tom="ciano" />
                    <StatCard label="Receita base gerada" valor={fmtKz(resumo.base_gerada_kz, 0)} icon={TrendingUp} tom="neutro" sub="sem imposto, via afiliados" />
                    <StatCard label="Em carência" valor={fmtKz(resumo.pendente_kz, 0)} icon={Clock} tom="amber" sub={`${resumo.pendente_n} comissão(ões)`} />
                    <StatCard label="Aprovado a pagar" valor={fmtKz(resumo.aprovada_kz, 0)} icon={CheckCircle2} tom="verde" sub={`${resumo.afiliados_a_pagar} afiliado(s) ≥ mínimo (${fmtKz(resumo.afiliados_a_pagar_kz, 0)})`} />
                    <StatCard label="Pago" valor={fmtKz(resumo.paga_kz, 0)} icon={Wallet} tom="verde" sub={`${resumo.paga_n} comissão(ões)`} />
                    <StatCard label="Comissões este mês" valor={fmtKz(resumo.mes_comissoes_kz, 0)} icon={TrendingUp} tom="roxo" sub={`${resumo.anulada_n} anulada(s) no total`} />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Seccao className="lg:col-span-2" titulo="Comissões geradas · últimos 12 meses (todos os afiliados)">
                        <div className="p-5">{Number(resumo.base_gerada_kz) > 0 ? <BarrasMensais serie={resumo.serie_12m} altura={160} /> : <Vazio titulo="Ainda sem comissões" texto="Aparecem quando um cliente indicado paga uma factura de subscrição ou uma ordem da loja." />}</div>
                    </Seccao>
                    <Seccao titulo="Top 5 afiliados (comissão gerada)">
                        {resumo.top.length === 0 ? <Vazio titulo="Sem dados" /> : (
                            <div className="divide-y divide-white/5">
                                {resumo.top.map((t, i) => (
                                    <Link key={t.id} href={`/super-admin/afiliados/${t.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03]">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-white/60">{i + 1}</span>
                                        <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-white">{t.nome}</div><div className="text-xs text-white/40">{t.codigo} · {t.clientes} cliente(s)</div></div>
                                        <NivelBadge nivel={t.nivel} />
                                        <span className="font-mono text-sm text-emerald-300">{fmtKz(t.total_kz, 0)}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Seccao>
                </div>

                <Seccao>
                    <div className="grid gap-3 p-4 md:grid-cols-4">
                        <div className="relative md:col-span-3">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                            <input className="input pl-9" placeholder="Nome, email, código ou telefone…" value={busca} onChange={(e) => setBusca(e.target.value)} />
                        </div>
                        <select className="input" value={estado} onChange={(e) => setEstado(e.target.value)}>
                            <option value="todos">Todos os estados</option>
                            <option value="pendente">Pendentes</option>
                            <option value="activo">Activos</option>
                            <option value="suspenso">Suspensos</option>
                            <option value="recusado">Recusados</option>
                        </select>
                    </div>
                </Seccao>

                <Seccao titulo={`${afiliados.total} afiliado(s)`}>
                    {afiliados.data.length === 0 ? <Vazio titulo="Nenhum afiliado encontrado" texto="As candidaturas chegam pela página pública /afiliados ou pela adesão de gestores no painel." /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10">
                                    <tr><Th>Afiliado</Th><Th>Tipo</Th><Th>Estado</Th><Th>Nível · taxa</Th><Th right>Clientes</Th><Th right>Cliques</Th><Th right>Em carência</Th><Th right>A pagar</Th><Th right>Pago</Th><Th>Registado</Th><Th></Th></tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {afiliados.data.map((a) => (
                                        <tr key={a.id} className="hover:bg-white/[0.02]">
                                            <Td><Link href={`/super-admin/afiliados/${a.id}`} className="font-medium text-white hover:text-cyan-300">{a.nome}</Link><div className="text-xs text-white/40">{a.email} · <span className="font-mono">{a.codigo}</span>{a.telefone ? ` · ${a.telefone}` : ''}</div></Td>
                                            <Td>{a.tipo === 'empresa' ? 'Empresa' : 'Particular'}</Td>
                                            <Td><EstadoAfiliadoBadge estado={a.estado} /></Td>
                                            <Td><NivelBadge nivel={a.nivel} taxa={a.taxa_pct} />{a.taxa_manual && <span className="ml-1 text-[10px] text-purple-300">manual</span>}</Td>
                                            <Td right mono>{a.clientes_count}</Td>
                                            <Td right mono>{a.cliques}</Td>
                                            <Td right mono><span className="text-amber-300">{fmtKz(a.pendente_kz)}</span></Td>
                                            <Td right mono><span className={Number(a.aprovada_kz) >= Number(resumo.pagamento_minimo_kz) && Number(a.aprovada_kz) > 0 ? 'font-semibold text-emerald-300' : 'text-cyan-200'}>{fmtKz(a.aprovada_kz)}</span></Td>
                                            <Td right mono>{fmtKz(a.paga_kz)}</Td>
                                            <Td>{fmtData(a.created_at)}</Td>
                                            <Td>
                                                <div className="flex justify-end gap-1">
                                                    {a.estado === 'pendente' && <button type="button" onClick={() => { if (confirm(`Aprovar ${a.nome}?`)) router.post(`/super-admin/afiliados/${a.id}/aprovar`, {}, { preserveScroll: true }); }} className="btn-primary px-3 py-1.5 text-xs">Aprovar</button>}
                                                    <Link href={`/super-admin/afiliados/${a.id}`} className="btn-ghost px-2 py-1.5 text-xs">Ver <ArrowRight className="h-3.5 w-3.5" /></Link>
                                                </div>
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Paginacao links={afiliados.links} from={afiliados.from} to={afiliados.to} total={afiliados.total} />
                </Seccao>
            </div>
        </AuthenticatedLayout>
    );
}
