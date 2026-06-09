import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { FileBarChart, Users, Clock } from 'lucide-react';

interface Registo {
    id: number;
    user_nome: string;
    data: string;
    data_label: string;
    hora_checkin: string;
    hora_checkout: string | null;
    horas_trabalhadas: number;
    condominio_nome: string | null;
}

interface PorUser {
    user_id: number;
    user_nome: string;
    total_horas: number;
    total_registos: number;
}

interface PageProps {
    registos: Registo[];
    por_user: PorUser[];
    mes: string;
    is_admin: boolean;
}

export default function Relatorio({ registos, por_user, mes, is_admin }: PageProps) {
    const totalHoras = por_user.reduce((s, u) => s + u.total_horas, 0);
    const totalRegistos = registos.length;

    const mudarMes = (offset: number) => {
        const [a, m] = mes.split('-').map(Number);
        const d = new Date(a, m - 1 + offset, 1);
        const novo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        router.get('/turnos/relatorio', { mes: novo }, { preserveState: false });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Relatório de Horas — ONDAKA" />
            <div className="p-6 md:p-8 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center">
                            <FileBarChart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">Relatório de Horas</h1>
                            <p className="text-sm text-zinc-500">{mes}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => mudarMes(-1)} className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm text-zinc-300">‹ Mês anterior</button>
                        <button onClick={() => mudarMes(1)} className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm text-zinc-300">Mês seguinte ›</button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/5 border border-emerald-500/25 p-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-1.5"><Clock className="h-3 w-3" />Total de horas</p>
                        <p className="text-3xl font-bold text-emerald-300 mt-1">{totalHoras.toFixed(2)}h</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/5 border border-cyan-500/25 p-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-1.5"><Users className="h-3 w-3" />{is_admin ? 'Pessoas' : 'Os meus'}</p>
                        <p className="text-3xl font-bold text-cyan-300 mt-1">{por_user.length}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-purple-500/15 to-pink-500/5 border border-purple-500/25 p-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-1.5"><FileBarChart className="h-3 w-3" />Registos</p>
                        <p className="text-3xl font-bold text-purple-300 mt-1">{totalRegistos}</p>
                    </div>
                </div>

                {/* Por user */}
                {is_admin && por_user.length > 0 && (
                    <div className="mb-6 rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
                        <h2 className="text-sm font-semibold text-zinc-100 mb-3">Sumário por colaborador</h2>
                        <div className="space-y-2">
                            {por_user.sort((a, b) => b.total_horas - a.total_horas).map((u) => (
                                <div key={u.user_id} className="flex items-center justify-between py-2 border-b border-zinc-800/40 last:border-0">
                                    <div>
                                        <p className="text-sm text-zinc-200 font-medium">{u.user_nome}</p>
                                        <p className="text-xs text-zinc-500">{u.total_registos} {u.total_registos === 1 ? 'registo' : 'registos'}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-emerald-300">{u.total_horas.toFixed(2)}h</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lista de registos */}
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                    <h2 className="text-sm font-semibold text-zinc-100 p-4 border-b border-zinc-800">Detalhe dos registos</h2>
                    {registos.length === 0 ? (
                        <p className="text-center text-sm text-zinc-500 py-8">Sem registos para este mês.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-xs uppercase text-zinc-400">
                                <tr>
                                    <th className="text-left px-4 py-2">Data</th>
                                    {is_admin && <th className="text-left px-4 py-2">Colaborador</th>}
                                    <th className="text-left px-4 py-2 hidden md:table-cell">Local</th>
                                    <th className="text-center px-4 py-2">Horário</th>
                                    <th className="text-right px-4 py-2">Horas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registos.map((r) => (
                                    <tr key={r.id} className="border-b border-zinc-800/40 last:border-0">
                                        <td className="px-4 py-2 text-zinc-300">{r.data_label}</td>
                                        {is_admin && <td className="px-4 py-2 text-zinc-300">{r.user_nome}</td>}
                                        <td className="px-4 py-2 text-zinc-500 text-xs hidden md:table-cell">{r.condominio_nome ?? '—'}</td>
                                        <td className="px-4 py-2 text-center text-xs font-mono text-zinc-400">{r.hora_checkin}{r.hora_checkout && ` – ${r.hora_checkout}`}</td>
                                        <td className="px-4 py-2 text-right text-emerald-300 font-semibold">{r.horas_trabalhadas.toFixed(2)}h</td>
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
