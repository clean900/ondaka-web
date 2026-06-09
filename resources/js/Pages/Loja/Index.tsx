import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Sparkles, ShoppingBag, Search, Check, Clock, ArrowRight, Filter } from 'lucide-react';

interface Feature {
    id: number;
    slug: string;
    nome: string;
    descricao: string | null;
    icone: string | null;
    categoria: string;
    modelo_cobranca: 'subscription' | 'one_time' | 'consumable';
    preco_base: number;
    preco_activacao: number;
    em_breve: boolean;
}

interface Props {
    features: Feature[];
}

const categoriaLabels: Record<string, string> = {
    comunicacao: 'Comunicação',
    pagamentos: 'Pagamentos',
    seguranca: 'Segurança',
    gestao: 'Gestão',
    personalizacao: 'Personalização',
    outros: 'Outros',
};

const categoriaColors: Record<string, string> = {
    comunicacao: '#00D4FF',
    pagamentos: '#10B981',
    seguranca: '#EF4444',
    gestao: '#A855F7',
    personalizacao: '#EC4899',
    outros: '#6B7280',
};

const modeloLabels: Record<string, string> = {
    subscription: 'Mensal',
    one_time: 'Pagamento único',
    consumable: 'Consumível',
};

const fmt = (v: number) => new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export default function Index({ features }: Props) {
    const [busca, setBusca] = useState('');
    const [categoria, setCategoria] = useState('');

    const filtradas = useMemo(() => {
        return features.filter((f) => {
            if (busca && !f.nome.toLowerCase().includes(busca.toLowerCase()) &&
                !(f.descricao ?? '').toLowerCase().includes(busca.toLowerCase())) {
                return false;
            }
            if (categoria && f.categoria !== categoria) return false;
            return true;
        });
    }, [features, busca, categoria]);

    const categorias = Array.from(new Set(features.map((f) => f.categoria)));

    return (
        <>
            <Head title="Loja - ONDAKA" />

            <div className="min-h-screen text-white" style={{ background: 'radial-gradient(ellipse at top, rgba(168,85,247,0.12) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(0,212,255,0.08) 0%, transparent 50%), #0A0A1F' }}>
                {/* Top nav */}
                <header className="border-b border-white/5 backdrop-blur-md sticky top-0 z-30 bg-[#0A0A1F]/80">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#00D4FF]" />
                            <span className="text-xl font-bold gradient-ondaka-text">ONDAKA</span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-6 text-sm">
                            <Link href="/" className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent hover:opacity-80">Início</Link>
                            <Link href="/catalogo" className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent hover:opacity-80">Catálogo</Link>
                            <Link href="/loja" className="text-white font-semibold">Loja</Link>
                            <Link href="/login" className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent hover:opacity-80">Entrar</Link>
                        </nav>
                    </div>
                </header>

                {/* Hero */}
                <section className="max-w-7xl mx-auto px-6 py-12">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#00D4FF]" />
                            <span className="text-xs text-white/70">Loja de Add-ons</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-3 gradient-ondaka-text">
                            Estenda a sua plataforma
                        </h1>
                        <p className="text-white/60 max-w-2xl mx-auto">
                            Funcionalidades adicionais para empresas-gestoras e administradores que querem mais.
                            Active apenas o que precisa, quando precisa. Aplica IPC 6.5%.
                        </p>
                    </div>

                    {/* Filtros */}
                    <div className="flex flex-col md:flex-row gap-3 mb-8 max-w-3xl mx-auto">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input type="text" placeholder="Pesquisar funcionalidade..."
                                value={busca} onChange={(e) => setBusca(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                        </div>
                        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                            className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#00D4FF]/50 md:w-52">
                            <option value="">Todas as categorias</option>
                            {categorias.map((c) => <option key={c} value={c}>{categoriaLabels[c] ?? c}</option>)}
                        </select>
                    </div>

                    {/* Grid */}
                    {filtradas.length === 0 ? (
                        <div className="text-center py-16 text-white/40">Nenhuma funcionalidade encontrada.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtradas.map((f) => {
                                const cor = categoriaColors[f.categoria] ?? '#6B7280';
                                return (
                                    <div key={f.id}
                                        className="rounded-xl p-5 bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                style={{ background: `${cor}15`, border: `0.5px solid ${cor}30` }}>
                                                <ShoppingBag className="w-5 h-5" style={{ color: cor }} />
                                            </div>
                                            {f.em_breve && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 inline-flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Em breve
                                                </span>
                                            )}
                                        </div>

                                        <span className="text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded inline-block mb-2"
                                            style={{ background: `${cor}10`, color: cor }}>
                                            {categoriaLabels[f.categoria] ?? f.categoria}
                                        </span>

                                        <h3 className="font-semibold text-white mb-1.5">{f.nome}</h3>
                                        <p className="text-xs text-white/60 leading-relaxed line-clamp-3 mb-4 min-h-[2.5rem]">
                                            {f.descricao ?? '—'}
                                        </p>

                                        <div className="pt-3 border-t border-white/5">
                                            <div className="flex items-end justify-between mb-3">
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-wide text-white/40">{modeloLabels[f.modelo_cobranca] ?? '—'}</div>
                                                    <div className="text-lg font-bold text-white">
                                                        {f.preco_base > 0 ? `${fmt(f.preco_base)} Kz` : 'Sob consulta'}
                                                    </div>
                                                </div>
                                                {f.preco_activacao > 0 && (
                                                    <div className="text-[10px] text-white/50 text-right">
                                                        Activação:<br />
                                                        <strong className="text-white/80">{fmt(f.preco_activacao)} Kz</strong>
                                                    </div>
                                                )}
                                            </div>
                                            <Link href="/registo"
                                                className={`block text-center text-xs py-2 rounded-lg font-medium transition ${
                                                    f.em_breve
                                                        ? 'bg-white/5 text-white/40 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-[#00D4FF] to-[#A855F7] text-white hover:opacity-90'
                                                }`}>
                                                {f.em_breve ? 'Aguarde lançamento' : (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        Activar <ArrowRight className="w-3.5 h-3.5" />
                                                    </span>
                                                )}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <footer className="border-t border-white/5 mt-12 py-6 text-center text-xs text-white/40">
                    © ONDAKA · Soluções Simples, Lda · Luanda, Angola
                </footer>
            </div>
        </>
    );
}
