import { usePage, Link } from '@inertiajs/react';
import { Clock, AlertCircle, AlertTriangle } from 'lucide-react';

interface Subscricao {
    estado: string;
    ciclo: string;
    num_imoveis: number;
    em_trial: boolean;
    activa: boolean;
    tem_acesso: boolean;
    dias_restantes_trial: number | null;
    trial_expira_em: string | null;
    periodo_actual_fim: string | null;
}

export default function SubscricaoBanner() {
    const { props } = usePage<any>();
    const subscricao = props.subscricao as Subscricao | null;

    if (!subscricao) return null;

    if (subscricao.estado === 'limitado' || subscricao.estado === 'cancelada') {
        return (
            <div className="border-y border-red-500/30 bg-red-500/10 px-6 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                        <p className="text-sm text-red-200">
                            <strong>A sua subscrição não está activa.</strong>{' '}
                            Regularize o pagamento para restabelecer o acesso completo.
                        </p>
                    </div>
                    <Link
                        href="/subscricao"
                        className="flex-shrink-0 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-400"
                    >
                        Subscrever agora
                    </Link>
                </div>
            </div>
        );
    }

    if (subscricao.em_trial && typeof subscricao.dias_restantes_trial === 'number') {
        const dias = subscricao.dias_restantes_trial;
        if (dias > 7) return null;

        const urgente = dias <= 3;
        const cor = urgente
            ? { border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-200', icon: 'text-orange-400', btn: 'bg-orange-500 hover:bg-orange-400' }
            : { border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', text: 'text-yellow-200', icon: 'text-yellow-400', btn: 'bg-yellow-500 hover:bg-yellow-400' };

        const Icon = urgente ? AlertTriangle : Clock;
        const mensagem =
            dias === 0
                ? 'O seu trial expira hoje!'
                : dias === 1
                    ? 'O seu trial expira amanhã!'
                    : `O seu trial expira em ${dias} dias.`;

        return (
            <div className={`border-y ${cor.border} ${cor.bg} px-6 py-3`}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 flex-shrink-0 ${cor.icon}`} />
                        <p className={`text-sm ${cor.text}`}>
                            <strong>{mensagem}</strong>{' '}
                            Subscreva agora para continuar a usar a plataforma sem interrupção.
                        </p>
                    </div>
                    <Link
                        href="/subscricao"
                        className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-white ${cor.btn}`}
                    >
                        Ver opções
                    </Link>
                </div>
            </div>
        );
    }

    return null;
}
