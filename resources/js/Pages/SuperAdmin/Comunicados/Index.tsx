import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Megaphone, Building2, Send, AlertTriangle, CheckSquare, Square } from 'lucide-react';

interface Condominio {
    id: number;
    nome: string;
    empresa_gestora_id: number;
}

interface Props {
    condominios: Condominio[];
}

export default function ComunicadosIndex({ condominios }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<any>({
        titulo: '',
        mensagem: '',
        condominio_ids: [] as number[],
    });

    const [confirmar, setConfirmar] = useState(false);

    const todosSelecionados =
        condominios.length > 0 && data.condominio_ids.length === condominios.length;

    function toggleCondominio(id: number) {
        if (data.condominio_ids.includes(id)) {
            setData('condominio_ids', data.condominio_ids.filter((c: number) => c !== id));
        } else {
            setData('condominio_ids', [...data.condominio_ids, id]);
        }
    }

    function toggleTodos() {
        if (todosSelecionados) {
            setData('condominio_ids', []);
        } else {
            setData('condominio_ids', condominios.map((c) => c.id));
        }
    }

    function submeter() {
        post('/admin/comunicados/enviar', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setConfirmar(false);
            },
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Comunicados" />

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500">
                        <Megaphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">Comunicados</h1>
                        <p className="text-sm text-zinc-400">
                            Publica um aviso nos condominios que escolheres. Os condominos recebem na seccao Avisos, com push e email.
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-5 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Titulo</label>
                        <input
                            type="text"
                            value={data.titulo}
                            onChange={(e) => setData('titulo', e.target.value)}
                            maxLength={120}
                            placeholder="Ex: Manutencao programada da plataforma"
                            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2 focus:border-cyan-500 outline-none"
                        />
                        {errors.titulo && <p className="text-sm text-red-400 mt-1">{errors.titulo}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Mensagem</label>
                        <textarea
                            value={data.mensagem}
                            onChange={(e) => setData('mensagem', e.target.value)}
                            maxLength={2000}
                            rows={5}
                            placeholder="Escreve o comunicado..."
                            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2 focus:border-cyan-500 outline-none resize-y"
                        />
                        {errors.mensagem && <p className="text-sm text-red-400 mt-1">{errors.mensagem}</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-zinc-300">
                                Condominios ({data.condominio_ids.length} selecionado{data.condominio_ids.length === 1 ? '' : 's'})
                            </label>
                            <button
                                type="button"
                                onClick={toggleTodos}
                                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                                {todosSelecionados ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                {todosSelecionados ? 'Desmarcar todos' : 'Selecionar todos'}
                            </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto rounded-lg border border-zinc-800 divide-y divide-zinc-800">
                            {condominios.map((c) => {
                                const checked = data.condominio_ids.includes(c.id);
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => toggleCondominio(c.id)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800/50 text-left"
                                    >
                                        {checked ? (
                                            <CheckSquare className="w-5 h-5 text-cyan-400 shrink-0" />
                                        ) : (
                                            <Square className="w-5 h-5 text-zinc-600 shrink-0" />
                                        )}
                                        <Building2 className="w-4 h-4 text-zinc-500 shrink-0" />
                                        <span className="text-sm text-zinc-200">{c.nome}</span>
                                        <span className="text-xs text-zinc-600 ml-auto">empresa #{c.empresa_gestora_id}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.condominio_ids && <p className="text-sm text-red-400 mt-1">{errors.condominio_ids}</p>}
                    </div>

                    {!confirmar ? (
                        <button
                            type="button"
                            disabled={!data.titulo || !data.mensagem || data.condominio_ids.length === 0}
                            onClick={() => setConfirmar(true)}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium py-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                        >
                            <Send className="w-4 h-4" />
                            Rever e enviar
                        </button>
                    ) : (
                        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 space-y-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-200">
                                    Vais publicar este comunicado em <strong>{data.condominio_ids.length}</strong> condominio(s). Confirmas?
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmar(false)}
                                    className="flex-1 rounded-lg border border-zinc-700 text-zinc-300 py-2 hover:bg-zinc-800"
                                >
                                    Voltar
                                </button>
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={submeter}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium py-2 disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    {processing ? 'A enviar...' : 'Confirmar e enviar'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
