import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Siren, AlertOctagon, CheckCircle2, Clock, Activity, Camera, MapPin, User, RefreshCw } from 'lucide-react';

interface AlertaItem {
    id: number;
    tipo: string;
    tipo_label: string;
    gravidade: 'critico' | 'alto' | 'medio' | 'baixo';
    estado: 'aberto' | 'atendido' | 'resolvido' | 'falso_alarme';
    localizacao: string | null;
    descricao: string | null;
    condominio_nome: string | null;
    autor_nome: string | null;
    created_at: string;
    atendido_em: string | null;
    resolvido_em: string | null;
    fotos_count: number;
}

interface Stats {
    abertos: number;
    criticos_abertos: number;
    hoje: number;
    total: number;
}

interface PageProps {
    stats: Stats;
    [key: string]: unknown;
}

const POLLING_INTERVAL = 30_000; // 30 segundos

export default function SosIndex() {
    const { stats: statsInicial } = usePage<PageProps>().props;

    const [alertas, setAlertas] = useState<AlertaItem[]>([]);
    const [stats, setStats] = useState<Stats>(statsInicial);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [secondsAgo, setSecondsAgo] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const r = await fetch('/sos/alertas/data', {
                headers: { Accept: 'application/json' },
            });
            if (!r.ok) return;
            const json = await r.json();
            setAlertas(json.data || []);
            setStats(json.stats || stats);
            setLastUpdate(new Date());
            setSecondsAgo(0);
        } catch (e) {
            console.error('Erro polling SOS:', e);
        } finally {
            setLoading(false);
        }
    }, [stats]);

    useEffect(() => {
        fetchData();
        intervalRef.current = setInterval(fetchData, POLLING_INTERVAL);
        tickRef.current = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (tickRef.current) clearInterval(tickRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Emergências SOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                            <Siren className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Emergências SOS</h1>
                            <p className="text-sm text-white/60">Alertas dos condóminos em tempo real</p>
                        </div>
                    </div>

                    <button
                        onClick={fetchData}
                        className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white transition px-3 py-2 rounded-lg border border-white/10"
                    >
                        <RefreshCw className="w-3 h-3" />
                        {lastUpdate ? `Há ${secondsAgo}s` : 'A carregar...'}
                    </button>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard
                        icon={<AlertOctagon className="w-5 h-5 text-red-400" />}
                        label="Críticos abertos"
                        value={stats.criticos_abertos}
                        cor="red"
                        destaque={stats.criticos_abertos > 0}
                    />
                    <StatCard
                        icon={<Activity className="w-5 h-5 text-amber-400" />}
                        label="Total abertos"
                        value={stats.abertos}
                        cor="amber"
                    />
                    <StatCard
                        icon={<Clock className="w-5 h-5 text-cyan-400" />}
                        label="Hoje"
                        value={stats.hoje}
                        cor="cyan"
                    />
                    <StatCard
                        icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                        label="Total acumulado"
                        value={stats.total}
                        cor="emerald"
                    />
                </div>

                {/* Lista de alertas */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                        Lista ({alertas.length})
                    </h2>

                    {loading && alertas.length === 0 && (
                        <div className="text-center py-12 text-white/40 text-sm">A carregar alertas…</div>
                    )}

                    {!loading && alertas.length === 0 && (
                        <div className="text-center py-12">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400/50 mx-auto mb-3" />
                            <p className="text-white/60 text-sm">Sem alertas. Tudo calmo.</p>
                        </div>
                    )}

                    {alertas.map((a) => (
                        <Link key={a.id} href={`/sos/alertas/${a.id}`}>
                            <AlertaCard alerta={a} />
                        </Link>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// ============================================================================

function StatCard({
    icon,
    label,
    value,
    cor,
    destaque = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    cor: 'red' | 'amber' | 'cyan' | 'emerald';
    destaque?: boolean;
}) {
    const corClasses = {
        red: 'bg-red-500/10 border-red-500/30',
        amber: 'bg-amber-500/10 border-amber-500/30',
        cyan: 'bg-cyan-500/10 border-cyan-500/30',
        emerald: 'bg-emerald-500/10 border-emerald-500/30',
    };

    return (
        <div
            className={`rounded-xl border p-4 ${corClasses[cor]} ${destaque ? 'ring-2 ring-red-500/50 animate-pulse' : ''}`}
        >
            <div className="flex items-center justify-between mb-2">
                {icon}
                <span className="text-2xl font-bold text-white">{value}</span>
            </div>
            <p className="text-xs text-white/60">{label}</p>
        </div>
    );
}

// ============================================================================

function AlertaCard({ alerta }: { alerta: AlertaItem }) {
    const gravidadeCfg = {
        critico: { cor: 'border-red-500/40 bg-red-500/5', text: 'text-red-300', label: 'CRÍTICO' },
        alto: { cor: 'border-orange-500/40 bg-orange-500/5', text: 'text-orange-300', label: 'ALTO' },
        medio: { cor: 'border-amber-500/40 bg-amber-500/5', text: 'text-amber-300', label: 'MÉDIO' },
        baixo: { cor: 'border-emerald-500/40 bg-emerald-500/5', text: 'text-emerald-300', label: 'BAIXO' },
    };
    const estadoCfg = {
        aberto: { cor: 'bg-red-500/20 text-red-300', label: 'A aguardar' },
        atendido: { cor: 'bg-amber-500/20 text-amber-300', label: 'Atendido' },
        resolvido: { cor: 'bg-emerald-500/20 text-emerald-300', label: 'Resolvido' },
        falso_alarme: { cor: 'bg-gray-500/20 text-gray-300', label: 'Falso alarme' },
    };

    const g = gravidadeCfg[alerta.gravidade] ?? gravidadeCfg.baixo;
    const e = estadoCfg[alerta.estado] ?? estadoCfg.aberto;

    const dataFormatada = new Date(alerta.created_at).toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className={`rounded-xl border p-4 ${g.cor} hover:bg-white/5 transition cursor-pointer`}>
            <div className="flex items-start gap-4">
                {/* Badges (gravidade + estado) */}
                <div className="flex flex-col gap-1.5 items-start min-w-[88px]">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${g.text} bg-white/5`}>
                        {g.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${e.cor}`}>{e.label}</span>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-white font-semibold">{alerta.tipo_label}</span>
                        <span className="text-white/40 text-xs">#{alerta.id}</span>
                        <span className="text-white/40 text-xs">· {dataFormatada}</span>
                    </div>

                    <div className="mt-2 space-y-1 text-sm">
                        {alerta.condominio_nome && (
                            <p className="text-white/70 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 inline" />
                                {alerta.condominio_nome}
                                {alerta.localizacao && <span className="text-white/40">· {alerta.localizacao}</span>}
                            </p>
                        )}
                        {alerta.autor_nome && (
                            <p className="text-white/50 text-xs flex items-center gap-1.5">
                                <User className="w-3 h-3 inline" /> {alerta.autor_nome}
                            </p>
                        )}
                        {alerta.descricao && (
                            <p className="text-white/60 text-xs italic mt-1">"{alerta.descricao}"</p>
                        )}
                    </div>

                    {alerta.fotos_count > 0 && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs text-white/50">
                            <Camera className="w-3 h-3" /> {alerta.fotos_count} foto{alerta.fotos_count > 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
