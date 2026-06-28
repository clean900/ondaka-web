import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface Condominio { id: number; nome: string; }
interface Props { condominios: Condominio[]; }

function kz(v: number): string {
    return new Intl.NumberFormat('pt-AO', { maximumFractionDigits: 0 }).format(v) + ' Kz';
}

const ABAS = [
    { id: 'receitas', label: 'Receitas vs Despesas' },
    { id: 'cobranca', label: 'Cobrança' },
    { id: 'despesas', label: 'Despesas' },
    { id: 'saude', label: 'Saúde financeira' },
    { id: 'preditivo', label: 'Preditivo' },
    { id: 'multi', label: 'Multi-condomínio' },
    { id: 'operacional', label: 'Operacional' },
];

export default function BiDashboard({ condominios }: Props) {
    const [aba, setAba] = useState('receitas');
    const [condominioId, setCondominioId] = useState('');
    const [meses, setMeses] = useState('12');
    const [dados, setDados] = useState<Record<string, any>>({});
    const [aCarregar, setACarregar] = useState(false);

    const carregar = useCallback(async () => {
        setACarregar(true);
        const p = new URLSearchParams();
        if (condominioId) p.set('condominio_id', condominioId);
        p.set('meses', meses);
        try {
            const res = await fetch(`/bi/dados/${aba}?${p.toString()}`, { headers: { Accept: 'application/json' } });
            const json = await res.json();
            setDados((prev) => ({ ...prev, [aba + condominioId + meses]: json }));
        } catch {
            // silencioso
        }
        setACarregar(false);
    }, [aba, condominioId, meses]);

    useEffect(() => { carregar(); }, [carregar]);

    const d = dados[aba + condominioId + meses];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard BI" />
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-medium text-white">Dashboard BI</h1>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200">PREMIUM</span>
                </div>
                <p className="text-sm text-white/60 mb-5">Análises financeiras do seu condomínio.</p>

                <BannerAlertas condominioId={condominioId} />

                <div className="mb-5 flex flex-wrap items-center gap-3">
                    <select
                        value={condominioId}
                        onChange={(e) => setCondominioId(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                        <option value="">Todos os condomínios</option>
                        {condominios.map((co) => (
                            <option key={co.id} value={co.id}>{co.nome}</option>
                        ))}
                    </select>
                    <select
                        value={meses}
                        onChange={(e) => setMeses(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                        <option value="3">Últimos 3 meses</option>
                        <option value="6">Últimos 6 meses</option>
                        <option value="12">Últimos 12 meses</option>
                        <option value="24">Últimos 24 meses</option>
                    </select>
                    <div className="flex gap-2 ml-auto">
                            <a
                            href={'/bi/exportar/csv' + (condominioId ? '?condominio_id=' + condominioId : '')}
                            className="text-sm px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
                        >
                            Exportar CSV
                        </a>
                            <a
                            href={'/bi/exportar/pdf' + (condominioId ? '?condominio_id=' + condominioId : '')}
                            className="text-sm px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30"
                        >
                            Relatório PDF
                        </a>
                    </div>
                </div>

                <div className="flex gap-1 border-b border-white/10 mb-6 overflow-x-auto">
                    {ABAS.map((a) => (
                        <button
                            key={a.id}
                            onClick={() => setAba(a.id)}
                            className={`text-sm px-4 py-2 whitespace-nowrap border-b-2 transition-colors ${
                                aba === a.id
                                    ? 'border-cyan-400 text-white'
                                    : 'border-transparent text-white/50 hover:text-white/80'
                            }`}
                        >
                            {a.label}
                        </button>
                    ))}
                </div>

                {aCarregar && !d ? (
                    <div className="p-10 text-center text-white/40 text-sm">A carregar...</div>
                ) : (
                    <>
                        {aba === 'receitas' && d && <AreaReceitas d={d} />}
                        {aba === 'cobranca' && d && <AreaCobranca d={d} condominioId={condominioId} />}
                        {aba === 'despesas' && d && <AreaDespesas d={d} condominioId={condominioId} meses={meses} />}
                        {aba === 'saude' && d && <AreaSaude d={d} />}
                        {aba === 'preditivo' && d && <AreaPreditivo d={d} />}
                        {aba === 'multi' && d && <AreaMulti d={d} />}
                        {aba === 'operacional' && d && <AreaOperacional d={d} />}
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function AreaReceitas({ d }: { d: any }) {
    const t = d.totais;
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Cartao label="Receita total" valor={kz(t.receita)} cor="text-emerald-400" variacao={d.comparacao?.receita} />
                <Cartao label="Despesa total" valor={kz(t.despesa)} cor="text-red-400" variacao={d.comparacao?.despesa} />
                <Cartao label="Saldo" valor={kz(t.saldo)} cor={t.saldo >= 0 ? 'text-cyan-400' : 'text-red-400'} variacao={d.comparacao?.saldo} />
            </div>
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                <p className="text-sm text-white/70 mb-4">Evolução mensal</p>
                <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer>
                        <BarChart data={d.meses} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickFormatter={(v) => new Intl.NumberFormat('pt-AO', { notation: 'compact' }).format(v as number)} />
                            <Tooltip formatter={(v: number) => kz(v)} contentStyle={{ background: '#141428', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="receita" name="Receita" fill="#10B981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="despesa" name="Despesa" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}

function AreaCobranca({ d, condominioId }: { d: any; condominioId: string }) {
    const dsoLabel = d.dso == null ? 'n/d' : d.dso < 0 ? `${Math.abs(d.dso)}d adiantado` : `${d.dso}d`;
    const aging = [
        { faixa: 'Até 30 dias', valor: d.aging.ate_30 },
        { faixa: '31-60 dias', valor: d.aging.d31_60 },
        { faixa: '61-90 dias', valor: d.aging.d61_90 },
        { faixa: '+90 dias', valor: d.aging.mais_90 },
        { faixa: 'Sem venc.', valor: d.aging.sem_venc },
    ];
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Cartao label="Taxa de cobrança" valor={`${d.taxa_cobranca}%`} cor="text-amber-400" />
                <Cartao label="Dívida total" valor={kz(d.divida_total)} cor="text-red-400" />
                <Cartao label="DSO (prazo médio)" valor={dsoLabel} cor="text-cyan-400" />
            </div>

            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 mb-6">
                <p className="text-sm text-white/70 mb-4">Antiguidade da dívida (aging)</p>
                <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                        <BarChart data={aging} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                            <XAxis dataKey="faixa" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickFormatter={(v) => new Intl.NumberFormat('pt-AO', { notation: 'compact' }).format(v as number)} />
                            <Tooltip formatter={(v: number) => kz(v)} contentStyle={{ background: '#141428', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                            <Bar dataKey="valor" name="Dívida" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <DevedoresDetalhados condominioId={condominioId} />
        </>
    );
}

function AreaDespesas({ d, condominioId, meses }: { d: any; condominioId: string; meses: string }) {
    const CORES = ['#A855F7', '#00D4FF', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'];
    const csvHref = '/bi/exportar/despesas/csv?' + (new URLSearchParams({
        ...(condominioId ? { condominio_id: condominioId } : {}),
        meses,
    })).toString();
    return (
        <>
            <div className="flex justify-end mb-3">
                <a href={csvHref} className="text-xs px-2 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-200 hover:bg-cyan-500/25">
                    Exportar CSV
                </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Cartao label="Despesa total (pagas)" valor={kz(d.total)} cor="text-red-400" />
                <Cartao label="Categorias com despesa" valor={String(d.por_categoria.length)} cor="text-cyan-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                    <p className="text-sm text-white/70 mb-4">Por categoria</p>
                    {d.por_categoria.length === 0 ? (
                        <p className="text-sm text-white/40">Sem despesas pagas.</p>
                    ) : (
                        <div className="space-y-3">
                            {d.por_categoria.map((cat: any, i: number) => {
                                const pct = d.total > 0 ? (cat.total / d.total) * 100 : 0;
                                return (
                                    <div key={cat.categoria}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white/80">{cat.categoria}</span>
                                            <span className="text-white/60">{kz(cat.total)}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CORES[i % CORES.length] }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                    <p className="text-sm text-white/70 mb-4">Evolução mensal</p>
                    <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                            <BarChart data={d.meses} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => new Intl.NumberFormat('pt-AO', { notation: 'compact' }).format(v as number)} />
                                <Tooltip formatter={(v: number) => kz(v)} contentStyle={{ background: '#141428', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                <Bar dataKey="total" name="Despesa" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
    );
}

function AreaSaude({ d }: { d: any }) {
    const fr = d.fundo_reserva;
    const lq = d.liquidez;
    const pctBar = Math.min(100, (fr.pct / Math.max(fr.min_legal * 2, fr.pct)) * 100);
    return (
        <>
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-white/70">Fundo de reserva (DP 141/15)</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${fr.cumpre ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                        {fr.cumpre ? 'Cumpre' : 'Abaixo do mínimo'}
                    </span>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                    <span className={`text-3xl font-bold ${fr.cumpre ? 'text-emerald-400' : 'text-red-400'}`}>{fr.pct}%</span>
                    <span className="text-sm text-white/50">das contribuições (mínimo legal {fr.min_legal}%)</span>
                </div>
                <div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full ${fr.cumpre ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${pctBar}%` }} />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-white/60" style={{ left: `${Math.min(100, (fr.min_legal / Math.max(fr.min_legal * 2, fr.pct)) * 100)}%` }} title={`Mínimo legal ${fr.min_legal}%`} />
                </div>
                <p className="text-xs text-white/40 mt-2">Saldo nas contas de fundo de reserva: {kz(fr.cobrado)} · base de contribuições: {kz(fr.contribuicoes)}.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Cartao label="Saldo disponível" valor={kz(lq.saldo_disponivel)} cor="text-cyan-400" />
                <Cartao label="Dívida em aberto" valor={kz(lq.divida_aberto)} cor="text-red-400" />
                <Cartao label="Cobertura (saldo/dívida)" valor={lq.cobertura == null ? 'n/d' : lq.cobertura + 'x'} cor={lq.cobertura != null && lq.cobertura >= 1 ? 'text-emerald-400' : 'text-amber-400'} />
            </div>
        </>
    );
}

function AreaPreditivo({ d }: { d: any }) {
    const ipc = d.sugestao_ipc;
    const ano = d.anomalias;
    const bench = d.benchmarking;
    return (
        <>
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 mb-6">
                <p className="text-sm text-white/70 mb-4">Sugestão de quota (ajuste ao IPC)</p>
                {ipc.disponivel ? (
                    <>
                        <p className="text-xs text-white/50 mb-3">Com base na inflação de {ipc.ipc_pct}%, sugestão para o próximo período:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-white/5">
                                <p className="text-xs text-white/50">Quota base</p>
                                <p className="text-sm text-white/70 mt-1">{kz(ipc.base_actual)} <span className="text-white/40">→</span></p>
                                <p className="text-lg font-bold text-cyan-400">{kz(ipc.base_sugerida)}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5">
                                <p className="text-xs text-white/50">Fundo reserva</p>
                                <p className="text-sm text-white/70 mt-1">{kz(ipc.fundo_actual)} <span className="text-white/40">→</span></p>
                                <p className="text-lg font-bold text-cyan-400">{kz(ipc.fundo_sugerido)}</p>
                                {ipc.fundo_ajustado_minimo && (
                                    <p className="text-[11px] text-amber-300/80 mt-1">Ajustado ao mínimo legal ({ipc.fundo_min_legal_pct}% da base — DP 141/15)</p>
                                )}
                            </div>
                            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                <p className="text-xs text-white/50">Total</p>
                                <p className="text-sm text-white/70 mt-1">{kz(ipc.total_actual)} <span className="text-white/40">→</span></p>
                                <p className="text-lg font-bold text-cyan-300">{kz(ipc.total_sugerido)}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-white/40">{ipc.motivo}</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                    <p className="text-sm text-white/70 mb-4">Detecção de anomalias</p>
                    {ano.disponivel ? (
                        <div>
                            <p className="text-sm text-white/60">Média mensal: {kz(ano.media_mensal)}</p>
                            <p className="text-sm text-white/60">Último mês: {kz(ano.ultimo_mes)}</p>
                            <p className={`text-lg font-bold mt-2 ${ano.anomalia ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {ano.desvio_pct > 0 ? '+' : ''}{ano.desvio_pct}% {ano.anomalia ? '⚠ anomalia' : 'normal'}
                            </p>
                        </div>
                    ) : (
                        <div className="text-sm text-white/40">
                            <p>{ano.motivo}</p>
                            <p className="text-xs mt-2 text-white/30">Disponível assim que houver mais histórico.</p>
                        </div>
                    )}
                </div>

                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                    <p className="text-sm text-white/70 mb-4">Benchmarking entre condomínios</p>
                    {bench.disponivel ? (
                        <div className="space-y-2">
                            <p className="text-xs text-white/50 mb-2">Média: {kz(bench.media)}</p>
                            {bench.itens.map((it: any) => (
                                <div key={it.condominio_id} className="flex justify-between text-sm">
                                    <span className="text-white/70">Condomínio #{it.condominio_id}</span>
                                    <span className={it.vs_media_pct > 0 ? 'text-amber-300' : 'text-emerald-300'}>
                                        {kz(it.total)} ({it.vs_media_pct > 0 ? '+' : ''}{it.vs_media_pct}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-white/40">
                            <p>{bench.motivo}</p>
                            <p className="text-xs mt-2 text-white/30">Disponível com mais condomínios com dados.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function AreaMulti({ d }: { d: any }) {
    const itens = d.itens || [];
    const grafico = itens.map((it: any) => ({ nome: it.nome.length > 14 ? it.nome.slice(0, 13) + '…' : it.nome, Receita: it.receita, Dívida: it.divida }));
    const corScore = (s: number) => s >= 70 ? 'text-emerald-400' : s >= 45 ? 'text-amber-400' : 'text-red-400';
    const medalha = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
    return (
        <>
            <p className="text-sm text-white/60 mb-4">Ranking de saúde financeira dos seus condomínios.</p>
            <div className="space-y-3 mb-6">
                {itens.map((it: any, i: number) => (
                    <div key={it.condominio_id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">{medalha(i)} {it.nome}</span>
                            <span className={`text-lg font-bold ${corScore(it.score_saude)}`}>{it.score_saude}<span className="text-xs text-white/40">/100</span></span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div><span className="text-white/40">Receita</span><br/><span className="text-emerald-300">{kz(it.receita)}</span></div>
                            <div><span className="text-white/40">Dívida</span><br/><span className="text-red-300">{kz(it.divida)}</span></div>
                            <div><span className="text-white/40">Cobrança</span><br/><span className="text-white/80">{it.taxa_cobranca}%</span></div>
                            <div><span className="text-white/40">Fundo</span><br/><span className={it.fundo_cumpre ? 'text-emerald-300' : 'text-red-300'}>{it.fundo_pct}%</span></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                <p className="text-sm text-white/70 mb-4">Receita vs Dívida por condomínio</p>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={grafico} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                            <XAxis dataKey="nome" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => new Intl.NumberFormat('pt-AO', { notation: 'compact' }).format(v as number)} />
                            <Tooltip formatter={(v: number) => kz(v)} contentStyle={{ background: '#141428', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="Receita" fill="#10B981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Dívida" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}

function AreaOperacional({ d }: { d: any }) {
    const cat = (d.por_categoria || []).map((c: any) => ({ nome: c.categoria, Pedidos: c.n }));
    const estados = Object.entries(d.por_estado || {}).map(([k, v]) => ({ k, v: v as number }));
    const prio = d.por_prioridade || {};
    const tr = d.tempo_resolucao;
    const corEstado = (e: string) => e === 'resolvido' || e === 'fechado' ? 'text-emerald-300' : e === 'cancelado' ? 'text-white/40' : 'text-amber-300';
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Cartao label="Total de pedidos" valor={String(d.total)} cor="text-cyan-400" />
                <Cartao label="Urgentes" valor={String(prio.urgente || 0)} cor="text-red-400" />
                <Cartao label="Tempo médio resolução" valor={tr.disponivel ? tr.dias_medio + 'd' : 'n/d'} cor="text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                    <p className="text-sm text-white/70 mb-4">Por estado</p>
                    <div className="space-y-2">
                        {estados.map((e: any) => (
                            <div key={e.k} className="flex justify-between text-sm">
                                <span className={corEstado(e.k)}>{e.k.replace('_', ' ')}</span>
                                <span className="text-white/70">{e.v}</span>
                            </div>
                        ))}
                    </div>
                    {!tr.disponivel && <p className="text-xs text-white/30 mt-4">{tr.motivo}</p>}
                </div>

                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                    <p className="text-sm text-white/70 mb-4">Por categoria</p>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <BarChart data={cat} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} allowDecimals={false} />
                                <YAxis type="category" dataKey="nome" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} width={90} />
                                <Tooltip contentStyle={{ background: '#141428', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                <Bar dataKey="Pedidos" fill="#A855F7" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                <p className="text-sm text-white/70 mb-4">Pedidos abertos por mês</p>
                <div style={{ width: '100%', height: 240 }}>
                    <ResponsiveContainer>
                        <BarChart data={d.meses} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: '#141428', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                            <Bar dataKey="n" name="Pedidos" fill="#00D4FF" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}

function DevedoresDetalhados({ condominioId }: { condominioId: string }) {
    const [lista, setLista] = useState<any[] | null>(null);
    const [expandido, setExpandido] = useState<number | null>(null);
    const [lancs, setLancs] = useState<Record<number, any[]>>({});
    const [antiguidade, setAntiguidade] = useState('todos');
    const [tipo, setTipo] = useState('todos');
    const [ordenar, setOrdenar] = useState('divida');

    useEffect(() => {
        setLista(null);
        const params = new URLSearchParams();
        if (condominioId) params.set('condominio_id', condominioId);
        params.set('antiguidade', antiguidade);
        params.set('tipo', tipo);
        params.set('ordenar', ordenar);
        fetch('/bi/dados/devedores?' + params.toString(), { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then((j) => setLista(j.devedores || []))
            .catch(() => setLista([]));
    }, [antiguidade, tipo, ordenar, condominioId]);

    const toggle = async (fraccaoId: number) => {
        if (expandido === fraccaoId) { setExpandido(null); return; }
        setExpandido(fraccaoId);
        if (!lancs[fraccaoId]) {
            try {
                const r = await fetch(`/bi/dados/fraccao/${fraccaoId}/lancamentos`, { headers: { Accept: 'application/json' } });
                const j = await r.json();
                setLancs((prev) => ({ ...prev, [fraccaoId]: j.lancamentos || [] }));
            } catch { /* silencioso */ }
        }
    };

    return (
        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <p className="text-sm text-white/70">Imóveis em dívida</p>
                <div className="flex gap-2 flex-wrap">
                    <select value={antiguidade} onChange={(e) => setAntiguidade(e.target.value)} className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80">
                        <option value="todos">Toda a antiguidade</option>
                        <option value="30">Vencido +30 dias</option>
                        <option value="60">Vencido +60 dias</option>
                        <option value="90">Vencido +90 dias</option>
                    </select>
                    <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80">
                        <option value="todos">Todos os tipos</option>
                        <option value="quota_base">Quota base</option>
                        <option value="fundo_reserva">Fundo reserva</option>
                        <option value="despesa_extra">Despesa extra</option>
                        <option value="multa">Multa</option>
                        <option value="juros">Juros</option>
                    </select>
                    <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)} className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80">
                        <option value="divida">Ordenar: dívida</option>
                        <option value="meses">Ordenar: meses</option>
                        <option value="facturas">Ordenar: facturas</option>
                    </select>
                        <a
                        href={'/bi/exportar/cobranca/csv?' + (new URLSearchParams({
                            ...(condominioId ? { condominio_id: condominioId } : {}),
                            antiguidade, tipo, ordenar,
                        })).toString()}
                        className="text-xs px-2 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-200 hover:bg-cyan-500/25"
                    >
                        Exportar CSV
                    </a>
                </div>
            </div>
            {lista === null ? (
                <p className="text-sm text-white/40">A carregar...</p>
            ) : lista.length === 0 ? (
                <p className="text-sm text-white/40">Sem dívidas em aberto.</p>
            ) : (
                <div className="space-y-2">
                    <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-white/40 px-2 pb-1">
                        <span className="col-span-3">Imóvel</span>
                        <span className="col-span-4">Condómino</span>
                        <span className="col-span-2 text-center">Facturas</span>
                        <span className="col-span-3 text-right">Dívida</span>
                    </div>
                    {lista.map((dev: any) => (
                        <div key={dev.fraccao_id} className="rounded-lg bg-white/[0.02] border border-white/5">
                            <button
                                onClick={() => toggle(dev.fraccao_id)}
                                className="w-full grid grid-cols-12 gap-2 items-center px-2 py-2 text-sm hover:bg-white/[0.03] text-left"
                            >
                                <span className="col-span-3 text-white/90 font-medium">{dev.imovel}</span>
                                <span className="col-span-4 text-white/60 truncate">{dev.condomino}</span>
                                <span className="col-span-2 text-center text-white/60">
                                    {dev.facturas}{dev.meses > 0 ? ` · ${dev.meses}m` : ''}
                                </span>
                                <span className="col-span-3 text-right font-medium text-red-300">
                                    {kz(dev.divida)} <span className="text-white/30">{expandido === dev.fraccao_id ? '▾' : '▸'}</span>
                                </span>
                            </button>
                            {expandido === dev.fraccao_id && (
                                <div className="px-3 pb-3 pt-1 border-t border-white/5">
                                    {!lancs[dev.fraccao_id] ? (
                                        <p className="text-xs text-white/40 py-2">A carregar lançamentos...</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {lancs[dev.fraccao_id].map((l: any) => (
                                                <div key={l.id} className="flex justify-between text-xs text-white/60 py-1">
                                                    <span>{l.tipo.replace('_', ' ')} — {l.descricao}</span>
                                                    <span className="text-white/50">{l.data_vencimento} · <span className="text-red-300">{kz(l.divida)}</span></span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function BannerAlertas({ condominioId }: { condominioId: string }) {
    const [alertas, setAlertas] = useState<any[]>([]);
    const [versao, setVersao] = useState(0);
    const [mostrarConfig, setMostrarConfig] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams();
        if (condominioId) params.set('condominio_id', condominioId);
        fetch('/bi/dados/alertas?' + params.toString(), { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then((j) => setAlertas(j.alertas || []))
            .catch(() => setAlertas([]));
    }, [condominioId, versao]);

    return (
        <>
            {alertas.length > 0 && (
                <div className="mb-5">
                    <div className="flex justify-end mb-2">
                        <button onClick={() => setMostrarConfig(true)} className="text-xs text-white/40 hover:text-white/70" title="Configurar limites dos alertas">
                            ⚙ Limites dos alertas
                        </button>
                    </div>
                    <div className="space-y-2">
                        {alertas.map((a: any, i: number) => {
                            const critico = a.nivel === 'critico';
                            return (
                                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${critico ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                                    <span className={`text-sm mt-0.5 ${critico ? 'text-red-400' : 'text-amber-400'}`}>{critico ? '⚠' : '!'}</span>
                                    <div>
                                        <p className={`text-sm font-medium ${critico ? 'text-red-200' : 'text-amber-200'}`}>{a.titulo}</p>
                                        <p className="text-xs text-white/60 mt-0.5">{a.detalhe}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {mostrarConfig && (
                <ConfigAlertasModal onFechar={() => setMostrarConfig(false)} onGuardado={() => { setMostrarConfig(false); setVersao((v) => v + 1); }} />
            )}
        </>
    );
}

function ConfigAlertasModal({ onFechar, onGuardado }: { onFechar: () => void; onGuardado: () => void }) {
    const [taxa, setTaxa] = useState<string>('50');
    const [divida, setDivida] = useState<string>('100000');
    const [carregado, setCarregado] = useState(false);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        fetch('/bi/alertas/config', { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then((j) => {
                if (j.taxa_cobranca_min !== undefined) setTaxa(String(j.taxa_cobranca_min));
                if (j.divida_imovel_limite !== undefined) setDivida(String(j.divida_imovel_limite));
            })
            .catch(() => { /* mantem defaults */ })
            .finally(() => setCarregado(true));
    }, []);

    const guardar = async () => {
        setGuardando(true);
        try {
            const axios = (window as any).axios;
            if (axios) {
                await axios.post('/bi/alertas/config', {
                    taxa_cobranca_min: parseFloat(taxa) || 0,
                    divida_imovel_limite: parseFloat(divida) || 0,
                });
                onGuardado();
            } else {
                // Fallback: fetch com XSRF-TOKEN do cookie (padrão Laravel)
                const xsrf = decodeURIComponent((document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN=')) || '').split('=')[1] || '');
                const r = await fetch('/bi/alertas/config', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrf },
                    body: JSON.stringify({ taxa_cobranca_min: parseFloat(taxa) || 0, divida_imovel_limite: parseFloat(divida) || 0 }),
                });
                if (r.ok) onGuardado();
                else alert('Erro ao guardar (HTTP ' + r.status + ').');
            }
        } catch (err: any) {
            alert('Erro ao guardar: ' + (err?.message || 'desconhecido'));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onFechar}>
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#141428] border border-white/10" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-medium text-white mb-1">Limites dos alertas</h3>
                <p className="text-xs text-white/50 mb-5">Configure os valores que disparam os alertas no Dashboard BI.</p>
                {!carregado ? (
                    <p className="text-sm text-white/40">A carregar...</p>
                ) : (
                    <>
                        <label className="block mb-4">
                            <span className="text-xs text-white/60">Taxa de cobrança mínima (%)</span>
                            <input type="number" min="0" max="100" step="1" value={taxa} onChange={(e) => setTaxa(e.target.value)}
                                className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
                            <span className="text-[10px] text-white/30">Avisa quando a taxa real fica abaixo deste valor. Default: 50%.</span>
                        </label>
                        <label className="block mb-5">
                            <span className="text-xs text-white/60">Dívida elevada por imóvel (Kz)</span>
                            <input type="number" min="0" step="1000" value={divida} onChange={(e) => setDivida(e.target.value)}
                                className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
                            <span className="text-[10px] text-white/30">Avisa quando um ou mais imóveis ultrapassam este valor. Default: 100.000 Kz.</span>
                        </label>
                        <div className="flex justify-end gap-2">
                            <button onClick={onFechar} className="text-sm px-3 py-2 rounded-lg text-white/70 hover:bg-white/5">Cancelar</button>
                            <button onClick={guardar} disabled={guardando} className="text-sm px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-50">
                                {guardando ? 'A guardar...' : 'Guardar'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function Cartao({ label, valor, cor, variacao }: { label: string; valor: string; cor: string; variacao?: number | null }) {
    const temVar = variacao !== undefined;
    const novo = variacao === null;
    const subiu = typeof variacao === 'number' && variacao > 0;
    const desceu = typeof variacao === 'number' && variacao < 0;
    return (
        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-white/60">{label}</p>
                {temVar && (
                    novo ? (
                        <span className="text-xs text-white/30">novo</span>
                    ) : variacao === 0 ? (
                        <span className="text-xs text-white/40">—</span>
                    ) : (
                        <span className={`text-xs font-medium ${subiu ? 'text-emerald-400' : 'text-red-400'}`}>
                            {subiu ? '▲' : '▼'} {Math.abs(variacao as number)}%
                        </span>
                    )
                )}
            </div>
            <p className={`text-2xl font-bold ${cor}`}>{valor}</p>
        </div>
    );
}
