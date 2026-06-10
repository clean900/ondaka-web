import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Megaphone, ArrowLeft, Save, Paperclip, X, Users,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Condominio { id: number; nome: string; }

interface PageProps {
    condominios: Condominio[];
}

const CATEGORIAS = [
    { v: 'geral', label: 'Geral' },
    { v: 'manutencao', label: 'Manutenção' },
    { v: 'reuniao', label: 'Reunião' },
    { v: 'urgente', label: 'Urgente' },
    { v: 'evento', label: 'Evento' },
    { v: 'aviso_legal', label: 'Aviso legal' },
    { v: 'outro', label: 'Outro' },
];

const PRIORIDADES = [
    { v: 'baixa', label: 'Baixa' },
    { v: 'media', label: 'Média' },
    { v: 'alta', label: 'Alta' },
    { v: 'urgente', label: 'Urgente' },
];

export default function AvisosCreate({ condominios }: PageProps) {
    const { data, setData, post, processing, errors } = useForm<any>({
        condominio_ids: [] as number[],
        titulo: '',
        descricao: '',
        categoria: 'geral',
        prioridade: 'media',
        publicar_em: '',
        arquivar_em: '',
        permite_comentarios: true,
        requer_confirmacao: false,
        notificar_push: true,
        notificar_email: true,
        notificar_sms: false,
        // segmentação: por agora "todos" (segmentação fina fica para evolução)
        segmentacoes: [{ tipo: 'todos' }],
        anexos: [] as File[],
    });

    const [ficheiros, setFicheiros] = useState<File[]>([]);

    const onFicheiros = (e: React.ChangeEvent<HTMLInputElement>) => {
        const lista = Array.from(e.target.files ?? []);
        const novos = [...ficheiros, ...lista].slice(0, 5);
        setFicheiros(novos);
        setData('anexos', novos);
    };

    const removerFicheiro = (idx: number) => {
        const novos = ficheiros.filter((_, i) => i !== idx);
        setFicheiros(novos);
        setData('anexos', novos);
    };

    const toggleCondominio = (id: number) => {
        const atual = data.condominio_ids as number[];
        if (atual.includes(id)) {
            setData('condominio_ids', atual.filter((x) => x !== id));
        } else {
            setData('condominio_ids', [...atual, id]);
        }
    };

    const todosSelecionados = condominios.length > 0 && (data.condominio_ids as number[]).length === condominios.length;

    const toggleTodos = () => {
        if (todosSelecionados) {
            setData('condominio_ids', []);
        } else {
            setData('condominio_ids', condominios.map((c) => c.id));
        }
    };

    const submeter = (e: FormEvent) => {
        e.preventDefault();
        post('/avisos', { forceFormData: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Novo aviso — ONDAKA" />
            <div className="p-6 md:p-8 max-w-3xl mx-auto">
                <Link
                    href="/avisos"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-200 text-sm mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar à lista
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                        <Megaphone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">Novo aviso</h1>
                        <p className="text-sm text-zinc-500">Comunique com os condóminos do condomínio</p>
                    </div>
                </div>

                <form onSubmit={submeter} className="space-y-5">
                    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5 space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs text-zinc-400">Condomínios *</label>
                                <button
                                    type="button"
                                    onClick={toggleTodos}
                                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                                >
                                    {todosSelecionados ? 'Limpar seleção' : 'Selecionar todos'}
                                </button>
                            </div>
                            <div className="max-h-56 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 divide-y divide-zinc-800">
                                {condominios.length === 0 ? (
                                    <p className="text-sm text-zinc-500 p-3">Sem condomínios disponíveis.</p>
                                ) : (
                                    condominios.map((c) => {
                                        const marcado = (data.condominio_ids as number[]).includes(c.id);
                                        return (
                                            <label
                                                key={c.id}
                                                className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-900 transition-colors ${marcado ? 'bg-cyan-500/5' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={marcado}
                                                    onChange={() => toggleCondominio(c.id)}
                                                    className="rounded border-zinc-700"
                                                />
                                                <span className="text-sm text-zinc-200">{c.nome}</span>
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                                {(data.condominio_ids as number[]).length} condomínio(s) selecionado(s)
                            </p>
                            {errors.condominio_ids && <p className="text-xs text-red-400 mt-1">{errors.condominio_ids}</p>}
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Título *</label>
                            <input
                                type="text"
                                value={data.titulo}
                                onChange={(e) => setData('titulo', e.target.value)}
                                placeholder="Ex: Corte de água programado"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                maxLength={200}
                                required
                            />
                            {errors.titulo && <p className="text-xs text-red-400 mt-1">{errors.titulo}</p>}
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Descrição *</label>
                            <textarea
                                value={data.descricao}
                                onChange={(e) => setData('descricao', e.target.value)}
                                placeholder="Descreva o aviso..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 min-h-[140px]"
                                required
                            />
                            {errors.descricao && <p className="text-xs text-red-400 mt-1">{errors.descricao}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Categoria</label>
                                <select
                                    value={data.categoria}
                                    onChange={(e) => setData('categoria', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                >
                                    {CATEGORIAS.map((c) => (
                                        <option key={c.v} value={c.v}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Prioridade</label>
                                <select
                                    value={data.prioridade}
                                    onChange={(e) => setData('prioridade', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                >
                                    {PRIORIDADES.map((p) => (
                                        <option key={p.v} value={p.v}>{p.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Segmentação */}
                    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
                        <div className="flex items-center gap-2 mb-2 text-zinc-200 text-sm font-semibold">
                            <Users className="h-4 w-4" />
                            Destinatários
                        </div>
                        <p className="text-xs text-zinc-500">
                            Este aviso será enviado a <span className="text-zinc-300 font-medium">todos os condóminos</span> do condomínio selecionado.
                        </p>
                        {errors.segmentacoes && <p className="text-xs text-red-400 mt-1">{errors.segmentacoes}</p>}
                    </div>

                    {/* Opções de notificação */}
                    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5 space-y-3">
                        <p className="text-sm font-semibold text-zinc-200 mb-1">Notificações</p>
                        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                            <input type="checkbox" checked={data.notificar_push} onChange={(e) => setData('notificar_push', e.target.checked)} className="rounded" />
                            Enviar notificação push (telemóvel)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                            <input type="checkbox" checked={data.notificar_email} onChange={(e) => setData('notificar_email', e.target.checked)} className="rounded" />
                            Enviar por email
                        </label>
                        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                            <input type="checkbox" checked={data.notificar_sms} onChange={(e) => setData('notificar_sms', e.target.checked)} className="rounded" />
                            Enviar por SMS
                        </label>
                        <div className="border-t border-zinc-800 pt-3 space-y-3">
                            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                                <input type="checkbox" checked={data.permite_comentarios} onChange={(e) => setData('permite_comentarios', e.target.checked)} className="rounded" />
                                Permitir comentários
                            </label>
                            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                                <input type="checkbox" checked={data.requer_confirmacao} onChange={(e) => setData('requer_confirmacao', e.target.checked)} className="rounded" />
                                Exigir confirmação de leitura
                            </label>
                        </div>
                    </div>

                    {/* Anexos */}
                    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
                        <div className="flex items-center gap-2 mb-2 text-zinc-200 text-sm font-semibold">
                            <Paperclip className="h-4 w-4" />
                            Anexos <span className="text-xs text-zinc-500 font-normal">(máx. 5, até 10MB cada)</span>
                        </div>
                        <input
                            type="file"
                            multiple
                            onChange={onFicheiros}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                            className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-zinc-200 hover:file:bg-zinc-700"
                        />
                        {ficheiros.length > 0 && (
                            <ul className="mt-3 space-y-2">
                                {ficheiros.map((f, i) => (
                                    <li key={i} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300">
                                        <span className="truncate">{f.name}</span>
                                        <button type="button" onClick={() => removerFicheiro(i)} className="text-zinc-500 hover:text-zinc-300 flex-shrink-0">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {errors.anexos && <p className="text-xs text-red-400 mt-1">{errors.anexos}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <Link href="/avisos" className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 text-sm">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || (data.condominio_ids as number[]).length === 0}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'A criar...' : 'Criar aviso'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
