import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Package, Filter, Search, Clock, CheckCircle2, XCircle,
    AlertCircle, AlertTriangle, MapPin, User, Home, Calendar,
    Settings, Plus, X, DollarSign, Unlock, FileText, UserPlus, Loader2,
} from 'lucide-react';
import { useState, FormEventHandler } from 'react';

interface Fraccao { id: number; identificador: string; }
interface Condomino { id: number; nome_completo: string; }

interface Encomenda {
    id: number;
    descricao: string;
    remetente: string | null;
    notas_guarda: string | null;
    estado: 'aguarda_chegada' | 'aguarda_levantamento' | 'entregue' | 'multa_aplicada' | 'cancelada';
    origem: 'pre_anunciada' | 'sem_aviso';
    local_atual: 'portaria' | 'administracao' | 'entregue';
    chegou_em: string | null;
    levantada_em: string | null;
    levantada_por: string | null;
    multa_aplicada_em: string | null;
    multa_valor_kz: string | null;
    multa_estado: 'pendente' | 'paga' | 'desbloqueada' | null;
    multa_pago_via: 'proxypay' | 'extracto' | 'dinheiro' | null;
    multa_pago_em: string | null;
    multa_pago_observacoes: string | null;
    created_at: string;
    fraccao: Fraccao | null;
    condomino: Condomino | null;
    recebida_por?: { id: number; name: string } | null;
    entregue_por?: { id: number; name: string } | null;
}

interface Paginacao<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Filtros { estado: string; pesquisa: string; }

interface Stats { total: number; na_portaria: number; multa_pendente: number; entregues_mes: number; }

interface Config {
    id?: number;
    multa_valor_padrao_kz: string;
    dias_aviso: number;
    dias_multa: number;
    permite_pagamento_proxypay: boolean;
    permite_pagamento_extracto: boolean;
    permite_pagamento_dinheiro: boolean;
}

interface PageProps {
    encomendas: Paginacao<Encomenda>;
    filtros: Filtros;
    stats: Stats;
    precisaCondominio: boolean;
    config: Config | null;
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    aguarda_chegada: { label: 'Aguarda chegada', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', icon: Clock },
    aguarda_levantamento: { label: 'Na portaria', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', icon: Package },
    entregue: { label: 'Entregue', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
    multa_aplicada: { label: 'Multa aplicada', color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: AlertTriangle },
    cancelada: { label: 'Cancelada', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30', icon: XCircle },
};

const ORIGEM_LABEL: Record<string, string> = {
    pre_anunciada: 'Pré-anunciada',
    sem_aviso: 'Sem aviso',
};

export default function EncomendasIndex({ encomendas, filtros, stats, precisaCondominio, config }: PageProps) {
    const [form, setForm] = useState<Filtros>(filtros);
    const [encomendaAberta, setEncomendaAberta] = useState<Encomenda | null>(null);
    const [modalConfig, setModalConfig] = useState(false);
    const [modalCobrar, setModalCobrar] = useState(false);
    const [modalDesbloquear, setModalDesbloquear] = useState(false);
    const [modalNova, setModalNova] = useState(false);

    const aplicarFiltros = () => {
        const params: Record<string, string> = {};
        if (form.estado) params.estado = form.estado;
        if (form.pesquisa) params.pesquisa = form.pesquisa;
        router.get('/encomendas', params, { preserveState: true, preserveScroll: true });
    };

    const limparFiltros = () => {
        setForm({ estado: '', pesquisa: '' });
        router.get('/encomendas', {}, { preserveState: true, preserveScroll: true });
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

    return (
        <AuthenticatedLayout>
            <Head title="Encomendas — ONDAKA" />
            <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">Encomendas</h1>
                            <p className="text-sm text-zinc-500">{stats.total} encomendas registadas</p>
                        </div>
                    </div>

                    {!precisaCondominio && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setModalNova(true)}
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium"
                            >
                                <Plus className="h-4 w-4" />
                                Nova encomenda
                            </button>
                            <button
                                onClick={() => setModalConfig(true)}
                                className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-medium"
                            >
                                <Settings className="h-4 w-4" />
                                Config
                            </button>
                        </div>
                    )}
                </div>

                {precisaCondominio ? (
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-6 text-center">
                        <AlertCircle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
                        <p className="text-amber-300 font-medium">Selecciona um condomínio activo</p>
                        <p className="text-sm text-amber-200/70 mt-1">Para gerir encomendas, define primeiro o condomínio activo no teu perfil.</p>
                    </div>
                ) : (
                    <>
                        {/* Stats cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <StatCard label="Total" valor={stats.total} icon={Package} cor="text-zinc-300 bg-zinc-500/10" />
                            <StatCard label="Na portaria" valor={stats.na_portaria} icon={MapPin} cor="text-cyan-400 bg-cyan-500/10" />
                            <StatCard label="Multa pendente" valor={stats.multa_pendente} icon={AlertTriangle} cor="text-red-400 bg-red-500/10" />
                            <StatCard label="Entregues este mês" valor={stats.entregues_mes} icon={CheckCircle2} cor="text-emerald-400 bg-emerald-500/10" />
                        </div>

                        {/* Filtros */}
                        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 mb-4">
                            <div className="flex items-center gap-2 mb-3 text-zinc-400 text-sm">
                                <Filter className="h-4 w-4" />
                                Filtros
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1">Estado</label>
                                    <select
                                        value={form.estado}
                                        onChange={(e) => setForm({ ...form, estado: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                    >
                                        <option value="">Todos</option>
                                        <option value="aguarda_chegada">Aguarda chegada</option>
                                        <option value="aguarda_levantamento">Na portaria</option>
                                        <option value="entregue">Entregue</option>
                                        <option value="multa_aplicada">Multa aplicada</option>
                                        <option value="cancelada">Cancelada</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-zinc-500 mb-1">Pesquisar</label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                                        <input
                                            type="text"
                                            value={form.pesquisa}
                                            onChange={(e) => setForm({ ...form, pesquisa: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                                            placeholder="Descrição ou nome do condómino..."
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200"
                                        />
                                    </div>
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
                            {encomendas.data.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Package className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                                    <p className="text-zinc-400 font-medium">Nenhuma encomenda</p>
                                    <p className="text-sm text-zinc-600 mt-1">As encomendas aparecem aqui quando o guarda regista ou os condóminos pré-anunciam.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-800">
                                    {encomendas.data.map((e) => {
                                        const estadoConfig = ESTADO_CONFIG[e.estado];
                                        const EstadoIcon = estadoConfig.icon;
                                        return (
                                            <button
                                                key={e.id}
                                                onClick={() => setEncomendaAberta(e)}
                                                className="w-full p-4 md:p-5 hover:bg-zinc-900 text-left transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                                            <Package className="h-5 w-5 text-purple-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-zinc-100">{e.descricao}</p>
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-zinc-500">
                                                                {e.condomino && (
                                                                    <span className="flex items-center gap-1">
                                                                        <User className="h-3.5 w-3.5" />
                                                                        {e.condomino.nome_completo}
                                                                    </span>
                                                                )}
                                                                {e.fraccao && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Home className="h-3.5 w-3.5" />
                                                                        Fracção {e.fraccao.identificador}
                                                                    </span>
                                                                )}
                                                                {e.remetente && (
                                                                    <span className="text-zinc-600">· {e.remetente}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-600">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    Registada {formatarDataHora(e.created_at)}
                                                                </span>
                                                                <span>· {ORIGEM_LABEL[e.origem]}</span>
                                                                {e.multa_valor_kz && (
                                                                    <span className="text-red-400">
                                                                        · Multa {Number(e.multa_valor_kz).toLocaleString('pt-AO')} Kz ({e.multa_estado})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${estadoConfig.color} flex-shrink-0`}>
                                                        <EstadoIcon className="h-3.5 w-3.5" />
                                                        {estadoConfig.label}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Paginação */}
                        {encomendas.last_page > 1 && (
                            <div className="flex items-center justify-center gap-1 mt-4">
                                {encomendas.links.map((link, i) => (
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
                    </>
                )}

                {/* DRAWER de detalhe */}
                {encomendaAberta && (
                    <Drawer
                        encomenda={encomendaAberta}
                        onClose={() => setEncomendaAberta(null)}
                        onCobrarMulta={() => setModalCobrar(true)}
                        onDesbloquear={() => setModalDesbloquear(true)}
                        formatarDataHora={formatarDataHora}
                    />
                )}

                {/* MODAL Configurações */}
                {modalConfig && config && (
                    <ModalConfig config={config} onClose={() => setModalConfig(false)} />
                )}

                {/* MODAL Cobrar multa */}
                {modalCobrar && encomendaAberta && (
                    <ModalCobrarMulta
                        encomenda={encomendaAberta}
                        onClose={() => setModalCobrar(false)}
                        onSucesso={() => { setModalCobrar(false); setEncomendaAberta(null); }}
                        config={config}
                    />
                )}

                {/* MODAL Desbloquear */}
                {modalDesbloquear && encomendaAberta && (
                    <ModalDesbloquear
                        encomenda={encomendaAberta}
                        onClose={() => setModalDesbloquear(false)}
                        onSucesso={() => { setModalDesbloquear(false); setEncomendaAberta(null); }}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}

// =============================================================================
// COMPONENTES
// =============================================================================

function StatCard({ label, valor, icon: Icon, cor }: { label: string; valor: number; icon: typeof Package; cor: string }) {
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

function Drawer({ encomenda, onClose, onCobrarMulta, onDesbloquear, formatarDataHora }: {
    encomenda: Encomenda;
    onClose: () => void;
    onCobrarMulta: () => void;
    onDesbloquear: () => void;
    formatarDataHora: (iso: string) => string;
}) {
    const estadoConfig = ESTADO_CONFIG[encomenda.estado];
    const EstadoIcon = estadoConfig.icon;
    const temMultaPendente = encomenda.estado === 'multa_aplicada' && encomenda.multa_estado === 'pendente';

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/60" onClick={onClose} />
            <div className="w-full max-w-lg bg-zinc-950 border-l border-zinc-800 overflow-y-auto">
                <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 p-5 flex items-center justify-between z-10">
                    <h2 className="text-lg font-bold text-zinc-100">Detalhe</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Estado */}
                    <div>
                        <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${estadoConfig.color}`}>
                            <EstadoIcon className="h-3.5 w-3.5" />
                            {estadoConfig.label}
                        </span>
                    </div>

                    {/* Descrição */}
                    <div>
                        <h3 className="text-xl font-bold text-zinc-100">{encomenda.descricao}</h3>
                        {encomenda.remetente && <p className="text-sm text-zinc-500 mt-1">Remetente: {encomenda.remetente}</p>}
                    </div>

                    {/* Destinatário */}
                    <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
                        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Destinatário</p>
                        {encomenda.condomino && <p className="text-zinc-100 font-medium">{encomenda.condomino.nome_completo}</p>}
                        {encomenda.fraccao && <p className="text-sm text-zinc-400 mt-0.5">Fracção {encomenda.fraccao.identificador}</p>}
                    </div>

                    {/* Linha do tempo */}
                    <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
                        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Linha do tempo</p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between">
                                <span className="text-zinc-400">Registada</span>
                                <span className="text-zinc-200">{formatarDataHora(encomenda.created_at)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-zinc-400">Origem</span>
                                <span className="text-zinc-200">{ORIGEM_LABEL[encomenda.origem]}</span>
                            </li>
                            {encomenda.chegou_em && (
                                <li className="flex justify-between">
                                    <span className="text-zinc-400">Chegou à portaria</span>
                                    <span className="text-zinc-200">{formatarDataHora(encomenda.chegou_em)}</span>
                                </li>
                            )}
                            {encomenda.recebida_por && (
                                <li className="flex justify-between">
                                    <span className="text-zinc-400">Recebida por</span>
                                    <span className="text-zinc-200">{encomenda.recebida_por.name}</span>
                                </li>
                            )}
                            {encomenda.multa_aplicada_em && (
                                <li className="flex justify-between">
                                    <span className="text-zinc-400">Multa aplicada</span>
                                    <span className="text-red-400">{formatarDataHora(encomenda.multa_aplicada_em)}</span>
                                </li>
                            )}
                            {encomenda.levantada_em && (
                                <li className="flex justify-between">
                                    <span className="text-zinc-400">Levantada em</span>
                                    <span className="text-zinc-200">{formatarDataHora(encomenda.levantada_em)}</span>
                                </li>
                            )}
                            {encomenda.levantada_por && (
                                <li className="flex justify-between">
                                    <span className="text-zinc-400">Levantada por</span>
                                    <span className="text-zinc-200">{encomenda.levantada_por}</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Multa */}
                    {encomenda.multa_valor_kz && (
                        <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4">
                            <p className="text-xs text-red-300 uppercase tracking-wide mb-2">Multa</p>
                            <p className="text-2xl font-bold text-zinc-100">
                                {Number(encomenda.multa_valor_kz).toLocaleString('pt-AO')} Kz
                            </p>
                            <p className="text-sm text-red-300 mt-1">Estado: {encomenda.multa_estado}</p>
                            {encomenda.multa_pago_via && <p className="text-xs text-zinc-400 mt-2">Pago via: {encomenda.multa_pago_via}</p>}
                            {encomenda.multa_pago_em && <p className="text-xs text-zinc-400">Pago em: {formatarDataHora(encomenda.multa_pago_em)}</p>}
                            {encomenda.multa_pago_observacoes && (
                                <p className="text-xs text-zinc-400 mt-2 italic">"{encomenda.multa_pago_observacoes}"</p>
                            )}
                        </div>
                    )}

                    {/* Notas guarda */}
                    {encomenda.notas_guarda && (
                        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
                            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" />
                                Notas do guarda
                            </p>
                            <p className="text-sm text-zinc-300">{encomenda.notas_guarda}</p>
                        </div>
                    )}

                    {/* Acções */}
                    {temMultaPendente && (
                        <div className="space-y-2 pt-2">
                            <button
                                onClick={onCobrarMulta}
                                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white rounded-lg px-4 py-2.5 text-sm font-medium"
                            >
                                <DollarSign className="h-4 w-4" />
                                Cobrar multa
                            </button>
                            <button
                                onClick={onDesbloquear}
                                className="w-full inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-lg px-4 py-2.5 text-sm"
                            >
                                <Unlock className="h-4 w-4" />
                                Desbloquear sem cobrança
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ModalConfig({ config, onClose }: { config: Config; onClose: () => void }) {
    const { data, setData, put, processing, errors } = useForm({
        multa_valor_padrao_kz: config.multa_valor_padrao_kz,
        dias_aviso: config.dias_aviso,
        dias_multa: config.dias_multa,
        permite_pagamento_proxypay: config.permite_pagamento_proxypay,
        permite_pagamento_extracto: config.permite_pagamento_extracto,
        permite_pagamento_dinheiro: config.permite_pagamento_dinheiro,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/encomendas/config', { onSuccess: () => onClose(), preserveScroll: true });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="border-b border-zinc-800 p-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configurações
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Multa padrão (Kz)</label>
                        <input
                            type="number" step="0.01" min="0"
                            value={data.multa_valor_padrao_kz}
                            onChange={(e) => setData('multa_valor_padrao_kz', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                        />
                        {errors.multa_valor_padrao_kz && <p className="text-xs text-red-400 mt-1">{errors.multa_valor_padrao_kz}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Dias até aviso</label>
                            <input
                                type="number" min="1" max="30"
                                value={data.dias_aviso}
                                onChange={(e) => setData('dias_aviso', parseInt(e.target.value))}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                            />
                            {errors.dias_aviso && <p className="text-xs text-red-400 mt-1">{errors.dias_aviso}</p>}
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Dias até multa</label>
                            <input
                                type="number" min="1" max="60"
                                value={data.dias_multa}
                                onChange={(e) => setData('dias_multa', parseInt(e.target.value))}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                            />
                            {errors.dias_multa && <p className="text-xs text-red-400 mt-1">{errors.dias_multa}</p>}
                        </div>
                    </div>

                    <div>
                        <p className="block text-xs text-zinc-400 mb-2">Vias de pagamento permitidas</p>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-zinc-300">
                                <input type="checkbox" checked={data.permite_pagamento_proxypay} onChange={(e) => setData('permite_pagamento_proxypay', e.target.checked)} />
                                ProxyPay
                            </label>
                            <label className="flex items-center gap-2 text-sm text-zinc-300">
                                <input type="checkbox" checked={data.permite_pagamento_extracto} onChange={(e) => setData('permite_pagamento_extracto', e.target.checked)} />
                                Extracto
                            </label>
                            <label className="flex items-center gap-2 text-sm text-zinc-300">
                                <input type="checkbox" checked={data.permite_pagamento_dinheiro} onChange={(e) => setData('permite_pagamento_dinheiro', e.target.checked)} />
                                Dinheiro
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 text-sm">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing} className="rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium disabled:opacity-60">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ModalCobrarMulta({ encomenda, onClose, onSucesso, config }: {
    encomenda: Encomenda;
    onClose: () => void;
    onSucesso: () => void;
    config: Config | null;
}) {
    const { data, setData, post, processing, errors } = useForm({
        valor_kz: encomenda.multa_valor_kz || '',
        via: 'dinheiro',
        observacoes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/encomendas/${encomenda.id}/cobrar-multa`, {
            onSuccess: () => onSucesso(),
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="border-b border-zinc-800 p-5">
                    <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Cobrar multa
                    </h2>
                </div>
                <form onSubmit={submit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Valor (Kz)</label>
                        <input
                            type="number" step="0.01" min="0"
                            value={data.valor_kz}
                            onChange={(e) => setData('valor_kz', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Via de pagamento</label>
                        <select
                            value={data.via}
                            onChange={(e) => setData('via', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                        >
                            {config?.permite_pagamento_dinheiro && <option value="dinheiro">Dinheiro</option>}
                            {config?.permite_pagamento_proxypay && <option value="proxypay">ProxyPay</option>}
                            {config?.permite_pagamento_extracto && <option value="extracto">Extracto</option>}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Observações</label>
                        <textarea
                            value={data.observacoes}
                            onChange={(e) => setData('observacoes', e.target.value)}
                            rows={3}
                            placeholder="Recibo, observações..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 text-sm">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing} className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium disabled:opacity-60">
                            Registar pagamento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ModalDesbloquear({ encomenda, onClose, onSucesso }: {
    encomenda: Encomenda;
    onClose: () => void;
    onSucesso: () => void;
}) {
    const { data, setData, post, processing } = useForm({ observacoes: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/encomendas/${encomenda.id}/desbloquear`, {
            onSuccess: () => onSucesso(),
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="border-b border-zinc-800 p-5">
                    <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                        <Unlock className="h-5 w-5" />
                        Desbloquear sem cobrança
                    </h2>
                </div>
                <form onSubmit={submit} className="p-5 space-y-4">
                    <p className="text-sm text-zinc-400">
                        A encomenda volta a estar disponível na portaria sem que a multa seja cobrada.
                    </p>
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Razão (opcional)</label>
                        <textarea
                            value={data.observacoes}
                            onChange={(e) => setData('observacoes', e.target.value)}
                            rows={3}
                            placeholder="Justificação para o desbloqueio..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 text-sm">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing} className="rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 text-sm font-medium disabled:opacity-60">
                            Desbloquear
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
