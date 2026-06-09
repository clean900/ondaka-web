import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo, FormEvent } from 'react';
import { Shield, Plus, Search, Check, Lock, X } from 'lucide-react';

interface Role { id: number; name: string; permissions: number[]; }
interface Perm { id: number; name: string; grupo: string; }

interface Props {
    matriz: { roles: Role[]; permissions: Perm[] };
}

export default function Index({ matriz }: Props) {
    const [busca, setBusca] = useState('');
    const [modalCriar, setModalCriar] = useState(false);

    const permissionsFiltradas = useMemo(() => {
        if (!busca) return matriz.permissions;
        const t = busca.toLowerCase();
        return matriz.permissions.filter((p) => p.name.toLowerCase().includes(t));
    }, [busca, matriz.permissions]);

    const grupos = useMemo(() => {
        const g: Record<string, Perm[]> = {};
        permissionsFiltradas.forEach((p) => {
            if (!g[p.grupo]) g[p.grupo] = [];
            g[p.grupo].push(p);
        });
        return g;
    }, [permissionsFiltradas]);

    const toggle = (roleId: number, permissionId: number, atribuir: boolean) => {
        router.post(route('super-admin.permissoes.toggle'), {
            role_id: roleId,
            permission_id: permissionId,
            atribuir,
        }, { preserveScroll: true, preserveState: true });
    };

    const temPermissao = (role: Role, permId: number) => role.permissions.includes(permId);

    return (
        <AuthenticatedLayout>
            <Head title="Permissões" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Shield className="w-6 h-6 text-[#A855F7]" />
                        Permissões e Funções
                    </h1>
                    <p className="text-sm text-white/60 mt-1">
                        Configurar o que cada função pode fazer no sistema.
                    </p>
                </div>
                <button onClick={() => setModalCriar(true)} className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Nova permissão
                </button>
            </div>

            <div className="card-elevated mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input type="text" placeholder="Pesquisar permissão..."
                        value={busca} onChange={(e) => setBusca(e.target.value)}
                        className="input pl-10" />
                </div>
            </div>

            <div className="card-elevated overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left p-3 text-[10px] uppercase tracking-wider text-white/50 font-medium sticky left-0 bg-[#16163A] z-10">Permissão</th>
                            {matriz.roles.map((r) => (
                                <th key={r.id} className="text-center p-3 text-[10px] uppercase tracking-wider text-white/50 font-medium">
                                    {r.name.replace(/-/g, ' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(grupos).map(([grupo, perms]) => (
                            <>
                                <tr key={grupo} className="border-b border-white/5 bg-white/[0.02]">
                                    <td colSpan={matriz.roles.length + 1} className="px-3 py-2 text-[10px] uppercase tracking-wider text-[#00D4FF] font-semibold">
                                        {grupo}
                                    </td>
                                </tr>
                                {perms.map((p) => (
                                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="p-3 text-white/80 sticky left-0 bg-[#16163A]">
                                            <div className="flex items-center gap-2">
                                                <Lock className="w-3 h-3 text-white/30" />
                                                {p.name}
                                            </div>
                                        </td>
                                        {matriz.roles.map((r) => {
                                            const tem = temPermissao(r, p.id);
                                            return (
                                                <td key={r.id} className="p-3 text-center">
                                                    <button
                                                        onClick={() => toggle(r.id, p.id, !tem)}
                                                        className={`w-7 h-7 rounded-md inline-flex items-center justify-center transition ${
                                                            tem
                                                                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                                                                : 'bg-white/[0.02] border border-white/10 text-white/30 hover:bg-white/[0.05] hover:text-white/60'
                                                        }`}
                                                        title={tem ? 'Clica para remover' : 'Clica para atribuir'}
                                                    >
                                                        {tem && <Check className="w-3.5 h-3.5" />}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </>
                        ))}
                        {permissionsFiltradas.length === 0 && (
                            <tr>
                                <td colSpan={matriz.roles.length + 1} className="p-8 text-center text-white/40">
                                    Nenhuma permissão encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modalCriar && <ModalCriarPermissao onClose={() => setModalCriar(false)} />}
        </AuthenticatedLayout>
    );
}

function ModalCriarPermissao({ onClose }: { onClose: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({ nome: '' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('super-admin.permissoes.criar'), {
            onSuccess: () => { reset(); onClose(); },
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm py-8 px-4" onClick={onClose}>
            <div className="bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={submit}>
                    <div className="flex items-center justify-between p-5 border-b border-white/5">
                        <h2 className="text-lg font-semibold text-white">Nova permissão</h2>
                        <button type="button" onClick={onClose} className="text-white/40 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-5 space-y-3">
                        <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">Nome técnico *</label>
                        <input type="text" required placeholder="ex: condominios.edit"
                            className="input" value={data.nome}
                            onChange={(e) => setData('nome', e.target.value)} />
                        {errors.nome && <div className="text-xs text-red-400 mt-1">{errors.nome}</div>}
                        <div className="text-[10px] text-white/40">
                            Use formato `recurso.acao` (ex: condominios.create, users.edit, facturacao.view).
                        </div>
                    </div>
                    <div className="p-5 border-t border-white/5 flex gap-2 justify-end">
                        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
                        <button type="submit" disabled={processing} className="btn-primary">
                            <Plus className="w-4 h-4" />
                            {processing ? 'A criar...' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
