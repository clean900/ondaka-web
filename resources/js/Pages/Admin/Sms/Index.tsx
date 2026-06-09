import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { MessageSquare, CircleX, Clock, CircleCheck, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

type EstadoSms = 'enviado' | 'entregue' | 'pendente' | 'falhado' | 'rejeitado';

type CategoriaSms = 'sistema' | 'notificacao' | 'manual_cliente' | 'manual_admin' | 'teste';

interface Sms {
    id: number;
    created_at: string;
    numero_mascarado: string;
    mensagem: string;
    tamanho_chars: number;
    segmentos: number;
    categoria: CategoriaSms | string;
    trigger: string | null;
    estado: EstadoSms;
    saldo_devolvido: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Meta {
    current_page: number;
    last_page: number;
    total: number;
}

interface Logs {
    data: Sms[];
    links: PaginationLink[];
    meta: Meta;
}

interface Contadores {
    enviados_hoje: number;
    falhas_hoje: number;
    total_hoje: number;
    taxa_sucesso_24h: number;
    saldo_provider: number | null;
}

interface Filtros {
    q?: string;
    estado?: string;
    categoria?: string;
    periodo?: string;
}

interface Props {
    logs: Logs;
    contadores: Contadores;
    filtros: Filtros;
}

const ESTADO_CONFIG: Record<EstadoSms, { label: string; color: string; icon: typeof CircleCheck }> = {
    enviado: {
        label: 'Enviado',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        icon: CircleCheck,
    },
    entregue: {
        label: 'Entregue',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        icon: CircleCheck,
    },
    pendente: {
        label: 'Pendente',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        icon: Clock,
    },
    falhado: {
        label: 'Falhado',
        color: 'text-red-400 bg-red-500/10 border-red-500/30',
        icon: CircleX,
    },
    rejeitado: {
        label: 'Rejeitado',
        color: 'text-red-400 bg-red-500/10 border-red-500/30',
        icon: CircleX,
    },
};

const CATEGORIA_LABELS: Record<string, string> = {
    sistema: 'Sistema',
    notificacao: 'Notificação',
    manual_cliente: 'Manual (cliente)',
    manual_admin: 'Manual (admin)',
    teste: 'Teste',
};

export default function AdminSmsIndex({ logs, contadores, filtros }: Props) {
    const [busca, setBusca] = useState(filtros.q || '');

    const aplicarFiltro = (chave: string, valor: string) => {
        router.get(
            '/admin/sms',
            { ...filtros, [chave]: valor },
            { preserveState: true, preserveScroll: true },
        );
    };

    const submeterBusca = (e: FormEvent) => {
        e.preventDefault();
        aplicarFiltro('q', busca);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Admin SMS — ONDAKA" />

            <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">SMS</h1>
                        <p className="text-sm text-zinc-500">Logs, envios e reenvio de mensagens</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Enviados hoje</p>
                        <p className="text-2xl font-bold text-emerald-400 mt-1">{contadores.enviados_hoje}</p>
                    </div>

                    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Falhas hoje</p>
                        <p className="text-2xl font-bold text-red-400 mt-1">{contadores.falhas_hoje}</p>
                    </div>

                    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Total hoje</p>
                        <p className="text-2xl font-bold text-zinc-100 mt-1">{contadores.total_hoje}</p>
                    </div>

                    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Sucesso 24h</p>
                        <p className="text-2xl font-bold text-cyan-400 mt-1">
                            {contadores.taxa_sucesso_24h}
                            <span className="text-sm">%</span>
                        </p>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 p-4">
                        <p className="text-xs uppercase tracking-wide text-cyan-400/80">Saldo TelcoSMS</p>
                        <p className="text-2xl font-bold text-zinc-100 mt-1">
                            {contadores.saldo_provider !== null ? contadores.saldo_provider : '—'}
                            <span className="text-xs text-zinc-500 ml-1">SMS</span>
                        </p>
                    </div>
                </div>

                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 mb-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <form onSubmit={submeterBusca} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <input
                                    type="text"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Pesquisar por número, mensagem, trigger..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                                />
                            </div>
                        </form>

                        <select
                            value={filtros.estado ?? ''}
                            onChange={(e) => aplicarFiltro('estado', e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        >
                            <option value="">Todos estados</option>
                            <option value="enviado">Enviado</option>
                            <option value="entregue">Entregue</option>
                            <option value="pendente">Pendente</option>
                            <option value="falhado">Falhado</option>
                            <option value="rejeitado">Rejeitado</option>
                        </select>

                        <select
                            value={filtros.categoria ?? ''}
                            onChange={(e) => aplicarFiltro('categoria', e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        >
                            <option value="">Todas categorias</option>
                            <option value="sistema">Sistema</option>
                            <option value="notificacao">Notificação</option>
                            <option value="manual_cliente">Manual cliente</option>
                            <option value="manual_admin">Manual admin</option>
                            <option value="teste">Teste</option>
                        </select>

                        <select
                            value={filtros.periodo ?? 'hoje'}
                            onChange={(e) => aplicarFiltro('periodo', e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        >
                            <option value="hoje">Hoje</option>
                            <option value="7d">Últimos 7 dias</option>
                            <option value="30d">Últimos 30 dias</option>
                            <option value="90d">Últimos 90 dias</option>
                        </select>
                    </div>
                </div>

                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                    {logs.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <MessageSquare className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-400">Nenhum SMS encontrado</p>
                            <p className="text-xs text-zinc-600 mt-1">
                                Ajuste os filtros ou envie um SMS de teste
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-800 bg-zinc-950/50">
                                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold">
                                            Data
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold">
                                            Número
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold">
                                            Mensagem
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold">
                                            Categoria
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold">
                                            Trigger
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold">
                                            Estado
                                        </th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.data.map((sms) => {
                                        const config = ESTADO_CONFIG[sms.estado] ?? ESTADO_CONFIG.pendente;
                                        const Icon = config.icon;
                                        const data = new Date(sms.created_at);

                                        return (
                                            <tr
                                                key={sms.id}
                                                className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition"
                                            >
                                                <td className="px-4 py-3 text-sm text-zinc-400 whitespace-nowrap">
                                                    <div>{data.toLocaleDateString('pt-PT')}</div>
                                                    <div className="text-xs text-zinc-600">
                                                        {data.toLocaleTimeString('pt-PT', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-mono text-zinc-300">
                                                    {sms.numero_mascarado}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-zinc-400 max-w-md">
                                                    <div className="truncate">{sms.mensagem}</div>
                                                    <div className="text-xs text-zinc-600 mt-0.5">
                                                        {sms.tamanho_chars} chars · {sms.segmentos} segmento
                                                        {sms.segmentos > 1 ? 's' : ''}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-zinc-400">
                                                    {CATEGORIA_LABELS[sms.categoria] ?? sms.categoria}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-zinc-500 font-mono">
                                                    {sms.trigger ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${config.color}`}
                                                    >
                                                        <Icon className="h-3 w-3" />
                                                        {config.label}
                                                    </span>
                                                    {sms.saldo_devolvido && (
                                                        <div className="text-xs text-amber-400/70 mt-1">
                                                            ↩ crédito devolvido
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={`/admin/sms/${sms.id}`}
                                                        className="text-xs text-cyan-400 hover:text-cyan-300 whitespace-nowrap"
                                                    >
                                                        Abrir →
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {logs.meta.last_page > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-xs text-zinc-500">
                            Mostrando {logs.data.length} de {logs.meta.total} · Página{' '}
                            {logs.meta.current_page} de {logs.meta.last_page}
                        </p>
                        <div className="flex gap-1">
                            {logs.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.get(link.url, {}, { preserveScroll: true })
                                    }
                                    className={`px-3 py-1.5 text-xs rounded-md ${
                                        link.active
                                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                            : link.url
                                              ? 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                                              : 'text-zinc-700 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
