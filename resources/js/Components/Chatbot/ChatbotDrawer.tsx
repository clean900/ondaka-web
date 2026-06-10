import { useState, useEffect, useRef, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Send, Bot, User as UserIcon } from 'lucide-react';

interface Pergunta {
    id: number;
    pergunta: string;
    resposta: string;
    formato?: 'texto' | 'markdown';
}

interface Mensagem {
    id: string;
    tipo: 'bot' | 'user';
    texto: string;
    formato?: 'texto' | 'markdown';
    perguntaTitulo?: string;
    relacionadas?: Pergunta[];
}

interface Props {
    open: boolean;
    onClose: () => void;
    userName?: string;
}

const SUGESTOES_INICIAIS = [
    'Como pago a taxa de condomínio?',
    'Como pré-aprovo uma visita?',
    'O que é o Fundo de Reserva?',
    'Como activar o ProxyPay?',
];

// Componente para renderizar texto da mensagem (texto simples ou markdown)
function ConteudoMensagem({ texto, formato }: { texto: string; formato?: 'texto' | 'markdown' }) {
    if (formato === 'markdown') {
        return (
            <div className="markdown-body text-sm leading-relaxed">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        // Estilos customizados para combinar com o tema dark
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 ml-2 space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2 ml-2 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="text-zinc-100" {...props} />,
                        blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-cyan-500/50 bg-cyan-500/5 pl-3 py-2 my-2 italic" {...props} />
                        ),
                        code: ({ node, ...props }) => (
                            <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-xs text-cyan-400 font-mono" {...props} />
                        ),
                        a: ({ node, ...props }) => (
                            <a className="text-cyan-400 hover:text-cyan-300 underline" target="_blank" rel="noopener noreferrer" {...props} />
                        ),
                        h1: ({ node, ...props }) => <h1 className="text-base font-semibold text-white mb-2" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-sm font-semibold text-white mb-2" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-white mb-1" {...props} />,
                        hr: ({ node, ...props }) => <hr className="border-zinc-700 my-2" {...props} />,
                    }}
                >
                    {texto}
                </ReactMarkdown>
            </div>
        );
    }
    return <p className="text-sm leading-relaxed whitespace-pre-line">{texto}</p>;
}

export default function ChatbotDrawer({ open, onClose, userName }: Props) {
    const [mensagens, setMensagens] = useState<Mensagem[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const primeiroNome = userName?.split(' ')[0] || '';

    useEffect(() => {
        if (open && mensagens.length === 0) {
            setMensagens([
                {
                    id: 'welcome',
                    tipo: 'bot',
                    texto: primeiroNome
                        ? `Olá ${primeiroNome}! Sobre o que precisa de ajuda?`
                        : 'Olá! Sobre o que precisa de ajuda?',
                },
            ]);
        }
    }, [open, primeiroNome, mensagens.length]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [mensagens, loading]);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [open]);

    const enviarPergunta = async (texto: string) => {
        if (!texto.trim() || loading) return;

        const userMsg: Mensagem = {
            id: `u-${Date.now()}`,
            tipo: 'user',
            texto: texto,
        };
        setMensagens((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const csrf =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const response = await fetch('/chatbot/perguntar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                credentials: 'same-origin',
                body: JSON.stringify({ texto }),
            });

            const data = await response.json();
            await new Promise((r) => setTimeout(r, 600));

            if (data.resposta) {
                const botMsg: Mensagem = {
                    id: `b-${Date.now()}`,
                    tipo: 'bot',
                    texto: data.resposta.resposta,
                    formato: data.resposta.formato || 'texto',
                    perguntaTitulo: data.resposta.pergunta,
                    relacionadas: data.relacionadas || [],
                };
                setMensagens((prev) => [...prev, botMsg]);
            } else {
                const errorMsg: Mensagem = {
                    id: `b-${Date.now()}`,
                    tipo: 'bot',
                    texto:
                        data.message ||
                        'Não encontrei uma resposta. Tente reformular a pergunta ou contacte o suporte.',
                };
                setMensagens((prev) => [...prev, errorMsg]);
            }
        } catch (e) {
            const errorMsg: Mensagem = {
                id: `b-${Date.now()}`,
                tipo: 'bot',
                texto: 'Erro de ligação. Tenta novamente.',
            };
            setMensagens((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        enviarPergunta(input);
    };

    const handleSugestaoClick = (texto: string) => {
        enviarPergunta(texto);
    };

    const handleRelacionadaClick = (p: Pergunta) => {
        enviarPergunta(p.pergunta);
    };

    return (
        <>
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
                    open ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            />
            <aside
                className={`fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-zinc-900 border-l border-zinc-800 z-50 transition-transform shadow-2xl ${
                    open ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-white">Assistente ONDAKA</h2>
                                <p className="text-xs text-zinc-400">Sempre a postos para ajudar</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-zinc-800 rounded transition"
                            aria-label="Fechar"
                        >
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </header>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {mensagens.map((m, idx) => (
                            <div key={m.id}>
                                <div
                                    className={`flex gap-2 ${
                                        m.tipo === 'user' ? 'flex-row-reverse' : 'flex-row'
                                    }`}
                                >
                                    <div
                                        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                                            m.tipo === 'user'
                                                ? 'bg-zinc-700'
                                                : 'bg-gradient-to-br from-cyan-500 to-purple-500'
                                        }`}
                                    >
                                        {m.tipo === 'user' ? (
                                            <UserIcon className="w-4 h-4 text-zinc-300" />
                                        ) : (
                                            <Bot className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                    <div
                                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                                            m.tipo === 'user'
                                                ? 'bg-cyan-600/30 border border-cyan-500/30 text-white'
                                                : 'bg-zinc-800 text-zinc-100'
                                        }`}
                                    >
                                        {m.perguntaTitulo && m.tipo === 'bot' && (
                                            <p className="text-xs font-medium text-cyan-400 mb-1">
                                                {m.perguntaTitulo}
                                            </p>
                                        )}
                                        <ConteudoMensagem texto={m.texto} formato={m.formato} />
                                    </div>
                                </div>

                                {idx === 0 && m.id === 'welcome' && mensagens.length === 1 && (
                                    <div className="mt-3 ml-9 space-y-2">
                                        <p className="text-xs text-zinc-500 mb-2">Sugestões:</p>
                                        {SUGESTOES_INICIAIS.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => handleSugestaoClick(s)}
                                                className="block w-full text-left text-sm text-cyan-400 hover:text-cyan-300 hover:bg-zinc-800/50 px-3 py-2 rounded-lg border border-zinc-800 transition"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {m.relacionadas && m.relacionadas.length > 0 && (
                                    <div className="mt-2 ml-9 space-y-1">
                                        <p className="text-xs text-zinc-500 mb-1">
                                            Quer saber também:
                                        </p>
                                        {m.relacionadas.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleRelacionadaClick(p)}
                                                className="block w-full text-left text-sm text-cyan-400 hover:text-cyan-300 hover:bg-zinc-800/50 px-3 py-1.5 rounded-lg transition"
                                            >
                                                ↳ {p.pergunta}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="border-t border-zinc-800 p-3">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escreva a sua pergunta..."
                                disabled={loading}
                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform"
                                aria-label="Enviar"
                            >
                                <Send className="w-4 h-4 text-white" />
                            </button>
                        </div>
                        <p className="text-xs text-zinc-600 text-center mt-2">
                            ONDAKA · Soluções Simples
                        </p>
                    </form>
                </div>
            </aside>
        </>
    );
}
