import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FeatureGate from '@/Components/FeatureGate';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Building2, Users, Receipt, TrendingUp, TrendingDown, Wallet, ArrowUpRight, BarChart3,
    ChevronRight, Plus, Sparkles,
} from 'lucide-react';
import type { PageProps } from '@/types';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { formatKz, formatRelativo, gradientDeNome, iniciais } from '@/lib/utils';

interface KpiValor {
    valor: number;
    delta: string;
}

interface ActividadeItem {
    tipo: string;            // 'ticket', 'aviso', 'pagamento', etc
    titulo: string;
    descricao: string;
    created_at: string;
}

interface DashboardProps {
    dados: {
        kpis: {
            condominios: KpiValor;
            imoveis: KpiValor;
            pendente: KpiValor;
            receita_mes: KpiValor;
            despesas_mes: KpiValor;
            saldo_contas: KpiValor;
        };
        receita_mensal: Array<{ mes: string; valor: number }>;
        fluxo_mensal: Array<{ mes: string; receitas: number; despesas: number }>;
        contas?: Array<{ id: number; nome: string; banco: string; condominio: string; saldo_actual: number; principal: boolean }>;
        actividade_recente: ActividadeItem[];
        proximas_assembleias?: unknown[];
    };
}

export default function Dashboard({ dados }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const nome = auth.user?.name?.split(' ')[0] ?? '';

    const horaActual = new Date().getHours();
    const saudacao = horaActual < 12 ? 'Bom dia' : horaActual < 19 ? 'Boa tarde' : 'Boa noite';

    const hoje = new Date();
    const dataFormatada = new Intl.DateTimeFormat('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(hoje);

    // Dados reais do backend (fallback para array vazio se inexistentes)
    const receitaMensal = dados?.receita_mensal ?? [];
    const fluxoMensal = dados?.fluxo_mensal ?? [];
    const contas = dados?.contas ?? [];

    return (
        <AuthenticatedLayout>
            <Head title="Painel" />

            {/* Hero header */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-[#00D4FF]" />
                        <span className="text-xs text-white/60 font-medium tracking-wide">
                            {dataFormatada}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {saudacao}, <span className="gradient-ondaka-text">{nome}</span>
                    </h1>
                    <p className="text-sm text-white/60 mt-1.5">
                        Aqui está o resumo da sua plataforma.
                    </p>
                </div>

                <Link
                    href="/condominios"
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4" />
                    Novo condomínio
                </Link>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <StatCard
                    icon={Building2}
                    iconColor="#00D4FF"
                    label="Condomínios"
                    valor={String(dados?.kpis?.condominios?.valor ?? 0)}
                    delta={dados?.kpis?.condominios?.delta ?? '—'}
                    deltaPositivo
                    variant="ciano"
                />
                <StatCard
                    icon={Users}
                    iconColor="#A855F7"
                    label="Imóveis geridos"
                    valor={String(dados?.kpis?.imoveis?.valor ?? 0)}
                    delta={dados?.kpis?.imoveis?.delta ?? '—'}
                    variant="roxo"
                />
                <StatCard
                    icon={Receipt}
                    iconColor="#EC4899"
                    label="Pendente"
                    valor={formatKz(dados?.kpis?.pendente?.valor ?? 0)}
                    delta={dados?.kpis?.pendente?.delta ?? '—'}
                    variant="magenta"
                />
                <StatCard
                    icon={TrendingUp}
                    iconColor="#10B981"
                    label="Receita do mês"
                    valor={formatKz(dados?.kpis?.receita_mes?.valor ?? 0)}
                    delta={dados?.kpis?.receita_mes?.delta ?? '—'}
                    variant="verde"
                />
                <StatCard
                    icon={TrendingDown}
                    iconColor="#EF4444"
                    label="Despesas do mês"
                    valor={formatKz(dados?.kpis?.despesas_mes?.valor ?? 0)}
                    delta={dados?.kpis?.despesas_mes?.delta ?? '—'}
                    variant="magenta"
                />
                <StatCard
                    icon={Wallet}
                    iconColor="#00D4FF"
                    label="Saldo em conta"
                    valor={formatKz(dados?.kpis?.saldo_contas?.valor ?? 0)}
                    delta={dados?.kpis?.saldo_contas?.delta ?? '—'}
                    variant="ciano"
                />
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Chart de receita */}
                <div className="lg:col-span-2 card-elevated">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-sm font-medium text-white">Receita mensal</h3>
                            <p className="text-xs text-white/50 mt-0.5">Últimos 6 meses (simulação)</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            12.4%
                        </div>
                    </div>

                    <div className="h-48 -mx-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={fluxoMensal} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="linhaReceitas" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#00D4FF" />
                                        <stop offset="100%" stopColor="#EC4899" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="mes"
                                    stroke="rgba(255,255,255,0.4)"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.4)"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#16163A',
                                        border: '0.5px solid rgba(168, 85, 247, 0.3)',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                    }}
                                    labelStyle={{ color: '#FFFFFF' }}
                                    formatter={(v: number, name: string) => [formatKz(v), name === 'receitas' ? 'Receitas' : 'Despesas']}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}
                                    formatter={(value) => value === 'receitas' ? 'Receitas' : 'Despesas'}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="receitas"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    fill="url(#colorReceitas)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="despesas"
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    fill="url(#colorDespesas)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Actividade recente */}
                <div className="card-elevated">
                    <h3 className="text-sm font-medium text-white mb-5">Actividade recente</h3>
                    <div className="space-y-4">
                        {(dados?.actividade_recente ?? []).length > 0 ? (
                            (dados?.actividade_recente ?? []).map((act, idx) => (
                                <ActivityItem
                                    key={idx}
                                    nome={act.titulo}
                                    mensagem={act.descricao}
                                    tempo={new Date(act.created_at)}
                                    tipo="info"
                                />
                            ))
                        ) : (
                            <p className="text-xs text-white/40 italic">Sem actividade recente</p>
                        )}
                        <div className="pt-3 border-t border-white/5 mt-4">
                            <button className="text-xs text-white/50 hover:text-white flex items-center gap-1 group">
                                Ver tudo
                                <ChevronRight className="w-3 h-3 transition group-hover:translate-x-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Acções rápidas */}
            <div className="card">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-medium text-white">Acções rápidas</h3>
                    <span className="text-xs text-white/40">Atalhos para tarefas comuns</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <QuickAction
                        href="/condominios"
                        icon={Building2}
                        iconColor="#00D4FF"
                        titulo="Condomínios"
                        descricao="Gerir condomínios e imóveis"
                    />
                    <QuickAction
                        href="/condominos"
                        icon={Users}
                        iconColor="#A855F7"
                        titulo="Condóminos"
                        descricao="Gerir condóminos"
                    />
                    <QuickAction
                        href="/quotas"
                        icon={Receipt}
                        iconColor="#EC4899"
                        titulo="Facturação"
                        descricao="Quotas, pagamentos, créditos"
                    />
                    <FeatureGate slug="dashboard_bi">
                        <QuickAction
                            href="/funcionalidades/dashboard_bi"
                            icon={BarChart3}
                            iconColor="#F59E0B"
                            titulo="Dashboard BI Avançado"
                            descricao="Análises detalhadas e relatórios"
                        />
                    </FeatureGate>
                </div>
            </div>

            {/* Saldos por conta */}
            {contas.length > 0 && (
                <div className="mt-6 card-elevated">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white">Saldos por conta</h3>
                        <Link href="/financas/contas-bancarias" className="text-xs text-[#00D4FF] hover:underline">
                            Gerir contas
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-white/40 text-xs border-b border-white/5">
                                    <th className="pb-2 font-medium">Conta</th>
                                    <th className="pb-2 font-medium">Condomínio</th>
                                    <th className="pb-2 font-medium text-right">Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contas.map((conta) => (
                                    <tr
                                        key={conta.id}
                                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="py-2.5 text-white/80">
                                            {conta.nome} <span className="text-white/40">· {conta.banco}</span>
                                        </td>
                                        <td className="py-2.5 text-white/60">{conta.condominio}</td>
                                        <td className="py-2.5 text-right font-medium" style={{ color: conta.saldo_actual >= 0 ? '#6EE7B7' : '#FCA5A5' }}>
                                            {formatKz(conta.saldo_actual)} Kz
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-white/10">
                                    <td className="pt-2.5 text-white/50 text-xs" colSpan={2}>Total</td>
                                    <td className="pt-2.5 text-right font-semibold text-white">
                                        {formatKz(contas.reduce((s, c) => s + c.saldo_actual, 0))} Kz
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}

function StatCard({
    icon: Icon,
    iconColor,
    label,
    valor,
    delta,
    deltaPositivo,
    variant,
}: {
    icon: React.ElementType;
    iconColor: string;
    label: string;
    valor: string;
    delta: string;
    deltaPositivo?: boolean;
    variant: 'ciano' | 'roxo' | 'magenta' | 'verde';
}) {
    const variantClass = {
        ciano: 'stat-card-ciano',
        roxo: 'stat-card-roxo',
        magenta: 'stat-card-magenta',
        verde: 'stat-card-verde',
    }[variant];

    return (
        <div className={variantClass}>
            <div className="flex items-start justify-between mb-3">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `${iconColor}15`, border: `0.5px solid ${iconColor}30` }}
                >
                    <Icon className="w-4 h-4" style={{ color: iconColor }} />
                </div>
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-[1px] font-medium mb-1">
                {label}
            </div>
            <div className="text-2xl font-semibold text-white tracking-tight">
                {valor}
            </div>
            <div
                className="text-[11px] mt-1.5 flex items-center gap-1"
                style={{ color: deltaPositivo ? '#10B981' : iconColor }}
            >
                {delta}
            </div>
        </div>
    );
}

function ActivityItem({
    nome,
    mensagem,
    tempo,
    tipo,
}: {
    nome: string;
    mensagem: string;
    tempo: Date;
    tipo: 'sucesso' | 'info' | 'aviso';
}) {
    const gradient = gradientDeNome(nome);

    return (
        <div className="flex gap-3 items-start">
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
                style={{ background: gradient }}
            >
                {iniciais(nome)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-xs text-white truncate">{mensagem}</div>
                <div className="text-[10px] text-white/40 mt-0.5">
                    {nome} · {formatRelativo(tempo)}
                </div>
            </div>
        </div>
    );
}

function QuickAction({
    href,
    icon: Icon,
    iconColor,
    titulo,
    descricao,
    disabled = false,
}: {
    href: string;
    icon: React.ElementType;
    iconColor: string;
    titulo: string;
    descricao: string;
    disabled?: boolean;
}) {
    const content = (
        <>
            <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                    background: disabled ? 'rgba(255,255,255,0.03)' : `${iconColor}15`,
                    border: `0.5px solid ${disabled ? 'rgba(255,255,255,0.08)' : iconColor + '30'}`,
                }}
            >
                <Icon
                    className="w-4 h-4"
                    style={{ color: disabled ? 'rgba(255,255,255,0.3)' : iconColor }}
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${disabled ? 'text-white/40' : 'text-white'}`}>
                    {titulo}
                </div>
                <div className="text-[11px] text-white/50">{descricao}</div>
            </div>
            {!disabled && (
                <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
            )}
        </>
    );

    const className = `flex items-center gap-3 p-3 rounded-lg transition-all ${
        disabled
            ? 'bg-white/[0.01] border border-white/5 cursor-not-allowed opacity-60'
            : 'bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] hover:-translate-y-0.5 cursor-pointer'
    }`;

    if (disabled) {
        return <div className={className}>{content}</div>;
    }

    return (
        <Link href={href} className={className}>
            {content}
        </Link>
    );
}
