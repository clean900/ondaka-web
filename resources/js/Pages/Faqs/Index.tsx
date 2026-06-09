import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { MessageSquare, Plus, Edit, Trash2, ThumbsUp, ThumbsDown, Filter } from 'lucide-react';
import { useState } from 'react';

interface Faq {
    id: number;
    pergunta: string;
    resposta: string;
    categoria: string;
    condominio: { id: number; nome: string } | null;
    activa: boolean;
    vezes_respondida: number;
    util_sim: number;
    util_nao: number;
    ordem: number;
}

interface Paginated<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
}

interface Props {
    faqs: Paginated<Faq>;
    condominios: Array<{ id: number; nome: string }>;
    filtros: { condominio_id: string | null; categoria: string | null };
}

const CATEGORIAS: Record<string, string> = {
    geral: 'Geral',
    financeiro: 'Financeiro',
    manutencao: 'Manutenção',
    assembleias: 'Assembleias',
    seguranca: 'Segurança',
    contactos: 'Contactos',
};

export default function FaqIndex({ faqs, condominios, filtros }: Props) {
    const [filtroCondominio, setFiltroCondominio] = useState(filtros.condominio_id || '');
    const [filtroCategoria, setFiltroCategoria] = useState(filtros.categoria || '');

    const aplicarFiltros = () => {
        router.get(route('faqs.index'), {
            condominio_id: filtroCondominio || undefined,
            categoria: filtroCategoria || undefined,
        }, { preserveState: true });
    };

    const apagar = (id: number) => {
        if (!confirm('Tens a certeza que queres apagar esta FAQ? Esta acção não pode ser desfeita.')) return;
        router.delete(route('faqs.destroy', id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="FAQs" />
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
                            <MessageSquare className="w-6 h-6 text-cyan-400" />
                            FAQs do Chatbot
                        </h1>
                        <p className="text-sm text-zinc-400 mt-1">
                            Perguntas frequentes que o chatbot responde automaticamente aos condóminos
                        </p>
                    </div>
                    <Link
                        href={route('faqs.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-4 py-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nova FAQ
                    </Link>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Filter className="w-4 h-4 text-zinc-500" />
                        <select
                            value={filtroCondominio}
                            onChange={(e) => setFiltroCondominio(e.target.value)}
                            className="px-3 py-1.5 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200"
                        >
                            <option value="">Todos os condomínios</option>
                            <option value="null">Apenas gerais</option>
                            {condominios.map((c) => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                        <select
                            value={filtroCategoria}
                            onChange={(e) => setFiltroCategoria(e.target.value)}
                            className="px-3 py-1.5 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200"
                        >
                            <option value="">Todas as categorias</option>
                            {Object.entries(CATEGORIAS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        <button
                            onClick={aplicarFiltros}
                            className="px-3 py-1.5 text-sm rounded border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200"
                        >
                            Aplicar
                        </button>
                    </div>
                </div>

                {faqs.data.length === 0 ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
                        <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-400 mb-2">Nenhuma FAQ cadastrada ainda.</p>
                        <p className="text-sm text-zinc-500 mb-4">
                            Cria a primeira FAQ para o chatbot começar a responder automaticamente.
                        </p>
                        <Link
                            href={route('faqs.create')}
                            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-4 py-2 text-sm"
                        >
                            <Plus className="w-4 h-4" /> Criar primeira FAQ
                        </Link>
                    </div>
                ) : (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-950/50 text-xs text-zinc-500 uppercase">
                                <tr>
                                    <th className="text-left p-3">Pergunta</th>
                                    <th className="text-left p-3">Categoria</th>
                                    <th className="text-left p-3">Condomínio</th>
                                    <th className="text-center p-3">Estado</th>
                                    <th className="text-center p-3">Uso</th>
                                    <th className="text-right p-3">Acções</th>
                                </tr>
                            </thead>
                            <tbody>
                                {faqs.data.map((f) => (
                                    <tr key={f.id} className="border-t border-zinc-800 hover:bg-zinc-900/50">
                                        <td className="p-3">
                                            <p className="text-zinc-200 font-medium">{f.pergunta}</p>
                                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{f.resposta}</p>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                                                {CATEGORIAS[f.categoria] || f.categoria}
                                            </span>
                                        </td>
                                        <td className="p-3 text-xs text-zinc-400">
                                            {f.condominio ? f.condominio.nome : <span className="italic text-zinc-600">Geral</span>}
                                        </td>
                                        <td className="p-3 text-center">
                                            {f.activa ? (
                                                <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">activa</span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 rounded bg-zinc-500/20 text-zinc-400">inactiva</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center text-xs text-zinc-400">
                                            <div>{f.vezes_respondida}x</div>
                                            {f.util_sim + f.util_nao > 0 && (
                                                <div className="flex items-center justify-center gap-2 mt-1">
                                                    <span className="flex items-center gap-0.5 text-emerald-400">
                                                        <ThumbsUp className="w-3 h-3" /> {f.util_sim}
                                                    </span>
                                                    <span className="flex items-center gap-0.5 text-rose-400">
                                                        <ThumbsDown className="w-3 h-3" /> {f.util_nao}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="inline-flex gap-1">
                                                <Link
                                                    href={route('faqs.edit', f.id)}
                                                    className="p-1.5 text-zinc-400 hover:text-cyan-400 rounded"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => apagar(f.id)}
                                                    className="p-1.5 text-zinc-400 hover:text-rose-400 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-3 text-xs text-zinc-500 border-t border-zinc-800">
                            {faqs.from || 0}-{faqs.to || 0} de {faqs.total}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
