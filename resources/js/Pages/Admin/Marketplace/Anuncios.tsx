import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface Autor {
    nome: string;
    email: string;
    telefone: string | null;
    condominio: string | null;
}

interface Anuncio {
    id: number;
    titulo: string;
    tipo: string;
    preco: number | null;
    nome_exibicao: string | null;
    visibilidade: string;
    estado_moderacao: string;
    estado_venda: string;
    categoria: string | null;
    denuncias_count: number;
    created_at: string | null;
    autor: Autor | null;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    anuncios: Paginated<Anuncio>;
    filtros: { q: string; estado_moderacao: string };
}

export default function AdminMarketplaceAnuncios({ anuncios, filtros }: Props) {
    const [q, setQ] = useState(filtros.q);

    const pesquisar = () => {
        router.get('/admin/marketplace/anuncios', q ? { q } : {}, { preserveState: false });
    };

    const filtrarEstado = (estado: string) => {
        router.get('/admin/marketplace/anuncios', estado ? { estado_moderacao: estado } : {}, {
            preserveState: false,
        });
    };

    const remover = (id: number) => {
        if (confirm('Remover este anúncio?')) {
            router.patch(`/admin/marketplace/anuncio/${id}/remover`);
        }
    };

    const reactivar = (id: number) => {
        router.patch(`/admin/marketplace/anuncio/${id}/reactivar`);
    };

    const preco = (v: number | null) =>
        v == null ? 'A combinar' : `${v.toLocaleString('pt-PT')} Kz`;

    return (
        <AuthenticatedLayout>
            <Head title="Anúncios — Marketplace" />
            <div className="max-w-6xl mx-auto px-4 py-6">
                <h1 className="text-xl font-medium text-white mb-1">Todos os anúncios</h1>
                <p className="text-sm text-white/60 mb-6">
                    Listagem completa para auditoria. Inclui os dados reais de quem publicou.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && pesquisar()}
                        placeholder="Pesquisar título ou nome..."
                        className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    />
                    <button onClick={pesquisar} className="px-4 py-2 text-sm rounded-lg bg-[#00D4FF]/15 text-[#8FE7FF] hover:bg-[#00D4FF]/25">
                        Pesquisar
                    </button>
                    <select
                        value={filtros.estado_moderacao}
                        onChange={(e) => filtrarEstado(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                        <option value="">Todos os estados</option>
                        <option value="activo">Activos</option>
                        <option value="removido">Removidos</option>
                    </select>
                </div>

                {anuncios.data.length === 0 ? (
                    <div className="p-8 rounded-xl bg-white/[0.03] border border-white/10 text-center text-white/50">
                        Sem anúncios.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {anuncios.data.map((a) => (
                            <div key={a.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white font-medium">{a.titulo}</span>
                                            {a.estado_moderacao === 'removido' && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-300">removido</span>
                                            )}
                                            {a.denuncias_count > 0 && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300">
                                                    {a.denuncias_count} denúncia(s)
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-white/60">
                                            {a.categoria} · {preco(a.preco)} · {a.tipo} · {a.visibilidade} · {a.created_at}
                                        </p>
                                        {a.autor && (
                                            <div className="mt-2 p-2 rounded-lg bg-white/[0.04]">
                                                <p className="text-xs text-white/40">Anunciante real (alcunha: {a.nome_exibicao ?? '—'})</p>
                                                <p className="text-sm text-white/80">{a.autor.nome} · {a.autor.email}</p>
                                                <p className="text-sm text-white/60">
                                                    {a.autor.telefone ?? 'Sem telefone'}
                                                    {a.autor.condominio ? ` · ${a.autor.condominio}` : ''}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="shrink-0">
                                        {a.estado_moderacao !== 'removido' ? (
                                            <button onClick={() => remover(a.id)} className="px-3 py-1.5 text-sm rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25">
                                                Remover
                                            </button>
                                        ) : (
                                            <button onClick={() => reactivar(a.id)} className="px-3 py-1.5 text-sm rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25">
                                                Reactivar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap gap-1 mt-6">
                    {anuncios.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.visit(link.url)}
                            className={`px-3 py-1.5 text-sm rounded-lg ${
                                link.active ? 'bg-[#00D4FF]/20 text-[#8FE7FF]' : 'bg-white/5 text-white/60 hover:bg-white/10'
                            } disabled:opacity-30`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
