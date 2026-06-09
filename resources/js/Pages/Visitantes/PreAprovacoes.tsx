import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Users, Clock, User, Home, Phone, Calendar, Filter, Search, CheckCircle2, XCircle, AlertCircle, Plus, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface Fraccao {
    id: number;
    identificador: string;
    piso: number | null;
}

interface Condomino {
    id: number;
    user: { id: number; name: string; email: string } | null;
}

interface PreAprovacao {
    id: number;
    nome_visitante: string;
    telefone_visitante: string;
    otp_code: string;
    valida_ate: string;
    estado: 'pendente' | 'usada' | 'expirada' | 'cancelada';
    observacoes: string | null;
    sms_enviado: boolean;
    created_at: string;
    fraccao: Fraccao | null;
    condomino: Condomino | null;
}

interface Paginacao<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface MinhaFraccao {
    id: number;
    identificador: string;
    piso: number | null;
    edificio_nome: string | null;
}

interface CondominoSelect {
    id: number;
    nome: string;
    email: string | null;
    fraccoes: MinhaFraccao[];
}

interface Meta {
    role: string | null;
    is_condomino: boolean;
    is_gestor: boolean;
}

interface Filtros {
    estado: string;
    nome: string;
}

interface PageProps {
    preAprovacoes: Paginacao<PreAprovacao>;
    filtros: Filtros;
    meta: Meta;
    minhasFraccoes: MinhaFraccao[];
    condominos: CondominoSelect[];
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    pendente: { label: 'Pendente', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', icon: Clock },
    usada: { label: 'Utilizada', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
    expirada: { label: 'Expirada', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: AlertCircle },
    cancelada: { label: 'Cancelada', color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: XCircle },
};

export default function PreAprovacoes({ preAprovacoes, filtros, meta, minhasFraccoes, condominos }: PageProps) {
    const [modalAberto, setModalAberto] = useState(false);
    const [form, setForm] = useState<Filtros>(filtros);

    const aplicarFiltros = () => {
        const params: Record<string, string> = {};
        if (form.estado) params.estado = form.estado;
        if (form.nome) params.nome = form.nome;
        router.get('/visitantes/pre-aprovacoes', params, { preserveState: true, preserveScroll: true });
    };

    const limparFiltros = () => {
        setForm({ estado: '', nome: '' });
        router.get('/visitantes/pre-aprovacoes', {}, { preserveState: true, preserveScroll: true });
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
            <Head title="Pré-aprovações — ONDAKA" />

            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">Pré-aprovações</h1>
                            <p className="text-sm text-zinc-500">{preAprovacoes.total} pré-aprovações criadas</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {(meta?.is_condomino || meta?.is_gestor) && (
                            <button
                                onClick={() => setModalAberto(true)}
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-4 py-2 text-sm font-medium shadow-lg shadow-cyan-500/30"
                            >
                                <Plus className="h-4 w-4" />
                                Nova pré-aprovação
                            </button>
                        )}
                        <Link
                            href="/visitantes/dentro-agora"
                            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-medium"
                        >
                            Dentro agora
                        </Link>
                        <Link
                            href="/visitantes/historico"
                            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-medium"
                        >
                            Histórico
                        </Link>
                    </div>
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
                                <option value="pendente">Pendentes</option>
                                <option value="usada">Utilizadas</option>
                                <option value="expirada">Expiradas</option>
                                <option value="cancelada">Canceladas</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
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
                    {preAprovacoes.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-400 font-medium">Nenhuma pré-aprovação</p>
                            <p className="text-sm text-zinc-600 mt-1">Os condóminos criam pré-aprovações pela app mobile.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800">
                            {preAprovacoes.data.map((pa) => {
                                const estadoConfig = ESTADO_CONFIG[pa.estado];
                                const EstadoIcon = estadoConfig.icon;
                                return (
                                    <div key={pa.id} className="p-4 md:p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                                                    <User className="h-5 w-5 text-cyan-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-zinc-100">{pa.nome_visitante}</p>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-zinc-500">
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3.5 w-3.5" />
                                                            {pa.telefone_visitante}
                                                        </span>
                                                        {pa.fraccao && (
                                                            <span className="flex items-center gap-1">
                                                                <Home className="h-3.5 w-3.5" />
                                                                Imóvel {pa.fraccao.identificador}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-600">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Criada: {formatarDataHora(pa.created_at)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Válida até: {formatarDataHora(pa.valida_ate)}
                                                        </span>
                                                        {pa.condomino?.user && (
                                                            <span>por {pa.condomino.user.name}</span>
                                                        )}
                                                    </div>
                                                    {pa.observacoes && (
                                                        <p className="text-xs text-zinc-600 mt-1 italic">"{pa.observacoes}"</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border ${estadoConfig.color}`}
                                                >
                                                    <EstadoIcon className="h-3 w-3" />
                                                    {estadoConfig.label}
                                                </span>
                                                {pa.estado === 'pendente' && (
                                                    <span className="text-xs text-zinc-500 font-mono tabular-nums">
                                                        {pa.otp_code}
                                                    </span>
                                                )}
                                                {pa.sms_enviado && (
                                                    <span className="text-xs text-zinc-600">SMS enviado</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Paginação */}
                    {preAprovacoes.last_page > 1 && (
                        <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                            <p className="text-sm text-zinc-500">
                                Página {preAprovacoes.current_page} de {preAprovacoes.last_page}
                            </p>
                            <div className="flex gap-1">
                                {preAprovacoes.links.map((link, i) => (
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
            {modalAberto && (
                <ModalNovaPreAprovacao
                    aberto={modalAberto}
                    onClose={() => setModalAberto(false)}
                    isCondomino={meta?.is_condomino ?? false}
                    minhasFraccoes={minhasFraccoes ?? []}
                    condominos={condominos ?? []}
                />
            )}
        </AuthenticatedLayout>
    );
}


// ============================
// Modal "Nova pré-aprovação"
// ============================
interface ModalProps {
    aberto: boolean;
    onClose: () => void;
    isCondomino: boolean;
    minhasFraccoes: MinhaFraccao[];
    condominos: CondominoSelect[];
}

function ModalNovaPreAprovacao({ aberto, onClose, isCondomino, minhasFraccoes, condominos }: ModalProps) {
    const [condominoId, setCondominoId] = useState<number | null>(null);
    const [fraccaoId, setFraccaoId] = useState<number | null>(
        isCondomino && minhasFraccoes.length > 0 ? minhasFraccoes[0].id : null
    );
    const [nomeVisitante, setNomeVisitante] = useState('');
    const [telefoneVisitante, setTelefoneVisitante] = useState('');
    const [validaDesde, setValidaDesde] = useState('');
    const [validaAte, setValidaAte] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [erros, setErros] = useState<Record<string, string>>({});

    if (!aberto) return null;

    // Para gestor: ao escolher condomino, mostrar fraccoes deste
    const condominoSelecionado = condominos.find((c) => c.id === condominoId);
    const fraccoesDisponiveis = isCondomino ? minhasFraccoes : (condominoSelecionado?.fraccoes ?? []);

    const submit = async () => {
        const novosErros: Record<string, string> = {};
        if (!isCondomino && !condominoId) novosErros.condomino_id = 'Escolha o condómino.';
        if (!fraccaoId) novosErros.fraccao_id = 'Escolha a fracção.';
        if (!nomeVisitante.trim()) novosErros.nome_visitante = 'Nome do visitante obrigatório.';
        if (!telefoneVisitante.trim()) novosErros.telefone_visitante = 'Telefone obrigatório.';
        if (!validaAte) novosErros.valida_ate = 'Data/hora de validade é obrigatória.';

        if (Object.keys(novosErros).length > 0) {
            setErros(novosErros);
            toast.error('Por favor preencha os campos obrigatórios.');
            return;
        }

        setErros({});
        setEnviando(true);

        const payload: Record<string, unknown> = {
            fraccao_id: fraccaoId,
            nome_visitante: nomeVisitante,
            telefone_visitante: telefoneVisitante,
            valida_ate: validaAte,
        };
        if (!isCondomino) payload.condomino_id = condominoId;
        if (validaDesde) payload.valida_desde = validaDesde;
        if (observacoes.trim()) payload.observacoes = observacoes;

        router.post('/visitantes/pre-aprovacoes', payload, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pre-aprovacao criada com sucesso!');
                onClose();
            },
            onError: (errs) => {
                const novos: Record<string, string> = {};
                Object.entries(errs).forEach(([k, v]) => {
                    novos[k] = Array.isArray(v) ? String(v[0]) : String(v);
                });
                setErros(novos);
                toast.error('Ha campos invalidos.');
            },
            onFinish: () => setEnviando(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md py-8 px-4" onClick={onClose}>
            <div
                className="bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-cyan-400" />
                        Nova pré-aprovação
                    </h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Para gestor: escolher condómino */}
                    {!isCondomino && (
                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">
                                Condómino *
                            </label>
                            <select
                                value={condominoId ?? ''}
                                onChange={(e) => {
                                    const id = e.target.value ? Number(e.target.value) : null;
                                    setCondominoId(id);
                                    setFraccaoId(null);
                                }}
                                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                            >
                                <option value="">Escolha um condómino...</option>
                                {condominos.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nome} {c.email && `(${c.email})`}
                                    </option>
                                ))}
                            </select>
                            {erros.condomino_id && <p className="text-xs text-red-400 mt-1">{erros.condomino_id}</p>}
                        </div>
                    )}

                    {/* Fracção */}
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">
                            Fracção *
                        </label>
                        <select
                            value={fraccaoId ?? ''}
                            onChange={(e) => setFraccaoId(e.target.value ? Number(e.target.value) : null)}
                            disabled={fraccoesDisponiveis.length === 0}
                            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                        >
                            <option value="">Escolha a fracção...</option>
                            {fraccoesDisponiveis.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.edificio_nome ? `${f.edificio_nome} — ` : ''}
                                    {f.identificador}
                                    {f.piso !== null ? ` (Piso ${f.piso})` : ''}
                                </option>
                            ))}
                        </select>
                        {fraccoesDisponiveis.length === 0 && !isCondomino && condominoId && (
                            <p className="text-xs text-amber-400 mt-1">Este condómino não tem fracções activas.</p>
                        )}
                        {erros.fraccao_id && <p className="text-xs text-red-400 mt-1">{erros.fraccao_id}</p>}
                    </div>

                    {/* Nome visitante */}
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">
                            Nome do visitante *
                        </label>
                        <input
                            type="text"
                            value={nomeVisitante}
                            onChange={(e) => setNomeVisitante(e.target.value)}
                            placeholder="João Silva"
                            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                        />
                        {erros.nome_visitante && <p className="text-xs text-red-400 mt-1">{erros.nome_visitante}</p>}
                    </div>

                    {/* Telefone */}
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">
                            Telefone *
                        </label>
                        <input
                            type="tel"
                            value={telefoneVisitante}
                            onChange={(e) => setTelefoneVisitante(e.target.value)}
                            placeholder="+244 923 456 789"
                            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                        />
                        {erros.telefone_visitante && <p className="text-xs text-red-400 mt-1">{erros.telefone_visitante}</p>}
                    </div>

                    {/* Datas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">
                                Válida desde
                            </label>
                            <input
                                type="datetime-local"
                                value={validaDesde}
                                onChange={(e) => setValidaDesde(e.target.value)}
                                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                            />
                            <p className="text-[10px] text-white/40 mt-0.5">Opcional. Vazio = imediato.</p>
                        </div>
                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">
                                Válida até *
                            </label>
                            <input
                                type="datetime-local"
                                value={validaAte}
                                onChange={(e) => setValidaAte(e.target.value)}
                                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                            />
                            {erros.valida_ate && <p className="text-xs text-red-400 mt-1">{erros.valida_ate}</p>}
                        </div>
                    </div>

                    {/* Observações */}
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">
                            Observações
                        </label>
                        <textarea
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            rows={2}
                            maxLength={500}
                            placeholder="Ex: Mobiliário, electricista, etc."
                            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                        />
                    </div>
                </div>

                <div className="p-5 border-t border-white/5 flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        disabled={enviando}
                        className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={submit}
                        disabled={enviando}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-sm font-semibold disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                        {enviando ? 'A criar...' : 'Criar pré-aprovação'}
                    </button>
                </div>
            </div>
        </div>
    );
}
