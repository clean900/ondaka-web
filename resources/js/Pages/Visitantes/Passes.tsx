import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { IdCard, Check, X, FileText, Palette } from 'lucide-react';
import { useState } from 'react';

interface Passe {
    id: number;
    tipo_acesso: string;
    nome_visitante: string;
    tipo_documento: string | null;
    numero_documento: string | null;
    documento_anexo: string | null;
    condomino: string | null;
    valida_desde: string | null;
    valida_ate: string | null;
    estado: string;
}
interface Condominio { id: number; nome: string; modelo_passe: number }
interface Props { passes: Passe[]; condominios: Condominio[] }

const ESTADO: Record<string, { label: string; cls: string }> = {
    pendente: { label: 'Pendente', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    aprovado: { label: 'Aprovado', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    recusado: { label: 'Recusado', cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
    expirada: { label: 'Expirado', cls: 'bg-zinc-700/40 text-zinc-400 border-zinc-700' },
};
const TIPO: Record<string, string> = { prestador: 'Prestador', trabalhador: 'Trabalhador', outro: 'Outro' };

const TEMAS: Record<number, { card: string; cardT: string; head: string; headT: string; accent: string }> = {
    1: { card: '#0a0a1a', cardT: '#fff', head: '#7c3aed', headT: '#fff', accent: '#c4b5fd' },
    2: { card: '#fff', cardT: '#0f172a', head: '#1e3a8a', headT: '#fff', accent: '#1e3a8a' },
    3: { card: '#111', cardT: '#f5e6c8', head: '#1a1a1a', headT: '#d4af37', accent: '#d4af37' },
    4: { card: '#fff', cardT: '#14532d', head: '#166534', headT: '#fff', accent: '#166534' },
    5: { card: '#9333ea', cardT: '#fff', head: '#db2777', headT: '#fff', accent: '#fff' },
    6: { card: '#0ea5e9', cardT: '#fff', head: '#1e40af', headT: '#fff', accent: '#e0f2fe' },
    7: { card: '#1a0c0c', cardT: '#fff', head: '#b91c1c', headT: '#fff', accent: '#fca5a5' },
    8: { card: '#fafafa', cardT: '#18181b', head: '#18181b', headT: '#fff', accent: '#18181b' },
    9: { card: '#ea580c', cardT: '#fff', head: '#db2777', headT: '#fff', accent: '#fff' },
    10: { card: '#0a0f0d', cardT: '#d1fae5', head: '#06120e', headT: '#34d399', accent: '#6ee7b7' },
    11: { card: '#fff', cardT: '#0f3d3a', head: '#0d9488', headT: '#fff', accent: '#0f766e' },
    12: { card: '#0f172a', cardT: '#e2e8f0', head: '#1e293b', headT: '#fbbf24', accent: '#fcd34d' },
};

function MiniPasse({ modelo, nome }: { modelo: number; nome: string }) {
    const t = TEMAS[modelo] ?? TEMAS[1];
    return (
        <div style={{ width: 128, borderRadius: 12, overflow: 'hidden', background: t.card, color: t.cardT, flexShrink: 0 }}>
            <div style={{ background: t.head, color: t.headT, padding: '7px 9px', fontSize: 9, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nome.toUpperCase()}</div>
            <div style={{ padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(125,125,125,.25)', margin: '0 auto 6px' }} />
                <div style={{ fontSize: 11, fontWeight: 700 }}>João Silva</div>
                <div style={{ fontSize: 8, opacity: .7 }}>PRESTADOR</div>
                <div style={{ marginTop: 6, padding: '3px', border: `1px solid ${t.accent}`, borderRadius: 5, fontSize: 8, color: t.accent }}>Válido até 21/09</div>
                <div style={{ width: 30, height: 30, background: '#fff', margin: '6px auto 0', borderRadius: 4 }} />
            </div>
        </div>
    );
}

export default function Passes({ passes, condominios }: Props) {
    const aprovar = (id: number) => router.post(route('visitantes.passes.aprovar', id), {}, { preserveScroll: true });
    const recusar = (id: number) => {
        const motivo = prompt('Motivo da recusa (opcional):') ?? '';
        router.post(route('visitantes.passes.recusar', id), { motivo }, { preserveScroll: true });
    };
    const [modelos, setModelos] = useState<Record<number, number>>(
        Object.fromEntries(condominios.map((c) => [c.id, c.modelo_passe])),
    );
    const setModelo = (condId: number, modelo: number) => {
        setModelos((m) => ({ ...m, [condId]: modelo }));
        router.patch(route('visitantes.passes.modelo', condId), { modelo_passe: modelo }, { preserveScroll: true, preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Passes de Visitante" />
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                        <IdCard className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-100">Passes de Visitante</h1>
                        <p className="text-sm text-zinc-500">Aprove os passes de prestadores e trabalhadores e escolha o modelo de cada condomínio.</p>
                    </div>
                </div>

                {/* Modelo por condomínio */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-4 flex items-center gap-2">
                        <Palette className="h-4 w-4" /> Modelo do passe por condomínio
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {condominios.map((c) => (
                            <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950/40 border border-zinc-800">
                                <MiniPasse modelo={modelos[c.id] ?? c.modelo_passe} nome={c.nome} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-zinc-200 mb-2 truncate">{c.nome}</p>
                                    <select value={modelos[c.id] ?? c.modelo_passe} onChange={(e) => setModelo(c.id, Number(e.target.value))}
                                        className="w-full rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 px-3 py-1.5">
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                            <option key={m} value={m}>Modelo {m}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-zinc-500 mt-1">Pré-visualização ao lado</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Passes */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-800">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Passes ({passes.length})</h2>
                    </div>
                    {passes.length === 0 ? (
                        <div className="p-10 text-center text-zinc-500">Sem passes. Os condóminos solicitam pela app.</div>
                    ) : (
                        <div className="divide-y divide-zinc-800/70">
                            {passes.map((p) => {
                                const e = ESTADO[p.estado] ?? { label: p.estado, cls: 'bg-zinc-700/40 text-zinc-400 border-zinc-700' };
                                return (
                                    <div key={p.id} className="px-6 py-4 flex items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-zinc-100 font-medium">{p.nome_visitante}</span>
                                                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{TIPO[p.tipo_acesso] ?? p.tipo_acesso}</span>
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-0.5">
                                                {p.condomino} · {p.tipo_documento?.toUpperCase()} {p.numero_documento} · {p.valida_desde} → {p.valida_ate}
                                            </p>
                                        </div>
                                        {p.documento_anexo && (
                                            <a href={p.documento_anexo} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-cyan-400" title="Ver documento">
                                                <FileText className="h-4 w-4" />
                                            </a>
                                        )}
                                        <span className={`text-xs px-2 py-1 rounded border ${e.cls}`}>{e.label}</span>
                                        {p.estado === 'pendente' && (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => aprovar(p.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white">
                                                    <Check className="h-3.5 w-3.5" /> Aprovar
                                                </button>
                                                <button onClick={() => recusar(p.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/80 text-zinc-300 hover:text-white">
                                                    <X className="h-3.5 w-3.5" /> Recusar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
