import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft, Building2, User as UserIcon, Mail, Phone, MapPin, Calendar,
    Receipt, Activity, Home, Users as UsersIcon, DollarSign,
    CalendarPlus, XCircle, RefreshCw, LogIn, AlertTriangle
} from 'lucide-react';

interface Empresa {
    id: number;
    nome: string;
    tipo_cliente: 'empresa_gestora' | 'admin_independente';
    nif: string;
    documento_tipo: string;
    nome_completo_responsavel: string | null;
    email_contacto: string;
    telefone: string;
    provincia: string;
    municipio: string;
    activa: boolean;
    plano: string;
    created_at: string;
}

interface Subscricao {
    id: number;
    estado: string;
    ciclo: string;
    num_imoveis: number;
    trial_inicia_em: string | null;
    trial_expira_em: string | null;
    activa_desde: string | null;
    periodo_actual_inicio: string | null;
    periodo_actual_fim: string | null;
    cancelada_em: string | null;
    cancela_no_fim_periodo: boolean;
    motivo_cancelamento: string | null;
}

interface Factura {
    id: number;
    numero: string;
    valor_total_kz: number;
    estado: string;
    emitida_em: string;
    paga_em: string | null;
}

interface Evento {
    id: number;
    tipo: string;
    descricao: string;
    created_at: string;
}

interface Detalhe {
    empresa: Empresa;
    subscricao: Subscricao | null;
    facturas: Factura[];
    eventos: Evento[];
    alteracoes_imoveis: any[];
    total_condominios: number;
    total_users: number;
    mrr_kz: number;
    trial_dias_restantes: number | null;
}

interface Props {
    detalhe: Detalhe;
}

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);

const fmtData = (v: string | null) => {
    if (!v) return '—';
    return new Date(v).toLocaleDateString('pt-PT');
};

const fmtDataHora = (v: string | null) => {
    if (!v) return '—';
    return new Date(v).toLocaleString('pt-PT');
};

export default function Show({ detalhe }: Props) {
    const { empresa, subscricao, facturas, eventos, total_condominios, total_users, mrr_kz, trial_dias_restantes } = detalhe;

    const [modalExtender, setModalExtender] = useState(false);
    const [modalCancelar, setModalCancelar] = useState(false);
    const [modalMudarPlano, setModalMudarPlano] = useState(false);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link href="/super-admin/clientes" className="text-zinc-500 hover:text-white">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h2 className="text-xl font-semibold text-zinc-100">{empresa.nome}</h2>
                    <TipoBadge tipo={empresa.tipo_cliente} />
                </div>
            }
        >
            <Head title={`Cliente: ${empresa.nome}`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Acções rápidas */}
                    <div className="flex flex-wrap gap-2">
                        {subscricao && subscricao.estado === 'trial' && (
                            <button
                                onClick={() => setModalExtender(true)}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-blue-400 hover:to-purple-500"
                            >
                                <CalendarPlus className="h-4 w-4" />
                                Estender trial
                            </button>
                        )}
                        {subscricao && (subscricao.estado === 'activa' || subscricao.estado === 'trial') && (
                            <button
                                onClick={() => setModalMudarPlano(true)}
                                className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-blue-500"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Mudar plano
                            </button>
                        )}
                        {subscricao && subscricao.estado !== 'cancelada' && !subscricao.cancela_no_fim_periodo && (
                            <button
                                onClick={() => setModalCancelar(true)}
                                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:border-red-500"
                            >
                                <XCircle className="h-4 w-4" />
                                Cancelar
                            </button>
                        )}
                        <button
                            onClick={() => router.post(`/super-admin/clientes/${empresa.id}/login-as`)}
                            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-yellow-500 hover:text-yellow-300"
                        >
                            <LogIn className="h-4 w-4" />
                            Entrar como
                        </button>
                    </div>

                    {/* Cards info */}
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Dados empresa */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                            <div className="mb-3 text-xs uppercase tracking-wider text-zinc-500">Dados</div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    {empresa.tipo_cliente === 'empresa_gestora' ? <Building2 className="mt-0.5 h-4 w-4 text-blue-400" /> : <UserIcon className="mt-0.5 h-4 w-4 text-purple-400" />}
                                    <div>
                                        <div className="font-medium text-zinc-100">{empresa.nome}</div>
                                        <div className="text-xs text-zinc-500">{empresa.documento_tipo} {empresa.nif}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <Mail className="h-3.5 w-3.5" />
                                    {empresa.email_contacto}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <Phone className="h-3.5 w-3.5" />
                                    {empresa.telefone}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {empresa.municipio}, {empresa.provincia}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Cliente desde {fmtData(empresa.created_at)}
                                </div>
                            </div>
                        </div>

                        {/* Subscrição */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                            <div className="mb-3 text-xs uppercase tracking-wider text-zinc-500">Subscrição</div>
                            {subscricao ? (
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400">Estado</span>
                                        <EstadoBadge estado={subscricao.estado} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400">Ciclo</span>
                                        <span className="font-medium text-zinc-200 capitalize">{subscricao.ciclo}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400">Imóveis</span>
                                        <span className="font-medium text-zinc-200">{subscricao.num_imoveis}</span>
                                    </div>
                                    {subscricao.estado === 'trial' && trial_dias_restantes !== null && (
                                        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-2 text-xs">
                                            <div className="text-yellow-300 font-semibold">{trial_dias_restantes} dias restantes</div>
                                            <div className="text-zinc-400">Expira {fmtData(subscricao.trial_expira_em)}</div>
                                        </div>
                                    )}
                                    {subscricao.cancela_no_fim_periodo && (
                                        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-xs">
                                            <div className="text-red-300 font-semibold flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" /> Cancelada
                                            </div>
                                            <div className="text-zinc-400">{subscricao.motivo_cancelamento}</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-sm text-zinc-500">Sem subscrição activa.</div>
                            )}
                        </div>

                        {/* MRR + Stats */}
                        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/10 p-5">
                            <div className="mb-3 text-xs uppercase tracking-wider text-purple-300">MRR estimado</div>
                            <div className="text-3xl font-bold text-white">{fmt(mrr_kz)} <span className="text-lg text-zinc-400">Kz</span></div>
                            <div className="mt-1 text-xs text-zinc-400">por mês recorrente</div>
                            <div className="mt-4 space-y-1.5 border-t border-zinc-800 pt-3 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-zinc-400">
                                        <Home className="h-3 w-3" /> Condomínios
                                    </span>
                                    <span className="font-medium text-white">{total_condominios}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-zinc-400">
                                        <UsersIcon className="h-3 w-3" /> Utilizadores
                                    </span>
                                    <span className="font-medium text-white">{total_users}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Facturas + Eventos */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* Facturas */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                            <h3 className="mb-3 flex items-center gap-2 font-semibold">
                                <Receipt className="h-4 w-4 text-blue-400" /> Últimas facturas
                            </h3>
                            {facturas.length === 0 ? (
                                <p className="text-sm text-zinc-500">Sem facturas emitidas.</p>
                            ) : (
                                <div className="space-y-2">
                                    {facturas.map((f) => (
                                        <div key={f.id} className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-3 text-sm">
                                            <div>
                                                <div className="font-medium text-zinc-100">{f.numero}</div>
                                                <div className="text-xs text-zinc-500">Emitida {fmtData(f.emitida_em)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-white">{fmt(f.valor_total_kz)} Kz</div>
                                                <FacturaEstadoBadge estado={f.estado} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Eventos */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                            <h3 className="mb-3 flex items-center gap-2 font-semibold">
                                <Activity className="h-4 w-4 text-green-400" /> Histórico de eventos
                            </h3>
                            {eventos.length === 0 ? (
                                <p className="text-sm text-zinc-500">Sem eventos registados.</p>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {eventos.map((e) => (
                                        <div key={e.id} className="border-l-2 border-zinc-700 pl-3 text-sm">
                                            <div className="font-medium text-zinc-200">{e.descricao}</div>
                                            <div className="text-xs text-zinc-500">{fmtDataHora(e.created_at)} · {e.tipo}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modais */}
            {modalExtender && subscricao && (
                <ModalExtenderTrial subscricaoId={subscricao.id} onClose={() => setModalExtender(false)} />
            )}
            {modalCancelar && subscricao && (
                <ModalCancelar subscricaoId={subscricao.id} onClose={() => setModalCancelar(false)} />
            )}
            {modalMudarPlano && subscricao && (
                <ModalMudarPlano subscricaoId={subscricao.id} cicloActual={subscricao.ciclo} onClose={() => setModalMudarPlano(false)} />
            )}
        </AuthenticatedLayout>
    );
}

function ModalExtenderTrial({ subscricaoId, onClose }: { subscricaoId: number; onClose: () => void }) {
    const { data, setData, post, processing } = useForm({ dias: 7, motivo: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/super-admin/clientes/subscricao/${subscricaoId}/extender-trial`, {
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="mb-2 text-lg font-bold">Estender trial</h3>
                <p className="mb-4 text-sm text-zinc-400">Adicione dias ao período de trial.</p>
                <label className="mb-1 block text-xs font-semibold text-zinc-300">Dias adicionais</label>
                <input
                    type="number"
                    min={1}
                    max={365}
                    value={data.dias}
                    onChange={(e) => setData('dias', parseInt(e.target.value))}
                    className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <label className="mb-1 block text-xs font-semibold text-zinc-300">Motivo (opcional)</label>
                <textarea
                    value={data.motivo}
                    onChange={(e) => setData('motivo', e.target.value)}
                    rows={2}
                    className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm">Cancelar</button>
                    <button type="submit" disabled={processing} className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white">
                        {processing ? 'A processar...' : 'Confirmar'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function ModalCancelar({ subscricaoId, onClose }: { subscricaoId: number; onClose: () => void }) {
    const { data, setData, post, processing } = useForm({ motivo: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/super-admin/clientes/subscricao/${subscricaoId}/cancelar`, {
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-red-500/30 bg-zinc-900 p-6">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-red-300">
                    <AlertTriangle className="h-5 w-5" /> Cancelar subscrição
                </h3>
                <p className="mb-4 text-sm text-zinc-400">A subscrição termina no fim do período pago. O cliente continua a ter acesso até essa data.</p>
                <label className="mb-1 block text-xs font-semibold text-zinc-300">Motivo *</label>
                <textarea
                    value={data.motivo}
                    onChange={(e) => setData('motivo', e.target.value)}
                    rows={3}
                    required
                    className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm">Voltar</button>
                    <button type="submit" disabled={processing || !data.motivo} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        {processing ? 'A processar...' : 'Confirmar cancelamento'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function ModalMudarPlano({ subscricaoId, cicloActual, onClose }: { subscricaoId: number; cicloActual: string; onClose: () => void }) {
    const { data, setData, post, processing } = useForm({ ciclo: cicloActual });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/super-admin/clientes/subscricao/${subscricaoId}/mudar-plano`, {
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="mb-2 text-lg font-bold">Mudar plano</h3>
                <p className="mb-4 text-sm text-zinc-400">Altere o ciclo de pagamento da subscrição.</p>
                <div className="mb-4 grid grid-cols-3 gap-2">
                    {(['mensal', 'semestral', 'anual'] as const).map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setData('ciclo', c)}
                            className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                                data.ciclo === c
                                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/10 text-white'
                                    : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                            }`}
                        >
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm">Cancelar</button>
                    <button type="submit" disabled={processing || data.ciclo === cicloActual} className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        {processing ? 'A processar...' : 'Confirmar'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function TipoBadge({ tipo }: { tipo: string }) {
    if (tipo === 'admin_independente') {
        return <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-300">Admin Independente</span>;
    }
    return <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-300">Empresa Gestora</span>;
}

function EstadoBadge({ estado }: { estado: string }) {
    const config: Record<string, { color: string; label: string }> = {
        trial: { color: 'bg-yellow-500/20 text-yellow-300', label: '● Trial' },
        activa: { color: 'bg-green-500/20 text-green-300', label: '● Activa' },
        limitado: { color: 'bg-orange-500/20 text-orange-300', label: '● Limitado' },
        cancelada: { color: 'bg-red-500/20 text-red-300', label: '● Cancelada' },
    };
    const c = config[estado] ?? { color: 'bg-zinc-700 text-zinc-300', label: estado };
    return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.color}`}>{c.label}</span>;
}

function FacturaEstadoBadge({ estado }: { estado: string }) {
    const config: Record<string, { color: string; label: string }> = {
        emitida: { color: 'bg-blue-500/20 text-blue-300', label: 'Emitida' },
        paga: { color: 'bg-green-500/20 text-green-300', label: 'Paga' },
        anulada: { color: 'bg-red-500/20 text-red-300', label: 'Anulada' },
        vencida: { color: 'bg-orange-500/20 text-orange-300', label: 'Vencida' },
    };
    const c = config[estado] ?? { color: 'bg-zinc-700 text-zinc-300', label: estado };
    return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.color}`}>{c.label}</span>;
}
