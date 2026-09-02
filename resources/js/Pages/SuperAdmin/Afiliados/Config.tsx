import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Settings, Percent, Clock, Wallet, Link2, ShieldCheck } from 'lucide-react';
import { fmtKz, fmtPct, PageHeader, Seccao, AdminNav, NivelBadge } from '@/Components/Afiliados/ui';
import type { ConfigAfiliados } from '@/types/afiliados';

interface Props {
    valores: Record<string, string>;
    descricoes: Record<string, string>;
    config: ConfigAfiliados;
}

export default function Config({ valores, descricoes }: Props) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        afiliado_programa_activo: valores.afiliado_programa_activo === '1',
        afiliado_aprovacao_automatica: valores.afiliado_aprovacao_automatica === '1',
        afiliado_taxa_base_pct: valores.afiliado_taxa_base_pct ?? '6',
        afiliado_taxa_prata_pct: valores.afiliado_taxa_prata_pct ?? '8',
        afiliado_taxa_ouro_pct: valores.afiliado_taxa_ouro_pct ?? '10',
        afiliado_nivel_prata_clientes: valores.afiliado_nivel_prata_clientes ?? '5',
        afiliado_nivel_ouro_clientes: valores.afiliado_nivel_ouro_clientes ?? '10',
        afiliado_carencia_dias: valores.afiliado_carencia_dias ?? '15',
        afiliado_pagamento_minimo_kz: valores.afiliado_pagamento_minimo_kz ?? '10000',
        afiliado_retencao_pct: valores.afiliado_retencao_pct ?? '0',
        afiliado_cookie_dias: valores.afiliado_cookie_dias ?? '90',
        afiliado_duracao_meses: valores.afiliado_duracao_meses ?? '0',
    });

    const prata = Number(data.afiliado_nivel_prata_clientes) || 0;
    const ouro = Number(data.afiliado_nivel_ouro_clientes) || 0;
    const exemploBase = 1110000; // 50 imóveis × 1.850 Kz × 12 meses (ilustrativo)

    return (
        <AuthenticatedLayout>
            <Head title="Configuração do programa de afiliados" />
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader icon={Settings} titulo="Configuração do Programa de Afiliados" subtitulo="Taxas por nível, carência, mínimo de pagamento, duração do link e da indicação" />
                <AdminNav activo="/super-admin/afiliados/config" />

                <form onSubmit={(e) => { e.preventDefault(); post('/super-admin/afiliados/config', { preserveScroll: true }); }} className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Seccao titulo={<span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" /> Programa</span>}>
                            <div className="space-y-4 p-5">
                                <Toggle label="Programa activo" desc={descricoes.afiliado_programa_activo} v={data.afiliado_programa_activo} on={(v) => setData('afiliado_programa_activo', v)} />
                                <Toggle label="Aprovação automática" desc={descricoes.afiliado_aprovacao_automatica} v={data.afiliado_aprovacao_automatica} on={(v) => setData('afiliado_aprovacao_automatica', v)} />
                                <p className="text-xs text-white/40">Com o programa inactivo, os links deixam de atribuir clientes e não são criadas comissões novas; as existentes mantêm-se.</p>
                            </div>
                        </Seccao>

                        <Seccao titulo={<span className="flex items-center gap-2"><Percent className="h-4 w-4 text-purple-300" /> Níveis e taxas de comissão</span>}>
                            <div className="space-y-3 p-5">
                                <div className="grid grid-cols-[1fr_110px_120px] items-center gap-2 text-xs text-white/50"><span>Nível</span><span>Taxa %</span><span>Clientes pagantes</span></div>
                                <Nivel label={<NivelBadge nivel="bronze" />} taxa={data.afiliado_taxa_base_pct} setTaxa={(v) => setData('afiliado_taxa_base_pct', v)} clientes={<span className="text-sm text-white/60">até {Math.max(0, prata - 1)}</span>} erro={errors.afiliado_taxa_base_pct} />
                                <Nivel label={<NivelBadge nivel="prata" />} taxa={data.afiliado_taxa_prata_pct} setTaxa={(v) => setData('afiliado_taxa_prata_pct', v)} clientes={<input type="number" min={1} className="input" value={data.afiliado_nivel_prata_clientes} onChange={(e) => setData('afiliado_nivel_prata_clientes', e.target.value)} />} erro={errors.afiliado_taxa_prata_pct || errors.afiliado_nivel_prata_clientes} />
                                <Nivel label={<NivelBadge nivel="ouro" />} taxa={data.afiliado_taxa_ouro_pct} setTaxa={(v) => setData('afiliado_taxa_ouro_pct', v)} clientes={<input type="number" min={1} className="input" value={data.afiliado_nivel_ouro_clientes} onChange={(e) => setData('afiliado_nivel_ouro_clientes', e.target.value)} />} erro={errors.afiliado_taxa_ouro_pct || errors.afiliado_nivel_ouro_clientes} />
                                <p className="text-xs text-white/40">«Clientes pagantes» = clientes indicados com pelo menos uma comissão não anulada. Guardar recalcula o nível de todos os afiliados; as comissões já criadas mantêm a taxa da altura.</p>
                            </div>
                        </Seccao>

                        <Seccao titulo="Pré-visualização">
                            <div className="p-5">
                                <div className="text-xs text-white/50">Cliente com 50 imóveis × 1.850 Kz × 12 meses = <strong className="text-white">{fmtKz(exemploBase, 0)}</strong> sem imposto</div>
                                <table className="mt-3 w-full text-sm">
                                    <thead><tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40"><th className="py-1.5 text-left">Nível</th><th className="py-1.5 text-left">Clientes</th><th className="py-1.5 text-right">Taxa</th><th className="py-1.5 text-right">Comissão/ano</th></tr></thead>
                                    <tbody>
                                        {[
                                            { n: 'bronze' as const, t: data.afiliado_taxa_base_pct, c: `0–${Math.max(0, prata - 1)}` },
                                            { n: 'prata' as const, t: data.afiliado_taxa_prata_pct, c: `${prata}–${Math.max(prata, ouro - 1)}` },
                                            { n: 'ouro' as const, t: data.afiliado_taxa_ouro_pct, c: `${ouro}+` },
                                        ].map((r) => (
                                            <tr key={r.n}><td className="py-2"><NivelBadge nivel={r.n} /></td><td className="py-2 text-white/70">{r.c}</td><td className="py-2 text-right">{fmtPct(r.t)}</td><td className="py-2 text-right font-mono text-emerald-300">{fmtKz(exemploBase * (Number(r.t) || 0) / 100, 0)}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-4 space-y-1 text-xs text-white/50">
                                    <div>Carência: <strong className="text-white">{data.afiliado_carencia_dias} dias</strong> · Mínimo: <strong className="text-white">{fmtKz(data.afiliado_pagamento_minimo_kz, 0)}</strong> · Retenção: <strong className="text-white">{fmtPct(data.afiliado_retencao_pct)}</strong></div>
                                    <div>Link memorizado: <strong className="text-white">{data.afiliado_cookie_dias} dias</strong> · Indicação: <strong className="text-white">{Number(data.afiliado_duracao_meses) > 0 ? `${data.afiliado_duracao_meses} meses` : 'vitalícia'}</strong></div>
                                </div>
                            </div>
                        </Seccao>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <Seccao titulo={<span className="flex items-center gap-2"><Clock className="h-4 w-4 text-amber-300" /> Carência</span>}>
                            <div className="p-5"><Num label="Dias de carência por comissão" desc={descricoes.afiliado_carencia_dias} v={data.afiliado_carencia_dias} on={(v) => setData('afiliado_carencia_dias', v)} erro={errors.afiliado_carencia_dias} min={0} /></div>
                        </Seccao>
                        <Seccao titulo={<span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-emerald-300" /> Pagamento</span>}>
                            <div className="grid gap-4 p-5 md:grid-cols-2">
                                <Num label="Mínimo para pagar (Kz)" desc={descricoes.afiliado_pagamento_minimo_kz} v={data.afiliado_pagamento_minimo_kz} on={(v) => setData('afiliado_pagamento_minimo_kz', v)} erro={errors.afiliado_pagamento_minimo_kz} min={0} step="100" />
                                <Num label="Retenção na fonte por defeito (%)" desc={descricoes.afiliado_retencao_pct} v={data.afiliado_retencao_pct} on={(v) => setData('afiliado_retencao_pct', v)} erro={errors.afiliado_retencao_pct} min={0} max={100} step="0.5" />
                            </div>
                        </Seccao>
                        <Seccao titulo={<span className="flex items-center gap-2"><Link2 className="h-4 w-4 text-cyan-300" /> Atribuição</span>}>
                            <div className="grid gap-4 p-5 md:grid-cols-2">
                                <Num label="Link memorizado (dias)" desc={descricoes.afiliado_cookie_dias} v={data.afiliado_cookie_dias} on={(v) => setData('afiliado_cookie_dias', v)} erro={errors.afiliado_cookie_dias} min={1} />
                                <Num label="Duração da indicação (meses, 0 = vitalícia)" desc={descricoes.afiliado_duracao_meses} v={data.afiliado_duracao_meses} on={(v) => setData('afiliado_duracao_meses', v)} erro={errors.afiliado_duracao_meses} min={0} />
                            </div>
                        </Seccao>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4">
                        <span className="text-xs text-white/40">{isDirty ? 'Há alterações por guardar.' : 'Sem alterações.'}</span>
                        <button type="submit" disabled={processing || !isDirty} className="btn-primary">Guardar configuração</button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

function Toggle({ label, desc, v, on }: { label: string; desc?: string; v: boolean; on: (v: boolean) => void }) {
    return (
        <label className="flex cursor-pointer items-start justify-between gap-4">
            <div><div className="text-sm font-medium text-white">{label}</div>{desc && <div className="text-xs text-white/40">{desc}</div>}</div>
            <button type="button" role="switch" aria-checked={v} onClick={() => on(!v)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${v ? 'bg-gradient-to-r from-cyan-400 to-purple-500' : 'bg-white/10'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${v ? 'left-[22px]' : 'left-0.5'}`} /></button>
        </label>
    );
}
function Num({ label, desc, v, on, erro, min, max, step }: { label: string; desc?: string; v: string; on: (v: string) => void; erro?: string; min?: number; max?: number; step?: string }) {
    return (
        <div>
            <label className="mb-1 block text-xs text-white/60">{label}</label>
            <input type="number" className="input" value={v} onChange={(e) => on(e.target.value)} min={min} max={max} step={step ?? '1'} />
            {desc && <div className="mt-1 text-[11px] text-white/40">{desc}</div>}
            {erro && <div className="mt-1 text-xs text-red-400">{erro}</div>}
        </div>
    );
}
function Nivel({ label, taxa, setTaxa, clientes, erro }: { label: React.ReactNode; taxa: string; setTaxa: (v: string) => void; clientes: React.ReactNode; erro?: string }) {
    return (
        <div>
            <div className="grid grid-cols-[1fr_110px_120px] items-center gap-2"><div>{label}</div><input type="number" min={0} max={100} step="0.5" className="input" value={taxa} onChange={(e) => setTaxa(e.target.value)} /><div>{clientes}</div></div>
            {erro && <div className="mt-1 text-xs text-red-400">{erro}</div>}
        </div>
    );
}
