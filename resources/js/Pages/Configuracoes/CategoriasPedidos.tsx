import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Tag, Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Categoria {
    id: number;
    nome: string;
    slug: string;
    icone: string | null;
    tipo: 'particular' | 'publico';
    ordem: number;
    ativo: boolean;
    created_at: string;
}

interface PageProps {
    categorias: Categoria[];
}

export default function CategoriasPedidos({ categorias }: PageProps) {
    const [tipoActivo, setTipoActivo] = useState<'particular' | 'publico'>('particular');
    const [modal, setModal] = useState<null | { tipo: 'novo' | 'editar'; cat?: Categoria }>(null);

    const filtradas = categorias.filter((c) => c.tipo === tipoActivo);

    const toggle = (cat: Categoria) => {
        router.patch(`/configuracoes/categorias-pedidos/${cat.id}`, {
            nome: cat.nome,
            icone: cat.icone,
            ordem: cat.ordem,
            ativo: !cat.ativo,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Estado actualizado.'),
        });
    };

    const eliminar = (cat: Categoria) => {
        if (!confirm(`Eliminar categoria "${cat.nome}"?`)) return;
        router.delete(`/configuracoes/categorias-pedidos/${cat.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Categoria removida.'),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Categorias de Pedidos — ONDAKA" />
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                            <Tag className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">Categorias de Pedidos de Intervenção</h1>
                            <p className="text-sm text-zinc-500">{categorias.length} categorias configuradas</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setModal({ tipo: 'novo' })}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-4 py-2 text-sm font-medium shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        Nova categoria
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-4 border-b border-zinc-800">
                    <button
                        onClick={() => setTipoActivo('particular')}
                        className={`px-4 py-2 text-sm font-medium ${tipoActivo === 'particular' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        🔒 Particular ({categorias.filter((c) => c.tipo === 'particular').length})
                    </button>
                    <button
                        onClick={() => setTipoActivo('publico')}
                        className={`px-4 py-2 text-sm font-medium ${tipoActivo === 'publico' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        🌐 Público ({categorias.filter((c) => c.tipo === 'publico').length})
                    </button>
                </div>

                {/* Tabela */}
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-900/80 border-b border-zinc-800">
                            <tr>
                                <th className="text-left px-4 py-2 text-zinc-400 text-xs uppercase">Ordem</th>
                                <th className="text-left px-4 py-2 text-zinc-400 text-xs uppercase">Nome</th>
                                <th className="text-left px-4 py-2 text-zinc-400 text-xs uppercase">Ícone</th>
                                <th className="text-left px-4 py-2 text-zinc-400 text-xs uppercase">Activo</th>
                                <th className="text-right px-4 py-2 text-zinc-400 text-xs uppercase">Acções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.map((cat) => (
                                <tr key={cat.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/40">
                                    <td className="px-4 py-3 text-zinc-500">{cat.ordem}</td>
                                    <td className="px-4 py-3 text-zinc-200 font-medium">{cat.nome}</td>
                                    <td className="px-4 py-3 text-zinc-500">{cat.icone ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => toggle(cat)}>
                                            {cat.ativo ? (
                                                <ToggleRight className="h-5 w-5 text-emerald-400" />
                                            ) : (
                                                <ToggleLeft className="h-5 w-5 text-zinc-600" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => setModal({ tipo: 'editar', cat })} className="text-zinc-400 hover:text-zinc-200 mr-2">
                                            <Pencil className="h-4 w-4 inline" />
                                        </button>
                                        <button onClick={() => eliminar(cat)} className="text-red-400 hover:text-red-300">
                                            <Trash2 className="h-4 w-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtradas.length === 0 && (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Nenhuma categoria deste tipo.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && <ModalCategoria modal={modal} tipoActivo={tipoActivo} onClose={() => setModal(null)} />}
        </AuthenticatedLayout>
    );
}

function ModalCategoria({ modal, tipoActivo, onClose }: { modal: { tipo: 'novo' | 'editar'; cat?: Categoria }; tipoActivo: 'particular' | 'publico'; onClose: () => void }) {
    const cat = modal.cat;
    const [nome, setNome] = useState(cat?.nome ?? '');
    const [icone, setIcone] = useState(cat?.icone ?? 'Tag');
    const [ordem, setOrdem] = useState<number>(cat?.ordem ?? 50);
    const [ativo, setAtivo] = useState(cat?.ativo ?? true);
    const [enviando, setEnviando] = useState(false);

    const submit = () => {
        if (!nome.trim()) {
            toast.error('Nome obrigatório.');
            return;
        }
        setEnviando(true);
        if (modal.tipo === 'novo') {
            router.post('/configuracoes/categorias-pedidos', { nome, tipo: tipoActivo, icone, ordem }, {
                preserveScroll: true,
                onSuccess: () => { toast.success('Criada.'); onClose(); },
                onFinish: () => setEnviando(false),
            });
        } else {
            router.patch(`/configuracoes/categorias-pedidos/${cat!.id}`, { nome, icone, ordem, ativo }, {
                preserveScroll: true,
                onSuccess: () => { toast.success('Actualizada.'); onClose(); },
                onFinish: () => setEnviando(false),
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md py-8 px-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white">
                        {modal.tipo === 'novo' ? `Nova categoria (${tipoActivo})` : 'Editar categoria'}
                    </h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Nome *</label>
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Ícone (Lucide name)</label>
                        <input type="text" value={icone} onChange={(e) => setIcone(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Ordem</label>
                        <input type="number" value={ordem} onChange={(e) => setOrdem(Number(e.target.value))} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" />
                    </div>
                    {modal.tipo === 'editar' && (
                        <label className="flex items-center gap-2 text-sm text-white/80">
                            <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
                            Activo
                        </label>
                    )}
                </div>
                <div className="p-5 border-t border-white/5 flex gap-2 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancelar</button>
                    <button onClick={submit} disabled={enviando} className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-semibold disabled:opacity-50">
                        {enviando ? 'A guardar...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
