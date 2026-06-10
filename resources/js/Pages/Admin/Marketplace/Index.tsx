import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

interface Autor {
    nome: string;
    email: string;
    telefone: string | null;
    condominio: string | null;
}

interface AnuncioInfo {
    id: number;
    titulo: string;
    tipo: string;
    preco: number | null;
    nome_exibicao: string | null;
    estado_moderacao: string;
    estado_venda: string;
    categoria: string | null;
    autor: Autor | null;
}

interface Denuncia {
    id: number;
    motivo: string;
    detalhe: string | null;
    estado: string;
    created_at: string | null;
    anuncio: AnuncioInfo | null;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    denuncias: Paginated<Denuncia>;
}

export default function AdminMarketplaceIndex({ denuncias }: Props) {
    const remover = (anuncioId: number) => {
        if (confirm('Remover este anúncio? Deixará de estar visível no marketplace.')) {
            router.patch(`/admin/marketplace/anuncio/${anuncioId}/remover`);
        }
    };

    const reactivar = (anuncioId: number) => {
        router.patch(`/admin/marketplace/anuncio/${anuncioId}/reactivar`);
    };

    const resolver = (denunciaId: number) => {
        router.patch(`/admin/marketplace/denuncia/${denunciaId}/resolver`);
    };

    const preco = (v: number | null) =>
        v == null ? 'A combinar' : `${v.toLocaleString('pt-PT')} Kz`;

    return (
        <AuthenticatedLayout>
            <Head title="Moderação — Marketplace" />
            <div className="max-w-5xl mx-auto px-4 py-6">
                <h1 className="text-xl font-medium text-white mb-1">Moderação do Marketplace</h1>
                <p className="text-sm text-white/60 mb-6">
                    Denúncias de anúncios. Remova os que violem as regras ou reactive os removidos.
                </p>

                {denuncias.data.length === 0 ? (
                    <div className="p-8 rounded-xl bg-white/[0.03] border border-white/10 text-center text-white/50">
                        Sem denúncias de momento.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {denuncias.data.map((d) => (
                            <div
                                key={d.id}
                                className="p-4 rounded-xl bg-white/[0.03] border border-white/10"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300">
                                                {d.estado === 'pendente' ? 'Pendente' : 'Resolvida'}
                                            </span>
                                            <span className="text-xs text-white/40">{d.created_at}</span>
                                        </div>
                                        {d.anuncio ? (
                                            <>
                                                <p className="text-white font-medium">
                                                    {d.anuncio.titulo}
                                                    {d.anuncio.estado_moderacao === 'removido' && (
                                                        <span className="ml-2 text-xs text-red-400">(removido)</span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-white/60">
                                                    {d.anuncio.categoria} · {preco(d.anuncio.preco)} · por {d.anuncio.nome_exibicao ?? '—'}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-white/50 italic">Anúncio apagado</p>
                                        )}
                                        <p className="text-sm text-white/80 mt-2">
                                            <span className="text-white/40">Motivo:</span> {d.motivo}
                                        </p>
                                        {d.detalhe && (
                                            <p className="text-sm text-white/60 mt-1">{d.detalhe}</p>
                                        )}
                                        {d.anuncio?.autor && (
                                            <div className="mt-3 p-3 rounded-lg bg-white/[0.04] border border-white/10">
                                                <p className="text-xs text-white/40 mb-1">Dados do anunciante (auditoria)</p>
                                                <p className="text-sm text-white/80">{d.anuncio.autor.nome} · {d.anuncio.autor.email}</p>
                                                <p className="text-sm text-white/60">
                                                    {d.anuncio.autor.telefone ?? 'Sem telefone'}
                                                    {d.anuncio.autor.condominio ? ` · ${d.anuncio.autor.condominio}` : ''}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        {d.anuncio && d.anuncio.estado_moderacao !== 'removido' && (
                                            <button
                                                onClick={() => remover(d.anuncio!.id)}
                                                className="px-3 py-1.5 text-sm rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors"
                                            >
                                                Remover anúncio
                                            </button>
                                        )}
                                        {d.anuncio && d.anuncio.estado_moderacao === 'removido' && (
                                            <button
                                                onClick={() => reactivar(d.anuncio!.id)}
                                                className="px-3 py-1.5 text-sm rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                                            >
                                                Reactivar anúncio
                                            </button>
                                        )}
                                        {d.estado === 'pendente' && (
                                            <button
                                                onClick={() => resolver(d.id)}
                                                className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
                                            >
                                                Marcar resolvida
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
