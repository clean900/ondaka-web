import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Edit, Plus, Home, Trash2, Building2, Layers, Hash, Percent,
    ChevronRight,
} from 'lucide-react';
import type { Edificio, Fraccao, Condominio } from '@/types';

interface Props {
    edificio: Edificio & {
        condominio: Pick<Condominio, 'id' | 'nome' | 'codigo'>;
        fraccoes: Fraccao[];
    };
    estatisticas: {
        total_fraccoes: number;
        fraccoes_ocupadas: number;
        fraccoes_vagas: number;
        area_total_m2: number;
    };
}

export default function Show({ edificio, estatisticas }: Props) {
    const eliminar = () => {
        if (confirm(`Eliminar «${edificio.nome}»? Esta acção não pode ser desfeita.`)) {
            router.delete(`/edificios/${edificio.id}`);
        }
    };

    const fraccoesPorPiso = edificio.fraccoes.reduce<Record<number, Fraccao[]>>((acc, f) => {
        acc[f.piso] = acc[f.piso] || [];
        acc[f.piso].push(f);
        return acc;
    }, {});

    const pisosOrdenados = Object.keys(fraccoesPorPiso)
        .map(Number)
        .sort((a, b) => b - a);

    const percentagemOcupacao = estatisticas.total_fraccoes > 0
        ? Math.round((estatisticas.fraccoes_ocupadas / estatisticas.total_fraccoes) * 100)
        : 0;

    return (
        <AuthenticatedLayout>
            <Head title={edificio.nome} />

            {/* Header */}
            <div className="mb-8">
                <Link
                    href={`/condominios/${edificio.condominio.id}`}
                    className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {edificio.condominio.nome}
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)',
                                border: '0.5px solid rgba(168, 85, 247, 0.3)',
                            }}
                        >
                            <Building2 className="w-7 h-7 text-[#A855F7]" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                {edificio.nome}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-white/60">
                                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                                    {edificio.codigo}
                                </span>
                                {edificio.tem_elevador && (
                                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF]">
                                        Com elevador
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link href={`/edificios/${edificio.id}/edit`} className="btn-secondary">
                            <Edit className="h-4 w-4" />
                            Editar
                        </Link>
                        <button onClick={eliminar} className="btn-danger">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <StatBox label="Pisos" valor={edificio.numero_pisos} icon={Layers} cor="#A855F7" />
                <StatBox label="Fracções" valor={estatisticas.total_fraccoes} icon={Hash} cor="#00D4FF" />
                <StatBox
                    label="Área total"
                    valor={`${Number(estatisticas.area_total_m2).toFixed(0)} m²`}
                    icon={Home}
                    cor="#EC4899"
                />
                <StatBox
                    label="Ocupação"
                    valor={`${percentagemOcupacao}%`}
                    icon={Percent}
                    cor={percentagemOcupacao >= 80 ? '#10B981' : '#F59E0B'}
                />
            </div>

            {/* Fracções */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Fracções</h2>
                    <p className="text-xs text-white/50 mt-0.5">
                        Organizadas por piso (mais alto primeiro)
                    </p>
                </div>
                <Link href={`/edificios/${edificio.id}/fraccoes/create`} className="btn-primary">
                    <Plus className="h-4 w-4" />
                    Nova fracção
                </Link>
            </div>

            {pisosOrdenados.length === 0 ? (
                <div
                    className="text-center py-16 rounded-xl"
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '0.5px dashed rgba(168, 85, 247, 0.2)',
                    }}
                >
                    <Home className="h-12 w-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/50 text-sm">Nenhuma fracção registada.</p>
                    <Link
                        href={`/edificios/${edificio.id}/fraccoes/create`}
                        className="inline-flex items-center gap-1 mt-4 text-[#00D4FF] hover:text-[#A855F7] text-sm font-medium transition"
                    >
                        Adicionar a primeira fracção
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {pisosOrdenados.map((piso) => (
                        <div key={piso} className="card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold"
                                        style={{
                                            background: 'rgba(168, 85, 247, 0.1)',
                                            border: '0.5px solid rgba(168, 85, 247, 0.25)',
                                            color: '#A855F7',
                                        }}
                                    >
                                        {piso === 0 ? '0' : piso}
                                    </div>
                                    <h3 className="font-semibold text-white text-sm">
                                        {piso === 0 ? 'Rés-do-chão' : piso > 0 ? `${piso}º Piso` : `Cave ${Math.abs(piso)}`}
                                    </h3>
                                </div>
                                <span className="text-xs text-white/40">
                                    {fraccoesPorPiso[piso].length} {fraccoesPorPiso[piso].length === 1 ? 'fracção' : 'fracções'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {fraccoesPorPiso[piso].map((f) => (
                                    <FraccaoCell key={f.id} fraccao={f} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function StatBox({
    label,
    valor,
    icon: Icon,
    cor,
}: {
    label: string;
    valor: number | string;
    icon: React.ElementType;
    cor: string;
}) {
    return (
        <div
            className="rounded-xl p-4 transition-all"
            style={{
                background: `linear-gradient(135deg, ${cor}15 0%, ${cor}05 100%)`,
                border: `0.5px solid ${cor}35`,
            }}
        >
            <div className="flex items-start justify-between mb-2">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${cor}20`, border: `0.5px solid ${cor}40` }}
                >
                    <Icon className="w-4 h-4" style={{ color: cor }} />
                </div>
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-[1px] font-medium mb-0.5">
                {label}
            </div>
            <div className="text-2xl font-semibold text-white tracking-tight">
                {valor}
            </div>
        </div>
    );
}

function FraccaoCell({ fraccao }: { fraccao: Fraccao }) {
    const estadoConfig: Record<string, { bg: string; border: string; dot: string; text: string; label: string }> = {
        ocupada: {
            bg: 'rgba(16, 185, 129, 0.08)',
            border: 'rgba(16, 185, 129, 0.3)',
            dot: '#10B981',
            text: '#6EE7B7',
            label: 'Ocupada',
        },
        vaga: {
            bg: 'rgba(255, 255, 255, 0.03)',
            border: 'rgba(255, 255, 255, 0.1)',
            dot: 'rgba(255, 255, 255, 0.4)',
            text: 'rgba(255, 255, 255, 0.5)',
            label: 'Vaga',
        },
        reservada: {
            bg: 'rgba(245, 158, 11, 0.08)',
            border: 'rgba(245, 158, 11, 0.3)',
            dot: '#F59E0B',
            text: '#FCD34D',
            label: 'Reservada',
        },
    };

    const config = estadoConfig[fraccao.estado] ?? estadoConfig.vaga;

    return (
        <Link
            href={`/fraccoes/${fraccao.id}`}
            className="group block p-3 rounded-lg transition-all hover:-translate-y-0.5"
            style={{
                background: config.bg,
                border: `0.5px solid ${config.border}`,
            }}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="font-mono font-semibold text-white text-sm">
                    {fraccao.identificador}
                </div>
                <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: config.dot }}
                />
            </div>
            <div className="text-[10px] text-white/50">
                {Number(fraccao.area_privativa_m2).toFixed(0)} m²
            </div>
            <div className="text-[10px] mt-1 font-medium" style={{ color: config.text }}>
                {config.label}
            </div>
        </Link>
    );
}
