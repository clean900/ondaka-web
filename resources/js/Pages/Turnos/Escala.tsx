import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Escala {
    id: number;
    data: string;
    data_label: string;
    hora_inicio: string;
    hora_fim: string;
    estado: string;
    turno: { id: number; nome: string; cor_hex: string } | null;
    user: { id: number; name: string } | null;
    condominio: { id: number; nome: string } | null;
    observacoes: string | null;
}

interface TurnoModelo { id: number; nome: string; hora_inicio: string; hora_fim: string; cor_hex: string; }
interface UserEsc { id: number; name: string; }

interface PageProps {
    escalas: Escala[];
    turnos_modelo: TurnoModelo[];
    users_escalaveis: UserEsc[];
    semana_inicio: string;
    semana_fim: string;
    is_admin: boolean;
}

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const ESTADO_LABEL: Record<string, { label: string; cor: string }> = {
    agendado: { label: 'Agendado', cor: 'text-blue-300 bg-blue-500/10' },
    em_curso: { label: 'Em curso', cor: 'text-emerald-300 bg-emerald-500/10' },
    concluido: { label: 'Concluído', cor: 'text-zinc-400 bg-zinc-500/10' },
    falhou: { label: 'Falhou', cor: 'text-red-300 bg-red-500/10' },
    cancelado: { label: 'Cancelado', cor: 'text-zinc-500 bg-zinc-700/10' },
};

export default function Escala({ escalas, turnos_modelo, users_escalaveis, semana_inicio, semana_fim, is_admin }: PageProps) {
    const [modal, setModal] = useState(false);

    const navegarSemana = (offset: number) => {
        const d = new Date(semana_inicio);
        d.setDate(d.getDate() + offset * 7);
        const nova = d.toISOString().slice(0, 10);
        router.get('/turnos/escala', { semana: nova }, { preserveState: false });
    };

    const eliminar = (id: number) => {
        if (!confirm('Eliminar esta escala?')) return;
        router.delete(`/turnos/escala/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Escala removida.'),
        });
    };

    // Agrupar escalas por data
    const escalasPorDia: Record<string, Escala[]> = {};
    for (const e of escalas) {
        if (!escalasPorDia[e.data]) escalasPorDia[e.data] = [];
        escalasPorDia[e.data].push(e);
    }

    // 7 dias da semana
    const diasSemana: { data: string; label: string; dia: number }[] = [];
    const inicio = new Date(semana_inicio);
    for (let i = 0; i < 7; i++) {
        const d = new Date(inicio);
        d.setDate(d.getDate() + i);
        diasSemana.push({
            data: d.toISOString().slice(0, 10),
            label: DIAS_SEMANA[i],
            dia: d.getDate(),
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Escala de Turnos — ONDAKA" />
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">Escala de Turnos</h1>
                            <p className="text-sm text-zinc-500">Semana de {new Date(semana_inicio).toLocaleDateString('pt-PT')} a {new Date(semana_fim).toLocaleDateString('pt-PT')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => navegarSemana(-1)} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={() => navegarSemana(0)} className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm text-zinc-300">
                            Hoje
                        </button>
                        <button onClick={() => navegarSemana(1)} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        {is_admin && (
                            <button onClick={() => setModal(true)} className="ml-2 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium shadow-lg">
                                <Plus className="h-4 w-4" /> Agendar
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                    {diasSemana.map((d) => {
                        const lista = escalasPorDia[d.data] ?? [];
                        const hoje = d.data === new Date().toISOString().slice(0, 10);
                        return (
                            <div key={d.data} className={`rounded-xl bg-zinc-900/40 border ${hoje ? 'border-cyan-500/40' : 'border-zinc-800'} p-3`}>
                                <div className="flex items-baseline justify-between mb-3">
                                    <span className={`text-xs font-semibold uppercase ${hoje ? 'text-cyan-300' : 'text-zinc-400'}`}>{d.label}</span>
                                    <span className={`text-2xl font-bold ${hoje ? 'text-cyan-300' : 'text-zinc-200'}`}>{d.dia}</span>
                                </div>
                                <div className="space-y-2 min-h-[100px]">
                                    {lista.length === 0 && <p className="text-xs text-zinc-700 text-center py-4">—</p>}
                                    {lista.map((e) => {
                                        const cfg = ESTADO_LABEL[e.estado] ?? { label: e.estado, cor: 'text-zinc-400 bg-zinc-500/10' };
                                        return (
                                            <div key={e.id} className="rounded-lg p-2 text-xs" style={{ background: `${e.turno?.cor_hex ?? '#06B6D4'}15`, border: `1px solid ${e.turno?.cor_hex ?? '#06B6D4'}30` }}>
                                                <p className="font-semibold text-zinc-100 mb-1">{e.turno?.nome ?? 'Turno'}</p>
                                                <p className="text-zinc-400 font-mono">{e.hora_inicio}–{e.hora_fim}</p>
                                                <p className="text-zinc-300 mt-1 truncate inline-flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {e.user?.name ?? '—'}
                                                </p>
                                                {e.condominio && <p className="text-zinc-500 text-[10px] truncate">{e.condominio.nome}</p>}
                                                <div className="flex items-center justify-between mt-1.5">
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.cor}`}>{cfg.label}</span>
                                                    {is_admin && (
                                                        <button onClick={() => eliminar(e.id)} className="text-red-400 hover:text-red-300">
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 flex items-center gap-3">
                    <Link href="/turnos/relatorio" className="text-xs text-cyan-400 hover:text-cyan-300">Ver relatório de horas →</Link>
                    {is_admin && <Link href="/configuracoes/turnos" className="text-xs text-zinc-400 hover:text-zinc-200">Configurar turnos modelo →</Link>}
                </div>
            </div>

            {modal && <ModalAgendar onClose={() => setModal(false)} turnosModelo={turnos_modelo} users={users_escalaveis} />}
        </AuthenticatedLayout>
    );
}

function ModalAgendar({ onClose, turnosModelo, users }: { onClose: () => void; turnosModelo: TurnoModelo[]; users: UserEsc[] }) {
    const [turnoId, setTurnoId] = useState<number | ''>('');
    const [userId, setUserId] = useState<number | ''>('');
    const [datas, setDatas] = useState<string[]>([new Date().toISOString().slice(0, 10)]);
    const [observacoes, setObservacoes] = useState('');
    const [enviando, setEnviando] = useState(false);

    const addData = () => setDatas([...datas, '']);
    const updateData = (i: number, v: string) => { const nv = [...datas]; nv[i] = v; setDatas(nv); };
    const removeData = (i: number) => setDatas(datas.filter((_, idx) => idx !== i));

    const submit = () => {
        if (!turnoId || !userId) { toast.error('Turno e utilizador obrigatórios.'); return; }
        const datasValidas = datas.filter((d) => d);
        if (datasValidas.length === 0) { toast.error('Pelo menos uma data.'); return; }
        setEnviando(true);
        router.post('/turnos/escala', { turno_modelo_id: turnoId, user_id: userId, datas: datasValidas, observacoes }, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Escala criada.'); onClose(); },
            onError: (errs) => toast.error(Object.values(errs)[0] as string),
            onFinish: () => setEnviando(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md py-8 px-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white">Agendar turno</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Turno *</label>
                        <select value={turnoId} onChange={(e) => setTurnoId(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white">
                            <option value="">Escolha um turno...</option>
                            {turnosModelo.map((t) => <option key={t.id} value={t.id}>{t.nome} ({t.hora_inicio.slice(0, 5)}–{t.hora_fim.slice(0, 5)})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Funcionário *</label>
                        <select value={userId} onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white">
                            <option value="">Escolha um utilizador...</option>
                            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Datas *</label>
                        <div className="space-y-2">
                            {datas.map((d, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input type="date" value={d} onChange={(e) => updateData(i, e.target.value)} className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" />
                                    {datas.length > 1 && <button onClick={() => removeData(i)} className="text-red-400 hover:text-red-300"><X className="h-4 w-4" /></button>}
                                </div>
                            ))}
                            <button onClick={addData} className="text-xs text-cyan-400 hover:text-cyan-300">+ Adicionar outra data</button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Observações</label>
                        <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white resize-none" />
                    </div>
                </div>
                <div className="p-5 border-t border-white/5 flex gap-2 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancelar</button>
                    <button onClick={submit} disabled={enviando} className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold disabled:opacity-50">
                        {enviando ? 'A guardar...' : 'Criar escala'}
                    </button>
                </div>
            </div>
        </div>
    );
}
