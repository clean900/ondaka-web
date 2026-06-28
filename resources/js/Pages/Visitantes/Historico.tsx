import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Clock, Users, User, Home, Key, LogIn, LogOut, Search, Filter, Package, AlertTriangle, Car } from 'lucide-react';
import { useState } from 'react';

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

interface Guarda {
    id: number;
    name: string;
}

interface VisitaItem {
    id: number;
    descricao: string;
    quantidade: number;
    estado: 'dentro' | 'saiu' | 'ficou';
    registado_na_entrada: boolean;
}

interface Visita {
    id: number;
    entrou_em: string;
    saiu_em: string | null;
    metodo_validacao: 'qr' | 'otp' | 'manual';
    observacoes: string | null;
    matricula: string | null;
    visitante: Visitante | null;
    fraccao: Fraccao | null;
    guarda_entrada: Guarda | null;
    guarda_saida: Guarda | null;
    itens?: VisitaItem[];
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
    desde: string;
    ate: string;
    nome: string;
    metodo: string;
}

interface PageProps {
    visitas: Paginacao<Visita>;
    filtros: Filtros;
}

const METODO_CONFIG: Record<string, { label: string; color: string }> = {
    qr: { label: 'QR', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    otp: { label: 'OTP', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    manual: { label: 'Manual', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
};

export default function Historico({ visitas, filtros }: PageProps) {
    const [form, setForm] = useState<Filtros>(filtros);

    const aplicarFiltros = () => {
        const params: Record<string, string> = {};
        if (form.desde) params.desde = form.desde;
        if (form.ate) params.ate = form.ate;
        if (form.nome) params.nome = form.nome;
        if (form.metodo) params.metodo = form.metodo;

        router.get('/visitantes/historico', params, { preserveState: true, preserveScroll: true });
    };

    const limparFiltros = () => {
        setForm({ desde: '', ate: '', nome: '', metodo: '' });
        router.get('/visitantes/historico', {}, { preserveState: true, preserveScroll: true });
    };

    const formatarDataHora = (iso: string) => {
        const d = new Date(iso);
        const dia = d.getDate().toString().padStart(2, '0');
        const mes = (d.getMonth() + 1).toString().padStart(2, '0');
        const ano = d.getFullYear();
        const hora = d.getHours().toString().padStart(2, '0');
        const min = d.getMinutes().toString().padStart(2, '0');
        return `${dia}/${mes}/${ano} ${hora}:${min}`;
    };

    const calcularDuracao = (entrou: string, saiu: string) => {
        const inicio = new Date(entrou);
        const fim = new Date(saiu);
        const minutos = Math.floor((fim.getTime() - inicio.getTime()) / 60000);
        if (minutos < 60) return `${minutos} min`;
        const horas = Math.floor(minutos / 60);
        const resto = minutos % 60;
        return resto === 0 ? `${horas}h` : `${horas}h ${resto}min`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Histórico de visitas — ONDAKA" />

            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">Histórico de visitas</h1>
                            <p className="text-sm text-zinc-500">{visitas.total} registos encontrados</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href="/visitantes/dentro-agora"
                            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-medium"
                        >
                            <Users className="h-4 w-4" />
                            Dentro agora
                        </Link>
                    </div>
                </div>

                {/* Filtros */}
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3 text-zinc-400 text-sm">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Desde</label>
                            <input
                                type="date"
                                value={form.desde}
                                onChange={(e) => setForm({ ...form, desde: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Até</label>
                            <input
                                type="date"
                                value={form.ate}
                                onChange={(e) => setForm({ ...form, ate: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Nome do visitante</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                                <input
                                    type="text"
                                    value={form.nome}
                                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                                    placeholder="Pesquisar..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Método</label>
                            <select
                                value={form.metodo}
                                onChange={(e) => setForm({ ...form, metodo: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                            >
                                <option value="">Todos</option>
                                <option value="qr">QR Code</option>
                                <option value="otp">Código OTP</option>
                                <option value="manual">Manual</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={aplicarFiltros}
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white rounded-lg px-3 py-2 text-sm font-medium"
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

                {/* Lista */}
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                    {visitas.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <Clock className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-400 font-medium">Nenhuma visita encontrada</p>
                            <p className="text-sm text-zinc-600 mt-1">Ajuste os filtros ou espere por novas visitas.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800">
                            {visitas.data.map((v) => {
                                const metodoConfig = METODO_CONFIG[v.metodo_validacao];
                                const aindaDentro = v.saiu_em === null;
                                return (
                                    <div key={v.id} className="p-4 md:p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                                                    <User className="h-5 w-5 text-cyan-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-zinc-100">{v.visitante?.nome ?? 'Visitante'}</p>
                                                    {v.fraccao && (
                                                        <p className="text-sm text-zinc-500 flex items-center gap-1 mt-0.5">
                                                            <Home className="h-3.5 w-3.5" />
                                                            Fracção {v.fraccao.identificador}
                                                            {v.fraccao.piso !== null && ` (Piso ${v.fraccao.piso})`}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-500">
                                                        <span className="flex items-center gap-1">
                                                            <LogIn className="h-3 w-3 text-emerald-400" />
                                                            Entrou: {formatarDataHora(v.entrou_em)}
                                                        </span>
                                                        {v.saiu_em ? (
                                                            <>
                                                                <span className="flex items-center gap-1">
                                                                    <LogOut className="h-3 w-3 text-red-400" />
                                                                    Saiu: {formatarDataHora(v.saiu_em)}
                                                                </span>
                                                                <span className="text-zinc-600">
                                                                    Duração: {calcularDuracao(v.entrou_em, v.saiu_em)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-emerald-400 font-medium">AINDA DENTRO</span>
                                                        )}
                                                        {v.matricula && (
                                                            <span className="flex items-center gap-1 text-zinc-400">
                                                                <Car className="h-3 w-3" />
                                                                {v.matricula}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {v.itens && v.itens.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                                            {v.itens.map((it) => (
                                                                <span
                                                                    key={it.id}
                                                                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${it.estado === 'saiu' ? 'text-emerald-400 bg-emerald-500/10' : it.estado === 'ficou' ? 'text-amber-400 bg-amber-500/10' : 'text-cyan-400 bg-cyan-500/10'}`}
                                                                >
                                                                    <Package className="h-3 w-3" />
                                                                    {it.quantidade > 1 ? `${it.quantidade}× ` : ''}
                                                                    {it.descricao}
                                                                    {!it.registado_na_entrada && <AlertTriangle className="h-3 w-3 text-amber-400" />}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border ${metodoConfig.color}`}
                                                >
                                                    <Key className="h-3 w-3" />
                                                    {metodoConfig.label}
                                                </span>
                                                {aindaDentro && (
                                                    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                                        Activa
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Paginação */}
                    {visitas.last_page > 1 && (
                        <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                            <p className="text-sm text-zinc-500">
                                Página {visitas.current_page} de {visitas.last_page}
                            </p>
                            <div className="flex gap-1">
                                {visitas.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        preserveState
                                        preserveScroll
                                        className={`px-3 py-1 text-sm rounded-md ${
                                            link.active
                                                ? 'bg-cyan-500 text-zinc-950 font-medium'
                                                : link.url
                                                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                                : 'text-zinc-700 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
