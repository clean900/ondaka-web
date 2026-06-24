import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Video, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
    assembleia: {
        id?: number;
        numero: string;
        titulo: string;
        sala_jitsi?: string;
        url_jitsi: string;
        estado: string;
        modo?: string;
        data_agendada?: string;
    };
    participante?: {
        nome: string;
        numero_fraccoes: number;
        permilagem_total: number;
        entrou_em: string | null;
    };
    erro?: string;
}

export default function AssembleiaEntrar({ assembleia, participante, erro }: Props) {
    // Redireccionar automaticamente ao Jitsi após 3s (se não houver erro e assembleia em curso)
    useEffect(() => {
        if (!erro && assembleia.estado === 'em_curso' && assembleia.url_jitsi) {
            const timer = setTimeout(() => {
                window.open(assembleia.url_jitsi + '#userInfo.displayName=' + encodeURIComponent(participante?.nome ?? ''), '_blank');
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [erro, assembleia.estado, assembleia.url_jitsi, participante?.nome]);

    return (
        <AuthenticatedLayout>
            <Head title={`Entrar: ${assembleia.titulo}`} />

            <div className="p-6 md:p-8 max-w-2xl mx-auto">
                <Link href="/assembleias" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                        <Video className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-100 font-mono">{assembleia.numero}</h1>
                        <p className="text-sm text-zinc-400">{assembleia.titulo}</p>
                    </div>
                </div>

                {erro ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-6 w-6 text-red-400 mt-0.5 shrink-0" />
                            <div>
                                <h3 className="text-base font-semibold text-red-400">Não foi possível entrar</h3>
                                <p className="text-sm text-zinc-300 mt-2">{erro}</p>
                            </div>
                        </div>
                    </div>
                ) : assembleia.estado !== 'em_curso' ? (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-6 w-6 text-amber-400 mt-0.5 shrink-0" />
                            <div>
                                <h3 className="text-base font-semibold text-amber-400">Assembleia ainda não iniciada</h3>
                                <p className="text-sm text-zinc-300 mt-2">
                                    Estado actual: <strong>{assembleia.estado}</strong>.
                                    {assembleia.data_agendada && (
                                        <span className="block mt-1">
                                            Agendada para: {new Date(assembleia.data_agendada).toLocaleString('pt-PT')}
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-zinc-500 mt-3">
                                    Aguarde que a administração inicie a sessão. Receberá notificação SMS/email quando começar.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {participante && (
                            <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-5 mb-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-400 mt-0.5 shrink-0" />
                                    <div>
                                        <h3 className="text-base font-semibold text-emerald-400">Presença registada</h3>
                                        <p className="text-sm text-zinc-200 mt-1">{participante.nome}</p>
                                        <div className="flex gap-4 text-xs text-zinc-400 mt-2">
                                            <span>{participante.numero_fraccoes} fracçã{participante.numero_fraccoes === 1 ? 'o' : 'es'}</span>
                                            <span>·</span>
                                            <span>{participante.permilagem_total.toFixed(4)}‰</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
                            <Video className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-zinc-100 mb-2">A entrar na sala virtual...</h3>
                            <p className="text-sm text-zinc-400 mb-6">
                                A abrir a sala de vídeo numa nova aba. Se não abrir automaticamente, clique no botão:
                            </p>

                            <a
                                href={assembleia.url_jitsi + '#userInfo.displayName=' + encodeURIComponent(participante?.nome ?? '')}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-6 py-3 text-base font-semibold"
                            >
                                <Video className="h-5 w-5" />
                                Abrir sala de vídeo
                            </a>

                            <p className="text-xs text-zinc-600 mt-6 font-mono break-all">{assembleia.url_jitsi}</p>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
