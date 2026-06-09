import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Ticket as TicketIcon, Filter, Search, AlertTriangle, Clock,
    CheckCircle2, XCircle, Activity, Inbox, Plus, X, UserPlus, Loader2, Heart, Lock, Globe,
} from 'lucide-react';
import { useState, useEffect, FormEventHandler } from 'react';

interface Fraccao { id: number; identificador: string; }
interface User { id: number; name: string; }
interface Condominio { id: number; nome: string; }

interface CategoriaTicket {
    id: number;
    nome: string;
    icone: string | null;
    tipo: 'particular' | 'publico';
}

interface Ticket {
    id: number;
    titulo: string;
    descricao: string;
    categoria_legacy?: string;
    tipo?: 'particular' | 'publico';
    categoria_id?: number | null;
    apoios_count?: number;
    categoria?: CategoriaTicket | null;
    prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
    estado: 'aberto' | 'em_analise' | 'em_curso' | 'resolvido' | 'fechado' | 'cancelado';
    aberto_por: User | null;
    atribuido_a: User | null;
    fraccao: Fraccao | null;
    condominio: Condominio | null;
    created_at: string;
}

interface Paginacao<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Filtros {
    estado?: string;
    categoria?: string;
    prioridade?: string;
    busca?: string;
}

interface Stats {
    total: number;
    abertos: number;
    urgentes: number;
    resolvidos_mes: number;
}

interface PageProps {
    tickets: Paginacao<Ticket>;
    filtros: Filtros;
    stats?: Stats;
    meta?: { role: string | null; is_condomino: boolean; is_gestor: boolean; is_prestador: boolean };
    categoriasParticulares?: CategoriaTicket[];
    categoriasPublicas?: CategoriaTicket[];
    apoiados?: number[];
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
    baixa: { label: 'Baixa', color: 'text-zinc-400' },
    media: { label: 'Média', color: 'text-blue-400' },
    alta: { label: 'Alta', color: 'text-amber-400' },
    urgente: { label: 'Urgente', color: 'text-red-400' },
};

const CATEGORIA_LABEL: Record<string, string> = {
    manutencao: 'Manutenção', limpeza: 'Limpeza', seguranca: 'Segurança',
    ruido: 'Ruído', agua: 'Água', electricidade: 'Electricidade',
    jardim: 'Jardim', estacionamento: 'Estacionamento',
    reclamacao: 'Reclamação', sugestao: 'Sugestão', outro: 'Outro',
};

export default function TicketsIndex({ tickets, filtros, stats = { total: 0, abertos: 0, urgentes: 0, resolvidos_mes: 0 } as Stats, categoriasParticulares = [], categoriasPublicas = [], meta }: PageProps) {
    const [form, setForm] = useState<Filtros>(filtros);
    const [modalNovo, setModalNovo] = useState(false);

    const aplicarFiltros = () => {
        const params: Record<string, string> = {};
        if (form.estado) params.estado = form.estado;
        if (form.categoria) params.categoria = form.categoria;
        if (form.prioridade) params.prioridade = form.prioridade;
        if (form.busca) params.busca = form.busca;
        router.get('/tickets', params, { preserveState: true, preserveScroll: true });
    };

    const limparFiltros = () => {
        setForm({});
        router.get('/tickets', {}, { preserveState: true, preserveScroll: true });
    };

    const formatarData = (iso: string) => {
        const d = new Date(iso);
        const dia = d.getDate().toString().padStart(2, '0');
        const mes = (d.getMonth() + 1).toString().padStart(2, '0');
        const ano = d.getFullYear();
        const hora = d.getHours().toString().padStart(2, '0');
        const min = d.getMinutes().toString().padStart(2, '0');
        return `${dia}/${mes}/${ano} ${hora}:${min}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pedidos de intervenção — ONDAKA" />
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                            <TicketIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">Pedidos de intervenção</h1>
                            <p className="text-sm text-zinc-500">{tickets?.total ?? 0} pedido{(tickets?.total ?? 0) !== 1 ? 's' : ''} no total</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setModalNovo(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Novo pedido
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <StatCard label="Total" valor={stats.total} icon={TicketIcon} cor="text-zinc-300 bg-zinc-500/10" />
                    <StatCard label="Por resolver" valor={stats.abertos} icon={Inbox} cor="text-blue-400 bg-blue-500/10" />
                    <StatCard label="Urgentes" valor={stats.urgentes} icon={AlertTriangle} cor="text-red-400 bg-red-500/10" />
                    <StatCard label="Resolvidos este mês" valor={stats.resolvidos_mes} icon={CheckCircle2} cor="text-emerald-400 bg-emerald-500/10" />
                </div>

                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3 text-zinc-400 text-sm">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Estado</label>
                            <select
                                value={form.estado || ''}
                                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                            >
                                <option value="">Todos</option>
                                {Object.entries(ESTADO_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Prioridade</label>
                            <select
                                value={form.prioridade || ''}
                                onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                            >
                                <option value="">Todas</option>
                                {Object.entries(PRIORIDADE_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Categoria</label>
                            <select
                                value={form.categoria || ''}
                                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                            >
                                <option value="">Todas</option>
                                {Object.entries(CATEGORIA_LABEL).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-zinc-500 mb-1">Pesquisar</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={form.busca || ''}
                                        onChange={(e) => setForm({ ...form, busca: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                                        placeholder="Título ou descrição..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200"
                                    />
                                </div>
                                <button
                                    onClick={aplicarFiltros}
                                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white rounded-lg px-3 py-2 text-sm font-medium"
                                >
                                    Filtrar
                                </button>
                                <button
                                    onClick={limparFiltros}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    Limpar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                    {tickets.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <TicketIcon className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-400 font-medium">Nenhum pedido</p>
                            <p className="text-sm text-zinc-600 mt-1">Os pedidos reportados pelos condóminos aparecem aqui.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800">
                            {tickets.data.map((t) => {
                                const estadoCfg = ESTADO_CONFIG[t.estado];
                                const EstadoIcon = estadoCfg.icon;
                                const prioCfg = PRIORIDADE_CONFIG[t.prioridade];
                                return (
                                    <Link
                                        key={t.id}
                                        href={`/tickets/${t.id}`}
                                        className="block p-4 md:p-5 hover:bg-zinc-900 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                                    <TicketIcon className="h-5 w-5 text-purple-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-semibold text-zinc-100">{t.titulo}</p>
                                                        {t.tipo === 'particular' && (
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                                                                <Lock className="h-3 w-3" />
                                                                Particular
                                                            </span>
                                                        )}
                                                        {t.tipo === 'publico' && (
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                                                                <Globe className="h-3 w-3" />
                                                                Público
                                                            </span>
                                                        )}
                                                        {meta?.is_condomino && t.tipo === 'publico' && (
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-pink-500/10 border border-pink-500/30 text-pink-300 px-2 py-0.5 text-[10px] font-medium">
                                                                <Heart className="h-3 w-3" />
                                                                {t.apoios_count ?? 0}
                                                            </span>
                                                        )}
                                                        <span className={`text-xs font-semibold ${prioCfg.color}`}>
                                                            • {prioCfg.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">{t.descricao}</p>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-zinc-600">
                                                        <span>{t.categoria?.nome ?? CATEGORIA_LABEL[t.categoria_legacy ?? ""] ?? "Sem categoria"}</span>
                                                        {t.aberto_por && <span>· {t.aberto_por.name}</span>}
                                                        {t.fraccao && <span>· Imóvel {t.fraccao.identificador}</span>}
                                                        <span>· {formatarData(t.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${estadoCfg.color} flex-shrink-0`}>
                                                <EstadoIcon className="h-3.5 w-3.5" />
                                                {estadoCfg.label}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {tickets.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-4">
                        {tickets.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                className={`px-3 py-1.5 rounded-lg text-sm ${
                                    link.active ? 'bg-cyan-500 text-white'
                                    : link.url ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                    : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {modalNovo && (
                    <ModalNovoTicket onClose={() => setModalNovo(false)} categoriasParticulares={categoriasParticulares ?? []} categoriasPublicas={categoriasPublicas ?? []} />
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, valor, icon: Icon, cor }: {
    label: string; valor: number; icon: typeof TicketIcon; cor: string;
}) {
    return (
        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${cor} mb-2`}>
                <Icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-zinc-100">{valor}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
        </div>
    );
}

function ModalNovoTicket({
    onClose,
    categoriasParticulares,
    categoriasPublicas,
}: {
    onClose: () => void;
    categoriasParticulares: CategoriaTicket[];
    categoriasPublicas: CategoriaTicket[];
}) {
    const [step, setStep] = useState<1 | 2>(1);
    const [tipo, setTipo] = useState<'particular' | 'publico' | null>(null);

    const [pesquisa, setPesquisa] = useState('');
    const [focado, setFocado] = useState(false);
    const [todosCondominos, setTodosCondominos] = useState<Array<{
        id: number;
        nome_completo: string;
        fraccao_id: number;
        fraccao_identificador: string;
    }>>([]);
    const [pesquisando, setPesquisando] = useState(false);
    const [condominoSelecionado, setCondominoSelecionado] = useState<{
        nome: string;
        fraccao_identificador: string;
    } | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        titulo: '',
        descricao: '',
        categoria_id: 0,
        prioridade: 'media',
        fraccao_id: 0,
        tipo: '' as 'particular' | 'publico' | '',
    });

    const categoriasDisponiveis = tipo === 'particular' ? categoriasParticulares : tipo === 'publico' ? categoriasPublicas : [];

    const escolherTipo = (t: 'particular' | 'publico') => {
        setTipo(t);
        setData('tipo', t);
        // Reset categoria quando troca tipo
        setData('categoria_id', 0);
        setStep(2);
    };

    // Carregar TODOS os condominos UMA vez quando o modal abre
    useEffect(() => {
        setPesquisando(true);
        fetch(`/tickets/condominos`, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then((r) => r.json())
            .then((res) => setTodosCondominos(res.data || []))
            .catch(() => setTodosCondominos([]))
            .finally(() => setPesquisando(false));
    }, []);

    // Filtro local (sem chamada ao backend)
    const resultados = pesquisa.length < 1
        ? todosCondominos.slice(0, 30)
        : todosCondominos.filter((c) =>
            c.nome_completo.toLowerCase().includes(pesquisa.toLowerCase()) ||
            c.fraccao_identificador.toLowerCase().includes(pesquisa.toLowerCase())
        ).slice(0, 30);

    const seleccionarCondomino = (c: { id: number; nome_completo: string; fraccao_id: number; fraccao_identificador: string }) => {
        setData('fraccao_id', c.fraccao_id);
        setCondominoSelecionado({ nome: c.nome_completo, fraccao_identificador: c.fraccao_identificador });
        setPesquisa('');
    };

    const limparCondomino = () => {
        setCondominoSelecionado(null);
        setData('fraccao_id', 0);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.categoria_id) {
            return;
        }
        post('/tickets', {
            preserveScroll: true,
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="border-b border-zinc-800 p-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Novo pedido {step === 2 && tipo ? `— ${tipo === 'particular' ? '🔒 Particular' : '🌐 Público'}` : ''}
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Step indicator */}
                <div className="px-5 pt-4 flex items-center gap-2">
                    <div className={`h-1 flex-1 rounded ${step >= 1 ? 'bg-cyan-500' : 'bg-zinc-800'}`} />
                    <div className={`h-1 flex-1 rounded ${step >= 2 ? 'bg-cyan-500' : 'bg-zinc-800'}`} />
                </div>

                {step === 1 && (
                    <div className="p-5 space-y-3">
                        <p className="text-sm text-zinc-400 mb-3">Escolha o tipo de pedido</p>

                        <button
                            type="button"
                            onClick={() => escolherTipo('particular')}
                            className="w-full text-left p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/60 hover:bg-zinc-900/80 transition group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                                    <Lock className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-100">Particular</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">Problema do imóvel — visível apenas para si, administração e prestador atribuído</p>
                                </div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => escolherTipo('publico')}
                            className="w-full text-left p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-purple-500/60 hover:bg-zinc-900/80 transition group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                    <Globe className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-100">Público</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">Bem comum (passeios, postes, jardins) — visível para todos os condóminos</p>
                                </div>
                            </div>
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={submit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Categoria *</label>
                            <select
                                value={data.categoria_id}
                                onChange={(e) => setData('categoria_id', Number(e.target.value))}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                required
                            >
                                <option value={0}>Escolha uma categoria...</option>
                                {categoriasDisponiveis.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                ))}
                            </select>
                            {errors.categoria_id && <p className="text-xs text-red-400 mt-1">{errors.categoria_id}</p>}
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Condómino / Fracção {tipo === 'particular' ? '*' : '(opcional)'}</label>
                            {!condominoSelecionado && pesquisa.length === 0 && (
                                <p className="text-[11px] text-zinc-500 mb-1.5 italic">Comece a digitar o nome do condómino...</p>
                            )}
                            {condominoSelecionado ? (
                                <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <UserPlus className="h-4 w-4 text-cyan-400" />
                                        <span className="text-sm text-zinc-200">
                                            {condominoSelecionado.nome} — Imóvel {condominoSelecionado.fraccao_identificador}
                                        </span>
                                    </div>
                                    <button type="button" onClick={limparCondomino} className="text-zinc-500 hover:text-zinc-300">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={pesquisa}
                                        onChange={(e) => setPesquisa(e.target.value)}
                                        onFocus={() => setFocado(true)} onBlur={() => setTimeout(() => setFocado(false), 150)} placeholder="Pesquisar por nome..."
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                    />
                                    {pesquisando && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500 animate-spin" />}
                                    {(focado || pesquisa.length > 0) && resultados.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {resultados.map((c) => (
                                                <button key={c.id} type="button" onClick={() => seleccionarCondomino(c)} className="w-full text-left px-3 py-2 hover:bg-zinc-800 text-sm text-zinc-200 border-b border-zinc-800 last:border-0">
                                                    <p className="font-medium">{c.nome_completo}</p>
                                                    <p className="text-xs text-zinc-500">Imóvel {c.fraccao_identificador}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Título *</label>
                            <input
                                type="text"
                                value={data.titulo}
                                onChange={(e) => setData('titulo', e.target.value)}
                                placeholder="Ex: Bomba de água sem pressão"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                maxLength={200}
                                required
                            />
                            {errors.titulo && <p className="text-xs text-red-400 mt-1">{errors.titulo}</p>}
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Descrição *</label>
                            <textarea
                                value={data.descricao}
                                onChange={(e) => setData('descricao', e.target.value)}
                                placeholder="Descreva o problema..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 min-h-[100px]"
                                required
                            />
                            {errors.descricao && <p className="text-xs text-red-400 mt-1">{errors.descricao}</p>}
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Prioridade *</label>
                            <select
                                value={data.prioridade}
                                onChange={(e) => setData('prioridade', e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                            >
                                <option value="baixa">Baixa</option>
                                <option value="media">Média</option>
                                <option value="alta">Alta</option>
                                <option value="urgente">Urgente</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2">
                            <button type="button" onClick={() => setStep(1)} className="text-sm text-zinc-400 hover:text-zinc-200">
                                ← Voltar
                            </button>
                            <div className="flex gap-2">
                                <button type="button" onClick={onClose} className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 text-sm">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processing || !data.categoria_id} className="rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
                                    {processing ? 'A criar...' : 'Criar pedido'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
