import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, FormEvent } from 'react';
import { Check, X, Plus, Edit, Trash2, ArrowLeft, Tag } from 'lucide-react';

type Categoria = {
    id: number;
    nome: string;
    slug: string;
    icone: string | null;
    cor: string | null;
    ordem: number;
    activa: boolean;
    despesas_count: number;
};

type Props = { categorias: Categoria[] };

const COR_PADRAO = ['#a855f7', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#facc15', '#ec4899'];

export default function CategoriasIndex({ categorias }: Props) {
    const [modalNova, setModalNova] = useState(false);
    const [editando, setEditando] = useState<Categoria | null>(null);

    const formNova = useForm({
        nome: '',
        icone: '',
        cor: COR_PADRAO[0],
        activa: true,
    });

    const formEditar = useForm({
        nome: '',
        icone: '',
        cor: '',
        activa: true,
    });

    const submitNova = (e: FormEvent) => {
        e.preventDefault();
        formNova.post('/despesas/categorias', {
            preserveScroll: true,
            onSuccess: () => { formNova.reset(); formNova.setData('cor', COR_PADRAO[0]); setModalNova(false); },
        });
    };

    const abrirEditar = (c: Categoria) => {
        formEditar.setData({
            nome: c.nome,
            icone: c.icone ?? '',
            cor: c.cor ?? COR_PADRAO[0],
            activa: c.activa,
        });
        setEditando(c);
    };

    const submitEditar = (e: FormEvent) => {
        e.preventDefault();
        if (!editando) return;
        formEditar.put(`/despesas/categorias/${editando.id}`, {
            preserveScroll: true,
            onSuccess: () => { setEditando(null); formEditar.reset(); },
        });
    };

    const eliminar = (c: Categoria) => {
        if (c.despesas_count > 0) {
            window.alert(`Esta categoria tem ${c.despesas_count} despesa(s) associada(s). Desactive-a em vez de eliminar.`);
            return;
        }
        if (!window.confirm(`Eliminar a categoria "${c.nome}"?`)) return;
        router.delete(`/despesas/categorias/${c.id}`, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Categorias de Despesas" />

            <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
                <Link href="/despesas" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
                    <ArrowLeft className="h-4 w-4" /> Voltar a despesas
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium text-white flex items-center gap-2">
                            <Tag className="h-6 w-6 text-purple-400" />
                            Categorias de Despesas
                        </h1>
                        <p className="text-sm text-white/50 mt-1">Organize as despesas em categorias personalizadas.</p>
                    </div>
                    <button
                        onClick={() => setModalNova(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium"
                        style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)' }}
                    >
                        <Plus className="h-4 w-4" /> Nova categoria
                    </button>
                </div>

                <div className="rounded-lg border border-white/10 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr className="text-left text-[10px] uppercase tracking-wider text-white/50">
                                <th className="px-3 py-2.5 w-10">Cor</th>
                                <th className="px-3 py-2.5">Nome</th>
                                <th className="px-3 py-2.5">Slug</th>
                                <th className="px-3 py-2.5 text-center">Despesas</th>
                                <th className="px-3 py-2.5 text-center">Activa</th>
                                <th className="px-3 py-2.5 text-right">Acções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categorias.length === 0 && (
                                <tr><td colSpan={6} className="px-3 py-12 text-center text-white/40 text-sm">Sem categorias.</td></tr>
                            )}
                            {categorias.map(c => (
                                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="px-3 py-2.5">
                                        <span className="inline-block w-5 h-5 rounded" style={{ background: c.cor ?? '#a855f7' }} />
                                    </td>
                                    <td className="px-3 py-2.5 text-white font-medium">{c.nome}</td>
                                    <td className="px-3 py-2.5 text-white/40 text-xs font-mono">{c.slug}</td>
                                    <td className="px-3 py-2.5 text-center text-white/70 text-xs">{c.despesas_count}</td>
                                    <td className="px-3 py-2.5 text-center">
                                        {c.activa
                                            ? <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-green-500/15 text-green-300">Sim</span>
                                            : <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/40">Não</span>}
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => abrirEditar(c)} title="Editar" className="p-1.5 rounded text-white/50 hover:bg-white/10 hover:text-white">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => eliminar(c)} title="Eliminar" className="p-1.5 rounded text-red-300 hover:bg-red-500/10">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalNova && (
                <ModalCategoria
                    titulo="Nova categoria"
                    form={formNova}
                    onSubmit={submitNova}
                    onClose={() => { setModalNova(false); formNova.reset(); }}
                    submitLabel="Criar"
                />
            )}

            {editando && (
                <ModalCategoria
                    titulo={`Editar "${editando.nome}"`}
                    form={formEditar}
                    onSubmit={submitEditar}
                    onClose={() => { setEditando(null); formEditar.reset(); }}
                    submitLabel="Guardar"
                />
            )}
        </AuthenticatedLayout>
    );
}

function ModalCategoria({ titulo, form, onSubmit, onClose, submitLabel }: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#0F0F23] border border-purple-500/30 rounded-xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-base font-medium">{titulo}</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white p-1"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-3">
                    <div>
                        <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Nome</label>
                        <input type="text" required maxLength={80} value={form.data.nome} onChange={e => form.setData('nome', e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm" />
                    </div>
                    <div>
                        <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Cor</label>
                        <div className="flex flex-wrap gap-2">
                            {COR_PADRAO.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => form.setData('cor', c)}
                                    className={`w-7 h-7 rounded transition-all ${form.data.cor === c ? 'ring-2 ring-white scale-110' : ''}`}
                                    style={{ background: c }}
                                />
                            ))}
                        </div>
                        <input type="text" value={form.data.cor} onChange={e => form.setData('cor', e.target.value)} placeholder="#a855f7" className="w-full mt-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-white text-xs font-mono" />
                    </div>
                    <div>
                        <label className="text-[10px] text-white/60 uppercase tracking-wider mb-1 block">Ícone (opcional)</label>
                        <input type="text" maxLength={40} value={form.data.icone} onChange={e => form.setData('icone', e.target.value)} placeholder="ex: wrench, droplet, zap" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm" />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-white/90">
                        <input type="checkbox" checked={form.data.activa} onChange={e => form.setData('activa', e.target.checked)} className="rounded" />
                        Categoria activa
                    </label>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10">Cancelar</button>
                        <button type="submit" disabled={form.processing} className="px-5 py-2 rounded-md text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)' }}>
                            <Check className="inline h-4 w-4 mr-1 -mt-0.5" /> {form.processing ? 'A guardar...' : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
