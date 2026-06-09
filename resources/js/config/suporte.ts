/**
 * Configurações centrais do suporte ONDAKA.
 * Para alterar, edita aqui — usado em vários sítios da app.
 */

export const SUPORTE = {
    whatsapp: {
        numero: '+244 929 167 474',
        // formato para wa.me (sem '+', sem espaços)
        url: 'https://wa.me/244929167474',
        mensagemPreFeita: 'Olá ONDAKA! Preciso de ajuda com a plataforma.',
    },
    email: 'suporte@ondaka.ao',
    horario: 'Seg-Sex 8h-18h (Luanda)',
};

/**
 * Helper que abre o WhatsApp com mensagem pré-preenchida.
 */
export function abrirWhatsAppSuporte(mensagemPersonalizada?: string) {
    const msg = encodeURIComponent(mensagemPersonalizada ?? SUPORTE.whatsapp.mensagemPreFeita);
    const url = `${SUPORTE.whatsapp.url}?text=${msg}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}
