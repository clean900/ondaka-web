import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Receipt,
    Send,
    Settings,
    TriangleAlert,
    MessageSquare,
    Phone,
    Video,
    RefreshCw,
    Smartphone,
    Camera,
    Fingerprint,
    UserCheck,
    Scan,
    Bot,
    ShoppingBag,
    Palette,
    Globe,
    BarChart3,
    ArrowLeft,
    Clock,
    Info,
    CircleCheck,
    Zap,
} from 'lucide-react';
import { ReactNode } from 'react';

function formatMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(valor) + ' Kz';
}

function formatData(iso: string | null): string {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(iso));
}

interface Pacote {
    id: number;
    nome: string;
    descricao: string | null;
    preco: number;
    quantidade: number;
    valor_unitario: number;
    destaque: boolean;
}

interface Feature {
    id: number;
    slug: string;
    nome: string;
    descricao: string | null;
    icone: string | null;
    categoria_label: string;
    comprador_label: string;
    modelo_cobranca: 'subscription' | 'consumable' | 'one_time';
    modelo_cobranca_label: string;
    em_breve: boolean;
    requer_hardware: boolean;
    requer_aprovacao_manual: boolean;
    preco_base: number | null;
    preco_activacao: number;
    duracao_dias: number;
    unidade: string;
    pacotes: Pacote[];
}

interface Subscription {
    esta_activa: boolean;
    modelo_cobranca: 'subscription' | 'consumable' | 'one_time';
    saldo_actual: number;
    saldo_inicial: number;
    saldo_utilizado: number;
    saldo_baixo: boolean;
    expira_em: string | null;
    unidade: string;
}

interface Props {
    feature: Feature;
    subscription: Subscription | null;
}

const ICON_MAP: Record<string, typeof MessageSquare> = {
    MessageSquare,
    Send,
    Phone,
    Video,
    Receipt,
    RefreshCw,
    Smartphone,
    Camera,
    Fingerprint,
    UserCheck,
    Scan,
    Bot,
    ShoppingBag,
    Palette,
    Globe,
    BarChart3,
};

export default function FuncionalidadesShow({ feature, subscription }: Props) {
    const Icon = (feature.icone && ICON_MAP[feature.icone]) ?? Settings;

    return (
        <AuthenticatedLayout>
            <Head title={feature.nome} />

            <div className="max-w-4xl mx-auto space-y-6 pt-2">
                <Link
                    href="/funcionalidades"
                    className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar à loja
                </Link>

                <div className="flex items-start gap-4 p-6 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="w-14 h-14 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-7 h-7 text-[#00D4FF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-xs text-white/50">{feature.categoria_label}</span>
                            <span className="text-white/30">·</span>
                            <span className="text-xs text-white/50">{feature.comprador_label}</span>
                            <span className="text-white/30">·</span>
                            <span className="text-xs text-white/50">{feature.modelo_cobranca_label}</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight">{feature.nome}</h1>
                        {feature.descricao && (
                            <p className="text-sm text-white/70 mt-2 leading-relaxed">{feature.descricao}</p>
                        )}
                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                            {feature.em_breve && (
                                <Badge cor="gray" icon={Clock}>
                                    Em breve
                                </Badge>
                            )}
                            {feature.requer_hardware && (
                                <Badge cor="amber" icon={TriangleAlert}>
                                    Requer hardware
                                </Badge>
                            )}
                            {feature.requer_aprovacao_manual && (
                                <Badge cor="cyan" icon={Info}>
                                    Aprovação manual
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {subscription && subscription.esta_activa && (
                    <ActiveSubscriptionInfo subscription={subscription} feature={feature} />
                )}

                {feature.em_breve && !subscription && (
                    <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                        <Clock className="w-10 h-10 text-white/40 mx-auto mb-3" />
                        <h3 className="text-base font-medium text-white mb-2">Em breve disponível</h3>
                        <p className="text-sm text-white/60">
                            Esta funcionalidade está em desenvolvimento final. Entraremos em contacto assim que estiver
                            disponível.
                        </p>
                        <button className="mt-4 px-4 py-2 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#8FE7FF] text-sm hover:bg-[#00D4FF]/15 transition-colors">
                            Avise-me quando estiver disponível
                        </button>
                    </div>
                )}

                {!feature.em_breve && feature.modelo_cobranca === 'consumable' && feature.pacotes.length > 0 && (
                    <ConsumablePackages feature={feature} subscription={subscription} />
                )}

                {!feature.em_breve &&
                    feature.modelo_cobranca === 'subscription' &&
                    !subscription?.esta_activa && <SubscriptionPlan feature={feature} />}

                {!feature.em_breve && feature.modelo_cobranca === 'one_time' && !subscription?.esta_activa && (
                    <OneTimePlan feature={feature} />
                )}
            </div>
        </AuthenticatedLayout>
    );
}

interface BadgeProps {
    cor: 'gray' | 'amber' | 'cyan';
    icon: typeof Clock;
    children: ReactNode;
}

function Badge({ cor, icon: Icon, children }: BadgeProps) {
    const corClasses: Record<string, string> = {
        gray: 'bg-white/5 text-white/70 border-white/10',
        amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        cyan: 'bg-[#00D4FF]/10 text-[#8FE7FF] border-[#00D4FF]/30',
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-medium ${corClasses[cor]}`}
        >
            <Icon className="w-3 h-3" />
            {children}
        </span>
    );
}

interface ActiveSubscriptionInfoProps {
    subscription: Subscription;
    feature: Feature;
}

function ActiveSubscriptionInfo({ subscription, feature }: ActiveSubscriptionInfoProps) {
    const percent =
        subscription.saldo_inicial > 0
            ? Math.round((subscription.saldo_actual / subscription.saldo_inicial) * 100)
            : 0;

    return (
        <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
            <div className="flex items-center gap-2">
                <CircleCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-medium text-emerald-100">Funcionalidade activa</h3>
            </div>

            {feature.modelo_cobranca === 'consumable' && (
                <div>
                    <div className="flex items-baseline justify-between mb-2">
                        <span className="text-xs text-white/60 uppercase tracking-wide">Saldo</span>
                        <span className="text-sm text-white/60">
                            {subscription.saldo_actual} / {subscription.saldo_inicial} {feature.unidade}
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${
                                subscription.saldo_baixo ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <div className="flex items-baseline justify-between mt-2 text-xs text-white/50">
                        <span>{subscription.saldo_utilizado} utilizados</span>
                        <span>{percent}% disponível</span>
                    </div>
                </div>
            )}

            {subscription.expira_em && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Expira em</span>
                    <span className="text-white">{formatData(subscription.expira_em)}</span>
                </div>
            )}

            {subscription.saldo_baixo && feature.modelo_cobranca === 'consumable' && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-200 flex items-start gap-2">
                    <TriangleAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                        <strong>Saldo baixo.</strong> Considere adquirir um novo pacote para continuar sem
                        interrupções.
                    </div>
                </div>
            )}
        </div>
    );
}

interface ConsumablePackagesProps {
    feature: Feature;
    subscription: Subscription | null;
}

function ConsumablePackages({ feature, subscription }: ConsumablePackagesProps) {
    return (
        <div>
            <h2 className="text-base font-medium text-white mb-4">
                {subscription?.esta_activa ? 'Adicionar mais saldo' : 'Escolher pacote'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {feature.pacotes.map((pacote) => (
                    <div
                        key={pacote.id}
                        className={`relative p-5 rounded-xl border ${
                            pacote.destaque
                                ? 'bg-[#00D4FF]/5 border-[#00D4FF]/40'
                                : 'bg-white/[0.03] border-white/10'
                        }`}
                    >
                        {pacote.destaque && (
                            <span className="absolute -top-2 left-4 text-[10px] px-2 py-0.5 rounded bg-[#00D4FF] text-black font-semibold">
                                MAIS POPULAR
                            </span>
                        )}
                        <h3 className="text-sm font-medium text-white">{pacote.nome}</h3>
                        <div className="mt-3 mb-1">
                            <span className="text-2xl font-semibold text-white">{formatMoeda(pacote.preco)}</span>
                        </div>
                        <div className="text-sm text-white/60 mb-3">
                            {pacote.quantidade.toLocaleString('pt-PT')} {feature.unidade}
                        </div>
                        <div className="text-[11px] text-white/40 mb-4">
                            {pacote.valor_unitario.toFixed(2)} Kz / {feature.unidade?.replace(/s$/, '') ?? 'unidade'}
                        </div>
                        {pacote.descricao && (
                            <div className="text-xs text-emerald-300 mb-3">{pacote.descricao}</div>
                        )}
                        <button
                            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                                pacote.destaque
                                    ? 'bg-[#00D4FF] text-black hover:bg-[#8FE7FF]'
                                    : 'bg-white/10 text-white hover:bg-white/15'
                            }`}
                            onClick={() =>
                                router.get(route('ordens.confirmar'), {
                                    tipo_item: 'pacote_consumivel',
                                    feature_id: feature.id,
                                    pacote_id: pacote.id,
                                })
                            }
                        >
                            Comprar
                        </button>
                    </div>
                ))}
            </div>

            {feature.preco_activacao > 0 && !subscription?.esta_activa && (
                <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white/70 flex items-center gap-2">
                    <Info className="w-4 h-4 text-white/50 flex-shrink-0" />
                    <span>
                        Primeira activação inclui taxa de{' '}
                        <strong className="text-white">{formatMoeda(feature.preco_activacao)}</strong> (pago uma única
                        vez).
                    </span>
                </div>
            )}
        </div>
    );
}

interface SubscriptionPlanProps {
    feature: Feature;
}

function SubscriptionPlan({ feature }: SubscriptionPlanProps) {
    return (
        <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10">
            <h2 className="text-base font-medium text-white mb-1">Subscrição mensal</h2>
            <p className="text-sm text-white/60 mb-4">
                Pagamento recorrente a cada {feature.duracao_dias} dias. Pode cancelar a qualquer momento.
            </p>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-semibold text-white">{formatMoeda(feature.preco_base ?? 0)}</span>
                <span className="text-sm text-white/60">/ mês</span>
            </div>
            {feature.preco_activacao > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white/70 flex items-center gap-2">
                    <Info className="w-4 h-4 text-white/50 flex-shrink-0" />
                    <span>
                        Activação única:{' '}
                        <strong className="text-white">{formatMoeda(feature.preco_activacao)}</strong>
                    </span>
                </div>
            )}
            <button
                className="w-full py-3 rounded-lg bg-[#00D4FF] text-black font-medium hover:bg-[#8FE7FF] transition-colors flex items-center justify-center gap-2"
                onClick={() =>
                    router.get(route('ordens.confirmar'), {
                        tipo_item: 'feature',
                        feature_id: feature.id,
                        meses: 1,
                    })
                }
            >
                <Zap className="w-4 h-4" />
                Activar subscrição
            </button>
        </div>
    );
}

interface OneTimePlanProps {
    feature: Feature;
}

function OneTimePlan({ feature }: OneTimePlanProps) {
    const total = (feature.preco_base ?? 0) + feature.preco_activacao;
    return (
        <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10">
            <h2 className="text-base font-medium text-white mb-1">Pagamento único</h2>
            <p className="text-sm text-white/60 mb-4">Pagamento único, uso permanente.</p>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-semibold text-white">{formatMoeda(total)}</span>
            </div>
            <button
                className="w-full py-3 rounded-lg bg-[#00D4FF] text-black font-medium hover:bg-[#8FE7FF] transition-colors"
                onClick={() =>
                    router.get(route('ordens.confirmar'), {
                        tipo_item: 'feature',
                        feature_id: feature.id,
                        meses: 1,
                    })
                }
            >
                Adquirir
            </button>
        </div>
    );
}
