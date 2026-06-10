import { MessageCircle } from 'lucide-react';

interface Props {
    onClick: () => void;
}

export default function ChatbotFab({ onClick }: Props) {
    return (
        <button
            onClick={onClick}
            aria-label="Abrir assistente"
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center group"
        >
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute right-full mr-3 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Precisas de ajuda?
            </span>
        </button>
    );
}
