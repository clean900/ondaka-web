import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

interface Espaco { id: number; nome: string; descricao: string | null; condominio_id: number | null;
    hora_abertura: string; hora_fecho: string; duracao_min_horas: number; duracao_max_horas: number;
    antecedencia_min_horas: number; antecedencia_max_dias: number; tem_caucao: boolean; valor_caucao: string; activo: boolean; }
interface Cond { id: number; nome: string; }

export default function ReservasEspaco({ espaco, condominios }: { espaco: Espaco | null; condominios: Cond[] }) {
    const editar = !!espaco;
    const { data, setData, processing, errors, post, put } = useForm({
        nome: espaco?.nome || '',
        descricao: espaco?.descricao || '',
        condominio_id: espaco?.condominio_id || '',
        hora_abertura: (espaco?.hora_abertura || '08:00').slice(0, 5),
        hora_fecho: (espaco?.hora_fecho || '22:00').slice(0, 5),
        duracao_min_horas: espaco?.duracao_min_horas ?? 1,
        duracao_max_horas: espaco?.duracao_max_horas ?? 4,
        antecedencia_min_horas: espaco?.antecedencia_min_horas ?? 48,
        antecedencia_max_dias: espaco?.antecedencia_max_dias ?? 60,
        tem_caucao: espaco?.tem_caucao ?? false,
        valor_caucao: espaco ? Number(espaco.valor_caucao) : 0,
        activo: espaco?.activo ?? true,
    });

    const submit = (e: any) => {
        e.preventDefault();
        if (editar) put(`/reservas/espacos/${espaco!.id}`);
        else post('/reservas/espacos');
    };

    return (
        <AuthenticatedLayout>
            <Head title={editar ? 'Editar espaço' : 'Novo espaço'} />
            <form onSubmit={submit} className="max-w-3xl mx-auto px-4 py-6 space-y-5">
                <h1 className="text-xl font-medium text-white">{editar ? 'Editar espaço' : 'Novo espaço'}</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block sm:col-span-2">
                        <span className="text-xs text-white/60">Nome</span>
                        <input value={data.nome} onChange={(e) => setData('nome', e.target.value)} required
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
                        {errors.nome && <span className="text-xs text-red-400">{errors.nome}</span>}
                    </label>
                    <label className="block sm:col-span-2">
                        <span className="text-xs text-white/60">Descrição</span>
                        <input value={data.descricao} onChange={(e) => setData('descricao', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
                    </label>
                    <label className="block sm:col-span-2">
                        <span className="text-xs text-white/60">Condomínio (opcional)</span>
                        <select value={data.condominio_id as any} onChange={(e) => setData('condominio_id', e.target.value as any)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
                            <option value="">Todos os condomínios</option>
                            {condominios.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-xs text-white/60">Hora abertura</span>
                        <input type="time" value={data.hora_abertura} onChange={(e) => setData('hora_abertura', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
                    </label>
                    <label className="block">
                        <span className="text-xs text-white/60">Hora fecho</span>
                        <input type="time" value={data.hora_fecho} onChange={(e) => setData('hora_fecho', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
                    </label>
                    <label className="block">
                        <span className="text-xs text-white/60">Duração mín (horas)</span>
                        <input type="number" min={1} max={24} value={data.duracao_min_horas} onChange={(e) => setData('duracao_min_horas', parseInt(e.target.value) || 1)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
                    </label>
                    <label className="block">
                        <span className="text-xs text-white/60">Duração máx (horas)</span>
                        <input type="number" min={1} max={24} value={data.duracao_max_horas} onChange={(e) => setData('duracao_max_horas', parseInt(e.target.value) || 4)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
                    </label>
                    <label className="block">
                        <span className="text-xs text-white/60">Antecedência mínima (horas)</span>
                        <input type="number" min={0} max={720} value={data.antecedencia_min_horas} onChange={(e) => setData('antecedencia_min_horas', parseInt(e.target.value) || 0)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
                    </label>
                    <label className="block">
                        <span className="text-xs text-white/60">Antecedência máxima (dias)</span>
                        <input type="number" min={1} max={365} value={data.antecedencia_max_dias} onChange={(e) => setData('antecedencia_max_dias', parseInt(e.target.value) || 60)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
                    </label>
                    <label className="flex items-center gap-2 mt-6">
                        <input type="checkbox" checked={data.tem_caucao} onChange={(e) => setData('tem_caucao', e.target.checked)} />
                        <span className="text-sm text-white/80">Exige caução</span>
                    </label>
                    <label className="block">
                        <span className="text-xs text-white/60">Valor da caução (Kz)</span>
                        <input type="number" min={0} step={1000} disabled={!data.tem_caucao} value={data.valor_caucao as any} onChange={(e) => setData('valor_caucao', parseFloat(e.target.value) || 0)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm disabled:opacity-40" />
                    </label>
                    <label className="flex items-center gap-2 mt-2 sm:col-span-2">
                        <input type="checkbox" checked={data.activo} onChange={(e) => setData('activo', e.target.checked)} />
                        <span className="text-sm text-white/80">Activo (disponível para reservas)</span>
                    </label>
                </div>

                <div className="flex justify-end gap-2">
                    <a href="/reservas" className="text-sm px-3 py-2 rounded-lg text-white/70 hover:bg-white/5">Cancelar</a>
                    <button type="submit" disabled={processing} className="text-sm px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-50">
                        {processing ? 'A guardar...' : 'Guardar'}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
