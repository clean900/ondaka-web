import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Bell, X, CheckCheck, Info } from 'lucide-react';

interface Notificacao {
    id: string;
    tipo: string;
    titulo: string;
    mensagem: string;
    url: string | null;
    lida: boolean;
    created_at: string;
    created_human: string;
}

export default function BellNotificacoes() {
    const [aberto, setAberto] = useState(false);
    const [notifs, setNotifs] = useState<Notificacao[]>([]);
    const [naoLidas, setNaoLidas] = useState(0);
    const [carregando, setCarregando] = useState(false);
    const refPanel = useRef<HTMLDivElement>(null);

    const carregar = () => {
        setCarregando(true);
        fetch('/notificacoes', {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then((r) => r.json())
            .then((res) => {
                setNotifs(res.notificacoes ?? []);
                setNaoLidas(res.nao_lidas ?? 0);
            })
            .catch(() => {})
            .finally(() => setCarregando(false));
    };

    // Carregar ao montar e a cada 60s
    useEffect(() => {
        carregar();
        const intervalo = setInterval(carregar, 60000);
        return () => clearInterval(intervalo);
    }, []);

    // Fechar ao clicar fora
    useEffect(() => {
        if (!aberto) return;
        const handler = (e: MouseEvent) => {
            if (refPanel.current && !refPanel.current.contains(e.target as Node)) {
                setAberto(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [aberto]);

    const csrfToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
        return meta?.content ?? '';
    };

    const clicarNotif = (n: Notificacao) => {
        if (!n.lida) {
            fetch(`/notificacoes/${n.id}/marcar-lida`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                credentials: 'same-origin',
            }).catch(() => {});
            setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, lida: true } : x));
            setNaoLidas((prev) => Math.max(0, prev - 1));
        }
        if (n.url) {
            setAberto(false);
            router.visit(n.url);
        }
    };

    const marcarTodas = () => {
        fetch('/notificacoes/marcar-todas-lidas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': csrfToken(),
            },
            credentials: 'same-origin',
        }).catch(() => {});
        setNotifs((prev) => prev.map((x) => ({ ...x, lida: true })));
        setNaoLidas(0);
    };

    return (
        <div className="relative" ref={refPanel}>
            <button
                onClick={() => setAberto((v) => !v)}
                className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition relative"
                aria-label="Notificações"
            >
                <Bell className="h-4 w-4" />
                {naoLidas > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center">
                        {naoLidas > 9 ? '9+' : naoLidas}
                    </span>
                )}
            </button>

            {aberto && (
                <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-[#16163A] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                        <h3 className="text-sm font-semibold text-white">Notificações</h3>
                        {naoLidas > 0 && (
                            <button
                                onClick={marcarTodas}
                                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition"
                            >
                                <CheckCheck className="h-3 w-3" />
                                Marcar todas como lidas
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {carregando && notifs.length === 0 ? (
                            <p className="text-center text-xs text-white/40 py-8">A carregar...</p>
                        ) : notifs.length === 0 ? (
                            <div className="text-center py-8 px-4">
                                <Bell className="h-8 w-8 text-white/20 mx-auto mb-2" />
                                <p className="text-xs text-white/40">Sem notificações por agora.</p>
                            </div>
                        ) : (
                            notifs.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => clicarNotif(n)}
                                    className={`w-full text-left px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition flex items-start gap-3 ${!n.lida ? 'bg-cyan-500/5' : ''}`}
                                >
                                    <div className="mt-0.5">
                                        {!n.lida ? (
                                            <div className="h-2 w-2 rounded-full bg-pink-500" />
                                        ) : (
                                            <div className="h-2 w-2 rounded-full bg-transparent" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${!n.lida ? 'text-white' : 'text-white/70'}`}>
                                            {n.titulo}
                                        </p>
                                        <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                                            {n.mensagem}
                                        </p>
                                        <p className="text-[10px] text-white/30 mt-1">
                                            {n.created_human}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
