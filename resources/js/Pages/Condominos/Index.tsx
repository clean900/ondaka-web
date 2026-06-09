import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Plus, Search, Users, UserCircle, Building, ChevronRight,
    Phone, Mail, Home,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { Condomino, Paginated } from '@/types';
import { gradientDeNome, iniciais } from '@/lib/utils';

interface Props {
    condominos: Paginated<Condomino>;
    filtros: { pesquisa?: string; tipo?: string; estado?: string };
    contagens: {
        total: number;
        singulares: number;
        empresas: number;
        activos: number;
    };
}

export default function Index({ condominos, filtros, contagens }: Props) {
    const [pesquisa, setPesquisa] = useState(filtros.pesquisa ?? '');
    const [tipo, setTipo] = useState(filtros.tipo ?? '');
    const [estado, setEstado] = useState(filtros.estado ?? '');

    const submeter = (e: FormEvent) => {
        e.preventDefault();
        router.get('/condominos', { pesquisa, tipo, estado }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Condóminos" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Condóminos</h1>
                    <p className="text-sm text-white/60 mt-1.5">
                        Pessoas e empresas registadas na plataforma.
                    </p>
                </div>
                <Link href="/condominos/create" className="btn-primary">
                    <Plus className="h-4 w-4" />
                    Novo condómino
                </Link>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatPill label="Total" valor={contagens.total} icon={Users} cor="#00D4FF" />
                <StatPill label="Singulares" valor={contagens.singulares} icon={UserCircle} cor="#A855F7" />
                <StatPill label="Empresas" valor={contagens.empresas} icon={Building} cor="#EC4899" />
                <StatPill label="Activos" valor={contagens.activos} icon={Home} cor="#10B981" />
            </div>

            {/* Pesquisa e filtros */}
            <form onSubmit={submeter} className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                    <input
                        type="text"
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                        placeholder="Pesquisar por nome, BI, NIF, email ou telefone..."
                        className="input pl-10"
                    />
                </div>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="input sm:w-40">
                    <option value="">Todos os tipos</option>
                    <option value="singular">Singular</option>
                    <option value="empresa">Empresa</option>
                </select>
                <select value={estado} onChange={(e) => setEstado(e.target.value)} className="input sm:w-40">
                    <option value="">Todos os estados</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="arquivado">Arquivado</option>
                </select>
                <button type="submit" className="btn-secondary">Filtrar</button>
            </form>

            {/* Lista */}
            {condominos.data.length === 0 ? (
                <div
                    className="text-center py-16 rounded-xl"
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '0.5px dashed rgba(168, 85, 247, 0.2)',
                    }}
                >
                    <Users className="h-12 w-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/50">Ainda não há condóminos registados.</p>
                    <Link
                        href="/condominos/create"
                        className="inline-flex items-center gap-1 mt-4 text-[#00D4FF] hover:text-[#A855F7] font-medium text-sm transition"
                    >
                        Registar o primeiro condómino
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {condominos.data.map((c) => (
                        <CondominoCard key={c.id} condomino={c} />
                    ))}
                </div>
            )}

            {/* Paginação */}
            {condominos.data.length > 0 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-white/50">
                        A mostrar <span className="text-white font-medium">{condominos.from}–{condominos.to}</span> de{' '}
                        <span className="text-white font-medium">{condominos.total}</span>
                    </p>
                    <div className="flex gap-1">
                        {condominos.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                className={`min-w-[34px] px-3 py-1.5 rounded-lg text-xs transition ${
                                    link.active
                                        ? 'text-white font-medium'
                                        : 'text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed'
                                }`}
                                style={link.active ? {
                                    background: 'linear-gradient(135deg, #00D4FF 0%, #A855F7 100%)',
                                } : undefined}
                                dangerouslySetInnerHTML={{
                                    __html: link.label
                                        .replace('pagination.previous', 'Anterior')
                                        .replace('pagination.next', 'Seguinte')
                                        .replace('&laquo;', '‹')
                                        .replace('&raquo;', '›'),
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function StatPill({
    label, valor, icon: Icon, cor,
}: { label: string; valor: number; icon: React.ElementType; cor: string }) {
    return (
        <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{
                background: `linear-gradient(135deg, ${cor}12 0%, ${cor}04 100%)`,
                border: `0.5px solid ${cor}30`,
            }}
        >
            <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${cor}20`, border: `0.5px solid ${cor}40` }}
            >
                <Icon className="w-4 h-4" style={{ color: cor }} />
            </div>
            <div className="min-w-0">
                <div className="text-[10px] text-white/50 uppercase tracking-wider font-medium">
                    {label}
                </div>
                <div className="text-xl font-semibold text-white">{valor}</div>
            </div>
        </div>
    );
}

function CondominoCard({ condomino }: { condomino: Condomino }) {
    const nomeExibicao = condomino.tipo === 'empresa' && condomino.nome_comercial
        ? condomino.nome_comercial
        : condomino.nome_completo;

    const documento = condomino.tipo === 'empresa'
        ? { label: 'NIF', valor: condomino.nif }
        : { label: 'BI', valor: condomino.numero_bi };

    const totalFraccoes = (condomino.propriedades_count ?? 0) + (condomino.arrendamentos_count ?? 0);

    return (
        <Link
            href={`/condominos/${condomino.id}`}
            className="card group hover:-translate-y-0.5 transition-all block"
        >
            <div className="flex items-start gap-3 mb-3">
                <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                    style={{ background: gradientDeNome(condomino.nome_completo) }}
                >
                    {iniciais(condomino.nome_completo)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate group-hover:text-[#00D4FF] transition">
                        {nomeExibicao}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <TipoBadge tipo={condomino.tipo} />
                        <EstadoDot estado={condomino.estado} />
                    </div>
                </div>
            </div>

            <div className="space-y-1.5 text-xs">
                {documento.valor && (
                    <div className="flex items-center justify-between">
                        <span className="text-white/50">{documento.label}</span>
                        <span className="text-white/80 font-mono text-[11px]">{documento.valor}</span>
                    </div>
                )}
                {condomino.telefone_principal && (
                    <div className="flex items-center gap-1.5 text-white/60">
                        <Phone className="w-3 h-3 text-white/40" />
                        <span className="truncate">{condomino.telefone_principal}</span>
                    </div>
                )}
                {condomino.email && (
                    <div className="flex items-center gap-1.5 text-white/60">
                        <Mail className="w-3 h-3 text-white/40" />
                        <span className="truncate">{condomino.email}</span>
                    </div>
                )}
            </div>

            {totalFraccoes > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/60">
                        <span className="text-white font-medium">{totalFraccoes}</span>
                        {' '}
                        {totalFraccoes === 1 ? 'fracção' : 'fracções'}
                    </span>
                    <div className="flex gap-2 text-[10px] text-white/40">
                        {(condomino.propriedades_count ?? 0) > 0 && (
                            <span>{condomino.propriedades_count} prop.</span>
                        )}
                        {(condomino.arrendamentos_count ?? 0) > 0 && (
                            <span>{condomino.arrendamentos_count} arrend.</span>
                        )}
                    </div>
                </div>
            )}
        </Link>
    );
}

function TipoBadge({ tipo }: { tipo: 'singular' | 'empresa' }) {
    if (tipo === 'empresa') {
        return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/20">
                <Building className="w-2.5 h-2.5" />
                Empresa
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/20">
            <UserCircle className="w-2.5 h-2.5" />
            Singular
        </span>
    );
}

function EstadoDot({ estado }: { estado: string }) {
    const cor = estado === 'activo' ? '#10B981' : estado === 'inactivo' ? '#F59E0B' : '#64748B';
    return <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: cor }} />;
}
