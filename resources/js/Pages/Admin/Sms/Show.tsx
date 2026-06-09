import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    MessageSquare,
    TriangleAlert,
    Building,
    User,
    Receipt,
    CircleX,
    Clock,
    CircleCheck,
    RotateCw,
} from 'lucide-react';

type EstadoSms = 'enviado' | 'entregue' | 'pendente' | 'falhado' | 'rejeitado';

interface Owner {
    id: number;
    type: string;
    nome: string;
}

interface UserData {
    name: string;
    email: string;
}

interface Ordem {
    id: number;
    numero: string;
}

interface Log {
    id: number;
    created_at: string;
    estado: EstadoSms;
    estado_label: string;
    trigger: string | null;
    erro_mensagem: string | null;
    saldo_devolvido: boolean;
    numero_mascarado: string;
    tamanho_chars: number;
    segmentos: number;
    mensagem: string;
    resposta_bruta: unknown;
    provider: string;
    provider_id: string | null;
    saldo_provider_apos: number | null;
    tentativas: number;
    creditos_consumidos_cliente: number;
    categoria_label: string;
    owner: Owner | null;
    user: UserData | null;
    ordem: Ordem | null;
    enviado_em: string | null;
    falhado_em: string | null;
}

interface Props {
    log: Log;
}

const ESTADO_CONFIG: Record<EstadoSms, { color: string; icon: typeof CircleCheck }> = {
    enviado: {
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40',
        icon: CircleCheck,
    },
    entregue: {
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40',
        icon: CircleCheck,
    },
    pendente: {
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/40',
        icon: Clock,
    },
    falhado: {
        color: 'text-red-400 bg-red-500/10 border-red-500/40',
        icon: CircleX,
    },
    rejeitado: {
        color: 'text-red-400 bg-red-500/10 border-red-500/40',
        icon: CircleX,
    },
};

export default function AdminSmsShow({ log }: Props) {
    const config = ESTADO_CONFIG[log.estado] ?? ESTADO_CONFIG.pendente;
    const Icon = config.icon;
    const podeReenviar = ['falhado', 'rejeitado'].includes(log.estado);

    const reenviar = () => {
        if (
            confirm(
                'Reenviar SMS? Será enviado usando saldo da conta sistema (não consome crédito cliente).',
            )
        ) {
            router.post(`/admin/sms/${log.id}/reenviar`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`SMS #${log.id} — ONDAKA`} />

            <div className="p-6 md:p-8 max-w-5xl">
                <Link
                    href="/admin/sms"
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar à lista
                </Link>

                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">SMS #{log.id}</h1>
                            <p className="text-sm text-zinc-500">
                                {new Date(log.created_at).toLocaleString('pt-PT')}
                                {log.trigger && (
                                    <span className="ml-2 text-zinc-600">
                                        · trigger:{' '}
                                        <span className="font-mono text-zinc-500">{log.trigger}</span>
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${config.color}`}
                    >
                        <Icon className="h-4 w-4" />
                        {log.estado_label}
                    </span>
                </div>

                {log.erro_mensagem && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-2">
                            <TriangleAlert className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                            <div>
                                <h3 className="text-sm font-semibold text-red-400">Erro no envio</h3>
                                <p className="text-sm text-zinc-300 mt-1">{log.erro_mensagem}</p>
                                {log.saldo_devolvido && (
                                    <p className="text-xs text-amber-400/80 mt-2">
                                        ✓ Crédito devolvido ao cliente automaticamente
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-4">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                                Mensagem
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4 text-xs text-zinc-500">
                                    <span>
                                        <span className="text-zinc-400 font-mono">
                                            {log.numero_mascarado}
                                        </span>
                                    </span>
                                    <span>·</span>
                                    <span>{log.tamanho_chars} caracteres</span>
                                    <span>·</span>
                                    <span>
                                        {log.segmentos} segmento{log.segmentos > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-zinc-200 whitespace-pre-wrap">
                                    {log.mensagem}
                                </div>
                            </div>
                        </div>

                        {log.resposta_bruta && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                                    Resposta do provider ({log.provider})
                                </h3>
                                <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-400 overflow-x-auto">
                                    {JSON.stringify(log.resposta_bruta, null, 2)}
                                </pre>
                            </div>
                        )}

                        {podeReenviar && (
                            <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-400/80 mb-2">
                                    Acções
                                </h3>
                                <p className="text-sm text-zinc-400 mb-3">
                                    Este SMS falhou. Pode tentar reenviar (usa saldo da conta sistema, não
                                    consome do cliente).
                                </p>
                                <button
                                    onClick={reenviar}
                                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-4 py-2 text-sm"
                                >
                                    <RotateCw className="h-4 w-4" />
                                    Reenviar SMS
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                                Contexto
                            </h3>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-zinc-500">Categoria</dt>
                                    <dd className="text-zinc-200">{log.categoria_label}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-zinc-500">Provider</dt>
                                    <dd className="text-zinc-200">{log.provider}</dd>
                                </div>
                                {log.provider_id && (
                                    <div className="flex justify-between">
                                        <dt className="text-zinc-500">ID provider</dt>
                                        <dd className="text-zinc-200 font-mono text-xs">{log.provider_id}</dd>
                                    </div>
                                )}
                                {log.saldo_provider_apos !== null && (
                                    <div className="flex justify-between">
                                        <dt className="text-zinc-500">Saldo após</dt>
                                        <dd className="text-zinc-200">{log.saldo_provider_apos} SMS</dd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <dt className="text-zinc-500">Tentativas</dt>
                                    <dd className="text-zinc-200">{log.tentativas}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-zinc-500">Créditos consumidos</dt>
                                    <dd className="text-zinc-200">{log.creditos_consumidos_cliente}</dd>
                                </div>
                            </dl>
                        </div>

                        {log.owner && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                                    Cliente (saldo)
                                </h3>
                                <div className="flex items-start gap-2">
                                    <Building className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-zinc-200">{log.owner.nome}</p>
                                        <p className="text-xs text-zinc-500">
                                            {log.owner.type}#{log.owner.id}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {log.user && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                                    Utilizador
                                </h3>
                                <div className="flex items-start gap-2">
                                    <User className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-zinc-200">{log.user.name}</p>
                                        <p className="text-xs text-zinc-500">{log.user.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {log.ordem && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                                    Ordem relacionada
                                </h3>
                                <Link
                                    href={`/admin/ordens/${log.ordem.id}`}
                                    className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
                                >
                                    <Receipt className="h-4 w-4" />
                                    {log.ordem.numero} →
                                </Link>
                            </div>
                        )}

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                                Timeline
                            </h3>
                            <dl className="space-y-2 text-sm">
                                <div>
                                    <dt className="text-xs text-zinc-500">Criado</dt>
                                    <dd className="text-zinc-300">
                                        {new Date(log.created_at).toLocaleString('pt-PT')}
                                    </dd>
                                </div>
                                {log.enviado_em && (
                                    <div>
                                        <dt className="text-xs text-emerald-400/80">Enviado</dt>
                                        <dd className="text-zinc-300">
                                            {new Date(log.enviado_em).toLocaleString('pt-PT')}
                                        </dd>
                                    </div>
                                )}
                                {log.falhado_em && (
                                    <div>
                                        <dt className="text-xs text-red-400/80">Falhado</dt>
                                        <dd className="text-zinc-300">
                                            {new Date(log.falhado_em).toLocaleString('pt-PT')}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
