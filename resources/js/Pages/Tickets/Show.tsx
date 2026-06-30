import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Ticket as TicketIcon, ArrowLeft, MessageSquare, Send,
    User, Home, Calendar, Tag, AlertCircle, CheckCircle2,
    Clock, Activity, Inbox, XCircle, EyeOff, UserCheck, UserMinus, Heart, Lock, Globe, Briefcase, Ban,
} from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

interface EmpresaPrestadora { id: number; nome: string; }

interface UserBasic { id: number; name: string; email?: string; }
interface Fraccao { id: number; identificador: string; piso?: number; }
interface Condominio { id: number; nome: string; }

interface Foto {
    id: number;
    url: string;
    nome_original?: string;
}

interface Comentario {
    id: number;
    mensagem: string;
    publico: boolean;
    user: UserBasic | null;
    created_at: string;
}

interface Ticket {
    id: number;
    titulo: string;
    descricao: string;
    categoria_legacy?: string;
    categoria?: { id: number; nome: string; icone: string | null; tipo: string } | null;
    tipo?: 'particular' | 'publico';
    apoios_count?: number;
    prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
    estado: 'aberto' | 'em_analise' | 'em_curso' | 'resolvido' | 'fechado' | 'cancelado';
    aberto_por: UserBasic | null;
    aberto_por_user_id?: number;
    cancelado_em?: string | null;
    cancelado_por_user_id?: number | null;
    motivo_cancelamento?: string | null;
    cancelado_por?: UserBasic | null;
    atribuido_a: UserBasic | null;
    atribuido_empresa?: EmpresaPrestadora | null;
    custo_intervencao?: number | string | null;
    fraccao: Fraccao | null;
    condominio: Condominio | null;
    fotos: Foto[];
    comentarios: Comentario[];
    atribuido_em: string | null;
    resolvido_em: string | null;
    fechado_em: string | null;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    ticket: Ticket;
    meta?: { role: string | null; is_condomino: boolean; ja_apoiei: boolean };
    empresasPrestadoras?: EmpresaPrestadora[];
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    aberto: { label: 'Aberto', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', icon: Inbox },
    em_analise: { label: 'Em análise', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: Clock },
    em_curso: { label: 'Em curso', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', icon: Activity },
    resolvido: { label: 'Resolvido', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
    fechado: { label: 'Fechado', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30', icon: XCircle },
    cancelado: { label: 'Cancelado', color: 'text-zinc-500 bg-zinc-700/20 border-zinc-700/30', icon: XCircle },
};

const PRIORIDADE_CONFIG: Record<string, { label: string; color: string }> = {
    baixa: { label: 'Baixa', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30' },
    media: { label: 'Média', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    alta: { label: 'Alta', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    urgente: { label: 'Urgente', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
};

const CATEGORIA_LABEL: Record<string, string> = {
    manutencao: 'Manutenção', limpeza: 'Limpeza', seguranca: 'Segurança',
    ruido: 'Ruído', agua: 'Água', electricidade: 'Electricidade',
    jardim: 'Jardim', estacionamento: 'Estacionamento',
    reclamacao: 'Reclamação', sugestao: 'Sugestão', outro: 'Outro',
};

const ESTADOS_DISPONIVEIS = ['aberto', 'em_analise', 'em_curso', 'resolvido', 'fechado', 'cancelado'];

export default function TicketShow({ ticket , meta , empresasPrestadoras = [] }: PageProps) {
    const estadoCfg = ESTADO_CONFIG[ticket.estado];
    const EstadoIcon = estadoCfg.icon;
    const prioCfg = PRIORIDADE_CONFIG[ticket.prioridade];

    const formComentario = useForm({ mensagem: '', publico: true });
    const [atribuiveis, setAtribuiveis] = useState<UserBasic[]>([]);
    // empresasPrestadoras vem via props
    const [modoAtribuir, setModoAtribuir] = useState<'user' | 'empresa'>(ticket.atribuido_empresa ? 'empresa' : 'user');
    const [selecionadoId, setSelecionadoId] = useState<number | null>(ticket.atribuido_a?.id ?? null);
    const [empresaSelId, setEmpresaSelId] = useState<number | null>(ticket.atribuido_empresa?.id ?? null);
    const [custo, setCusto] = useState<string>(ticket.custo_intervencao != null ? String(ticket.custo_intervencao) : '');
    const [aAtribuir, setAAtribuir] = useState(false);

    useEffect(() => {
        fetch('/tickets/atribuiveis', {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then((r) => r.json())
            .then((res) => setAtribuiveis(res.data || []))
            .catch(() => {});


    }, []);

    const formatarData = (iso: string) => {
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
        formComentario.post(`/tickets/${ticket.id}/comentarios`, {
            preserveScroll: true,
            onSuccess: () => formComentario.reset('mensagem'),
        });
    };

    const mudarEstado = (novoEstado: string) => {
        if (novoEstado === ticket.estado) return;
        if (!confirm(`Mudar estado para "${ESTADO_CONFIG[novoEstado]?.label}"?`)) return;
        router.patch(`/tickets/${ticket.id}/estado`,
            { estado: novoEstado },
            { preserveScroll: true }
        );
    };

    const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
    const [motivoCancelar, setMotivoCancelar] = useState('');
    const [aCancelar, setACancelar] = useState(false);

    const cancelarPedido = () => {
        setACancelar(true);
        router.patch(`/tickets/${ticket.id}/cancelar`, { motivo: motivoCancelar }, {
            preserveScroll: true,
            onSuccess: () => {
                setMostrarModalCancelar(false);
                setMotivoCancelar('');
            },
            onFinish: () => setACancelar(false),
        });
    };

    const podeCancelar = () => {
        if (ticket.estado === 'cancelado') return false;
        const role = meta?.role;
        const isAdmin = ['super-admin', 'admin-empresa', 'gestor', 'administrador-condominio'].includes(role || '');
        // Sem aberto_por_user_id no frontend, vamos usar meta ou aberto_por
        const isAutor = ticket.aberto_por?.email === meta?.email || ticket.aberto_por_user_id !== undefined;
        return isAdmin || isAutor;
    };

    const submeterAtribuicao = () => {
        setAAtribuir(true);
        let payload: Record<string, unknown>;
        if (modoAtribuir === 'user') {
            if (!selecionadoId) {
                payload = { modo: 'remover' };
            } else {
                payload = { modo: 'user', atribuido_a_user_id: selecionadoId };
            }
        } else {
            if (!empresaSelId) {
                payload = { modo: 'remover' };
            } else {
                payload = {
                    modo: 'empresa',
                    atribuido_a_empresa_id: empresaSelId,
                    custo_intervencao: custo.trim() === '' ? null : Number(custo),
                };
            }
        }
        router.patch(`/tickets/${ticket.id}/atribuir`, payload, {
            preserveScroll: true,
            onFinish: () => setAAtribuir(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Pedido #${ticket.id} — ONDAKA`} />
            <div className="p-6 md:p-8">
                <Link
                    href="/tickets"
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
                                    <TicketIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-zinc-500 mb-1">Pedido #{ticket.id}</div>
                                    <h1 className="text-xl md:text-2xl font-bold text-zinc-100">{ticket.titulo}</h1>
                                </div>
                                {meta?.is_condomino && ticket.tipo === 'publico' && (
                                    <button
                                        onClick={() => router.post(`/tickets/${ticket.id}/apoiar`, {}, { preserveScroll: true })}
                                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                            meta.ja_apoiei
                                                ? 'border-pink-500/50 bg-pink-500/15 text-pink-300 hover:bg-pink-500/25'
                                                : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-pink-500/40 hover:text-pink-300'
                                        }`}
                                    >
                                        <Heart className={`h-4 w-4 ${meta.ja_apoiei ? 'fill-pink-500' : ''}`} />
                                        {meta.ja_apoiei ? 'Apoiado' : 'Apoiar'}
                                        <span className="ml-1 text-xs opacity-70">({ticket.apoios_count ?? 0})</span>
                                    </button>
                                )}
                                {!meta?.is_condomino && ticket.tipo === 'publico' && (ticket.apoios_count ?? 0) > 0 && (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-pink-500/30 bg-pink-500/10 text-pink-300 px-3 py-2 text-sm font-medium">
                                        <Heart className="h-4 w-4" />
                                        {ticket.apoios_count} apoio{(ticket.apoios_count ?? 0) !== 1 ? 's' : ''}
                                    </span>
                                )}
                                {ticket.estado !== 'cancelado' && podeCancelar() && (
                                    <button
                                        onClick={() => setMostrarModalCancelar(true)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 px-3 py-2 text-sm font-medium transition"
                                    >
                                        <Ban className="h-4 w-4" />
                                        Cancelar
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {ticket.tipo === 'particular' && (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 px-2.5 py-1 text-xs font-medium">
                                        <Lock className="h-3.5 w-3.5" />
                                        Particular
                                    </span>
                                )}
                                {ticket.tipo === 'publico' && (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 px-2.5 py-1 text-xs font-medium">
                                        <Globe className="h-3.5 w-3.5" />
                                        Público
                                    </span>
                                )}
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
                                    {ticket.categoria?.nome ?? CATEGORIA_LABEL[ticket.categoria_legacy ?? ""] ?? "Sem categoria"}
                                </span>
                            </div>

                            <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                {ticket.descricao}
                            </div>

                            {ticket.fotos && ticket.fotos.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {ticket.fotos.map((foto) => (
                                        <a
                                            key={foto.id}
                                            href={foto.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-700"
                                        >
                                            <img src={foto.url} alt={foto.nome_original || `Foto ${foto.id}`} className="w-full h-32 object-cover" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6">
                            <h2 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Comentários ({ticket.comentarios?.length || 0})
                            </h2>

                            {(!ticket.comentarios || ticket.comentarios.length === 0) ? (
                                <p className="text-sm text-zinc-500 text-center py-6">
                                    Ainda não há comentários neste pedido.
                                </p>
                            ) : (
                                <div className="space-y-4 mb-6">
                                    {ticket.comentarios.map((c) => (
                                        <div key={c.id} className="flex gap-3">
                                            <div className="h-9 w-9 rounded-full bg-purple-500/15 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-purple-300">
                                                {c.user?.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="text-sm font-medium text-zinc-200">{c.user?.name || 'Anónimo'}</span>
                                                    <span className="text-xs text-zinc-600">{formatarData(c.created_at)}</span>
                                                    {!c.publico && (
                                                        <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5">
                                                            <EyeOff className="h-3 w-3" /> Privado
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{c.mensagem}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

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
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formComentario.data.publico}
                                            onChange={(e) => formComentario.setData('publico', e.target.checked)}
                                            className="rounded"
                                        />
                                        Visível ao condómino
                                    </label>
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
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                                Mudar estado
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {ESTADOS_DISPONIVEIS.map((e) => {
                                    const cfg = ESTADO_CONFIG[e];
                                    const Icon = cfg.icon;
                                    const isActual = e === ticket.estado;
                                    return (
                                        <button
                                            key={e}
                                            onClick={() => mudarEstado(e)}
                                            disabled={isActual}
                                            className={`flex items-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                isActual
                                                    ? `${cfg.color} ring-2 ring-offset-2 ring-offset-zinc-950 ring-current cursor-default`
                                                    : 'text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200'
                                            }`}
                                        >
                                            <Icon className="h-3 w-3" />
                                            {cfg.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3 flex items-center gap-1.5">
                                <UserCheck className="h-3.5 w-3.5" />
                                Atribuir
                            </h3>
                            <select
                                value={selecionadoId ?? ''}
                                onChange={(e) => setSelecionadoId(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 mb-2"
                                disabled={aAtribuir}
                                style={{ display: 'none' }}
                            >
                                <option value="">--</option>
                            </select>

                            {/* Toggle Modo */}
                            <div className="flex gap-1 mb-3 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setModoAtribuir('user')}
                                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition ${modoAtribuir === 'user' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    👤 Colaborador
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModoAtribuir('empresa')}
                                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition ${modoAtribuir === 'empresa' ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    🏢 Empresa
                                </button>
                            </div>

                            {modoAtribuir === 'user' && (
                                <select
                                    value={selecionadoId ?? ''}
                                    onChange={(e) => setSelecionadoId(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 mb-2"
                                    disabled={aAtribuir}
                                >
                                    <option value="">Sem atribuição</option>
                                    {atribuiveis.map((u) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            )}

                            {modoAtribuir === 'empresa' && (
                                <select
                                    value={empresaSelId ?? ''}
                                    onChange={(e) => setEmpresaSelId(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 mb-2"
                                    disabled={aAtribuir}
                                >
                                    <option value="">Sem atribuição</option>
                                    {empresasPrestadoras.map((e) => (
                                        <option key={e.id} value={e.id}>{e.nome}</option>
                                    ))}
                                </select>
                            )}

                            {modoAtribuir === 'empresa' && empresaSelId != null && (
                                <div className="mb-2">
                                    <label className="block text-[11px] text-zinc-500 mb-1">Custo da intervenção (Kz) — opcional</label>
                                    <input
                                        type="number" min={0} step="0.01"
                                        value={custo}
                                        onChange={(e) => setCusto(e.target.value)}
                                        placeholder="ex.: 45000"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                        disabled={aAtribuir}
                                    />
                                    <p className="text-[10px] text-zinc-600 mt-1">Alimenta o preço médio do fornecedor no diretório.</p>
                                </div>
                            )}

                            {modoAtribuir === 'empresa' && empresasPrestadoras.length === 0 && (
                                <p className="text-xs text-zinc-500 mb-2">
                                    Sem empresas registadas. <a href="/configuracoes/empresas-prestadoras" className="text-cyan-400 hover:underline">Criar agora</a>
                                </p>
                            )}

                            <button
                                onClick={submeterAtribuicao}
                                disabled={aAtribuir}
                                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-60"
                            >
                                {aAtribuir ? 'A guardar...' : 'Confirmar atribuição'}
                            </button>
                        </div>

                        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                                Detalhes
                            </h3>
                            <ul className="space-y-3 text-sm">
                                {ticket.aberto_por && (
                                    <li className="flex items-start gap-2">
                                        <User className="h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs text-zinc-500">Aberto por</div>
                                            <div className="text-zinc-200">{ticket.aberto_por.name}</div>
                                        </div>
                                    </li>
                                )}
                                {ticket.atribuido_a && (
                                    <li className="flex items-start gap-2">
                                        <User className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs text-zinc-500">Atribuído a</div>
                                            <div className="text-cyan-300">{ticket.atribuido_a.name}</div>
                                        </div>
                                    </li>
                                )}
                                {ticket.atribuido_empresa && (
                                    <li className="flex items-start gap-2">
                                        <Briefcase className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs text-zinc-500">Empresa atribuída</div>
                                            <div className="text-amber-300">{ticket.atribuido_empresa.nome}</div>
                                        </div>
                                    </li>
                                )}
                                {ticket.fraccao && (
                                    <li className="flex items-start gap-2">
                                        <Home className="h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs text-zinc-500">Imóvel</div>
                                            <div className="text-zinc-200">{ticket.fraccao.identificador}</div>
                                        </div>
                                    </li>
                                )}
                                <li className="flex items-start gap-2">
                                    <Calendar className="h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <div className="text-xs text-zinc-500">Criado em</div>
                                        <div className="text-zinc-200">{formatarData(ticket.created_at)}</div>
                                    </div>
                                </li>
                                {ticket.resolvido_em && (
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs text-zinc-500">Resolvido em</div>
                                            <div className="text-emerald-300">{formatarData(ticket.resolvido_em)}</div>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            {mostrarModalCancelar && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md py-8 px-4 overflow-y-auto" onClick={() => setMostrarModalCancelar(false)}>
                    <div className="bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Ban className="h-5 w-5 text-red-400" />
                                <h2 className="text-lg font-semibold text-white">Cancelar pedido</h2>
                            </div>
                            <button onClick={() => setMostrarModalCancelar(false)} className="text-white/40 hover:text-white">
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-sm text-zinc-300">
                                Tem a certeza que pretende cancelar o pedido <strong>#{ticket.id} {ticket.titulo}</strong>?
                            </p>
                            <div>
                                <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Motivo (opcional)</label>
                                <textarea
                                    value={motivoCancelar}
                                    onChange={(e) => setMotivoCancelar(e.target.value)}
                                    rows={3}
                                    placeholder="Ex: Problema já resolvido, pedido feito por engano..."
                                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white resize-none"
                                    maxLength={1000}
                                />
                            </div>
                        </div>
                        <div className="p-5 border-t border-white/5 flex gap-2 justify-end">
                            <button
                                onClick={() => setMostrarModalCancelar(false)}
                                className="px-4 py-2 text-sm text-white/60 hover:text-white"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={cancelarPedido}
                                disabled={aCancelar}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold disabled:opacity-50"
                            >
                                {aCancelar ? 'A cancelar...' : 'Confirmar cancelamento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
