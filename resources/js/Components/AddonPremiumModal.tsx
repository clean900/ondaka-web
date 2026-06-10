import { Link, router } from '@inertiajs/react';
import { Lock, Sparkles, X, ArrowRight, Gift, Loader2, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * ONDAKA — AddonPremiumModal
 *
 * Modal premium único para todos os 5 perfis web (super-admin, admin-empresa,
 * gestor, funcionario, administrador-condominio). Todos podem activar add-ons
 * directamente — não há ramificações por role.
 *
 * Como abre:
 *   - Ouve o CustomEvent 'ondaka:premium-modal' disparado pelo <FeatureGate>
 *   - O detail do evento contém { slug: string }
 *
 * Como fecha:
 *   - Click no botão Fechar
 *   - Click no backdrop (fora do modal)
 *   - Tecla Esc
 *   - Click no CTA primário (que também navega para /funcionalidades/{slug})
 *
 * CTAs (3):
 *   1. "Experimentar 7 dias grátis" (cyan, principal) — POST /funcionalidades/{slug}/trial
 *      • Só aparece se a feature ainda não tiver trial usado pelo cliente
 *   2. "Saber mais e Activar" (gradient, secundário) — navega para detalhe
 *   3. "Fechar" (texto, terciário)
 *
 * Dados do add-on:
 *   - Lê opcionalmente window.__ondakaFeaturesCatalog
 *   - Fallback: slug formatado bonito
 *
 * Montar este componente UMA VEZ no AuthenticatedLayout — não em cada página.
 */

interface FeatureCatalogEntry {
    nome?: string;
    descricao?: string;
    preco_kz?: number | string;
    categoria?: string;
    trial_usado?: boolean;
}

declare global {
    interface Window {
        __ondakaFeaturesCatalog?: Record<string, FeatureCatalogEntry>;
    }
}

interface PremiumModalEvent extends CustomEvent {
    detail: { slug: string };
}

function formatarSlug(slug: string): string {
    return slug
        .split('_')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
}

function formatarPreco(preco?: number | string): string | null {
    if (preco === undefined || preco === null || preco === '') return null;
    const n = typeof preco === 'string' ? parseFloat(preco) : preco;
    if (isNaN(n) || n <= 0) return null;
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'AOA',
        maximumFractionDigits: 0,
    })
        .format(n)
        .replace('AOA', 'Kz');
}

export default function AddonPremiumModal() {
    const [slug, setSlug] = useState<string | null>(null);
    const [iniciandoTrial, setIniciandoTrial] = useState(false);
    const [solicitandoActivacao, setSolicitandoActivacao] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            const ev = e as PremiumModalEvent;
            if (ev.detail?.slug) {
                setSlug(ev.detail.slug);
            }
        };

        window.addEventListener('ondaka:premium-modal', handler);
        return () => {
            window.removeEventListener('ondaka:premium-modal', handler);
        };
    }, []);

    useEffect(() => {
        if (!slug) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !iniciandoTrial) setSlug(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [slug, iniciandoTrial]);

    useEffect(() => {
        if (!slug) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [slug]);

    if (!slug) return null;

    const catalog = window.__ondakaFeaturesCatalog ?? {};
    const entry = catalog[slug];

    const nome = entry?.nome ?? formatarSlug(slug);
    const descricao =
        entry?.descricao ??
        'Esta é uma funcionalidade premium da Loja ONDAKA. Active-a para desbloquear capacidades adicionais para o seu condomínio.';
    const precoFormatado = formatarPreco(entry?.preco_kz);
    const trialDisponivel = entry?.trial_usado !== true;

    const fechar = () => {
        if (iniciandoTrial) return;
        setSlug(null);
    };

    const iniciarTrial = () => {
        if (iniciandoTrial) return;
        setIniciandoTrial(true);
        router.post(
            `/funcionalidades/${slug}/trial`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setIniciandoTrial(false);
                    setSlug(null);
                },
            },
        );
    };

    const solicitarActivacao = () => {
        if (solicitandoActivacao) return;
        setSolicitandoActivacao(true);
        router.post(
            `/funcionalidades/${slug}/activar`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setSolicitandoActivacao(false);
                    setSlug(null);
                },
            },
        );
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="addon-premium-modal-title"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={fechar}
        >
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                aria-hidden="true"
            />

            <div
                className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative px-6 py-5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500">
                    <button
                        onClick={fechar}
                        disabled={iniciandoTrial}
                        aria-label="Fechar"
                        className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-white" aria-hidden="true" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                            <Lock className="w-5 h-5 text-white" aria-hidden="true" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <Sparkles className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                                <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                                    Funcionalidade Premium
                                </span>
                            </div>
                            <h2
                                id="addon-premium-modal-title"
                                className="text-lg font-bold text-white"
                            >
                                {nome}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5">
                    <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                        {descricao}
                    </p>

                    {precoFormatado && (
                        <div className="flex items-baseline gap-1.5 mb-4 px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700">
                            <span className="text-xs text-zinc-400 uppercase tracking-wide">
                                A partir de
                            </span>
                            <span className="text-xl font-bold text-white">
                                {precoFormatado}
                            </span>
                            <span className="text-xs text-zinc-400">/mês</span>
                        </div>
                    )}

                    {trialDisponivel && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                            <div className="flex items-center gap-2 mb-1">
                                <Gift className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                                <span className="text-sm font-semibold text-cyan-300">
                                    Experimente 7 dias grátis
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400">
                                Sem compromisso. Cancele quando quiser durante o trial.
                            </p>
                        </div>
                    )}

                    {entry?.categoria && (
                        <div className="mb-4">
                            <span className="inline-block px-2.5 py-1 rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-700">
                                {entry.categoria}
                            </span>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-zinc-950/50 border-t border-zinc-800 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
                    <button
                        onClick={fechar}
                        disabled={iniciandoTrial}
                        className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        Fechar
                    </button>

                    <Link
                        href={`/funcionalidades/${slug}`}
                        onClick={() => setSlug(null)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-zinc-300 rounded-lg border border-zinc-600 hover:border-zinc-400 hover:text-white transition-colors"
                    >
                        Saber mais
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>


                    <button
                        type="button"
                        onClick={solicitarActivacao}
                        disabled={solicitandoActivacao}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 transition-all disabled:opacity-50 disabled:cursor-wait"
                    >
                        {solicitandoActivacao ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                A enviar pedido...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-4 h-4" aria-hidden="true" />
                                Activar subscrição
                            </>
                        )}
                    </button>
                    {trialDisponivel && (
                        <button
                            onClick={iniciarTrial}
                            disabled={iniciandoTrial}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-wait"
                        >
                            {iniciandoTrial ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                    A activar...
                                </>
                            ) : (
                                <>
                                    <Gift className="w-4 h-4" aria-hidden="true" />
                                    Experimentar 7 dias
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
