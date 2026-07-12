import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Archive, CircleX, Mail, Phone } from 'lucide-react';

function formatData(iso: string | null): string {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(iso));
}

interface Subscricao {
    estado: 'suspensa' | 'arquivada' | 'cancelada' | string;
    periodo_actual_fim: string | null;
}

interface Props {
    subscricao: Subscricao | null;
}

export default function SubscricaoExpirada({ subscricao }: Props) {
    const estado = subscricao?.estado ?? '';
    const Icon = estado === 'arquivada' ? Archive : CircleX;

    const titulos: Record<string, string> = {
        suspensa: 'Subscrição suspensa',
        arquivada: 'Conta arquivada',
        cancelada: 'Subscrição terminada',
    };
    const titulo = titulos[estado] ?? 'Subscrição inactiva';

    const mensagens: Record<string, string> = {
        suspensa:
            'A sua conta foi suspensa por falta de pagamento. Os dados permanecem seguros por 90 dias.',
        arquivada: 'A sua conta foi arquivada. Para reactivar, contacte o nosso suporte.',
        cancelada: `A sua subscrição foi cancelada e o período pago expirou em ${formatData(
            subscricao?.periodo_actual_fim ?? null,
        )}.`,
    };
    const mensagem = mensagens[estado] ?? 'A sua subscrição não está activa.';

    return (
        <AuthenticatedLayout>
            <Head title="Subscrição expirada" />

            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="max-w-lg w-full text-center">
                    <div className="mb-6 text-lg font-extrabold tracking-[0.15em] gradient-ondaka-text">ONDAKA</div>
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-red-400" />
                    </div>

                    <h1 className="text-2xl font-semibold text-white mb-3">{titulo}</h1>
                    <p className="text-white/70 mb-8 leading-relaxed">{mensagem}</p>

                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-left mb-6">
                        <h3 className="text-sm font-medium text-white/80 mb-3">Como reactivar</h3>
                        <p className="text-sm text-white/60 mb-4 leading-relaxed">
                            A nossa equipa pode ajudar a regularizar a situação e restaurar o acesso. Os seus
                            condomínios, condóminos e histórico permanecem intactos.
                        </p>

                        <div className="space-y-2">
                            <a
                                href="mailto:suporte@ondaka.ao"
                                className="flex items-center gap-2 text-sm text-[#00D4FF] hover:text-[#8FE7FF] transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                suporte@ondaka.ao
                            </a>
                            <a
                                href="tel:+244922772177"
                                className="flex items-center gap-2 text-sm text-[#00D4FF] hover:text-[#8FE7FF] transition-colors"
                            >
                                <Phone className="w-4 h-4" />
                                +244 922 772 177
                            </a>
                        </div>
                    </div>

                    <Link
                        href="/subscricao"
                        className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                        Ver detalhes da subscrição
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
