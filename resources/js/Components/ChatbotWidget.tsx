import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';

interface FaqResultado {
    id: number;
    pergunta: string;
    resposta: string;
    categoria: string;
}

interface Mensagem {
    id: string;
    tipo: 'user' | 'bot';
    texto: string;
    resultados?: FaqResultado[];
    timestamp: Date;
}

export default function ChatbotWidget({ condominioId }: { condominioId?: number | null }) {
    const [aberto, setAberto] = useState(false);
    const [pergunta, setPergunta] = useState('');
    const [a, setA] = useState(false);
    const [mensagens, setMensagens] = useState<Mensagem[]>([
        {
            id: '0',
            tipo: 'bot',
            texto: 'Olá! Sou o assistente do teu condomínio. Pergunta-me o que quiseres — se souber, respondo; se não souber, direi.',
            timestamp: new Date(),
        },
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [mensagens]);

    const perguntar = async () => {
        if (!pergunta.trim() || a) return;

        const minhaMsg: Mensagem = {
            id: Date.now().toString(),
            tipo: 'user',
            texto: pergunta,
            timestamp: new Date(),
        };
        setMensagens((prev) => [...prev, minhaMsg]);
        const perguntaAtual = pergunta;
        setPergunta('');
        setA(true);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

            const resp = await fetch('/chatbot/perguntar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    pergunta: perguntaAtual,
                    condominio_id: condominioId || null,
                }),
            });

            if (!resp.ok) {
                throw new Error('Erro ' + resp.status);
            }

            const data = await resp.json();

            const respostaMsg: Mensagem = {
                id: Date.now().toString() + '-bot',
                tipo: 'bot',
                texto: data.total > 0
                    ? `Encontrei ${data.total} resposta${data.total > 1 ? 's' : ''} que podem ajudar:`
                    : 'Não encontrei uma resposta para a tua pergunta. Podes reformular ou contactar o gestor.',
                resultados: data.resultados,
                timestamp: new Date(),
            };
            setMensagens((prev) => [...prev, respostaMsg]);
        } catch (e) {
            setMensagens((prev) => [
                ...prev,
                {
                    id: Date.now().toString() + '-err',
                    tipo: 'bot',
                    texto: 'Desculpa, houve um erro a procurar a resposta. Tenta novamente daqui a pouco.',
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setA(false);
        }
    };

    const marcarUtil = async (faqId: number, util: boolean) => {
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            await fetch(`/chatbot/faqs/${faqId}/util`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ util }),
            });
        } catch (e) {
            // silent
        }
    };

    if (!aberto) {
        return (
            <button
                onClick={() => setAberto(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 hover:scale-110 transition-transform shadow-lg flex items-center justify-center text-white z-50"
                title="Assistente"
            >
                <MessageCircle className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[520px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl flex flex-col z-50">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-purple-600/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-100">Assistente ONDAKA</p>
                        <p className="text-[10px] text-zinc-500">Respostas instantâneas</p>
                    </div>
                </div>
                <button
                    onClick={() => setAberto(false)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {mensagens.map((m) => (
                    <div key={m.id} className={`flex ${m.tipo === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[85%] rounded-lg p-3 text-sm ${
                                m.tipo === 'user'
                                    ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30'
                                    : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                            }`}
                        >
                            <p className="whitespace-pre-line">{m.texto}</p>

                            {m.resultados && m.resultados.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {m.resultados.map((r) => (
                                        <div key={r.id} className="bg-zinc-900/50 rounded p-2.5 border border-zinc-700">
                                            <p className="text-xs font-semibold text-cyan-300 mb-1">{r.pergunta}</p>
                                            <p className="text-xs text-zinc-300 whitespace-pre-line">{r.resposta}</p>
                                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800">
                                                <span className="text-[10px] text-zinc-500">Foi útil?</span>
                                                <button
                                                    onClick={() => marcarUtil(r.id, true)}
                                                    className="text-zinc-500 hover:text-emerald-400"
                                                    title="Sim, útil"
                                                >
                                                    <ThumbsUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => marcarUtil(r.id, false)}
                                                    className="text-zinc-500 hover:text-rose-400"
                                                    title="Não ajudou"
                                                >
                                                    <ThumbsDown className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {a && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-lg p-3 text-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> A procurar...
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-zinc-800">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        perguntar();
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={pergunta}
                        onChange={(e) => setPergunta(e.target.value)}
                        placeholder="Escreve a tua pergunta..."
                        className="flex-1 px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-200 focus:border-cyan-500 focus:outline-none"
                        disabled={a}
                    />
                    <button
                        type="submit"
                        disabled={a || !pergunta.trim()}
                        className="px-3 py-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
