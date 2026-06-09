import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Edit, Trash2, Home, Layers, Ruler, Percent, Bed, Bath, Car, Package,
    DollarSign, Shield, MessageSquare,
} from 'lucide-react';
import type { Fraccao, Edificio, Condominio, TipoFraccao } from '@/types';
import { formatKz } from '@/lib/utils';

interface Props {
    fraccao: Fraccao & {
        edificio: Pick<Edificio, 'id' | 'nome' | 'codigo'>;
        condominio: Pick<Condominio, 'id' | 'nome' | 'codigo'>;
        tipo: Pick<TipoFraccao, 'id' | 'nome' | 'codigo'>;
    };
}

export default function Show({ fraccao }: Props) {
    const eliminar = () => {
        if (confirm(`Eliminar fracção ${fraccao.identificador}?`)) {
            router.delete(`/fraccoes/${fraccao.id}`);
        }
    };

    const quotaTotal =
        Number(fraccao.quota_mensal_base) + Number(fraccao.quota_mensal_fundo_reserva);

    const estadoConfig: Record<string, { bg: string; text: string; dot: string }> = {
        ocupada: { bg: 'bg-emerald-500/10 border-emerald-500/25', text: 'text-emerald-400', dot: '#10B981' },
        vaga: { bg: 'bg-white/5 border-white/10', text: 'text-white/60', dot: '#64748B' },
        reservada: { bg: 'bg-amber-500/10 border-amber-500/25', text: 'text-amber-400', dot: '#F59E0B' },
    };

    const config = estadoConfig[fraccao.estado] ?? estadoConfig.vaga;

    return (
        <AuthenticatedLayout>
            <Head title={`Fracção ${fraccao.identificador}`} />

            {/* Header */}
            <div className="mb-8">
                <Link
                    href={`/edificios/${fraccao.edificio.id}`}
                    className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="truncate max-w-md">
                        {fraccao.condominio.nome} / {fraccao.edificio.nome}
                    </span>
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
                                border: '0.5px solid rgba(236, 72, 153, 0.3)',
                            }}
                        >
                            <Home className="w-7 h-7 text-[#EC4899]" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                Fracção <span className="font-mono">{fraccao.identificador}</span>
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-white/60">
                                <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                                    {fraccao.tipo.nome}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                                    {fraccao.area_privativa_m2} m²
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${config.bg} ${config.text}`}>
                                    <span className="w-1 h-1 rounded-full" style={{ background: config.dot }} />
                                    {fraccao.estado}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link href={`/fraccoes/${fraccao.id}/edit`} className="btn-secondary">
                            <Edit className="h-4 w-4" />
                            Editar
                        </Link>
                        <button onClick={eliminar} className="btn-danger">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Características + Quotas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Características */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-5">
                        <Home className="w-4 h-4 text-[#A855F7]" />
                        <h2 className="text-sm font-semibold text-white uppercase tracking-[1px]">
                            Características
                        </h2>
                    </div>
                    <dl className="space-y-3">
                        <InfoLine icon={Home} label="Tipo" value={fraccao.tipo.nome} />
                        <InfoLine
                            icon={Layers}
                            label="Piso"
                            value={fraccao.piso === 0 ? 'Rés-do-chão' : `${fraccao.piso}º Piso`}
                        />
                        <InfoLine
                            icon={Ruler}
                            label="Área privativa"
                            value={`${fraccao.area_privativa_m2} m²`}
                        />
                        <InfoLine
                            icon={Percent}
                            label="Permilagem"
                            value={`${fraccao.permilagem} ‰`}
                        />
                        <InfoLine
                            icon={Bed}
                            label="Quartos"
                            value={fraccao.numero_quartos?.toString() ?? null}
                        />
                        <InfoLine
                            icon={Bath}
                            label="Casas de banho"
                            value={fraccao.numero_casas_banho?.toString() ?? null}
                        />
                        <InfoLine
                            icon={Car}
                            label="Garagem"
                            value={
                                fraccao.tem_lugar_garagem
                                    ? `${fraccao.numero_lugares_garagem} ${fraccao.numero_lugares_garagem === 1 ? 'lugar' : 'lugares'}`
                                    : 'Não'
                            }
                            destaque={fraccao.tem_lugar_garagem}
                        />
                        <InfoLine
                            icon={Package}
                            label="Arrecadação"
                            value={fraccao.tem_arrecadacao ? 'Sim' : 'Não'}
                            destaque={fraccao.tem_arrecadacao}
                        />
                    </dl>
                </div>

                {/* Quotas */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-5">
                        <DollarSign className="w-4 h-4 text-[#00D4FF]" />
                        <h2 className="text-sm font-semibold text-white uppercase tracking-[1px]">
                            Quotas mensais
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <QuotaLine
                            icon={DollarSign}
                            label="Quota base"
                            valor={Number(fraccao.quota_mensal_base)}
                        />
                        <QuotaLine
                            icon={Shield}
                            label="Fundo reserva (DP 141/15)"
                            valor={Number(fraccao.quota_mensal_fundo_reserva)}
                        />
                    </div>

                    {/* Total */}
                    <div
                        className="mt-4 pt-4 border-t rounded-lg p-4"
                        style={{
                            borderColor: 'rgba(168, 85, 247, 0.15)',
                            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.06) 0%, rgba(168, 85, 247, 0.04) 100%)',
                            border: '0.5px solid rgba(0, 212, 255, 0.2)',
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[10px] text-white/50 uppercase tracking-[1.5px] font-medium">
                                    Total mensal
                                </div>
                            </div>
                            <div className="text-2xl font-bold gradient-ondaka-text">
                                {formatKz(quotaTotal)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Observações */}
            {fraccao.observacoes && (
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-4 h-4 text-[#EC4899]" />
                        <h2 className="text-sm font-semibold text-white uppercase tracking-[1px]">
                            Observações
                        </h2>
                    </div>
                    <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                        {fraccao.observacoes}
                    </p>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function InfoLine({
    icon: Icon,
    label,
    value,
    destaque,
}: {
    icon: React.ElementType;
    label: string;
    value: string | null | undefined;
    destaque?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-2 text-white/50 text-xs flex-shrink-0">
                <Icon className="w-3 h-3" />
                {label}
            </div>
            <div className={`text-right text-sm ${
                value
                    ? destaque
                        ? 'text-[#00D4FF] font-medium'
                        : 'text-white'
                    : 'text-white/30'
            }`}>
                {value || '—'}
            </div>
        </div>
    );
}

function QuotaLine({
    icon: Icon,
    label,
    valor,
}: {
    icon: React.ElementType;
    label: string;
    valor: number;
}) {
    return (
        <div className="flex items-center justify-between gap-3 py-1.5">
            <div className="flex items-center gap-2 text-white/60 text-xs">
                <Icon className="w-3 h-3" />
                {label}
            </div>
            <div className="text-sm font-medium text-white">
                {formatKz(valor)}
            </div>
        </div>
    );
}
