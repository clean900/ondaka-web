import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface Config {
    activo: boolean;
    periodicidade_dias: number;
    pergunta: string;
    seguimento: string | null;
}

interface Props {
    alvo: string;
    config: Config;
}

export default function AdminNpsConfiguracao({ config }: Props) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        activo: config.activo,
        periodicidade_dias: config.periodicidade_dias,
        pergunta: config.pergunta,
        seguimento: config.seguimento ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/nps/configuracao', { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Configurar NPS — Plataforma" />
            <div className="max-w-2xl mx-auto px-4 py-6">
                <h1 className="text-xl font-medium text-white mb-1">Configurar NPS da Plataforma</h1>
                <p className="text-sm text-white/60 mb-6">
                    Define como e com que frequência os utilizadores avaliam a plataforma ONDAKA.
                </p>

                <div className="space-y-5">
                    <label className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <div>
                            <p className="text-sm text-white font-medium">Inquérito activo</p>
                            <p className="text-xs text-white/50">Se desligado, não se pede avaliação.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={data.activo}
                            onChange={(e) => setData('activo', e.target.checked)}
                            className="w-5 h-5 accent-cyan-400"
                        />
                    </label>

                    <div>
                        <label className="block text-sm text-white/70 mb-1">Periodicidade (dias)</label>
                        <input
                            type="number"
                            min={1}
                            max={3650}
                            value={data.periodicidade_dias}
                            onChange={(e) => setData('periodicidade_dias', parseInt(e.target.value || '0', 10))}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                        />
                        <p className="text-xs text-white/40 mt-1">De quantos em quantos dias se volta a pedir.</p>
                    </div>

                    <div>
                        <label className="block text-sm text-white/70 mb-1">Pergunta principal</label>
                        <textarea
                            value={data.pergunta}
                            onChange={(e) => setData('pergunta', e.target.value)}
                            rows={2}
                            maxLength={255}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-white/70 mb-1">Pergunta de seguimento (opcional)</label>
                        <textarea
                            value={data.seguimento}
                            onChange={(e) => setData('seguimento', e.target.value)}
                            rows={2}
                            maxLength={255}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={submit}
                            disabled={processing}
                            className="px-5 py-2.5 rounded-lg bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-50 text-sm font-medium"
                        >
                            {processing ? 'A guardar...' : 'Guardar configuração'}
                        </button>
                        {recentlySuccessful && (
                            <span className="text-sm text-emerald-300">Guardado!</span>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
