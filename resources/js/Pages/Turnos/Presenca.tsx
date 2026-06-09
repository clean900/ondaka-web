import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Clock, Play, Square, CheckCircle2, Calendar, MapPin, History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface EmCurso {
    id: number;
    checkin_em: string;
    turno_nome: string | null;
    condominio_nome: string | null;
}

interface EscalaHoje {
    id: number;
    turno: { nome: string; cor_hex: string } | null;
    inicio_previsto: string;
    fim_previsto: string;
    hora_inicio: string;
    hora_fim: string;
    estado: string;
    condominio_nome: string | null;
}

interface HistoricoItem {
    id: number;
    checkin_em: string;
    checkout_em: string | null;
    data_label: string;
    hora_checkin: string;
    hora_checkout: string | null;
    horas_trabalhadas: number;
    turno_nome: string | null;
    condominio_nome: string | null;
}

interface PageProps {
    em_curso: EmCurso | null;
    escalas_hoje: EscalaHoje[];
    historico: HistoricoItem[];
}

const formatarDuracao = (segundos: number) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function Presenca({ em_curso, escalas_hoje, historico }: PageProps) {
    const [tempoDecorrido, setTempoDecorrido] = useState(0);
    const [enviando, setEnviando] = useState(false);
    const [escalaSelecionada, setEscalaSelecionada] = useState<number | null>(null);

    useEffect(() => {
        if (!em_curso) return;
        const inicio = new Date(em_curso.checkin_em).getTime();
        const tick = () => setTempoDecorrido(Math.floor((Date.now() - inicio) / 1000));
        tick();
        const intervalo = setInterval(tick, 1000);
        return () => clearInterval(intervalo);
    }, [em_curso]);

    const fazerCheckin = () => {
        setEnviando(true);
        router.post('/turnos/presenca/checkin', { escala_turno_id: escalaSelecionada }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Check-in feito.'),
            onError: (errs) => toast.error(Object.values(errs)[0] as string),
            onFinish: () => setEnviando(false),
        });
    };

    const fazerCheckout = () => {
        if (!confirm('Confirma o fim do turno?')) return;
        setEnviando(true);
        router.post('/turnos/presenca/checkout', {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Check-out feito.'),
            onError: (errs) => toast.error(Object.values(errs)[0] as string),
            onFinish: () => setEnviando(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Presença — ONDAKA" />
            <div className="p-6 md:p-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">Presença</h1>
                        <p className="text-sm text-zinc-500">Marque a sua entrada e saída do turno</p>
                    </div>
                </div>

                {/* ESTADO ACTUAL */}
                {em_curso ? (
                    <div className="mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-blue-500/10 border border-emerald-500/30 p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Ao serviço</p>
                        </div>
                        <p className="text-5xl font-bold text-white font-mono tracking-tighter mb-2">{formatarDuracao(tempoDecorrido)}</p>
                        <p className="text-xs text-zinc-400">
                            Desde {new Date(em_curso.checkin_em).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                            {em_curso.turno_nome && ` · ${em_curso.turno_nome}`}
                            {em_curso.condominio_nome && ` · ${em_curso.condominio_nome}`}
                        </p>
                        <button
                            onClick={fazerCheckout}
                            disabled={enviando}
                            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white py-4 text-base font-semibold shadow-lg disabled:opacity-50"
                        >
                            <Square className="h-5 w-5 fill-white" />
                            {enviando ? 'A finalizar...' : 'Terminar turno'}
                        </button>
                    </div>
                ) : (
                    <div className="mb-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 text-center">
                        <Clock className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-400 text-sm mb-5">Não está ao serviço de momento.</p>

                        {escalas_hoje.length > 0 && (
                            <div className="mb-5">
                                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Associar a uma escala de hoje (opcional)</p>
                                <div className="space-y-2 max-w-md mx-auto">
                                    <button
                                        onClick={() => setEscalaSelecionada(null)}
                                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${escalaSelecionada === null ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'}`}
                                    >
                                        Sem escala específica
                                    </button>
                                    {escalas_hoje.map((e) => (
                                        <button
                                            key={e.id}
                                            onClick={() => setEscalaSelecionada(e.id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${escalaSelecionada === e.id ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{e.turno?.nome ?? 'Turno'}</span>
                                                <span className="text-xs">{e.hora_inicio} – {e.hora_fim}</span>
                                            </div>
                                            {e.condominio_nome && <p className="text-xs text-zinc-500 mt-0.5">{e.condominio_nome}</p>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={fazerCheckin}
                            disabled={enviando}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white px-8 py-4 text-base font-semibold shadow-lg disabled:opacity-50"
                        >
                            <Play className="h-5 w-5 fill-white" />
                            {enviando ? 'A iniciar...' : 'Iniciar turno'}
                        </button>
                    </div>
                )}

                {/* ESCALAS DE HOJE */}
                {escalas_hoje.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-zinc-300 mb-3 inline-flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-cyan-400" />
                            Escalas de hoje
                        </h2>
                        <div className="space-y-2">
                            {escalas_hoje.map((e) => (
                                <div key={e.id} className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-3 flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full" style={{ background: e.turno?.cor_hex ?? '#06B6D4' }} />
                                    <div className="flex-1">
                                        <p className="text-sm text-zinc-200">{e.turno?.nome ?? 'Turno'}</p>
                                        {e.condominio_nome && <p className="text-xs text-zinc-500"><MapPin className="inline h-3 w-3 mr-1" />{e.condominio_nome}</p>}
                                    </div>
                                    <p className="text-xs text-zinc-400 font-mono">{e.hora_inicio} – {e.hora_fim}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* HISTÓRICO */}
                <div>
                    <h2 className="text-sm font-semibold text-zinc-300 mb-3 inline-flex items-center gap-2">
                        <History className="h-4 w-4 text-zinc-400" />
                        Histórico recente
                    </h2>
                    {historico.length === 0 ? (
                        <div className="text-center py-8 bg-zinc-900/30 rounded-xl border border-zinc-800">
                            <p className="text-xs text-zinc-500">Sem registos ainda.</p>
                        </div>
                    ) : (
                        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-900/80 border-b border-zinc-800 text-xs uppercase text-zinc-400">
                                    <tr>
                                        <th className="text-left px-3 py-2">Data</th>
                                        <th className="text-left px-3 py-2">Turno</th>
                                        <th className="text-left px-3 py-2 hidden md:table-cell">Local</th>
                                        <th className="text-center px-3 py-2">Hora</th>
                                        <th className="text-right px-3 py-2">Horas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historico.map((h) => (
                                        <tr key={h.id} className="border-b border-zinc-800/40 last:border-0">
                                            <td className="px-3 py-2 text-zinc-300">{h.data_label}</td>
                                            <td className="px-3 py-2 text-zinc-400 text-xs">{h.turno_nome ?? '—'}</td>
                                            <td className="px-3 py-2 text-zinc-500 text-xs hidden md:table-cell">{h.condominio_nome ?? '—'}</td>
                                            <td className="px-3 py-2 text-center text-zinc-400 text-xs font-mono">{h.hora_checkin} – {h.hora_checkout}</td>
                                            <td className="px-3 py-2 text-right text-emerald-300 font-semibold">{h.horas_trabalhadas.toFixed(2)}h</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
