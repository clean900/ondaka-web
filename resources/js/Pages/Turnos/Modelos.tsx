import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Clock, Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight, Moon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Turno {
    id: number;
    nome: string;
    hora_inicio: string;
    hora_fim: string;
    atravessa_meia_noite: boolean;
    cor_hex: string;
    descricao: string | null;
    ativo: boolean;
    ordem: number;
}

interface PageProps {
    turnos: Turno[];
}

const CORES_PREDEFINIDAS = ['#06B6D4', '#A855F7', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

export default function Modelos({ turnos }: PageProps) {
    const [modal, setModal] = useState<null | { tipo: 'novo' | 'editar'; t?: Turno }>(null);

    const toggle = (t: Turno) => {
        router.patch(`/configuracoes/turnos/${t.id}`, {
            nome: t.nome,
            hora_inicio: t.hora_inicio.slice(0, 5),
            hora_fim: t.hora_fim.slice(0, 5),
            cor_hex: t.cor_hex,
            descricao: t.descricao,
            ativo: !t.ativo,
        }, { preserveScroll: true, onSuccess: () => toast.success('Estado actualizado.') });
    };

    const eliminar = (t: Turno) => {
        if (!confirm(`Eliminar turno "${t.nome}"?`)) return;
        router.delete(`/configuracoes/turnos/${t.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Turno removido.'),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Modelos de Turno — ONDAKA" />
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">Modelos de Turno</h1>
                            <p className="text-sm text-zinc-500">Configure os turnos disponíveis para escalas</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setModal({ tipo: 'novo' })}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        Novo turno
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {turnos.map((t) => (
                        <div key={t.id} className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 hover:border-zinc-700 transition">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${t.cor_hex}40, ${t.cor_hex}10)`, border: `1px solid ${t.cor_hex}60` }}>
                                    <Clock className="h-5 w-5" style={{ color: t.cor_hex }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-semibold text-zinc-100">{t.nome}</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                        {t.hora_inicio.slice(0, 5)} – {t.hora_fim.slice(0, 5)}
                                        {t.atravessa_meia_noite && (<span className="inline-flex items-center gap-1 ml-2 text-purple-400"><Moon className="h-3 w-3" />atravessa</span>)}
                                    </p>
                                    {t.descricao && <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{t.descricao}</p>}
                                </div>
                                <button onClick={() => toggle(t)} className="text-zinc-400 hover:text-zinc-200">
                                    {t.ativo ? <ToggleRight className="h-5 w-5 text-emerald-400" /> : <ToggleLeft className="h-5 w-5 text-zinc-600" />}
                                </button>
                            </div>
                            <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-zinc-800/60">
                                <button onClick={() => setModal({ tipo: 'editar', t })} className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1">
                                    <Pencil className="h-3 w-3" /> Editar
                                </button>
                                <button onClick={() => eliminar(t)} className="text-xs text-red-400 hover:text-red-300 inline-flex items-center gap-1">
                                    <Trash2 className="h-3 w-3" /> Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                    {turnos.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800">
                            <Clock className="h-10 w-10 text-zinc-700 mx-auto mb-2" />
                            <p className="text-sm text-zinc-500">Nenhum turno configurado. Crie o primeiro para começar a escalar a equipa.</p>
                        </div>
                    )}
                </div>
            </div>
            {modal && <ModalTurno modal={modal} onClose={() => setModal(null)} />}
        </AuthenticatedLayout>
    );
}

function ModalTurno({ modal, onClose }: { modal: { tipo: 'novo' | 'editar'; t?: Turno }; onClose: () => void }) {
    const t = modal.t;
    const [nome, setNome] = useState(t?.nome ?? '');
    const [horaInicio, setHoraInicio] = useState(t?.hora_inicio?.slice(0, 5) ?? '08:00');
    const [horaFim, setHoraFim] = useState(t?.hora_fim?.slice(0, 5) ?? '16:00');
    const [cor, setCor] = useState(t?.cor_hex ?? '#06B6D4');
    const [descricao, setDescricao] = useState(t?.descricao ?? '');
    const [ativo, setAtivo] = useState(t?.ativo ?? true);
    const [enviando, setEnviando] = useState(false);

    const submit = () => {
        if (!nome.trim()) { toast.error('Nome obrigatório.'); return; }
        setEnviando(true);
        const payload = { nome, hora_inicio: horaInicio, hora_fim: horaFim, cor_hex: cor, descricao, ativo };
        if (modal.tipo === 'novo') {
            router.post('/configuracoes/turnos', payload, {
                preserveScroll: true,
                onSuccess: () => { toast.success('Turno criado.'); onClose(); },
                onFinish: () => setEnviando(false),
            });
        } else {
            router.patch(`/configuracoes/turnos/${t!.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => { toast.success('Turno actualizado.'); onClose(); },
                onFinish: () => setEnviando(false),
            });
        }
    };

    const atravessa = horaFim < horaInicio;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md py-8 px-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white">{modal.tipo === 'novo' ? 'Novo turno' : 'Editar turno'}</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Nome *</label>
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" placeholder="Ex: Turno da manhã" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Início *</label>
                            <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Fim *</label>
                            <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" />
                        </div>
                    </div>
                    {atravessa && (<p className="text-xs text-purple-300 inline-flex items-center gap-1"><Moon className="h-3 w-3" /> Este turno atravessa a meia-noite</p>)}
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Cor</label>
                        <div className="flex gap-2 flex-wrap">
                            {CORES_PREDEFINIDAS.map((c) => (
                                <button key={c} type="button" onClick={() => setCor(c)} className={`h-8 w-8 rounded-lg border-2 transition ${cor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ background: c }} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Descrição</label>
                        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white resize-none" />
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
                    <button onClick={submit} disabled={enviando} className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold disabled:opacity-50">
                        {enviando ? 'A guardar...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
