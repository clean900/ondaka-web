import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Ban, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { FormEvent } from 'react';

interface Item {
    id: number;
    tipo: 'bi' | 'matricula' | 'nome';
    valor: string;
    motivo: string | null;
    partilhar_empresa: boolean;
    criado_em: string | null;
}

interface Props {
    itens: Item[];
}

const TIPO_LABEL: Record<string, string> = {
    bi: 'BI / Documento',
    matricula: 'Matrícula',
    nome: 'Nome',
};

export default function ListaNegra({ itens }: Props) {
    const form = useForm({
        tipo: 'bi',
        valor: '',
        motivo: '',
        partilhar_empresa: false as boolean,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(route('visitantes.lista-negra.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset('valor', 'motivo'),
        });
    };

    const remover = (id: number) => {
        if (!confirm('Remover este visitante da lista negra?')) return;
        router.delete(route('visitantes.lista-negra.destroy', id), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Lista Negra de Visitantes" />

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                        <Ban className="h-5 w-5 text-rose-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-100">Lista Negra de Visitantes</h1>
                        <p className="text-sm text-zinc-500">
                            Visitantes banidos por BI, matrícula ou nome. A portaria recebe um alerta — não bloqueia
                            automaticamente.
                        </p>
                    </div>
                </div>

                {/* Form de adição */}
                <form onSubmit={submit} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-4">Adicionar à lista</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Tipo</label>
                            <select
                                value={form.data.tipo}
                                onChange={(e) => form.setData('tipo', e.target.value as Item['tipo'])}
                                className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2 focus:border-cyan-500/50"
                            >
                                <option value="bi">BI / Documento</option>
                                <option value="matricula">Matrícula</option>
                                <option value="nome">Nome</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-zinc-400 mb-1">Valor</label>
                            <input
                                type="text"
                                value={form.data.valor}
                                onChange={(e) => form.setData('valor', e.target.value)}
                                placeholder="Ex.: 0012345LA042 ou LD-12-34-AB"
                                className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2 focus:border-cyan-500/50"
                            />
                            {form.errors.valor && <p className="text-xs text-rose-400 mt-1">{form.errors.valor}</p>}
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 text-xs text-zinc-300 pb-2">
                                <input
                                    type="checkbox"
                                    checked={form.data.partilhar_empresa}
                                    onChange={(e) => form.setData('partilhar_empresa', e.target.checked)}
                                    className="rounded bg-zinc-800 border-zinc-700 text-cyan-500"
                                />
                                Todos os condomínios
                            </label>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-xs text-zinc-400 mb-1">Motivo (opcional)</label>
                        <input
                            type="text"
                            value={form.data.motivo}
                            onChange={(e) => form.setData('motivo', e.target.value)}
                            placeholder="Ex.: agressão a guarda em 2026, furto..."
                            className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2 focus:border-cyan-500/50"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-500/90 hover:bg-rose-500 text-white font-medium px-4 py-2 text-sm disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar à lista negra
                    </button>
                </form>

                {/* Lista */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                    {itens.length === 0 ? (
                        <div className="p-10 text-center text-zinc-500">
                            <ShieldAlert className="h-10 w-10 mx-auto mb-3 text-zinc-700" />
                            Nenhum visitante na lista negra.
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-900 text-zinc-500 text-xs uppercase tracking-wide">
                                <tr>
                                    <th className="text-left px-4 py-3">Tipo</th>
                                    <th className="text-left px-4 py-3">Valor</th>
                                    <th className="text-left px-4 py-3">Motivo</th>
                                    <th className="text-left px-4 py-3">Âmbito</th>
                                    <th className="text-left px-4 py-3">Adicionado</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {itens.map((it) => (
                                    <tr key={it.id} className="border-t border-zinc-800/70">
                                        <td className="px-4 py-3 text-zinc-300">{TIPO_LABEL[it.tipo]}</td>
                                        <td className="px-4 py-3 text-zinc-100 font-medium">{it.valor}</td>
                                        <td className="px-4 py-3 text-zinc-400">{it.motivo || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">
                                                {it.partilhar_empresa ? 'Toda a empresa' : 'Condomínio'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-500 text-xs">{it.criado_em}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => remover(it.id)}
                                                className="text-zinc-500 hover:text-rose-400"
                                                title="Remover"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
