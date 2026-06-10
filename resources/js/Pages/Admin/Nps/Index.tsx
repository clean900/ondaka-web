import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

interface Score {
    score: number | null;
    total: number;
    promotores: number;
    passivos: number;
    detractores: number;
    pct_promotores: number;
    pct_passivos: number;
    pct_detractores: number;
}

interface Resposta {
    id: number;
    tipo_avaliador: string;
    alvo: string;
    nota: number;
    categoria: string;
    comentario: string | null;
    seguimento: string | null;
    autor: string | null;
    created_at: string | null;
}

interface Props {
    scores: {
        plataforma: Score;
        condominios: Score;
        plataforma_condominos: Score;
        plataforma_gestoras: Score;
    };
    recentes: Resposta[];
}

function corScore(s: number | null): string {
    if (s == null) return 'text-white/40';
    if (s < 0) return 'text-red-400';
    if (s < 30) return 'text-amber-400';
    if (s < 50) return 'text-emerald-300';
    return 'text-emerald-400';
}

function CartaoScore({ titulo, score }: { titulo: string; score: Score }) {
    return (
        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
            <p className="text-sm text-white/60 mb-2">{titulo}</p>
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold ${corScore(score.score)}`}>
                    {score.score ?? '—'}
                </span>
                <span className="text-xs text-white/40">NPS</span>
            </div>
            <p className="text-xs text-white/40 mt-1">{score.total} resposta(s)</p>
            {score.total > 0 && (
                <div className="mt-3 flex h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500" style={{ width: `${score.pct_promotores}%` }} title={`Promotores ${score.pct_promotores}%`} />
                    <div className="bg-amber-500" style={{ width: `${score.pct_passivos}%` }} title={`Passivos ${score.pct_passivos}%`} />
                    <div className="bg-red-500" style={{ width: `${score.pct_detractores}%` }} title={`Detractores ${score.pct_detractores}%`} />
                </div>
            )}
            {score.total > 0 && (
                <div className="mt-2 flex justify-between text-xs text-white/40">
                    <span>{score.promotores} prom.</span>
                    <span>{score.passivos} pass.</span>
                    <span>{score.detractores} detr.</span>
                </div>
            )}
        </div>
    );
}

export default function AdminNpsIndex({ scores, recentes }: Props) {
    const catCor = (c: string) =>
        c === 'promotor' ? 'bg-emerald-500/15 text-emerald-300'
            : c === 'passivo' ? 'bg-amber-500/15 text-amber-300'
            : 'bg-red-500/15 text-red-300';

    const alvoLabel = (a: string) => (a === 'plataforma' ? 'Plataforma ONDAKA' : 'Condomínio');
    const tipoLabel = (t: string) => (t === 'gestora' ? 'Gestora' : 'Condómino');

    return (
        <AuthenticatedLayout>
            <Head title="NPS — Satisfação" />
            <div className="max-w-5xl mx-auto px-4 py-6">
                <h1 className="text-xl font-medium text-white mb-1">NPS — Satisfação</h1>
                <p className="text-sm text-white/60 mb-6">
                    Net Promoter Score. Varia de −100 a +100; acima de 0 é bom, acima de 50 é excelente.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <CartaoScore titulo="Plataforma ONDAKA (global)" score={scores.plataforma} />
                    <CartaoScore titulo="Gestão dos condomínios" score={scores.condominios} />
                    <CartaoScore titulo="Plataforma — por condóminos" score={scores.plataforma_condominos} />
                    <CartaoScore titulo="Plataforma — por gestoras" score={scores.plataforma_gestoras} />
                </div>

                <h2 className="text-base font-medium text-white mt-8 mb-3">Respostas recentes</h2>
                {recentes.length === 0 ? (
                    <div className="p-8 rounded-xl bg-white/[0.03] border border-white/10 text-center text-white/50">
                        Ainda sem respostas.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentes.map((r) => (
                            <div key={r.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${catCor(r.categoria)}`}>
                                        {r.nota}/10
                                    </span>
                                    <span className="text-sm text-white/80">{alvoLabel(r.alvo)}</span>
                                    <span className="text-xs text-white/40">· {tipoLabel(r.tipo_avaliador)}</span>
                                    <span className="text-xs text-white/40 ml-auto">{r.created_at}</span>
                                </div>
                                {r.comentario && (
                                    <p className="text-sm text-white/80 mt-2">{r.comentario}</p>
                                )}
                                {r.seguimento && (
                                    <p className="text-sm text-white/60 mt-1">
                                        <span className="text-white/40">Sugestão:</span> {r.seguimento}
                                    </p>
                                )}
                                {r.autor && (
                                    <p className="text-xs text-white/40 mt-2">— {r.autor}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
