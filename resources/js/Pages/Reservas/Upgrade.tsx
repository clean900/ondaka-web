import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function ReservasUpgrade() {
    const beneficios = [
        'Espaços comuns reserváveis (salão, churrasqueira, ginásio...)',
        'Calendário e verificação automática de conflitos',
        'Regras configuráveis (horário, antecedência, duração)',
        'Aprovação pelo gestor antes da confirmação',
        'Caução opcional com comprovativo de pagamento',
        'Os condóminos reservam diretamente no telemóvel',
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Reservas de Áreas Comuns" />
            <div className="max-w-2xl mx-auto px-4 py-10">
                <div className="rounded-2xl p-8 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-white/10">
                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 font-medium mb-4">
                        ADD-ON PREMIUM
                    </span>
                    <h1 className="text-2xl font-semibold text-white mb-2">Reservas de Áreas Comuns</h1>
                    <p className="text-white/70 mb-6">
                        Permita que os condóminos reservem áreas comuns directamente na app, com regras claras e aprovação centralizada.
                    </p>
                    <ul className="space-y-2 mb-8">
                        {beneficios.map((b, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                                <span className="text-cyan-400 mt-0.5">✓</span>
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 mb-6">
                        <span className="text-sm text-white/60">Subscrição mensal</span>
                        <span className="text-xl font-bold text-cyan-300">5.000 Kz</span>
                    </div>
                    <p className="text-sm text-white/50">
                        Para activar este add-on, contacte a equipa ONDAKA ou aceda à Loja de funcionalidades.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
