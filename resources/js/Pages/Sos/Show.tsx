import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Siren, CheckCircle2, AlertOctagon, XCircle, RefreshCw, User, MapPin, Clock, MessageSquare, Camera } from 'lucide-react';

interface Foto {
    id: number;
    url: string;
}

interface Alerta {
    id: number;
    tipo: string;
    tipo_label: string;
    gravidade: 'critico' | 'alto' | 'medio' | 'baixo';
    estado: 'aberto' | 'atendido' | 'resolvido' | 'falso_alarme';
    descricao: string | null;
    localizacao: string | null;
    condominio_nome: string | null;
    autor_nome: string | null;
    atendido_por_nome: string | null;
    created_at: string;
    atendido_em: string | null;
    resolvido_em: string | null;
    resolucao_notas: string | null;
    fotos: Foto[];
}

interface PageProps {
    alerta: Alerta;
    [key: string]: unknown;
}

export default function SosShow() {
    const { alerta } = usePage<PageProps>().props;
    const [showFotoUrl, setShowFotoUrl] = useState<string | null>(null);
    const [notas, setNotas] = useState('');
    const [acaoEmCurso, setAcaoEmCurso] = useState<string | null>(null);

    const submitAcao = (acao: string) => {
        if (acaoEmCurso) return;
        setAcaoEmCurso(acao);
        router.patch(`/sos/alertas/${alerta.id}/estado`, { acao, notas }, {
            preserveScroll: true,
            onFinish: () => setAcaoEmCurso(null),
        });
    };

    const gCfg = {
        critico: { cor: 'red', label: 'CRÍTICO', text: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/40' },
        alto: { cor: 'orange', label: 'ALTO', text: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/40' },
        medio: { cor: 'amber', label: 'MÉDIO', text: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/40' },
        baixo: { cor: 'emerald', label: 'BAIXO', text: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40' },
    }[alerta.gravidade];

    const eCfg = {
        aberto: { label: 'A aguardar', cor: 'bg-red-500/20 text-red-300' },
        atendido: { label: 'Atendido', cor: 'bg-amber-500/20 text-amber-300' },
        resolvido: { label: 'Resolvido', cor: 'bg-emerald-500/20 text-emerald-300' },
        falso_alarme: { label: 'Falso alarme', cor: 'bg-gray-500/20 text-gray-300' },
    }[alerta.estado];

    const fmt = (iso: string | null) =>
        iso ? new Date(iso).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    return (
        <AuthenticatedLayout>
            <Head title={`SOS #${alerta.id}`} />

            <div className="p-6 max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <Link href="/sos/alertas" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
                        <ArrowLeft className="w-4 h-4" /> Voltar à lista
                    </Link>
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${eCfg.cor}`}>{eCfg.label}</span>
                </div>

                {/* Card principal */}
                <div className={`rounded-2xl border p-6 ${gCfg.bg} ${gCfg.border}`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-${gCfg.cor}-500/20`}>
                            <Siren className={`w-8 h-8 ${gCfg.text}`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2 flex-wrap mb-1">
                                <span className={`text-xs font-bold tracking-wider ${gCfg.text}`}>{gCfg.label}</span>
                                <span className="text-white/40 text-sm">#{alerta.id}</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">{alerta.tipo_label}</h1>
                            <p className="text-white/60 text-sm mt-1">
                                {alerta.condominio_nome} {alerta.localizacao && <>· {alerta.localizacao}</>}
                            </p>
                        </div>
                    </div>

                    {alerta.descricao && (
                        <p className="mt-4 text-white/80 text-sm italic">"{alerta.descricao}"</p>
                    )}
                </div>

                {/* Acções */}
                {alerta.estado === 'aberto' && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
                        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Ações</h3>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => submitAcao('atender')}
                                disabled={!!acaoEmCurso}
                                className="px-4 py-2 rounded-lg bg-amber-500/90 hover:bg-amber-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition disabled:opacity-50"
                            >
                                <RefreshCw className="w-4 h-4" /> Marcar como atendido
                            </button>
                            <button
                                onClick={() => submitAcao('resolver')}
                                disabled={!!acaoEmCurso}
                                className="px-4 py-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Resolver
                            </button>
                            <button
                                onClick={() => submitAcao('falso_alarme')}
                                disabled={!!acaoEmCurso}
                                className="px-4 py-2 rounded-lg bg-gray-600/90 hover:bg-gray-600 text-white text-sm font-semibold inline-flex items-center gap-2 transition disabled:opacity-50"
                            >
                                <XCircle className="w-4 h-4" /> Falso alarme
                            </button>
                        </div>
                        <textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Notas sobre a resolução (opcional)"
                            rows={2}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50"
                        />
                    </div>
                )}

                {alerta.estado === 'atendido' && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
                        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Ações</h3>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => submitAcao('resolver')}
                                disabled={!!acaoEmCurso}
                                className="px-4 py-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Resolver
                            </button>
                            <button
                                onClick={() => submitAcao('falso_alarme')}
                                disabled={!!acaoEmCurso}
                                className="px-4 py-2 rounded-lg bg-gray-600/90 hover:bg-gray-600 text-white text-sm font-semibold inline-flex items-center gap-2 transition disabled:opacity-50"
                            >
                                <XCircle className="w-4 h-4" /> Falso alarme
                            </button>
                        </div>
                        <textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Notas sobre a resolução (opcional)"
                            rows={2}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50"
                        />
                    </div>
                )}

                {(alerta.estado === 'resolvido' || alerta.estado === 'falso_alarme') && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-3">Reabrir alerta?</h3>
                        <button
                            onClick={() => submitAcao('reabrir')}
                            disabled={!!acaoEmCurso}
                            className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition disabled:opacity-50"
                        >
                            <AlertOctagon className="w-4 h-4" /> Reabrir
                        </button>
                    </div>
                )}

                {/* Informação detalhada */}
                <div className="grid md:grid-cols-2 gap-3">
                    <InfoRow icon={<User className="w-4 h-4" />} label="Autor" valor={alerta.autor_nome ?? '—'} />
                    <InfoRow icon={<MapPin className="w-4 h-4" />} label="Localização" valor={alerta.localizacao ?? '—'} />
                    <InfoRow icon={<Clock className="w-4 h-4" />} label="Criado em" valor={fmt(alerta.created_at)} />
                    {alerta.atendido_em && (
                        <InfoRow
                            icon={<RefreshCw className="w-4 h-4" />}
                            label="Atendido em"
                            valor={`${fmt(alerta.atendido_em)} ${alerta.atendido_por_nome ? `por ${alerta.atendido_por_nome}` : ''}`}
                        />
                    )}
                    {alerta.resolvido_em && (
                        <InfoRow icon={<CheckCircle2 className="w-4 h-4" />} label="Resolvido em" valor={fmt(alerta.resolvido_em)} />
                    )}
                </div>

                {alerta.resolucao_notas && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <MessageSquare className="w-3 h-3" /> Notas de resolução
                        </h3>
                        <p className="text-white/80 text-sm italic">"{alerta.resolucao_notas}"</p>
                    </div>
                )}

                {/* Fotos */}
                {alerta.fotos.length > 0 && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Camera className="w-3 h-3" /> Fotos anexadas ({alerta.fotos.length})
                        </h3>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                            {alerta.fotos.map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setShowFotoUrl(f.url)}
                                    className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition"
                                >
                                    <img src={f.url} alt={`Foto #${f.id}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox foto fullscreen */}
            {showFotoUrl && (
                <div
                    onClick={() => setShowFotoUrl(null)}
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 cursor-pointer"
                >
                    <img src={showFotoUrl} alt="Foto" className="max-w-full max-h-full object-contain" />
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function InfoRow({ icon, label, valor }: { icon: React.ReactNode; label: string; valor: string }) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex items-start gap-2">
                <span className="text-white/40 mt-0.5">{icon}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-sm text-white/90 break-words">{valor}</p>
                </div>
            </div>
        </div>
    );
}
