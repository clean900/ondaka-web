import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Users, Plus, Video, Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Assembleia {
    id: number;
    numero: string;
    titulo: string;
    tipo: string;
    tipo_label: string;
    modo: string;
    estado: string;
    estado_label: string;
    data_agendada: string;
    condominio: { id: number; nome: string } | null;
    total_participantes: number;
    presentes: number;
}

interface PageProps {
    assembleias: {
        data: Assembleia[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        meta?: { current_page: number; last_page: number; total: number };
    };
    condominios: Array<{ id: number; nome: string }>;
    filtros: { estado: string; condominio_id: number | null };
}

const ESTADO_CONFIG: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
    agendada: { color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', icon: Clock },
    em_curso: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: Video },
    concluida: { color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30', icon: CheckCircle2 },
    cancelada: { color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: XCircle },
    sem_quorum: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: AlertCircle },
};

export default function AssembleiasIndex({ assembleias, condominios, filtros }: PageProps) {
    const aplicar = (campo: string, valor: string) => {
        router.get('/assembleias', { ...filtros, [campo]: valor || undefined }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Assembleias — ONDAKA" />

            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">Assembleias</h1>
                            <p className="text-sm text-zinc-500">Convocação, realização e actas</p>
                        </div>
                    </div>

                    <Link
                        href="/assembleias/nova"
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Nova assembleia
                    </Link>
                </div>

                {/* Filtros */}
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 mb-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <select
                            value={filtros.estado}
                            onChange={(e) => aplicar('estado', e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                        >
                            <option value="">Todos estados</option>
                            <option value="agendada">Agendadas</option>
                            <option value="em_curso">Em curso</option>
                            <option value="concluida">Concluídas</option>
                            <option value="cancelada">Canceladas</option>
                            <option value="sem_quorum">Sem quórum</option>
                        </select>

                        <select
                            value={filtros.condominio_id ?? ''}
                            onChange={(e) => aplicar('condominio_id', e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                        >
                            <option value="">Todos condomínios</option>
                            {condominios.map((c) => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Lista */}
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                    {assembleias.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-400">Nenhuma assembleia registada</p>
                            <p className="text-xs text-zinc-600 mt-1">Clique em "Nova assembleia" para começar</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-950/50">
                                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold">Número</th>
                                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold">Título</th>
                                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold">Condomínio</th>
                                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold">Data</th>
                                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold">Presenças</th>
                                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold">Estado</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {assembleias.data.map((a) => {
                                    const cfg = ESTADO_CONFIG[a.estado] ?? ESTADO_CONFIG.agendada;
                                    const Icon = cfg.icon;
                                    const data = new Date(a.data_agendada);
                                    return (
                                        <tr key={a.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition">
                                            <td className="px-4 py-3 text-sm font-mono text-zinc-300">{a.numero}</td>
                                            <td className="px-4 py-3 text-sm text-zinc-200">
                                                <div>{a.titulo}</div>
                                                <div className="text-xs text-zinc-500 mt-0.5">{a.tipo_label} · {a.modo}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-400">{a.condominio?.nome ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-zinc-400 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                                                    {data.toLocaleDateString('pt-PT')}
                                                </div>
                                                <div className="text-xs text-zinc-500 mt-0.5">
                                                    {data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-400">
                                                {a.presentes} / {a.total_participantes}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${cfg.color}`}>
                                                    <Icon className="h-3 w-3" />
                                                    {a.estado_label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={`/assembleias/${a.id}`} className="text-xs text-cyan-400 hover:text-cyan-300">
                                                    Abrir →
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
