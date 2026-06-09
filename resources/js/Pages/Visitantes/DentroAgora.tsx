import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, DoorOpen, Clock, Key, User, Home } from 'lucide-react';

interface Visitante {
    id: number;
    nome: string;
    telefone: string | null;
}

interface Fraccao {
    id: number;
    identificador: string;
    piso: number | null;
}

interface GuardaEntrada {
    id: number;
    name: string;
}

interface Visita {
    id: number;
    entrou_em: string;
    metodo_validacao: 'qr' | 'otp' | 'manual';
    observacoes: string | null;
    visitante: Visitante | null;
    fraccao: Fraccao | null;
    guarda_entrada: GuardaEntrada | null;
}

interface PageProps {
    visitas: Visita[];
    total: number;
}

const METODO_CONFIG: Record<string, { label: string; color: string }> = {
    qr: { label: 'QR Code', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    otp: { label: 'Código OTP', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    manual: { label: 'Manual', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
};

export default function DentroAgora({ visitas, total }: PageProps) {
    const formatarHora = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    };

    const formatarDuracao = (iso: string) => {
        const entrada = new Date(iso);
        const agora = new Date();
        const minutos = Math.floor((agora.getTime() - entrada.getTime()) / 60000);
        if (minutos < 60) return `há ${minutos} min`;
        const horas = Math.floor(minutos / 60);
        const resto = minutos % 60;
        return resto === 0 ? `há ${horas}h` : `há ${horas}h ${resto}min`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dentro agora — ONDAKA" />

            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                            <DoorOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">
                                Dentro agora {total > 0 && <span className="text-zinc-500">({total})</span>}
                            </h1>
                            <p className="text-sm text-zinc-500">Visitantes actualmente no condomínio</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href="/visitantes/historico"
                            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-medium"
                        >
                            <Clock className="h-4 w-4" />
                            Histórico
                        </Link>
                        <Link
                            href="/visitantes/pre-aprovacoes"
                            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-medium"
                        >
                            <Users className="h-4 w-4" />
                            Pré-aprovações
                        </Link>
                    </div>
                </div>

                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                    {visitas.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-400 font-medium">Nenhum visitante dentro</p>
                            <p className="text-sm text-zinc-600 mt-1">O condomínio está vazio de visitas agora.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800">
                            {visitas.map((visita) => {
                                const metodoConfig = METODO_CONFIG[visita.metodo_validacao];
                                return (
                                    <div key={visita.id} className="p-4 md:p-5 hover:bg-zinc-900/30 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                                                    <User className="h-5 w-5 text-cyan-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-zinc-100 truncate">
                                                        {visita.visitante?.nome ?? 'Visitante'}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                                                        {visita.fraccao && (
                                                            <span className="flex items-center gap-1">
                                                                <Home className="h-3.5 w-3.5" />
                                                                Fracção {visita.fraccao.identificador}
                                                                {visita.fraccao.piso !== null && ` (Piso ${visita.fraccao.piso})`}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {formatarHora(visita.entrou_em)} · {formatarDuracao(visita.entrou_em)}
                                                        </span>
                                                    </div>
                                                    {visita.observacoes && (
                                                        <p className="text-xs text-zinc-600 mt-1 italic">
                                                            "{visita.observacoes}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border ${metodoConfig.color}`}
                                                >
                                                    <Key className="h-3 w-3" />
                                                    {metodoConfig.label}
                                                </span>
                                                {visita.guarda_entrada && (
                                                    <span className="text-xs text-zinc-600">
                                                        Autorizado por {visita.guarda_entrada.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
