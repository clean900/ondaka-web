import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Users, Save, Info } from 'lucide-react';

interface PageProps {
    condominios: Array<{ id: number; nome: string; codigo: string }>;
}

export default function AssembleiaForm({ condominios }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        condominio_id: '',
        tipo: 'ordinaria',
        titulo: '',
        ordem_do_dia: '',
        observacoes: '',
        data_agendada: '',
        data_segunda_convocatoria: '',
        local: 'Virtual (Jitsi)',
        modo: 'virtual',
        quorum_minimo_percent: 50,
        enviar_convocatorias_ja: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/assembleias');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Nova assembleia — ONDAKA" />

            <div className="p-6 md:p-8 max-w-3xl">
                <Link href="/assembleias" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">Nova assembleia</h1>
                        <p className="text-sm text-zinc-500">Agendar reunião de condóminos</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Condomínio */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Condomínio</h3>
                        <select
                            value={data.condominio_id}
                            onChange={(e) => setData('condominio_id', e.target.value)}
                            required
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                        >
                            <option value="">Seleccione um condomínio...</option>
                            {condominios.map((c) => (
                                <option key={c.id} value={c.id}>{c.nome} ({c.codigo})</option>
                            ))}
                        </select>
                        {errors.condominio_id && <p className="text-xs text-red-400 mt-1">{errors.condominio_id}</p>}
                    </div>

                    {/* Detalhes */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Detalhes</h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1.5">Tipo</label>
                                <select
                                    value={data.tipo}
                                    onChange={(e) => setData('tipo', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                >
                                    <option value="ordinaria">Ordinária</option>
                                    <option value="extraordinaria">Extraordinária</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-500 mb-1.5">Modo</label>
                                <select
                                    value={data.modo}
                                    onChange={(e) => setData('modo', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                >
                                    <option value="virtual">Virtual (Jitsi)</option>
                                    <option value="presencial">Presencial</option>
                                    <option value="hibrida">Híbrida</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-xs text-zinc-500 mb-1.5">Título *</label>
                            <input
                                type="text"
                                value={data.titulo}
                                onChange={(e) => setData('titulo', e.target.value)}
                                required
                                maxLength={200}
                                placeholder="Ex: 1ª Assembleia Ordinária 2026"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600"
                            />
                            {errors.titulo && <p className="text-xs text-red-400 mt-1">{errors.titulo}</p>}
                        </div>

                        <div className="mt-4">
                            <label className="block text-xs text-zinc-500 mb-1.5">Ordem do dia *</label>
                            <textarea
                                value={data.ordem_do_dia}
                                onChange={(e) => setData('ordem_do_dia', e.target.value)}
                                required
                                rows={5}
                                placeholder={"1. Aprovação das contas do exercício anterior\n2. Eleição do novo administrador\n3. Outros assuntos"}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 font-mono"
                            />
                            {errors.ordem_do_dia && <p className="text-xs text-red-400 mt-1">{errors.ordem_do_dia}</p>}
                        </div>

                        <div className="mt-4">
                            <label className="block text-xs text-zinc-500 mb-1.5">Observações</label>
                            <textarea
                                value={data.observacoes}
                                onChange={(e) => setData('observacoes', e.target.value)}
                                rows={2}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                            />
                        </div>
                    </div>

                    {/* Agendamento */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Agendamento</h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1.5">Data e hora (1ª convocatória) *</label>
                                <input
                                    type="datetime-local"
                                    value={data.data_agendada}
                                    onChange={(e) => setData('data_agendada', e.target.value)}
                                    required
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                />
                                {errors.data_agendada && <p className="text-xs text-red-400 mt-1">{errors.data_agendada}</p>}
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-500 mb-1.5">2ª convocatória (opcional)</label>
                                <input
                                    type="datetime-local"
                                    value={data.data_segunda_convocatoria}
                                    onChange={(e) => setData('data_segunda_convocatoria', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                />
                            </div>
                        </div>

                        {data.modo !== 'virtual' && (
                            <div className="mt-4">
                                <label className="block text-xs text-zinc-500 mb-1.5">Local (se presencial/híbrida)</label>
                                <input
                                    type="text"
                                    value={data.local}
                                    onChange={(e) => setData('local', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                />
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="block text-xs text-zinc-500 mb-1.5">Quórum mínimo (%)</label>
                            <input
                                type="number"
                                value={data.quorum_minimo_percent}
                                onChange={(e) => setData('quorum_minimo_percent', Number(e.target.value))}
                                min={0}
                                max={100}
                                step={0.01}
                                className="w-32 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                            />
                            <p className="text-xs text-zinc-500 mt-1">Percentagem de fracções necessária para deliberar (DP 141/15: ≥50% em 1ª)</p>
                        </div>
                    </div>

                    {/* Convocatórias */}
                    <div className="bg-cyan-500/5 border border-cyan-500/30 rounded-xl p-5">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-cyan-300 mb-1">Enviar convocatórias agora?</h3>
                                <p className="text-xs text-zinc-400 mb-3">
                                    Enviam-se email + SMS (1 SMS por condómino da sua feature sms_sender_id).
                                    Se preferir, pode enviar mais tarde na página de detalhe.
                                </p>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.enviar_convocatorias_ja}
                                        onChange={(e) => setData('enviar_convocatorias_ja', e.target.checked)}
                                        className="w-4 h-4 rounded bg-zinc-900 border-zinc-700"
                                    />
                                    <span className="text-sm text-zinc-200">Enviar convocatórias automaticamente após criar</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link href="/assembleias" className="text-sm text-zinc-400 hover:text-zinc-200">Cancelar</Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-5 py-2.5 text-sm font-medium disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'A criar...' : 'Criar assembleia'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
