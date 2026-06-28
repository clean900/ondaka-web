import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, Clock, User, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';

interface Pessoa { id: number; name: string }
interface Ocorrencia {
    id: number;
    tipo: 'observacao' | 'incidente' | 'alerta';
    descricao: string;
    foto_path: string | null;
    created_at: string;
    resolvida_em: string | null;
    guarda: Pessoa | null;
    resolvida_por: Pessoa | null;
}
interface Passagem {
    id: number;
    resumo: string;
    total_dentro: number;
    ocorrencias_abertas: number;
    created_at: string;
    guarda: Pessoa | null;
}
interface PageProps {
    ocorrencias: Ocorrencia[];
    passagens: Passagem[];
}

const TIPO: Record<string, { label: string; cls: string }> = {
    observacao: { label: 'Observação', cls: 'text-cyan-400 bg-cyan-500/10' },
    incidente: { label: 'Incidente', cls: 'text-amber-400 bg-amber-500/10' },
    alerta: { label: 'Alerta', cls: 'text-red-400 bg-red-500/10' },
};

function dt(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function LivroOcorrencias({ ocorrencias, passagens }: PageProps) {
    const resolver = (id: number) => router.post(`/visitantes/ocorrencias/${id}/resolver`, {}, { preserveScroll: true });

    return (
        <AuthenticatedLayout>
            <Head title="Livro de ocorrências — ONDAKA" />
            <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                        <ClipboardList className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">Livro de ocorrências</h1>
                        <p className="text-sm text-zinc-500">Registos da portaria e passagens de turno</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <h2 className="text-sm font-medium text-zinc-400 mb-3">Ocorrências</h2>
                        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
                            {ocorrencias.length === 0 ? (
                                <p className="p-8 text-center text-zinc-500 text-sm">Sem ocorrências registadas.</p>
                            ) : (
                                ocorrencias.map((o) => {
                                    const t = TIPO[o.tipo] ?? TIPO.observacao;
                                    return (
                                        <div key={o.id} className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${t.cls}`}>{t.label}</span>
                                                <span className="text-xs text-zinc-600 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {dt(o.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-zinc-200 text-sm mt-2">{o.descricao}</p>
                                            {o.foto_path && (
                                                <img src={`https://ondaka.ao/ficheiros/${o.foto_path}`} alt="" className="mt-2 rounded-lg max-h-44 object-cover" />
                                            )}
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <User className="h-3 w-3" /> {o.guarda?.name ?? '—'}
                                                </span>
                                                {o.resolvida_em ? (
                                                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Resolvida
                                                    </span>
                                                ) : (
                                                    <button onClick={() => resolver(o.id)} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                                                        Marcar resolvida
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-1.5">
                            <ArrowRightLeft className="h-4 w-4" /> Passagens de turno
                        </h2>
                        <div className="space-y-3">
                            {passagens.length === 0 ? (
                                <p className="text-zinc-500 text-sm">Sem passagens registadas.</p>
                            ) : (
                                passagens.map((p) => (
                                    <div key={p.id} className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-zinc-200">{p.guarda?.name ?? 'Guarda'}</span>
                                            <span className="text-xs text-zinc-600">{dt(p.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 mt-1">{p.resumo}</p>
                                        <p className="text-xs text-cyan-400 mt-2 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> {p.total_dentro} dentro · {p.ocorrencias_abertas} ocorrências abertas
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link href="/visitantes/dentro-agora" className="mt-4 inline-block text-sm text-zinc-400 hover:text-cyan-400">← Voltar a Dentro agora</Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
