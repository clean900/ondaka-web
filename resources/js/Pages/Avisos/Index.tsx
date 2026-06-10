import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Megaphone, Filter, Search, Plus, FileText, Archive,
    Clock, CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';

interface Condominio { id: number; nome: string; }
interface UserBasic { id: number; name: string; }

interface Aviso {
    id: number;
    titulo: string;
    descricao: string;
    categoria: string;
    prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
    estado: 'rascunho' | 'agendado' | 'publicado' | 'arquivado';
    publicado_em: string | null;
    publicar_em: string | null;
    created_at: string;
    autor?: UserBasic | null;
    condominio?: Condominio | null;
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
    condominio_id?: string;
    q?: string;
}

interface PageProps {
    avisos: Paginacao<Aviso>;
    condominios: Condominio[];
    filtros: Filtros;
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    rascunho: { label: 'Rascunho', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30', icon: FileText },
    agendado: { label: 'Agendado', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: Clock },
    publicado: { label: 'Publicado', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
    arquivado: { label: 'Arquivado', color: 'text-zinc-500 bg-zinc-700/20 border-zinc-700/30', icon: Archive },
};

const PRIORIDADE_CONFIG: Record<string, { label: string; color: string }> = {
    baixa: { label: 'Baixa', color: 'text-zinc-400' },
    media: { label: 'Média', color: 'text-blue-400' },
    alta: { label: 'Alta', color: 'text-amber-400' },
    urgente: { label: 'Urgente', color: 'text-red-400' },
};

const CATEGORIA_LABEL: Record<string, string> = {
    geral: 'Geral', manutencao: 'Manutenção', reuniao: 'Reunião',
    urgente: 'Urgente', evento: 'Evento', aviso_legal: 'Aviso legal', outro: 'Outro',
};

export default function AvisosIndex({ avisos, condominios, filtros }: PageProps) {
    const [form, setForm] = useState<Filtros>(filtros);

    const aplicarFiltros = () => {
        const params: Record<string, string> = {};
        if (form.estado) params.estado = form.estado;
        if (form.categoria) params.categoria = form.categoria;
        if (form.condominio_id) params.condominio_id = form.condominio_id;
        if (form.q) params.q = form.q;
        router.get('/avisos', params, { preserveState: true, preserveScroll: true });
    };

    const limparFiltros = () => {
        setForm({});
        router.get('/avisos', {}, { preserveState: true, preserveScroll: true });
    };

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

    return (
        <AuthenticatedLayout>
            <Head title="Avisos — ONDAKA" />
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                            <Megaphone className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">Avisos</h1>
                            <p className="text-sm text-zinc-500">{avisos?.total ?? 0} aviso{(avisos?.total ?? 0) !== 1 ? 's' : ''} no total</p>
                        </div>
                    </div>
                    <Link
                        href="/avisos/criar"
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Novo aviso
                    </Link>
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
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Condomínio</label>
                            <select
                                value={form.condominio_id || ''}
                                onChange={(e) => setForm({ ...form, condominio_id: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                            >
                                <option value="">Todos</option>
                                {condominios.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nome}</option>
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
                                        value={form.q || ''}
                                        onChange={(e) => setForm({ ...form, q: e.target.value })}
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
                    {avisos.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <Megaphone className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-400 font-medium">Nenhum aviso</p>
                            <p className="text-sm text-zinc-600 mt-1">Crie o primeiro aviso para comunicar com os condóminos.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800">
                            {avisos.data.map((a) => {
                                const estadoCfg = ESTADO_CONFIG[a.estado] ?? ESTADO_CONFIG.rascunho;
                                const EstadoIcon = estadoCfg.icon;
                                const prioCfg = PRIORIDADE_CONFIG[a.prioridade] ?? PRIORIDADE_CONFIG.media;
                                return (
                                    <Link
                                        key={a.id}
                                        href={`/avisos/${a.id}`}
                                        className="block p-4 md:p-5 hover:bg-zinc-900 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                                    <Megaphone className="h-5 w-5 text-purple-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-semibold text-zinc-100">{a.titulo}</p>
                                                        <span className={`text-xs font-semibold ${prioCfg.color}`}>
                                                            • {prioCfg.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">{a.descricao}</p>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-zinc-600">
                                                        <span>{CATEGORIA_LABEL[a.categoria] ?? a.categoria}</span>
                                                        {a.condominio && <span>· {a.condominio.nome}</span>}
                                                        {a.autor && <span>· {a.autor.name}</span>}
                                                        <span>· {a.estado === 'publicado' ? formatarData(a.publicado_em) : formatarData(a.created_at)}</span>
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

                {avisos.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-4">
                        {avisos.links.map((link, i) => (
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
            </div>
        </AuthenticatedLayout>
    );
}
