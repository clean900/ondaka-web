import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function BiUpgrade() {
    const beneficios = [
        'Receitas vs Despesas mensal, trimestral e anual',
        'Demonstração de resultados e cash flow projectado',
        'Aging report de cobrança e top devedores',
        'Fundo de reserva (DP 141/15) e indicadores de liquidez',
        'Relatórios executivos em PDF e exportação Excel',
        'Detecção de anomalias e benchmarking entre condomínios',
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard BI Avançado" />
            <div className="max-w-2xl mx-auto px-4 py-10">
                <div className="rounded-2xl p-8 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-white/10">
                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 font-medium mb-4">
                        ADD-ON PREMIUM
                    </span>
                    <h1 className="text-2xl font-semibold text-white mb-2">Dashboard BI Avançado</h1>
                    <p className="text-white/70 mb-6">
                        Transforme os dados do seu condomínio em decisões. Análises financeiras
                        profissionais, relatórios prontos para auditoria e visão consolidada.
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
                        <span className="text-xl font-bold text-cyan-300">10.000 Kz</span>
                    </div>

                    <p className="text-sm text-white/50">
                        Para activar este add-on, contacte a equipa ONDAKA ou aceda à Loja de funcionalidades.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
