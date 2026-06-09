import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Edit, Trash2, UserCircle, Building, Phone, Mail,
    MapPin, Calendar, Hash, Plus, Home, FileText, Briefcase,
    ChevronRight, X,
} from 'lucide-react';
import type { Condomino, ContratoOcupacao } from '@/types';
import { formatDate, formatKz, gradientDeNome, iniciais } from '@/lib/utils';

interface Props {
    condomino: Condomino;
    estatisticas: {
        total_contratos: number;
        total_propriedades: number;
        total_arrendamentos: number;
        total_fraccoes_activas: number;
    };
}

export default function Show({ condomino, estatisticas }: Props) {
    const eliminar = () => {
        if (confirm(`Tem a certeza que quer arquivar «${condomino.nome_completo}»?`)) {
            router.delete(`/condominos/${condomino.id}`);
        }
    };

    const ehEmpresa = condomino.tipo === 'empresa';
    const nomeExibicao = ehEmpresa && condomino.nome_comercial ? condomino.nome_comercial : condomino.nome_completo;
    const corTema = ehEmpresa ? '#EC4899' : '#A855F7';

    return (
        <AuthenticatedLayout>
            <Head title={nomeExibicao} />

            {/* Header */}
            <div className="mb-8">
                <Link href="/condominos" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar à lista
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                            style={{ background: gradientDeNome(condomino.nome_completo) }}
                        >
                            {iniciais(condomino.nome_completo)}
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                {nomeExibicao}
                            </h1>
                            {ehEmpresa && condomino.nome_comercial && condomino.nome_comercial !== condomino.nome_completo && (
                                <p className="text-sm text-white/50 mt-0.5">{condomino.nome_completo}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <TipoBadge tipo={condomino.tipo} />
                                <EstadoBadge estado={condomino.estado} />
                                {condomino.tipo === 'empresa' && condomino.nif && (
                                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70 font-mono">
                                        NIF {condomino.nif}
                                    </span>
                                )}
                                {condomino.tipo === 'singular' && condomino.numero_bi && (
                                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70 font-mono">
                                        BI {condomino.numero_bi}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link href={`/condominos/${condomino.id}/edit`} className="btn-secondary">
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
                <StatBox label="Contratos activos" valor={estatisticas.total_fraccoes_activas} icon={FileText} cor="#00D4FF" />
                <StatBox label="Propriedades" valor={estatisticas.total_propriedades} icon={Home} cor="#A855F7" />
                <StatBox label="Arrendamentos" valor={estatisticas.total_arrendamentos} icon={Briefcase} cor="#EC4899" />
                <StatBox label="Total histórico" valor={estatisticas.total_contratos} icon={Calendar} cor="#64748B" />
            </div>

            {/* Dados + Contactos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        {ehEmpresa ? <Building className="w-4 h-4 text-[#EC4899]" /> : <UserCircle className="w-4 h-4 text-[#A855F7]" />}
                        <h2 className="text-sm font-semibold text-white uppercase tracking-[1px]">
                            {ehEmpresa ? 'Dados da empresa' : 'Dados pessoais'}
                        </h2>
                    </div>
                    <dl className="space-y-3">
                        {ehEmpresa ? (
                            <>
                                <InfoLine label="NIF" value={condomino.nif} icon={Hash} mono />
                                <InfoLine label="Data constituição" value={condomino.data_constituicao_empresa ? formatDate(condomino.data_constituicao_empresa) : null} icon={Calendar} />
                                <InfoLine label="Nº registo" value={condomino.numero_registo_comercial} icon={FileText} />
                            </>
                        ) : (
                            <>
                                <InfoLine label="BI" value={condomino.numero_bi} icon={Hash} mono />
                                <InfoLine label="Data nascimento" value={condomino.data_nascimento ? formatDate(condomino.data_nascimento) : null} icon={Calendar} />
                                <InfoLine label="Género" value={formatGenero(condomino.genero)} icon={UserCircle} />
                                <InfoLine label="Estado civil" value={formatEstadoCivil(condomino.estado_civil)} icon={FileText} />
                                <InfoLine label="Nacionalidade" value={condomino.nacionalidade} icon={MapPin} />
                                <InfoLine label="Profissão" value={condomino.profissao} icon={Briefcase} />
                            </>
                        )}
                    </dl>
                </div>

                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <Phone className="w-4 h-4 text-[#00D4FF]" />
                        <h2 className="text-sm font-semibold text-white uppercase tracking-[1px]">
                            Contactos
                        </h2>
                    </div>
                    <dl className="space-y-3">
                        <InfoLine label="Telefone" value={condomino.telefone_principal} icon={Phone} />
                        <InfoLine label="Telefone alt." value={condomino.telefone_alternativo} icon={Phone} />
                        <InfoLine label="Email" value={condomino.email} icon={Mail} />
                        {condomino.morada && (
                            <>
                                <div className="pt-2 mt-2 border-t border-white/5">
                                    <InfoLine label="Morada" value={condomino.morada} icon={MapPin} />
                                    <InfoLine label="Localidade" value={[condomino.bairro, condomino.municipio, condomino.provincia].filter(Boolean).join(' · ') || null} icon={MapPin} />
                                </div>
                            </>
                        )}
                    </dl>
                </div>
            </div>

            {/* Representante (se empresa) */}
            {ehEmpresa && condomino.representante_nome && (
                <div className="card mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Briefcase className="w-4 h-4 text-[#EC4899]" />
                        <h2 className="text-sm font-semibold text-white uppercase tracking-[1px]">
                            Representante legal
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                        <InfoLine label="Nome" value={condomino.representante_nome} icon={UserCircle} />
                        <InfoLine label="Cargo" value={condomino.representante_cargo} icon={Briefcase} />
                        <InfoLine label="BI" value={condomino.representante_bi} icon={Hash} mono />
                        <InfoLine label="Telefone" value={condomino.representante_telefone} icon={Phone} />
                        <InfoLine label="Email" value={condomino.representante_email} icon={Mail} />
                    </div>
                </div>
            )}

            {/* Contratos de ocupação */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Contratos de ocupação</h2>
                    <p className="text-xs text-white/50 mt-0.5">
                        Fracções associadas a este condómino (proprietário, inquilino, etc.)
                    </p>
                </div>
                <Link href={`/condominos/${condomino.id}/contratos/create`} className="btn-primary">
                    <Plus className="h-4 w-4" />
                    Associar fracção
                </Link>
            </div>

            {(!condomino.contratos || condomino.contratos.length === 0) ? (
                <div className="text-center py-16 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px dashed rgba(168, 85, 247, 0.2)' }}
                >
                    <Home className="h-12 w-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/50 text-sm">Ainda não há contratos associados.</p>
                    <Link href={`/condominos/${condomino.id}/contratos/create`} className="inline-flex items-center gap-1 mt-4 text-[#00D4FF] hover:text-[#A855F7] text-sm font-medium transition">
                        Associar primeira fracção
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-2">
                    {condomino.contratos.map((c) => (
                        <ContratoRow key={c.id} contrato={c} />
                    ))}
                </div>
            )}

            {condomino.observacoes && (
                <div className="card mt-6">
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-white/50" />
                        <h2 className="text-sm font-semibold text-white uppercase tracking-[1px]">Observações</h2>
                    </div>
                    <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{condomino.observacoes}</p>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function ContratoRow({ contrato }: { contrato: ContratoOcupacao }) {
    const terminar = () => {
        const data = prompt('Data de fim do contrato (AAAA-MM-DD):', new Date().toISOString().slice(0, 10));
        if (!data) return;
        const motivo = prompt('Motivo (opcional):') || '';
        router.patch(`/contratos/${contrato.id}/terminar`, { data_fim: data, motivo_fim: motivo });
    };

    const remover = () => {
        if (confirm('Remover este contrato do histórico?')) {
            router.delete(`/contratos/${contrato.id}`);
        }
    };

    const tipoConfig: Record<string, { label: string; cor: string; icon: React.ElementType }> = {
        proprietario: { label: 'Proprietário', cor: '#A855F7', icon: Home },
        inquilino: { label: 'Inquilino', cor: '#00D4FF', icon: Briefcase },
        usufructo: { label: 'Usufruto', cor: '#F59E0B', icon: FileText },
        cedencia: { label: 'Cedência', cor: '#64748B', icon: FileText },
    };

    const config = tipoConfig[contrato.tipo] ?? tipoConfig.proprietario;
    const Icon = config.icon;

    const fraccao = contrato.fraccao;
    const edificio = (fraccao as any)?.edificio;
    const condominio = edificio?.condominio;

    return (
        <div
            className="rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-white/[0.02]"
            style={{
                background: 'rgba(255,255,255,0.02)',
                border: `0.5px solid ${contrato.estado === 'activo' ? config.cor + '25' : 'rgba(255,255,255,0.08)'}`,
                opacity: contrato.estado !== 'activo' ? 0.6 : 1,
            }}
        >
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${config.cor}15`, border: `0.5px solid ${config.cor}35` }}
            >
                <Icon className="w-4 h-4" style={{ color: config.cor }} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: `${config.cor}15`, color: config.cor }}>
                        {config.label}
                    </span>
                    {contrato.estado === 'terminado' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50">Terminado</span>
                    )}
                    {contrato.estado === 'suspenso' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Suspenso</span>
                    )}
                </div>
                {fraccao && (
                    <Link href={`/fraccoes/${fraccao.id}`} className="text-sm text-white font-medium hover:text-[#00D4FF] transition">
                        Fracção {fraccao.identificador}
                        {edificio && (
                            <span className="text-white/50 font-normal"> · {edificio.nome}</span>
                        )}
                        {condominio && (
                            <span className="text-white/40 font-normal"> · {condominio.nome}</span>
                        )}
                    </Link>
                )}
                <div className="text-[11px] text-white/50 mt-0.5 flex items-center gap-2">
                    <span>{formatDate(contrato.data_inicio)}</span>
                    {contrato.data_fim && <span>→ {formatDate(contrato.data_fim)}</span>}
                    {contrato.tipo === 'inquilino' && contrato.valor_renda_mensal && (
                        <span>· Renda {formatKz(contrato.valor_renda_mensal)}</span>
                    )}
                    {contrato.tipo === 'proprietario' && Number(contrato.percentagem_propriedade) < 100 && (
                        <span>· {contrato.percentagem_propriedade}% propriedade</span>
                    )}
                </div>
            </div>

            {contrato.estado === 'activo' && (
                <div className="flex gap-1 flex-shrink-0">
                    <button
                        onClick={terminar}
                        className="p-2 rounded-lg text-white/50 hover:text-amber-400 hover:bg-white/5 transition"
                        title="Terminar contrato"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            {contrato.estado !== 'activo' && (
                <button
                    onClick={remover}
                    className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition"
                    title="Remover do histórico"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

function StatBox({ label, valor, icon: Icon, cor }: { label: string; valor: number; icon: React.ElementType; cor: string }) {
    return (
        <div
            className="rounded-xl p-4 transition-all"
            style={{
                background: `linear-gradient(135deg, ${cor}15 0%, ${cor}05 100%)`,
                border: `0.5px solid ${cor}35`,
            }}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cor}20`, border: `0.5px solid ${cor}40` }}>
                    <Icon className="w-4 h-4" style={{ color: cor }} />
                </div>
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-[1px] font-medium mb-0.5">{label}</div>
            <div className="text-2xl font-semibold text-white tracking-tight">{valor}</div>
        </div>
    );
}

function InfoLine({
    label, value, icon: Icon, mono,
}: { label: string; value: string | null | undefined; icon?: React.ElementType; mono?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-2 text-white/50 text-xs flex-shrink-0">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
            </div>
            <div className={`text-right text-sm ${mono ? 'font-mono text-xs' : ''} ${value ? 'text-white' : 'text-white/30'}`}>
                {value || '—'}
            </div>
        </div>
    );
}

function TipoBadge({ tipo }: { tipo: 'singular' | 'empresa' }) {
    if (tipo === 'empresa') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/20">
                <Building className="w-2.5 h-2.5" />
                Empresa
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/20">
            <UserCircle className="w-2.5 h-2.5" />
            Pessoa singular
        </span>
    );
}

function EstadoBadge({ estado }: { estado: string }) {
    const config: Record<string, string> = {
        activo: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        inactivo: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        arquivado: 'bg-white/5 text-white/50 border-white/10',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${config[estado] ?? config.arquivado}`}>
            <span className="w-1 h-1 rounded-full bg-current" />
            {estado}
        </span>
    );
}

function formatGenero(g: string | null): string | null {
    if (!g) return null;
    return g.charAt(0).toUpperCase() + g.slice(1);
}

function formatEstadoCivil(ec: string | null): string | null {
    if (!ec) return null;
    const map: Record<string, string> = {
        solteiro: 'Solteiro(a)',
        casado: 'Casado(a)',
        uniao_facto: 'União de facto',
        divorciado: 'Divorciado(a)',
        viuvo: 'Viúvo(a)',
    };
    return map[ec] ?? ec;
}
