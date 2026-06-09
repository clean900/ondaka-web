import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes Tailwind de forma inteligente, evitando conflitos.
 * Exemplo: cn('p-2', condition && 'p-4') → 'p-4' se condition for true
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formatação de moeda angolana (Kwanza)
 */
export function formatKz(valor: number | string): string {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(num)) return 'Kz 0';

    return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num).replace('AOA', 'Kz');
}

/**
 * Formatação de números grandes (1000 → 1.2K, 1000000 → 1.2M)
 */
export function formatCompact(valor: number): string {
    if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(1)}M`;
    if (valor >= 1_000) return `${(valor / 1_000).toFixed(1)}K`;
    return valor.toString();
}

/**
 * Formatar data em Português
 */
export function formatDate(data: string | Date | null | undefined): string {
    if (!data) return '—';
    try {
        const d = typeof data === 'string' ? new Date(data) : data;
        if (isNaN(d.getTime())) return '—';
        return new Intl.DateTimeFormat('pt-PT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(d);
    } catch {
        return '—';
    }
}

/**
 * Formatar data+hora em Português
 */
export function formatDateTime(data: string | Date): string {
    const d = typeof data === 'string' ? new Date(data) : data;
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

/**
 * Tempo relativo (ex: "Há 3 minutos")
 */
export function formatRelativo(data: string | Date): string {
    const d = typeof data === 'string' ? new Date(data) : data;
    const agora = new Date();
    const diffMs = agora.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Agora mesmo';
    if (diffMin < 60) return `Há ${diffMin} min`;
    if (diffHoras < 24) return `Há ${diffHoras}h`;
    if (diffDias < 7) return `Há ${diffDias} dias`;
    return formatDate(d);
}

/**
 * Gerar iniciais de um nome (ex: "Bráulio Gonçalves" → "BG")
 */
export function iniciais(nome: string): string {
    if (!nome) return '?';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/**
 * Gerar cor do gradient baseada numa string (determinística)
 * Útil para avatars de utilizadores
 */
export function gradientDeNome(nome: string): string {
    const gradientes = [
        'linear-gradient(135deg, #00D4FF, #A855F7)',
        'linear-gradient(135deg, #A855F7, #EC4899)',
        'linear-gradient(135deg, #EC4899, #00D4FF)',
        'linear-gradient(135deg, #00D4FF, #10B981)',
        'linear-gradient(135deg, #A855F7, #F59E0B)',
        'linear-gradient(135deg, #EC4899, #F59E0B)',
    ];

    const hash = nome.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradientes[hash % gradientes.length];
}
