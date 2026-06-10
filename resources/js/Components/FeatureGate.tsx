import { usePage } from '@inertiajs/react';
import { Lock, Sparkles } from 'lucide-react';
import { ReactNode, MouseEvent } from 'react';

/**
 * ONDAKA — FeatureGate
 *
 * Envolve qualquer bloco de UI e bloqueia-o visualmente se a feature
 * (identificada por `slug`) não estiver activa para a empresa_gestora
 * e/ou condomínio actual do utilizador.
 *
 * As features activas são partilhadas eager via Inertia em
 * page.props.features = { [slug]: true, ... }
 * (ver HandleInertiaRequests::dadosFeatures()).
 *
 * Quando bloqueado:
 *   - children continuam renderizados (com opacity 60% e pointer-events:none)
 *   - badge "PREMIUM" no topo-direito
 *   - overlay com cadeado central
 *   - clique em qualquer ponto dispara CustomEvent 'ondaka:premium-modal'
 *     com { slug } no detail. A Mini-Fase 3.3 (modais) vai ouvir este evento.
 *
 * Acessibilidade:
 *   - aria-disabled="true" + role="region" quando bloqueado
 *   - aria-label descritivo
 *
 * Uso:
 *   <FeatureGate slug="sms_pack_extra">
 *     <Button>Enviar SMS</Button>
 *   </FeatureGate>
 *
 *   // Com fallback custom (substitui completamente o overlay padrão):
 *   <FeatureGate slug="chatbot_faq" fallback={<MeuAviso />}>
 *     <ChatbotPanel />
 *   </FeatureGate>
 */

interface PageProps {
    features?: Record<string, boolean>;
    [key: string]: unknown;
}

interface FeatureGateProps {
    /** Slug da feature na BD (ex.: 'sms_pack_extra', 'chatbot_faq') */
    slug: string;
    /** Conteúdo a proteger */
    children: ReactNode;
    /**
     * Fallback opcional. Se fornecido, substitui TODO o overlay padrão
     * (badge + cadeado) quando a feature está bloqueada.
     * Útil para mostrar uma mensagem custom em vez do bloqueio visual.
     */
    fallback?: ReactNode;
    /** Classe extra para o wrapper exterior */
    className?: string;
}

export default function FeatureGate({
    slug,
    children,
    fallback,
    className = '',
}: FeatureGateProps) {
    const { props } = usePage<PageProps>();
    const features = props.features ?? {};
    const isActive = features[slug] === true;

    // Caminho rápido: feature activa → renderiza children sem overhead
    if (isActive) {
        return <>{children}</>;
    }

    // Fallback custom fornecido → usa-o em vez do overlay padrão
    if (fallback !== undefined) {
        return <>{fallback}</>;
    }

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        // Mini-Fase 3.3 vai ouvir este evento e abrir o modal apropriado
        // (AddonPremiumModalEmpresa ou AddonPremiumModalCondomino conforme o role).
        window.dispatchEvent(
            new CustomEvent('ondaka:premium-modal', {
                detail: { slug },
            }),
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.dispatchEvent(
                new CustomEvent('ondaka:premium-modal', {
                    detail: { slug },
                }),
            );
        }
    };

    return (
        <div
            role="region"
            aria-disabled="true"
            aria-label={`Funcionalidade premium bloqueada: ${slug}. Clique para saber mais.`}
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={`relative cursor-pointer select-none group ${className}`}
        >
            {/* Conteúdo original — visível mas desactivado */}
            <div
                className="opacity-60 pointer-events-none transition-opacity group-hover:opacity-50"
                aria-hidden="true"
            >
                {children}
            </div>

            {/* Badge PREMIUM — topo-direito */}
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white text-xs font-semibold shadow-lg">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                <span>PREMIUM</span>
            </div>

            {/* Overlay com cadeado central */}
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/30 dark:bg-black/30 backdrop-blur-[1px] rounded-lg transition-all group-hover:bg-white/40 dark:group-hover:bg-black/40">
                <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 shadow-xl border border-zinc-200 dark:border-zinc-700">
                    <Lock className="w-6 h-6 text-zinc-700 dark:text-zinc-300" aria-hidden="true" />
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Clique para activar
                    </span>
                </div>
            </div>
        </div>
    );
}
