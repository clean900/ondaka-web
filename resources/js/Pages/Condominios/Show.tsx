import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Edit, Plus, Building2, MapPin, User, Trash2,
    Hash, Calendar, FileText, Landmark, CreditCard, DollarSign, Shield,
    ChevronRight,
} from 'lucide-react';
import type { Condominio, Edificio } from '@/types';
import { gradientDeNome, iniciais, formatDate } from '@/lib/utils';

interface Props {
    condominio: Condominio & {
        edificios: (Edificio & { fraccoes_count: number })[];
    };
    estatisticas: {
        total_edificios: number;
        total_fraccoes: number;
        fraccoes_ocupadas: number;
        fraccoes_vagas: number;
    };
}

export default function Show({ condominio, estatisticas }: Props) {
    const eliminar = () => {
        if (confirm(`Tem a certeza que quer arquivar «${condominio.nome}»?`)) {
            router.delete(`/condominios/${condominio.id}`);
        }
    };

    const percentagemOcupacao = estatisticas.total_fraccoes > 0
        ? Math.round((estatisticas.fraccoes_ocupadas / estatisticas.total_fraccoes) * 100)
        : 0;

    return (
        <AuthenticatedLayout>
            <Head title={condominio.nome} />

            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/condominios"
                    className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar à lista
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
                                border: '0.5px solid rgba(0, 212, 255, 0.3)',
                            }}
                        >
                            <Building2 className="w-7 h-7 text-[#00D4FF]" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                {condominio.nome}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/60">
                                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                                    {condominio.codigo}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-[#A855F7]" />
                                    {condominio.municipio}
                                    {condominio.bairro && ` · ${condominio.bairro}`}
                                </span>
                                <EstadoBadge estado={condominio.estado} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={`/condominios/${condominio.id}/edit`} className="btn-secondary">
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
                <StatBox
                    label={labelBlocos(condominio.tipo)}
                    valor={estatisticas.total_edificios}
                    icon={Building2}
                    cor="#00D4FF"
                />
                <StatBox
                    label={labelFraccoes(condominio.tipo)}
                    valor={estatisticas.total_fraccoes}
                    icon={Hash}
                    cor="#A855F7"
                />
                <StatBox
                    label="Ocupadas"
                    valor={estatisticas.fraccoes_ocupadas}
                    icon={User}
                    cor="#10B981"
                    subtitulo={`${percentagemOcupacao}% do total`}
                />
                <StatBox
                    label="Vagas"
                    valor={estatisticas.fraccoes_vagas}
                    icon={FileText}
                    cor="#F59E0B"
                />
            </div>

            {/* Barra de ocupação */}
            {estatisticas.total_fraccoes > 0 && (
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-sm font-medium text-white">Taxa de ocupação</h3>
                            <p className="text-xs text-white/50 mt-0.5">
                                {estatisticas.fraccoes_ocupadas} de {estatisticas.total_fraccoes} fracções ocupadas
                            </p>
                        </div>
                        <div className="text-2xl font-semibold text-white">
                            {percentagemOcupacao}<span className="text-sm text-white/50">%</span>
                        </div>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${percentagemOcupacao}%`,
                                background: 'linear-gradient(90deg, #00D4FF 0%, #A855F7 60%, #EC4899 100%)',
                                boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Dados legais e financeiros */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-4 h-4 text-[#A855F7]" />
                        <h2 className="text-sm font-semibold text-white uppercase tracking-[1px]">
                            Dados legais
                        </h2>
                    </div>
                    <dl className="space-y-3">
                        <InfoLine label="NIF" value={condominio.nif} icon={Hash} />
                        <InfoLine
                            label="Data constituição"
                            value={condominio.data_constituicao ? formatDate(condominio.data_constituicao) : null}
                            icon={Calendar}
                        />
                        <InfoLine label="Matrícula" value={condominio.numero_matricula} icon={FileText} />
                        <InfoLine label="Conservatória" value={condominio.conservatoria} icon={Landmark} />
                    </dl>
                </div>

                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-4 h-4 text-[#00D4FF]" />
                        <h2 className="text-sm font-semibold text-white uppercase tracking-[1px]">
                            Financeiro
                        </h2>
                    </div>
                    <dl className="space-y-3">
                        <InfoLine label="Banco" value={condominio.banco} icon={Landmark} />
                        <InfoLine label="IBAN" value={condominio.iban} icon={CreditCard} mono />
                        <InfoLine
                            label="UCF actual"
                            value={condominio.ucf_valor_actual ? `${Number(condominio.ucf_valor_actual).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz` : null}
                            icon={DollarSign}
                        />
                        <InfoLine
                            label="Fundo reserva"
                            value={`${condominio.percentagem_fundo_reserva}%`}
                            icon={Shield}
                            destaque={parseFloat(condominio.percentagem_fundo_reserva?.toString() ?? '0') >= 10}
                        />
                    </dl>
                </div>
            </div>

            {/* Administrador */}
            {condominio.administrador && (
                <div className="card mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-4 h-4 text-[#EC4899]" />
                        <h2 className="text-sm font-semibold text-white uppercase tracking-[1px]">
                            Administrador do condomínio
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                            style={{ background: gradientDeNome(condominio.administrador.name) }}
                        >
                            {iniciais(condominio.administrador.name)}
                        </div>
                        <div>
                            <div className="font-medium text-white text-sm">
                                {condominio.administrador.name}
                            </div>
                            <div className="text-xs text-white/50 mt-0.5">
                                {condominio.administrador.email}
                                {condominio.administrador.telefone &&
                                    ` · ${condominio.administrador.telefone}`}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Blocos adaptativos */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">{labelBlocos(condominio.tipo)}</h2>
                    <p className="text-xs text-white/50 mt-0.5">
                        {condominio.edificios.length} {condominio.edificios.length === 1 ? labelBloco(condominio.tipo).toLowerCase() : labelBlocos(condominio.tipo).toLowerCase()} registados
                    </p>
                </div>
                <Link
                    href={`/condominios/${condominio.id}/edificios/create`}
                    className="btn-primary"
                >
                    <Plus className="h-4 w-4" />
                    Adicionar {labelBloco(condominio.tipo).toLowerCase()}
                </Link>
            </div>

            {condominio.edificios.length === 0 ? (
                <div
                    className="text-center py-16 rounded-xl"
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '0.5px dashed rgba(168, 85, 247, 0.2)',
                    }}
                >
                    <Building2 className="h-12 w-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/50 text-sm">Nenhum edifício registado.</p>
                    <Link
                        href={`/condominios/${condominio.id}/edificios/create`}
                        className="inline-flex items-center gap-1 mt-4 text-[#00D4FF] hover:text-[#A855F7] text-sm font-medium transition"
                    >
                        Adicionar o primeiro edifício
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {condominio.edificios.map((e) => (
                        <Link
                            key={e.id}
                            href={`/edificios/${e.id}`}
                            className="card group hover:-translate-y-0.5 transition-all"
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                                    style={{
                                        background: 'rgba(168, 85, 247, 0.1)',
                                        border: '0.5px solid rgba(168, 85, 247, 0.25)',
                                    }}
                                >
                                    <Building2 className="h-4 w-4 text-[#A855F7]" />
                                </div>
                                <span className="text-[10px] font-mono text-white/40 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                                    {e.codigo}
                                </span>
                            </div>
                            <h3 className="font-semibold text-white text-sm group-hover:text-[#00D4FF] transition">
                                {e.nome}
                            </h3>
                            <p className="text-xs text-white/50 mt-1">
                                {e.numero_pisos} pisos
                                {e.tem_elevador && ' · c/ elevador'}
                            </p>
                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                <span className="text-xs text-white/60">
                                    {e.fraccoes_count ?? 0} fracções
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition" />
                            </div>
                        </Link>
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
    subtitulo,
}: {
    label: string;
    valor: number | string;
    icon: React.ElementType;
    cor: string;
    subtitulo?: string;
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
            {subtitulo && (
                <div className="text-[10px] text-white/40 mt-1">{subtitulo}</div>
            )}
        </div>
    );
}

function InfoLine({
    label,
    value,
    icon: Icon,
    mono,
    destaque,
}: {
    label: string;
    value: string | null | undefined;
    icon?: React.ElementType;
    mono?: boolean;
    destaque?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-3 py-1.5">
            <div className="flex items-center gap-2 text-white/50 text-xs flex-shrink-0">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
            </div>
            <div className={`text-right text-sm ${mono ? 'font-mono text-xs' : ''} ${
                value
                    ? destaque
                        ? 'text-emerald-400 font-medium'
                        : 'text-white'
                    : 'text-white/30'
            }`}>
                {value || '—'}
            </div>
        </div>
    );
}

function EstadoBadge({ estado }: { estado: string }) {
    const variants: Record<string, string> = {
        activo: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        inactivo: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        arquivado: 'bg-white/5 text-white/50 border-white/10',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${
                variants[estado] ?? variants.arquivado
            }`}
        >
            <span className="w-1 h-1 rounded-full bg-current" />
            {estado}
        </span>
    );
}

function labelBlocos(tipo: string): string {
    const map: Record<string, string> = {
        vertical: 'Edifícios',
        horizontal: 'Conjuntos',
        misto: 'Blocos',
        loteamento: 'Fases',
    };
    return map[tipo] ?? 'Blocos';
}

function labelBloco(tipo: string): string {
    const map: Record<string, string> = {
        vertical: 'Edifício',
        horizontal: 'Conjunto',
        misto: 'Bloco',
        loteamento: 'Fase',
    };
    return map[tipo] ?? 'Bloco';
}

function labelFraccoes(tipo: string): string {
    const map: Record<string, string> = {
        vertical: 'Apartamentos',
        horizontal: 'Vivendas',
        misto: 'Fracções',
        loteamento: 'Lotes',
    };
    return map[tipo] ?? 'Fracções';
}
