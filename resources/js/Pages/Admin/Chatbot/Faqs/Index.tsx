import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, FormEvent, useEffect, KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Plus,
    Pencil,
    Trash2,
    GripVertical,
    Power,
    PowerOff,
    Eye,
    X,
    Save,
    MessageSquare,
    Tag,
} from 'lucide-react';

interface Faq {
    id: number;
    condominio_id: number;
    categoria: string | null;
    pergunta: string;
    resposta: string;
    palavras_chave: string[] | null;
    formato: 'texto' | 'markdown';
    ordem: number;
    activa: boolean;
}

interface Props {
    faqs: Faq[];
    categoriasExistentes: string[];
}

export default function Index({ faqs: initialFaqs, categoriasExistentes }: Props) {
    const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
    const [draggedId, setDraggedId] = useState<number | null>(null);

    // Form state
    const [pergunta, setPergunta] = useState('');
    const [resposta, setResposta] = useState('');
    const [categoria, setCategoria] = useState('');
    const [categoriaCustom, setCategoriaCustom] = useState('');
    const [usaCategoriaCustom, setUsaCategoriaCustom] = useState(false);
    const [formato, setFormato] = useState<'texto' | 'markdown'>('markdown');
    const [activa, setActiva] = useState(true);
    const [palavrasChave, setPalavrasChave] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setFaqs(initialFaqs);
    }, [initialFaqs]);

    const abrirModalNovo = () => {
        setEditingFaq(null);
        setPergunta('');
        setResposta('');
        setCategoria('');
        setCategoriaCustom('');
        setUsaCategoriaCustom(false);
        setFormato('markdown');
        setActiva(true);
        setPalavrasChave([]);
        setTagInput('');
        setShowPreview(false);
        setModalOpen(true);
    };

    const abrirModalEditar = (faq: Faq) => {
        setEditingFaq(faq);
        setPergunta(faq.pergunta);
        setResposta(faq.resposta);
        const cat = faq.categoria || '';
        if (cat && !categoriasExistentes.includes(cat)) {
            setUsaCategoriaCustom(true);
            setCategoriaCustom(cat);
            setCategoria('');
        } else {
            setUsaCategoriaCustom(false);
            setCategoria(cat);
            setCategoriaCustom('');
        }
        setFormato(faq.formato);
        setActiva(faq.activa);
        setPalavrasChave(faq.palavras_chave || []);
        setTagInput('');
        setShowPreview(false);
        setModalOpen(true);
    };

    const fecharModal = () => {
        setModalOpen(false);
        setEditingFaq(null);
    };

    const getCsrf = () =>
        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

    const adicionarTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (!tag || palavrasChave.includes(tag) || palavrasChave.length >= 10) {
            return;
        }
        if (tag.length > 50) {
            alert('Palavra-chave muito longa (máximo 50 caracteres).');
            return;
        }
        setPalavrasChave([...palavrasChave, tag]);
        setTagInput('');
    };

    const removerTag = (tag: string) => {
        setPalavrasChave(palavrasChave.filter((t) => t !== tag));
    };

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            adicionarTag();
        } else if (e.key === 'Backspace' && tagInput === '' && palavrasChave.length > 0) {
            // Apaga última tag se input vazio
            setPalavrasChave(palavrasChave.slice(0, -1));
        }
    };

    const guardar = async (e: FormEvent) => {
        e.preventDefault();
        if (saving) return;
        if (!pergunta.trim() || !resposta.trim()) {
            alert('Pergunta e resposta são obrigatórias.');
            return;
        }

        setSaving(true);

        const cat = usaCategoriaCustom ? categoriaCustom.trim() : categoria;

        const payload = {
            pergunta: pergunta.trim(),
            resposta: resposta,
            categoria: cat || null,
            palavras_chave: palavrasChave,
            formato,
            activa,
        };

        try {
            const url = editingFaq
                ? `/admin/chatbot/faqs/${editingFaq.id}`
                : '/admin/chatbot/faqs';
            const method = editingFaq ? 'PUT' : 'POST';

            const r = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });

            const data = await r.json();
            if (!r.ok || !data.success) {
                alert(data.message || 'Erro ao guardar.');
                return;
            }

            fecharModal();
            router.reload({ only: ['faqs', 'categoriasExistentes'] });
        } catch (err) {
            alert('Erro de ligação.');
        } finally {
            setSaving(false);
        }
    };

    const toggleFaq = async (faq: Faq) => {
        try {
            const r = await fetch(`/admin/chatbot/faqs/${faq.id}/toggle`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                },
                credentials: 'same-origin',
            });
            if (r.ok) {
                router.reload({ only: ['faqs'] });
            }
        } catch (err) {
            alert('Erro ao alterar estado.');
        }
    };

    const eliminarFaq = async (faq: Faq) => {
        if (!confirm(`Eliminar a FAQ "${faq.pergunta.substring(0, 60)}..."?`)) return;
        try {
            const r = await fetch(`/admin/chatbot/faqs/${faq.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                },
                credentials: 'same-origin',
            });
            if (r.ok) {
                router.reload({ only: ['faqs'] });
            }
        } catch (err) {
            alert('Erro ao eliminar.');
        }
    };

    const handleDragStart = (id: number) => setDraggedId(id);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = async (targetId: number) => {
        if (!draggedId || draggedId === targetId) return;
        const draggedIdx = faqs.findIndex((f) => f.id === draggedId);
        const targetIdx = faqs.findIndex((f) => f.id === targetId);
        if (draggedIdx < 0 || targetIdx < 0) return;

        const newFaqs = [...faqs];
        const [moved] = newFaqs.splice(draggedIdx, 1);
        newFaqs.splice(targetIdx, 0, moved);
        setFaqs(newFaqs);

        try {
            await fetch('/admin/chatbot/faqs/reorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                },
                credentials: 'same-origin',
                body: JSON.stringify({ ids: newFaqs.map((f) => f.id) }),
            });
        } catch (err) {
            alert('Erro ao reordenar.');
            setFaqs(initialFaqs);
        }
        setDraggedId(null);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-zinc-100">
                    Chatbot — FAQs do Condomínio
                </h2>
            }
        >
            <Head title="Chatbot FAQs" />

            <div className="py-6">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-zinc-400">
                            FAQs específicas deste condomínio. Aparecem no Chatbot dos condóminos.
                        </p>
                        <button
                            onClick={abrirModalNovo}
                            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
                        >
                            <Plus className="h-4 w-4" />
                            Nova FAQ
                        </button>
                    </div>

                    {faqs.length === 0 ? (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
                            <MessageSquare className="mx-auto h-12 w-12 text-zinc-600" />
                            <h3 className="mt-4 text-lg font-medium text-zinc-100">
                                Sem FAQs ainda
                            </h3>
                            <p className="mt-2 text-sm text-zinc-400">
                                Cria a primeira FAQ para os condóminos verem no Chatbot.
                            </p>
                            <button
                                onClick={abrirModalNovo}
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
                            >
                                <Plus className="h-4 w-4" />
                                Nova FAQ
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                            <table className="w-full">
                                <thead className="border-b border-zinc-800 bg-zinc-950">
                                    <tr>
                                        <th className="w-10 px-2 py-3"></th>
                                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                                            Categoria
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                                            Pergunta
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                                            Palavras-chave
                                        </th>
                                        <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-400">
                                            Estado
                                        </th>
                                        <th className="w-32 px-3 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {faqs.map((faq) => (
                                        <tr
                                            key={faq.id}
                                            draggable
                                            onDragStart={() => handleDragStart(faq.id)}
                                            onDragOver={handleDragOver}
                                            onDrop={() => handleDrop(faq.id)}
                                            className={`hover:bg-zinc-850 ${
                                                draggedId === faq.id ? 'opacity-50' : ''
                                            } ${!faq.activa ? 'opacity-60' : ''}`}
                                        >
                                            <td className="px-2 py-3 text-center">
                                                <GripVertical className="mx-auto h-4 w-4 cursor-move text-zinc-600" />
                                            </td>
                                            <td className="px-3 py-3">
                                                {faq.categoria ? (
                                                    <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-300">
                                                        {faq.categoria}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-zinc-600">—</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-sm text-zinc-100">
                                                {faq.pergunta}
                                            </td>
                                            <td className="px-3 py-3">
                                                {faq.palavras_chave && faq.palavras_chave.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {faq.palavras_chave.slice(0, 3).map((kw) => (
                                                            <span
                                                                key={kw}
                                                                className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-xs text-cyan-300"
                                                            >
                                                                {kw}
                                                            </span>
                                                        ))}
                                                        {faq.palavras_chave.length > 3 && (
                                                            <span className="text-xs text-zinc-500">
                                                                +{faq.palavras_chave.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-zinc-600">—</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <button
                                                    onClick={() => toggleFaq(faq)}
                                                    title={faq.activa ? 'Desactivar' : 'Activar'}
                                                    className="inline-flex items-center"
                                                >
                                                    {faq.activa ? (
                                                        <Power className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <PowerOff className="h-4 w-4 text-zinc-600" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => abrirModalEditar(faq)}
                                                        className="rounded p-1.5 text-cyan-400 hover:bg-cyan-500/10"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarFaq(faq)}
                                                        className="rounded p-1.5 text-red-400 hover:bg-red-500/10"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Criar/Editar */}
            {modalOpen && (
                <>
                    <div
                        onClick={fecharModal}
                        className="fixed inset-0 z-40 bg-black/60"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
                            <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">
                                    {editingFaq ? 'Editar FAQ' : 'Nova FAQ'}
                                </h3>
                                <button onClick={fecharModal} className="text-zinc-400 hover:text-white">
                                    <X className="h-5 w-5" />
                                </button>
                            </header>

                            <form onSubmit={guardar} className="max-h-[calc(90vh-130px)] overflow-y-auto p-6 space-y-4">
                                {/* Categoria */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-200">
                                        Categoria
                                    </label>
                                    {!usaCategoriaCustom ? (
                                        <div className="flex gap-2">
                                            <select
                                                value={categoria}
                                                onChange={(e) => setCategoria(e.target.value)}
                                                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                                            >
                                                <option value="">— Sem categoria —</option>
                                                {categoriasExistentes.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => setUsaCategoriaCustom(true)}
                                                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700"
                                            >
                                                + Outra
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={categoriaCustom}
                                                onChange={(e) => setCategoriaCustom(e.target.value)}
                                                placeholder="Nova categoria..."
                                                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                                                maxLength={100}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUsaCategoriaCustom(false);
                                                    setCategoriaCustom('');
                                                }}
                                                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Pergunta */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-200">
                                        Pergunta *
                                    </label>
                                    <input
                                        type="text"
                                        value={pergunta}
                                        onChange={(e) => setPergunta(e.target.value)}
                                        placeholder="Ex: A piscina abre a que horas?"
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                                        maxLength={500}
                                        required
                                    />
                                </div>

                                {/* Palavras-chave */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-200">
                                        <Tag className="mr-1 inline h-3 w-3" />
                                        Palavras-chave (ajuda o chatbot a encontrar)
                                    </label>
                                    <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-2">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {palavrasChave.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="flex items-center gap-1 rounded bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removerTag(tag)}
                                                        className="ml-0.5 hover:text-white"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleTagKeyDown}
                                                onBlur={adicionarTag}
                                                placeholder={
                                                    palavrasChave.length === 0
                                                        ? 'Ex: piscina, horário, reserva (Enter ou vírgula para adicionar)'
                                                        : 'Adicionar mais...'
                                                }
                                                className="flex-1 min-w-[200px] bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
                                                maxLength={50}
                                            />
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        {palavrasChave.length}/10 palavras. Pressiona Enter ou vírgula para adicionar. Backspace remove última.
                                    </p>
                                </div>

                                {/* Resposta + Preview */}
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="block text-sm font-medium text-zinc-200">
                                            Resposta * ({formato === 'markdown' ? 'Markdown' : 'Texto simples'})
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowPreview(!showPreview)}
                                            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                                        >
                                            <Eye className="h-3 w-3" />
                                            {showPreview ? 'Ocultar preview' : 'Ver preview'}
                                        </button>
                                    </div>
                                    <textarea
                                        value={resposta}
                                        onChange={(e) => setResposta(e.target.value)}
                                        rows={10}
                                        placeholder={
                                            formato === 'markdown'
                                                ? '**Resposta com Markdown**\n\n- Lista com bullets\n- Outra dica\n\n> Bloco importante'
                                                : 'Resposta em texto simples.'
                                        }
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white"
                                        required
                                    />
                                    {showPreview && (
                                        <div className="mt-3 rounded-lg border border-cyan-500/30 bg-zinc-950 p-4">
                                            <div className="mb-2 text-xs font-medium text-cyan-400">
                                                Preview:
                                            </div>
                                            {formato === 'markdown' ? (
                                                <div className="prose prose-invert prose-sm max-w-none text-sm text-zinc-100">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            p: (p) => <p className="mb-2" {...p} />,
                                                            strong: (p) => (
                                                                <strong className="font-semibold text-white" {...p} />
                                                            ),
                                                            ul: (p) => (
                                                                <ul className="mb-2 ml-2 list-inside list-disc space-y-1" {...p} />
                                                            ),
                                                            ol: (p) => (
                                                                <ol className="mb-2 ml-2 list-inside list-decimal space-y-1" {...p} />
                                                            ),
                                                            blockquote: (p) => (
                                                                <blockquote
                                                                    className="my-2 border-l-4 border-cyan-500/50 bg-cyan-500/5 py-2 pl-3 italic"
                                                                    {...p}
                                                                />
                                                            ),
                                                            code: (p) => (
                                                                <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-cyan-400" {...p} />
                                                            ),
                                                        }}
                                                    >
                                                        {resposta || '*(vazio)*'}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-line text-sm text-zinc-100">
                                                    {resposta || '(vazio)'}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Formato + Activa */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-zinc-200">
                                            Formato
                                        </label>
                                        <select
                                            value={formato}
                                            onChange={(e) => setFormato(e.target.value as 'texto' | 'markdown')}
                                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                                        >
                                            <option value="markdown">Markdown (recomendado)</option>
                                            <option value="texto">Texto simples</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-zinc-200">
                                            Estado
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white">
                                            <input
                                                type="checkbox"
                                                checked={activa}
                                                onChange={(e) => setActiva(e.target.checked)}
                                                className="rounded border-zinc-600 bg-zinc-900 text-cyan-500"
                                            />
                                            <span>Activa (visível no Chatbot)</span>
                                        </label>
                                    </div>
                                </div>
                            </form>

                            <footer className="flex items-center justify-end gap-2 border-t border-zinc-800 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={fecharModal}
                                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={guardar}
                                    disabled={saving}
                                    className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" />
                                    {saving ? 'A guardar...' : 'Guardar'}
                                </button>
                            </footer>
                        </div>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}
