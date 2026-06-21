import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Wrench, Plus, CalendarClock, CheckCircle2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Equipamento {
    id: number;
    nome: string;
    tipo: string;
    tipo_label: string;
    localizacao: string | null;
    condominio_id: number;
    planos_count: number;
}
interface Proxima {
    id: number;
    titulo: string;
    equipamento: string | null;
    tipo_label: string | null;
    proxima_data: string;
    dias: number;
    periodicidade_dias: number;
}
interface Condominio { id: number; nome: string }
interface Props { equipamentos: Equipamento[]; proximas: Proxima[]; condominios: Condominio[] }

const TIPOS = [
    ['elevador', 'Elevador'], ['avac', 'AVAC (climatização)'], ['gerador', 'Gerador'],
    ['bomba', 'Bomba de água'], ['incendio', 'Combate a incêndio'], ['portao', 'Portão / cancela'], ['outro', 'Outro'],
];

function corDias(dias: number) {
    if (dias < 0) return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    if (dias <= 7) return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    if (dias <= 15) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    if (dias <= 30) return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    return 'bg-zinc-700/40 text-zinc-400 border-zinc-700';
}

export default function ManutencaoIndex({ equipamentos, proximas, condominios }: Props) {
    const [intervencaoPlano, setIntervencaoPlano] = useState<Proxima | null>(null);

    const eqForm = useForm({ condominio_id: condominios[0]?.id ?? 0, nome: '', tipo: 'elevador', localizacao: '', marca: '', modelo: '' });
    const planoForm = useForm({ equipamento_id: equipamentos[0]?.id ?? 0, titulo: '', descricao: '', periodicidade_dias: 180, proxima_data: '' });
    const intForm = useForm<{ data_realizada: string; descricao: string; custo: string; realizado_por: string; relatorio: File | null }>({
        data_realizada: new Date().toISOString().slice(0, 10), descricao: '', custo: '', realizado_por: '', relatorio: null,
    });

    const addEquipamento = (e: FormEvent) => { e.preventDefault(); eqForm.post(route('manutencao.equipamentos.store'), { preserveScroll: true, onSuccess: () => eqForm.reset('nome', 'localizacao', 'marca', 'modelo') }); };
    const addPlano = (e: FormEvent) => { e.preventDefault(); planoForm.post(route('manutencao.planos.store'), { preserveScroll: true, onSuccess: () => planoForm.reset('titulo', 'descricao') }); };
    const submitIntervencao = (e: FormEvent) => {
        e.preventDefault();
        if (!intervencaoPlano) return;
        intForm.post(route('manutencao.planos.intervencao', intervencaoPlano.id), {
            preserveScroll: true, forceFormData: true,
            onSuccess: () => { setIntervencaoPlano(null); intForm.reset(); },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manutenção Preventiva" />
            <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-100">Manutenção Preventiva</h1>
                        <p className="text-sm text-zinc-500">Elevadores, AVAC, geradores, bombas… com alertas 30/15/7 dias antes.</p>
                    </div>
                </div>

                {/* Próximas */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-4 flex items-center gap-2">
                        <CalendarClock className="h-4 w-4" /> Próximas manutenções
                    </h2>
                    {proximas.length === 0 ? (
                        <p className="text-sm text-zinc-500">Sem manutenções agendadas. Adicione um equipamento e um plano abaixo.</p>
                    ) : (
                        <div className="space-y-2">
                            {proximas.map((p) => (
                                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950/40 border border-zinc-800">
                                    <span className={`text-xs px-2 py-1 rounded border font-semibold ${corDias(p.dias)}`}>
                                        {p.dias < 0 ? `Em atraso ${Math.abs(p.dias)}d` : `${p.dias} dias`}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-zinc-200 font-medium truncate">{p.titulo}</p>
                                        <p className="text-xs text-zinc-500">{p.equipamento} · {p.tipo_label} · {p.proxima_data}</p>
                                    </div>
                                    <button onClick={() => setIntervencaoPlano(p)}
                                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Registar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add equipamento */}
                    <form onSubmit={addEquipamento} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Novo equipamento</h2>
                        <select value={eqForm.data.condominio_id} onChange={(e) => eqForm.setData('condominio_id', Number(e.target.value))} className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2">
                            {condominios.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                        <input value={eqForm.data.nome} onChange={(e) => eqForm.setData('nome', e.target.value)} placeholder="Nome (ex.: Elevador Bloco A)" className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" />
                        <div className="grid grid-cols-2 gap-3">
                            <select value={eqForm.data.tipo} onChange={(e) => eqForm.setData('tipo', e.target.value)} className="rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2">
                                {TIPOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                            <input value={eqForm.data.localizacao} onChange={(e) => eqForm.setData('localizacao', e.target.value)} placeholder="Localização" className="rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" />
                        </div>
                        <button disabled={eqForm.processing} className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 hover:bg-cyan-500 text-white text-sm px-4 py-2 disabled:opacity-50">
                            <Plus className="h-4 w-4" /> Adicionar equipamento
                        </button>
                    </form>

                    {/* Add plano */}
                    <form onSubmit={addPlano} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Novo plano de manutenção</h2>
                        <select value={planoForm.data.equipamento_id} onChange={(e) => planoForm.setData('equipamento_id', Number(e.target.value))} className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2">
                            {equipamentos.length === 0 ? <option value={0}>— adicione um equipamento primeiro —</option> :
                                equipamentos.map((eq) => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
                        </select>
                        <input value={planoForm.data.titulo} onChange={(e) => planoForm.setData('titulo', e.target.value)} placeholder="Título (ex.: Revisão semestral)" className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" />
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Periodicidade (dias)</label>
                                <input type="number" min={1} value={planoForm.data.periodicidade_dias} onChange={(e) => planoForm.setData('periodicidade_dias', Number(e.target.value))} className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Próxima data</label>
                                <input type="date" value={planoForm.data.proxima_data} onChange={(e) => planoForm.setData('proxima_data', e.target.value)} className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" />
                            </div>
                        </div>
                        <button disabled={planoForm.processing || equipamentos.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 hover:bg-cyan-500 text-white text-sm px-4 py-2 disabled:opacity-50">
                            <Plus className="h-4 w-4" /> Criar plano
                        </button>
                    </form>
                </div>

                {/* Equipamentos */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-4">Equipamentos ({equipamentos.length})</h2>
                    {equipamentos.length === 0 ? <p className="text-sm text-zinc-500">Nenhum equipamento.</p> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {equipamentos.map((eq) => (
                                <div key={eq.id} className="p-3 rounded-lg bg-zinc-950/40 border border-zinc-800">
                                    <p className="text-sm text-zinc-100 font-medium">{eq.nome}</p>
                                    <p className="text-xs text-zinc-500">{eq.tipo_label}{eq.localizacao ? ` · ${eq.localizacao}` : ''}</p>
                                    <p className="text-xs text-cyan-400/80 mt-1">{eq.planos_count} plano(s)</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal registar intervenção */}
            {intervencaoPlano && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setIntervencaoPlano(null)}>
                    <form onClick={(e) => e.stopPropagation()} onSubmit={submitIntervencao} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md space-y-3">
                        <h3 className="text-lg font-medium text-zinc-100">Registar intervenção</h3>
                        <p className="text-sm text-zinc-500">{intervencaoPlano.titulo} · {intervencaoPlano.equipamento}</p>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Data realizada</label>
                            <input type="date" value={intForm.data.data_realizada} onChange={(e) => intForm.setData('data_realizada', e.target.value)} className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" />
                        </div>
                        <textarea value={intForm.data.descricao} onChange={(e) => intForm.setData('descricao', e.target.value)} placeholder="Descrição do que foi feito" rows={3} className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" />
                        <div className="grid grid-cols-2 gap-3">
                            <input value={intForm.data.custo} onChange={(e) => intForm.setData('custo', e.target.value)} placeholder="Custo (Kz)" className="rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" />
                            <input value={intForm.data.realizado_por} onChange={(e) => intForm.setData('realizado_por', e.target.value)} placeholder="Realizado por" className="rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Relatório (PDF/foto, opcional)</label>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => intForm.setData('relatorio', e.target.files?.[0] ?? null)} className="w-full text-xs text-zinc-400" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIntervencaoPlano(null)} className="text-sm text-zinc-400 px-4 py-2">Cancelar</button>
                            <button type="submit" disabled={intForm.processing} className="rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white text-sm px-4 py-2 disabled:opacity-50">
                                {intForm.processing ? 'A guardar…' : 'Registar e avançar data'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
