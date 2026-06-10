import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Megaphone, ArrowLeft, MessageSquare, Send, User, Calendar, Tag,
    AlertCircle, Archive, Paperclip, Users, Eye,
    FileText, Clock, CheckCircle2,
} from 'lucide-react';
import { FormEventHandler } from 'react';

interface UserBasic { id: number; name: string; }
interface Condominio { id: number; nome: string; }

interface Anexo {
    id: number;
    url: string;
    nome_original: string;
    mime_type?: string;
}

interface Segmentacao {
    id: number;
    tipo: string;
    alvo_id: number | null;
    valor_texto: string | null;
}

interface Comentario {
    id: number;
    mensagem: string;
    user: UserBasic | null;
    created_at: string;
}

interface Leitura {
    id: number;
    user: UserBasic | null;
    created_at: string;
}

interface Aviso {
    id: number;
    titulo: string;
    descricao: string;
    categoria: string;
    prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
    estado: 'rascunho' | 'agendado' | 'publicado' | 'arquivado';
    publicado_em: string | null;
    publicar_em: string | null;
    permite_comentarios: boolean;
    requer_confirmacao: boolean;
    created_at: string;
    autor?: UserBasic | null;
    condominio?: Condominio | null;
    segmentacoes?: Segmentacao[];
    anexos?: Anexo[];
    todos_comentarios?: Comentario[];
    leituras?: Leitura[];
}

interface Estatisticas {
    total_lidos?: number;
    total_confirmados?: number;
}

interface PageProps {
    aviso: Aviso;
    estatisticas?: Estatisticas;
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    rascunho: { label: 'Rascunho', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30', icon: FileText },
    agendado: { label: 'Agendado', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: Clock },
    publicado: { label: 'Publicado', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
    arquivado: { label: 'Arquivado', color: 'text-zinc-500 bg-zinc-700/20 border-zinc-700/30', icon: Archive },
};

const PRIORIDADE_CONFIG: Record<string, { label: string; color: string }> = {
    baixa: { label: 'Baixa', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30' },
    media: { label: 'Média', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    alta: { label: 'Alta', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    urgente: { label: 'Urgente', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
};

const CATEGORIA_LABEL: Record<string, string> = {
    geral: 'Geral', manutencao: 'Manutenção', reuniao: 'Reunião',
    urgente: 'Urgente', evento: 'Evento', aviso_legal: 'Aviso legal', outro: 'Outro',
};

const SEGMENTO_LABEL: Record<string, string> = {
    todos: 'Todos os condóminos', fraccao: 'Imóvel', bloco: 'Bloco', grupo: 'Grupo',
};

export default function AvisosShow({ aviso, estatisticas }: PageProps) {
    const estadoCfg = ESTADO_CONFIG[aviso.estado] ?? ESTADO_CONFIG.rascunho;
    const EstadoIcon = estadoCfg.icon;
    const prioCfg = PRIORIDADE_CONFIG[aviso.prioridade] ?? PRIORIDADE_CONFIG.media;

    const formComentario = useForm({ mensagem: '' });

    const formatarData = (iso: string | null) => {
        if (!iso) return '—';
        const d = new Date(iso);
        const dia = d.getDate().toString().padStart(2, '0');
        const mes = (d.getMonth() + 1).toString().padStart(2, '0');
        const ano = d.getFullYear();
        const hora = d.getHours().toString().padStart(2, '0');
        const min = d.getMinutes().toString().padStart(2, '0');
        return `${dia}/${mes}/${ano} ${hora}:${min}`;
    };

    const submitComentario: FormEventHandler = (e) => {
        e.preventDefault();
        if (formComentario.data.mensagem.trim().length < 2) return;
        formComentario.post(`/avisos/${aviso.id}/comentarios`, {
            preserveScroll: true,
            onSuccess: () => formComentario.reset('mensagem'),
        });
    };

    const publicar = () => {
        if (!confirm('Publicar este aviso? Os condóminos serão notificados.')) return;
        router.post(`/avisos/${aviso.id}/publicar`, {}, { preserveScroll: true });
    };

    const arquivar = () => {
        if (!confirm('Arquivar este aviso? Deixa de aparecer nas listas ativas.')) return;
        router.post(`/avisos/${aviso.id}/arquivar`, {}, { preserveScroll: true });
    };

    const comentarios = aviso.todos_comentarios ?? [];

    return (
        <AuthenticatedLayout>
            <Head title={`Aviso #${aviso.id} — ONDAKA`} />
            <div className="p-6 md:p-8">
                <Link
                    href="/avisos"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-200 text-sm mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar à lista
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                    <Megaphone className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-zinc-500 mb-1">Aviso #{aviso.id}</div>
                                    <h1 className="text-xl md:text-2xl font-bold text-zinc-100">{aviso.titulo}</h1>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${estadoCfg.color}`}>
                                    <EstadoIcon className="h-3.5 w-3.5" />
                                    {estadoCfg.label}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${prioCfg.color}`}>
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    {prioCfg.label}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300">
                                    <Tag className="h-3.5 w-3.5" />
                                    {CATEGORIA_LABEL[aviso.categoria] ?? aviso.categoria}
                                </span>
                            </div>

                            <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                {aviso.descricao}
                            </div>

                            {aviso.anexos && aviso.anexos.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-zinc-800">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2 flex items-center gap-1.5">
                                        <Paperclip className="h-3.5 w-3.5" /> Anexos
                                    </p>
                                    <div className="space-y-2">
                                        {aviso.anexos.map((anexo) => (
                                            <a
                                                key={anexo.id}
                                                href={anexo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:border-zinc-700"
                                            >
                                                <FileText className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                                                <span className="truncate">{anexo.nome_original}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Comentários */}
                        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6">
                            <h2 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Comentários ({comentarios.length})
                            </h2>

                            {comentarios.length === 0 ? (
                                <p className="text-sm text-zinc-500 text-center py-6">
                                    Ainda não há comentários neste aviso.
                                </p>
                            ) : (
                                <div className="space-y-4 mb-6">
                                    {comentarios.map((c) => (
                                        <div key={c.id} className="flex gap-3">
                                            <div className="h-9 w-9 rounded-full bg-purple-500/15 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-purple-300">
                                                {c.user?.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="text-sm font-medium text-zinc-200">{c.user?.name || 'Anónimo'}</span>
                                                    <span className="text-xs text-zinc-600">{formatarData(c.created_at)}</span>
                                                </div>
                                                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{c.mensagem}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {aviso.permite_comentarios && (
                                <form onSubmit={submitComentario} className="space-y-3 pt-4 border-t border-zinc-800">
                                    <textarea
                                        value={formComentario.data.mensagem}
                                        onChange={(e) => formComentario.setData('mensagem', e.target.value)}
                                        placeholder="Escreve um comentário..."
                                        rows={3}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 resize-none"
                                    />
                                    {formComentario.errors.mensagem && (
                                        <p className="text-xs text-red-400">{formComentario.errors.mensagem}</p>
                                    )}
                                    <div className="flex items-center justify-end">
                                        <button
                                            type="submit"
                                            disabled={formComentario.processing || formComentario.data.mensagem.trim().length < 2}
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
                                        >
                                            <Send className="h-4 w-4" />
                                            {formComentario.processing ? 'A enviar...' : 'Enviar'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Coluna lateral */}
                    <div className="space-y-4">
                        {/* Ações */}
                        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                                Ações
                            </h3>
                            <div className="space-y-2">
                                {aviso.estado !== 'publicado' && aviso.estado !== 'arquivado' && (
                                    <button
                                        onClick={publicar}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white rounded-lg px-3 py-2 text-sm font-medium"
                                    >
                                        <Send className="h-4 w-4" />
                                        Publicar agora
                                    </button>
                                )}
                                {aviso.estado !== 'arquivado' && (
                                    <button
                                        onClick={arquivar}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm font-medium"
                                    >
                                        <Archive className="h-4 w-4" />
                                        Arquivar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Estatísticas de leitura */}
                        {aviso.estado === 'publicado' && estatisticas && (
                            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3 flex items-center gap-1.5">
                                    <Eye className="h-3.5 w-3.5" />
                                    Leitura
                                </h3>
                                <div className="flex items-end gap-2 mb-1">
                                    <span className="text-3xl font-bold text-zinc-100">{estatisticas.total_lidos ?? 0}</span>
                                    <span className="text-sm text-zinc-500 mb-1">leram</span>
                                </div>
                                {aviso.requer_confirmacao && (
                                    <p className="text-sm text-zinc-400">
                                        <CheckCircle2 className="h-3.5 w-3.5 inline text-emerald-400 mr-1" />
                                        {estatisticas.total_confirmados ?? 0} confirmaram a leitura
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Destinatários */}
                        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3 flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                Destinatários
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(aviso.segmentacoes ?? []).map((s) => (
                                    <span key={s.id} className="inline-flex items-center rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300">
                                        {SEGMENTO_LABEL[s.tipo] ?? s.tipo}{s.valor_texto ? `: ${s.valor_texto}` : ''}
                                    </span>
                                ))}
                                {(aviso.segmentacoes ?? []).length === 0 && (
                                    <span className="text-sm text-zinc-500">Sem segmentação definida</span>
                                )}
                            </div>
                        </div>

                        {/* Detalhes */}
                        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                                Detalhes
                            </h3>
                            <ul className="space-y-3 text-sm">
                                {aviso.condominio && (
                                    <li className="flex items-start gap-2">
                                        <Tag className="h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs text-zinc-500">Condomínio</div>
                                            <div className="text-zinc-200">{aviso.condominio.nome}</div>
                                        </div>
                                    </li>
                                )}
                                {aviso.autor && (
                                    <li className="flex items-start gap-2">
                                        <User className="h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs text-zinc-500">Autor</div>
                                            <div className="text-zinc-200">{aviso.autor.name}</div>
                                        </div>
                                    </li>
                                )}
                                <li className="flex items-start gap-2">
                                    <Calendar className="h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <div className="text-xs text-zinc-500">Criado em</div>
                                        <div className="text-zinc-200">{formatarData(aviso.created_at)}</div>
                                    </div>
                                </li>
                                {aviso.publicado_em && (
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs text-zinc-500">Publicado em</div>
                                            <div className="text-emerald-300">{formatarData(aviso.publicado_em)}</div>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
