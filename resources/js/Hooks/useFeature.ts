import { usePage } from '@inertiajs/react';

/**
 * ONDAKA — useFeature hook
 *
 * Retorna `true` se a feature (slug) está activa para a empresa_gestora
 * e/ou condomínio actual do utilizador.
 *
 * Útil quando um componente só precisa saber se tem ou não acesso
 * (sem precisar do wrap visual do <FeatureGate />).
 *
 * Exemplos:
 *
 *   const temSMS = useFeature('sms_pack_extra');
 *   if (temSMS) { ... }
 *
 *   // Condicionar lógica:
 *   const podeEnviarBranding = useFeature('passe_visitante_branding');
 *   const payload = podeEnviarBranding ? { ...comLogo } : { ...semLogo };
 *
 *   // Em renders condicionais simples:
 *   {useFeature('chatbot_faq') && <ChatbotIcon />}
 */

interface PageProps {
    features?: Record<string, boolean>;
    [key: string]: unknown;
}

export function useFeature(slug: string): boolean {
    const { props } = usePage<PageProps>();
    const features = props.features ?? {};
    return features[slug] === true;
}

/**
 * Variante que retorna várias features de uma vez.
 *
 * Exemplo:
 *   const { sms_pack_extra, chatbot_faq } = useFeatures([
 *     'sms_pack_extra',
 *     'chatbot_faq',
 *   ]);
 */
export function useFeatures<T extends string>(
    slugs: readonly T[],
): Record<T, boolean> {
    const { props } = usePage<PageProps>();
    const features = props.features ?? {};
    return slugs.reduce(
        (acc, slug) => {
            acc[slug] = features[slug] === true;
            return acc;
        },
        {} as Record<T, boolean>,
    );
}
