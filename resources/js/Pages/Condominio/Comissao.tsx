import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Users, Trash2, Plus, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Membro { id: number; user_id: number; nome: string | null; email: string | null; }
interface Condomino { id: number; name: string; email: string | null; }
interface Props {
    condominio: { id: number; nome: string; exige_aprovacao_comissao: boolean };
    membros: Membro[];
    condominosDisponiveis: Condomino[];
}

export default function Comissao({ condominio, membros, condominosDisponiveis }: Props) {
    const [seleccionado, setSeleccionado] = useState<number | null>(null);

    const toggleRegra = (valor: boolean) => {
        router.patch(`/condominios/${condominio.id}/comissao/regra`, { exige_aprovacao_comissao: valor }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Regra actualizada.'),
        });
    };

    const adicionar = () => {
        if (!seleccionado) { toast.error('Escolha um condómino.'); return; }
        router.post(`/condominios/${condominio.id}/comissao/membros`, { user_id: seleccionado }, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Membro adicionado.'); setSeleccionado(null); },
        });
    };

    const remover = (m: Membro) => {
        if (!confirm(`Remover ${m.nome} da comissão?`)) return;
        router.delete(`/condominios/${condominio.id}/comissao/membros/${m.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Membro removido.'),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Comissão de Moradores — ${condominio.nome}`} />
            <div className="p-6 md:p-8 max-w-3xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">Comissão de Moradores</h1>
                        <p className="text-sm text-zinc-500">{condominio.nome}</p>
                    </div>
                </div>

                {/* Toggle da regra */}
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5 mb-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-zinc-100 font-medium">
                                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                                Exigir aprovação da comissão para despesas
                            </div>
                            <p className="text-sm text-zinc-500 mt-1">
                                Quando ligado, as despesas deste condomínio só podem ser aprovadas por um membro da comissão (na app). Desligado, o gestor aprova normalmente.
                            </p>
                        </div>
                        <button
                            onClick={() => toggleRegra(!condominio.exige_aprovacao_comissao)}
                            className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${condominio.exige_aprovacao_comissao ? 'bg-cyan-500' : 'bg-zinc-700'}`}
                            aria-pressed={condominio.exige_aprovacao_comissao}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${condominio.exige_aprovacao_comissao ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Adicionar membro */}
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5 mb-4">
                    <label className="text-xs text-white/60 uppercase tracking-wide block mb-2">Adicionar membro (condómino)</label>
                    <div className="flex gap-2">
                        <select
                            value={seleccionado ?? ''}
                            onChange={(e) => setSeleccionado(e.target.value ? parseInt(e.target.value) : null)}
                            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
                        >
                            <option value="">— Escolher condómino —</option>
                            {condominosDisponiveis.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}{c.email ? ` (${c.email})` : ''}</option>
                            ))}
                        </select>
                        <button onClick={adicionar} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 text-sm font-medium">
                            <Plus className="h-4 w-4" /> Adicionar
                        </button>
                    </div>
                    {condominosDisponiveis.length === 0 && (
                        <p className="text-xs text-white/40 mt-2">Não há condóminos disponíveis para adicionar (ou já estão todos na comissão).</p>
                    )}
                </div>

                {/* Lista de membros */}
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                    <div className="px-5 py-3 border-b border-zinc-800 text-sm text-white/70 font-medium">
                        Membros da comissão ({membros.length})
                    </div>
                    {membros.length === 0 ? (
                        <div className="px-5 py-8 text-center text-sm text-white/40">Ainda sem membros na comissão.</div>
                    ) : (
                        <ul className="divide-y divide-zinc-800">
                            {membros.map((m) => (
                                <li key={m.id} className="flex items-center justify-between px-5 py-3">
                                    <div>
                                        <div className="text-sm text-zinc-100">{m.nome}</div>
                                        {m.email && <div className="text-xs text-white/40">{m.email}</div>}
                                    </div>
                                    <button onClick={() => remover(m)} className="p-1.5 rounded text-red-400 hover:bg-red-500/10" title="Remover">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
