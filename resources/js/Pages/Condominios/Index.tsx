import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Building2, MapPin, Users2, ChevronRight } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { Condominio, Paginated } from '@/types';

interface Props {
    condominios: Paginated<Condominio>;
    filtros: { pesquisa?: string; estado?: string };
}

export default function Index({ condominios, filtros }: Props) {
    const [pesquisa, setPesquisa] = useState(filtros.pesquisa ?? '');
    const [estado, setEstado] = useState(filtros.estado ?? '');

    const submeter = (e: FormEvent) => {
        e.preventDefault();
        router.get('/condominios', { pesquisa, estado }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Condomínios" />

            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Condomínios</h1>
                    <p className="text-sm text-white/60 mt-1.5">
                        Gestão dos condomínios sob administração da empresa.
                    </p>
                </div>
                <Link href="/condominios/create" className="btn-primary">
                    <Plus className="h-4 w-4" />
                    Novo condomínio
                </Link>
            </div>

            {/* Pesquisa */}
            <form onSubmit={submeter} className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                    <input
                        type="text"
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                        placeholder="Pesquisar por nome, código, bairro ou município..."
                        className="input pl-10"
                    />
                </div>
                <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="input sm:w-48"
                >
                    <option value="">Todos os estados</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="arquivado">Arquivado</option>
                </select>
                <button type="submit" className="btn-secondary">
                    Filtrar
                </button>
            </form>

            {/* Lista */}
            {condominios.data.length === 0 ? (
                <div
                    className="text-center py-16 rounded-xl"
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '0.5px dashed rgba(168, 85, 247, 0.2)',
                    }}
                >
                    <Building2 className="h-12 w-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/50">Nenhum condomínio encontrado.</p>
                    <Link
                        href="/condominios/create"
                        className="inline-flex items-center gap-1 mt-4 text-[#00D4FF] hover:text-[#A855F7] font-medium text-sm transition"
                    >
                        Criar o primeiro condomínio
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {condominios.data.map((c) => (
                        <Link
                            key={c.id}
                            href={`/condominios/${c.id}`}
                            className="card group hover:-translate-y-0.5 transition-all"
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
                                        border: '0.5px solid rgba(0, 212, 255, 0.25)',
                                    }}
                                >
                                    <Building2 className="h-5 w-5 text-[#00D4FF]" />
                                </div>
                                <EstadoBadge estado={c.estado} />
                            </div>
                            <h3 className="font-semibold text-white group-hover:text-[#00D4FF] transition">
                                {c.nome}
                            </h3>
                            <p className="text-[11px] text-white/40 mt-0.5 font-mono">{c.codigo}</p>

                            <div className="mt-3 flex items-center gap-1.5 text-xs text-white/60">
                                <MapPin className="h-3 w-3 text-[#A855F7]" />
                                {c.municipio}
                                {c.bairro ? ` · ${c.bairro}` : ''}
                            </div>

                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                <span className="text-xs text-white/60">
                                    <span className="text-white font-medium">{c.edificios_count ?? 0}</span> edif
                                    <span className="mx-1 text-white/30">·</span>
                                    <span className="text-white font-medium">{c.fraccoes_count ?? 0}</span> fracções
                                </span>
                                {c.administrador && (
                                    <span className="flex items-center gap-1 text-white/50 text-[10px]">
                                        <Users2 className="h-3 w-3" />
                                        {c.administrador.name.split(' ')[0]}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Paginação */}
            {condominios.data.length > 0 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-white/50">
                        A mostrar <span className="text-white font-medium">{condominios.from}–{condominios.to}</span> de{' '}
                        <span className="text-white font-medium">{condominios.total}</span>
                    </p>
                    <div className="flex gap-1">
                        {condominios.links.map((link, i) => (
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
