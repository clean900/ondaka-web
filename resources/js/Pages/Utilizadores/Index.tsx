import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, FormEvent } from 'react';
import {
    Users, UserPlus, Mail, Phone, Shield, Building2,
    Clock, MoreVertical, X, Search, Filter, RefreshCw,
    Ban, CheckCircle2, Trash2, Send, AlertCircle, Key, Lock, Pencil,
} from 'lucide-react';

interface Utilizador {
    id: number;
    name: string;
    email: string;
    telefone: string | null;
    estado: 'activo' | 'suspenso' | 'pendente';
    condominio_activo_id: number | null;
    role: string | null;
    ultimo_login_em: string | null;
    created_at: string | null;
}

interface Convite {
    id: number;
    nome: string;
    email: string;
    telefone: string | null;
    role_name: string;
    condominio_nome: string | null;
    convidado_por: string | null;
    expira_em: string;
    created_at: string;
}

interface RoleDisp { name: string; label: string; }
interface Cond { id: number; nome: string; }

interface Props {
    utilizadores: {
        data: Utilizador[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number;
        to: number;
        total: number;
    };
    convites_pendentes: Convite[];
    roles_disponiveis: RoleDisp[];
    condominios: Cond[];
    filtros: { busca?: string; role?: string; estado?: string; condominio_id?: string };
}

const roleLabel: Record<string, string> = {
    'super-admin': 'Super Admin', 'admin-empresa': 'Admin Empresa',
    'gestor': 'Gestor', 'administrador-condominio': 'Admin Condomínio',
    'condomino': 'Condómino', 'funcionario': 'Funcionário',
    'prestador': 'Prestador', 'guarda': 'Guarda',
};

const roleColor: Record<string, string> = {
    'super-admin': '#EC4899', 'admin-empresa': '#A855F7',
    'gestor': '#00D4FF', 'administrador-condominio': '#3B82F6',
    'condomino': '#10B981', 'funcionario': '#F59E0B',
    'prestador': '#6B7280', 'guarda': '#EF4444',
};

export default function Index({ utilizadores, convites_pendentes, roles_disponiveis, condominios, filtros }: Props) {
    const [modalCriar, setModalCriar] = useState(false);
    const [busca, setBusca] = useState(filtros.busca ?? '');
    const [roleFiltro, setRoleFiltro] = useState(filtros.role ?? '');
    const [estadoFiltro, setEstadoFiltro] = useState(filtros.estado ?? '');

    const aplicarFiltros = () => {
        router.get(route('utilizadores.index'), {
            busca: busca || undefined,
            role: roleFiltro || undefined,
            estado: estadoFiltro || undefined,
        }, { preserveState: true, replace: true });
    };

    const limparFiltros = () => {
        setBusca(''); setRoleFiltro(''); setEstadoFiltro('');
        router.get(route('utilizadores.index'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Utilizadores" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#00D4FF]" />
                        Utilizadores
                    </h1>
                    <p className="text-sm text-white/60 mt-1">
                        Gerir gestores, guardas, condóminos e outros utilizadores da empresa.
                    </p>
                </div>
                <button onClick={() => setModalCriar(true)} className="btn-primary">
                    <UserPlus className="w-4 h-4" />
                    Novo utilizador
                </button>
            </div>

            <div className="card-elevated mb-6">
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input type="text" placeholder="Pesquisar por nome, email ou telefone..."
                            value={busca} onChange={(e) => setBusca(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                            className="input pl-10" />
                    </div>
                    <select value={roleFiltro} onChange={(e) => setRoleFiltro(e.target.value)} className="input lg:w-52">
                        <option value="">Todas as funções</option>
                        {roles_disponiveis.map((r) => <option key={r.name} value={r.name}>{r.label}</option>)}
                    </select>
                    <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} className="input lg:w-40">
                        <option value="">Todos estados</option>
                        <option value="activo">Activo</option>
                        <option value="suspenso">Suspenso</option>
                        <option value="pendente">Pendente</option>
                    </select>
                    <button onClick={aplicarFiltros} className="btn-secondary">
                        <Filter className="w-4 h-4" />Filtrar
                    </button>
                    {(busca || roleFiltro || estadoFiltro) && (
                        <button onClick={limparFiltros} className="btn-ghost"><X className="w-4 h-4" /></button>
                    )}
                </div>
            </div>

            {convites_pendentes.length > 0 && (
                <div className="card-elevated mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-400" />
                            Convites pendentes ({convites_pendentes.length})
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {convites_pendentes.map((c) => <ConvitePendenteRow key={c.id} convite={c} />)}
                    </div>
                </div>
            )}

            <div className="card-elevated">
                <div className="overflow-x-auto -mx-5">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-left text-[10px] uppercase tracking-wider text-white/50">
                                <th className="px-5 py-3 font-medium">Nome</th>
                                <th className="px-5 py-3 font-medium">Função</th>
                                <th className="px-5 py-3 font-medium">Estado</th>
                                <th className="px-5 py-3 font-medium">Último login</th>
                                <th className="px-5 py-3 font-medium text-right">Acções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {utilizadores.data.length === 0 ? (
                                <tr><td colSpan={5} className="px-5 py-12 text-center text-white/40 text-sm">Nenhum utilizador encontrado.</td></tr>
                            ) : (
                                utilizadores.data.map((u) => <UtilizadorRow key={u.id} user={u} condominios={condominios} />)
                            )}
                        </tbody>
                    </table>
                </div>

                {utilizadores.total > utilizadores.data.length && (
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5 text-xs text-white/50">
                        <div>A mostrar {utilizadores.from}-{utilizadores.to} de {utilizadores.total}</div>
                        <div className="flex gap-1">
                            {utilizadores.links.map((l, i) => (
                                <Link key={i} href={l.url ?? '#'}
                                    className={`px-3 py-1 rounded ${l.active ? 'bg-[#00D4FF] text-black font-medium' : l.url ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-white/20 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: l.label }} preserveScroll preserveState />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {modalCriar && (
                <ModalNovoUtilizador
                    onClose={() => setModalCriar(false)}
                    rolesDisponiveis={roles_disponiveis}
                    condominios={condominios}
                />
            )}
        </AuthenticatedLayout>
    );
}

function UtilizadorRow({ user, condominios }: { user: Utilizador; condominios: Cond[] }) {
    const [menuAberto, setMenuAberto] = useState(false);
    const [modalCondominio, setModalCondominio] = useState(false);
    const [modalPassword, setModalPassword] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const cor = user.role ? roleColor[user.role] ?? '#6B7280' : '#6B7280';

    const suspender = () => {
        if (!confirm(`Suspender utilizador ${user.name}?`)) return;
        router.post(route('utilizadores.suspender', user.id));
    };
    const reactivar = () => router.post(route('utilizadores.reactivar', user.id));

    return (
        <>
            <tr className="border-b border-white/5 hover:bg-white/[0.02] transition">
                <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                            style={{ background: `${cor}25`, border: `0.5px solid ${cor}50` }}>
                            {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm text-white font-medium truncate">{user.name}</div>
                            <div className="text-xs text-white/50 truncate flex items-center gap-2">
                                <Mail className="w-3 h-3" />{user.email}
                                {user.telefone && (<><span className="text-white/20">·</span><Phone className="w-3 h-3" />{user.telefone}</>)}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wide"
                        style={{ background: `${cor}15`, color: cor, border: `0.5px solid ${cor}30` }}>
                        <Shield className="w-3 h-3" />
                        {user.role ? roleLabel[user.role] ?? user.role : 'Sem função'}
                    </span>
                </td>
                <td className="px-5 py-4"><EstadoBadge estado={user.estado} /></td>
                <td className="px-5 py-4 text-xs text-white/60">
                    {user.ultimo_login_em
                        ? new Date(user.ultimo_login_em).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                </td>
                <td className="px-5 py-4 text-right relative">
                    <button onClick={() => setMenuAberto(!menuAberto)}
                        className="p-1.5 rounded hover:bg-white/5 text-white/60 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuAberto && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(false)} />
                            <div className="absolute right-5 mt-1 w-56 bg-[#16163A] border border-white/10 rounded-lg shadow-xl z-50 py-1">
                                <button onClick={() => { setMenuAberto(false); setModalEditar(true); }}
                                    className="w-full px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5 flex items-center gap-2">
                                    <Pencil className="w-3.5 h-3.5 text-[#A855F7]" />
                                    Editar dados
                                </button>
                                <button onClick={() => { setMenuAberto(false); setModalPassword(true); }}
                                    className="w-full px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5 flex items-center gap-2">
                                    <Key className="w-3.5 h-3.5 text-[#00D4FF]" />
                                    Alterar password
                                </button>
                                {(user.role === 'guarda' || user.role === 'administrador-condominio') && (
                                    <button onClick={() => { setMenuAberto(false); setModalCondominio(true); }}
                                        className="w-full px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5 flex items-center gap-2">
                                        <Building2 className="w-3.5 h-3.5" />Mudar condomínio
                                    </button>
                                )}
                                <div className="my-1 border-t border-white/5" />
                                {user.estado === 'activo' ? (
                                    <button onClick={() => { setMenuAberto(false); suspender(); }}
                                        className="w-full px-3 py-2 text-left text-xs text-amber-400 hover:bg-white/5 flex items-center gap-2">
                                        <Ban className="w-3.5 h-3.5" />Suspender
                                    </button>
                                ) : (
                                    <button onClick={() => { setMenuAberto(false); reactivar(); }}
                                        className="w-full px-3 py-2 text-left text-xs text-emerald-400 hover:bg-white/5 flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5" />Reactivar
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </td>
            </tr>

            {modalCondominio && <ModalAlterarCondominio user={user} condominios={condominios} onClose={() => setModalCondominio(false)} />}
            {modalPassword && <ModalAlterarPassword user={user} onClose={() => setModalPassword(false)} />}
            {modalEditar && <ModalEditarUtilizador user={user} condominios={condominios} onClose={() => setModalEditar(false)} />}
        </>
    );
}

function EstadoBadge({ estado }: { estado: string }) {
    const config: Record<string, { label: string; cor: string; bg: string }> = {
        activo: { label: 'Activo', cor: '#10B981', bg: 'rgba(16,185,129,0.12)' },
        suspenso: { label: 'Suspenso', cor: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
        pendente: { label: 'Pendente', cor: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
    };
    const c = config[estado] ?? config.pendente;
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium" style={{ color: c.cor, background: c.bg }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.cor }} />
            {c.label}
        </span>
    );
}

function ConvitePendenteRow({ convite }: { convite: Convite }) {
    const reenviar = () => router.post(route('utilizadores.convites.reenviar', convite.id), {}, { preserveScroll: true });
    const cancelar = () => {
        if (!confirm(`Cancelar convite para ${convite.email}?`)) return;
        router.post(route('utilizadores.convites.cancelar', convite.id), {}, { preserveScroll: true });
    };
    const cor = roleColor[convite.role_name] ?? '#6B7280';
    const expiraEmDias = Math.max(0, Math.ceil((new Date(convite.expira_em).getTime() - Date.now()) / 86400000));

    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${cor}15`, border: `0.5px solid ${cor}30` }}>
                    <Mail className="w-3.5 h-3.5" style={{ color: cor }} />
                </div>
                <div className="min-w-0">
                    <div className="text-xs text-white font-medium truncate">{convite.nome} <span className="text-white/40">·</span> <span className="text-white/60">{convite.email}</span></div>
                    <div className="text-[10px] text-white/40 mt-0.5">
                        {roleLabel[convite.role_name] ?? convite.role_name}
                        {convite.condominio_nome && ` · ${convite.condominio_nome}`}
                        {' · '}Expira em {expiraEmDias} {expiraEmDias === 1 ? 'dia' : 'dias'}
                    </div>
                </div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={reenviar} className="p-2 rounded hover:bg-white/5 text-white/60 hover:text-white" title="Reenviar"><RefreshCw className="w-3.5 h-3.5" /></button>
                <button onClick={cancelar} className="p-2 rounded hover:bg-red-500/10 text-white/60 hover:text-red-400" title="Cancelar"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
        </div>
    );
}

function ModalNovoUtilizador({ onClose, rolesDisponiveis, condominios }: { onClose: () => void; rolesDisponiveis: RoleDisp[]; condominios: Cond[] }) {
    const [tab, setTab] = useState<'convidar' | 'criar'>('convidar');

    const formConvidar = useForm({
        nome: '', email: '', telefone: '', role_name: 'gestor',
        condominio_id: '', fraccao_id: '',
    });

    const formCriar = useForm({
        nome: '', email: '', telefone: '', role_name: 'gestor',
        condominio_id: '', password: '', forcar_troca_password: true as boolean,
    });

    const submitConvidar = (e: FormEvent) => {
        e.preventDefault();
        formConvidar.post(route('utilizadores.convidar'), {
            onSuccess: () => { formConvidar.reset(); onClose(); },
            preserveScroll: true,
        });
    };

    const submitCriar = (e: FormEvent) => {
        e.preventDefault();
        formCriar.post(route('utilizadores.criar-directo'), {
            onSuccess: () => { formCriar.reset(); onClose(); },
            preserveScroll: true,
        });
    };

    const dadosActivos = tab === 'convidar' ? formConvidar.data : formCriar.data;
    const setDadosActivos = tab === 'convidar' ? formConvidar.setData : formCriar.setData;
    const errorsActivos = tab === 'convidar' ? formConvidar.errors : formCriar.errors;
    const processingActivo = tab === 'convidar' ? formConvidar.processing : formCriar.processing;

    const precisaCondominio = ['administrador-condominio', 'guarda', 'condomino'].includes(dadosActivos.role_name);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm py-8 px-4" onClick={onClose}>
            <div className="bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-[#00D4FF]" />
                        Novo utilizador
                    </h2>
                    <button type="button" onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5">
                    <button type="button" onClick={() => setTab('convidar')}
                        className={`flex-1 px-5 py-3 text-xs font-medium uppercase tracking-wide transition ${tab === 'convidar' ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'text-white/40 hover:text-white/60'}`}>
                        <Mail className="w-3.5 h-3.5 inline mr-1.5" />
                        Convidar por email
                    </button>
                    <button type="button" onClick={() => setTab('criar')}
                        className={`flex-1 px-5 py-3 text-xs font-medium uppercase tracking-wide transition ${tab === 'criar' ? 'text-[#A855F7] border-b-2 border-[#A855F7]' : 'text-white/40 hover:text-white/60'}`}>
                        <Lock className="w-3.5 h-3.5 inline mr-1.5" />
                        Criar com password
                    </button>
                </div>

                <form onSubmit={tab === 'convidar' ? submitConvidar : submitCriar} >
                    <div className="p-5 space-y-4">
                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">Nome completo *</label>
                            <input type="text" required className="input" value={dadosActivos.nome}
                                onChange={(e) => setDadosActivos('nome' as never, e.target.value as never)} />
                            {errorsActivos.nome && <div className="text-xs text-red-400 mt-1">{errorsActivos.nome}</div>}
                        </div>

                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">Email *</label>
                            <input type="email" required className="input" value={dadosActivos.email}
                                onChange={(e) => setDadosActivos('email' as never, e.target.value as never)} />
                            {errorsActivos.email && <div className="text-xs text-red-400 mt-1">{errorsActivos.email}</div>}
                        </div>

                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">Telefone (Angola)</label>
                            <input type="tel" placeholder="+244 XXX XXX XXX" className="input" value={dadosActivos.telefone}
                                onChange={(e) => setDadosActivos('telefone' as never, e.target.value as never)} />
                            {tab === 'convidar' && <div className="text-[10px] text-white/40 mt-1">Se preencher, será enviado SMS com o link de convite.</div>}
                        </div>

                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">Função *</label>
                            <select required className="input" value={dadosActivos.role_name}
                                onChange={(e) => setDadosActivos('role_name' as never, e.target.value as never)}>
                                {rolesDisponiveis.map((r) => <option key={r.name} value={r.name}>{r.label}</option>)}
                            </select>
                            {errorsActivos.role_name && <div className="text-xs text-red-400 mt-1">{errorsActivos.role_name}</div>}
                        </div>

                        {precisaCondominio && (
                            <div>
                                <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">Condomínio *</label>
                                <select required className="input" value={dadosActivos.condominio_id}
                                    onChange={(e) => setDadosActivos('condominio_id' as never, e.target.value as never)}>
                                    <option value="">Seleccione...</option>
                                    {condominios.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                </select>
                                {errorsActivos.condominio_id && <div className="text-xs text-red-400 mt-1">{errorsActivos.condominio_id}</div>}
                            </div>
                        )}

                        {tab === 'criar' && (
                            <>
                                <div>
                                    <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">Password inicial *</label>
                                    <input type="text" required minLength={8} className="input"
                                        value={formCriar.data.password}
                                        onChange={(e) => formCriar.setData('password', e.target.value)} />
                                    {formCriar.errors.password && <div className="text-xs text-red-400 mt-1">{formCriar.errors.password}</div>}
                                    <div className="text-[10px] text-white/40 mt-1">Mínimo 8 caracteres. Comunique ao utilizador.</div>
                                </div>

                                <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                                    <input type="checkbox" checked={formCriar.data.forcar_troca_password}
                                        onChange={(e) => formCriar.setData('forcar_troca_password', e.target.checked)}
                                        className="mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-xs text-white font-medium">Forçar troca no primeiro login</div>
                                        <div className="text-[10px] text-white/50 mt-0.5">O utilizador será obrigado a definir uma nova password antes de aceder à plataforma.</div>
                                    </div>
                                </label>
                            </>
                        )}

                        {tab === 'convidar' && (
                            <div className="rounded-lg p-3 bg-blue-500/5 border border-blue-500/20 flex gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-white/70 leading-relaxed">
                                    Será enviado um email {dadosActivos.telefone && '(e SMS)'} com um link de convite válido durante 7 dias. O utilizador define a sua própria password ao aceitar.
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-5 border-t border-white/5 flex gap-2 justify-end">
                        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
                        <button type="submit" disabled={processingActivo} className="btn-primary">
                            {tab === 'convidar' ? <><Send className="w-4 h-4" />{processingActivo ? 'A enviar...' : 'Enviar convite'}</>
                                : <><UserPlus className="w-4 h-4" />{processingActivo ? 'A criar...' : 'Criar utilizador'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ModalAlterarCondominio({ user, condominios, onClose }: { user: Utilizador; condominios: Cond[]; onClose: () => void }) {
    const [novoCondominio, setNovoCondominio] = useState<string>(user.condominio_activo_id ? String(user.condominio_activo_id) : '');

    const submit = (e: FormEvent) => {
        e.preventDefault();
        router.patch(route('utilizadores.alterar-condominio', user.id), {
            condominio_id: novoCondominio || null,
        }, { onSuccess: onClose, preserveScroll: true });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm py-8 px-4" onClick={onClose}>
            <form onSubmit={submit} className="bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white">Alterar condomínio</h2>
                    <button type="button" onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5 space-y-3">
                    <div className="text-xs text-white/60">{user.name}</div>
                    <select className="input" value={novoCondominio} onChange={(e) => setNovoCondominio(e.target.value)}>
                        <option value="">Sem condomínio activo</option>
                        {condominios.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>
                <div className="p-5 border-t border-white/5 flex gap-2 justify-end">
                    <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    );
}

function ModalAlterarPassword({ user, onClose }: { user: Utilizador; onClose: () => void }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        password: '',
        forcar_troca_password: true as boolean,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route('utilizadores.alterar-password', user.id), {
            onSuccess: () => { reset(); onClose(); },
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm py-8 px-4" onClick={onClose}>
            <form onSubmit={submit} className="bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Key className="w-5 h-5 text-[#00D4FF]" />
                        Alterar password
                    </h2>
                    <button type="button" onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="rounded-lg p-3 bg-white/[0.03] border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase tracking-wide">Utilizador</div>
                        <div className="text-sm text-white font-medium mt-0.5">{user.name}</div>
                        <div className="text-xs text-white/60 mt-0.5">{user.email}</div>
                    </div>

                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">Nova password *</label>
                        <input type="text" required minLength={8} className="input"
                            value={data.password} onChange={(e) => setData('password', e.target.value)} />
                        {errors.password && <div className="text-xs text-red-400 mt-1">{errors.password}</div>}
                        <div className="text-[10px] text-white/40 mt-1">Mínimo 8 caracteres. Comunique ao utilizador.</div>
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <input type="checkbox" checked={data.forcar_troca_password}
                            onChange={(e) => setData('forcar_troca_password', e.target.checked)} className="mt-0.5" />
                        <div className="flex-1">
                            <div className="text-xs text-white font-medium">Forçar troca no próximo login</div>
                            <div className="text-[10px] text-white/50 mt-0.5">Recomendado quando o admin define a password.</div>
                        </div>
                    </label>

                    <div className="rounded-lg p-3 bg-red-500/5 border border-red-500/20 flex gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-white/70 leading-relaxed">
                            Esta acção altera <strong>imediatamente</strong> a password. O utilizador perde acesso com a password antiga.
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-white/5 flex gap-2 justify-end">
                    <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
                    <button type="submit" disabled={processing} className="btn-primary">
                        <Key className="w-4 h-4" />
                        {processing ? 'A guardar...' : 'Alterar password'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function ModalEditarUtilizador({ user, condominios, onClose }: { user: Utilizador; condominios: Cond[]; onClose: () => void }) {
    const { data, setData, patch, processing, errors } = useForm({
        nome: user.name,
        email: user.email,
        telefone: user.telefone ?? '',
        role_name: user.role ?? 'gestor',
        condominio_id: user.condominio_activo_id ? String(user.condominio_activo_id) : '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route('utilizadores.editar', user.id), {
            onSuccess: onClose,
            preserveScroll: true,
        });
    };

    const rolesEditaveis = [
        { name: 'gestor', label: 'Gestor de Condomínios' },
        { name: 'administrador-condominio', label: 'Administrador de Condomínio' },
        { name: 'guarda', label: 'Guarda / Porteiro' },
        { name: 'funcionario', label: 'Funcionário' },
        { name: 'condomino', label: 'Condómino' },
        { name: 'prestador', label: 'Prestador de Serviços' },
    ];

    const precisaCondominio = ['administrador-condominio', 'guarda', 'condomino'].includes(data.role_name);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm py-8 px-4" onClick={onClose}>
            <div className="bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-[#A855F7]" />
                        Editar utilizador
                    </h2>
                    <button type="button" onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={submit} >
                    <div className="p-5 space-y-4">
                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">Nome completo *</label>
                            <input type="text" required className="input" value={data.nome} onChange={(e) => setData('nome', e.target.value)} />
                            {errors.nome && <div className="text-xs text-red-400 mt-1">{errors.nome}</div>}
                        </div>

                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">Email *</label>
                            <input type="email" required className="input" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                            {errors.email && <div className="text-xs text-red-400 mt-1">{errors.email}</div>}
                        </div>

                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">Telefone (Angola)</label>
                            <input type="tel" placeholder="+244 XXX XXX XXX" className="input" value={data.telefone} onChange={(e) => setData('telefone', e.target.value)} />
                        </div>

                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">Função *</label>
                            <select required className="input" value={data.role_name} onChange={(e) => setData('role_name', e.target.value)}>
                                {rolesEditaveis.map((r) => <option key={r.name} value={r.name}>{r.label}</option>)}
                            </select>
                            {errors.role_name && <div className="text-xs text-red-400 mt-1">{errors.role_name}</div>}
                        </div>

                        {precisaCondominio && (
                            <div>
                                <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">Condomínio *</label>
                                <select required className="input" value={data.condominio_id} onChange={(e) => setData('condominio_id', e.target.value)}>
                                    <option value="">Seleccione...</option>
                                    {condominios.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                </select>
                                {errors.condominio_id && <div className="text-xs text-red-400 mt-1">{errors.condominio_id}</div>}
                            </div>
                        )}

                        <div className="rounded-lg p-3 bg-blue-500/5 border border-blue-500/20 flex gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-white/70 leading-relaxed">
                                Para alterar a password, use a opção "Alterar password" no menu.
                            </div>
                        </div>
                    </div>
                    <div className="p-5 border-t border-white/5 flex gap-2 justify-end">
                        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
                        <button type="submit" disabled={processing} className="btn-primary">
                            <Pencil className="w-4 h-4" />
                            {processing ? 'A guardar...' : 'Guardar alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
