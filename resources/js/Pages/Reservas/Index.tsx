import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface Espaco {
    id: number; nome: string; condominio_id: number | null;
    tem_caucao: boolean; valor_caucao: string; activo: boolean; reservas_count: number;
}
interface Reserva {
    id: number; espaco_id: number; user_id: number; user_nome: string;
    data: string; hora_inicio: string; hora_fim: string;
    estado: string; motivo: string | null; caucao_paga: boolean;
    comprovativo_caucao: string | null;
    espaco: { id: number; nome: string; tem_caucao: boolean; valor_caucao: string };
}

const ESTADO_COR: Record<string, string> = {
    pendente: 'text-amber-300',
    aprovada: 'text-cyan-300',
    aguarda_caucao: 'text-amber-300',
    confirmada: 'text-emerald-300',
    recusada: 'text-white/40',
    cancelada: 'text-white/40',
};
const ESTADO_LABEL: Record<string, string> = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    aguarda_caucao: 'Aguarda caução',
    confirmada: 'Confirmada',
    recusada: 'Recusada',
    cancelada: 'Cancelada',
};

function kz(v: any): string {
    const n = typeof v === 'number' ? v : parseFloat(v || '0');
    return n.toLocaleString('pt-PT', { maximumFractionDigits: 0 }) + ' Kz';
}

export default function ReservasIndex({ espacos, reservas }: { espacos: Espaco[]; reservas: Reserva[] }) {
    const aprovar = (id: number) => {
        if (confirm('Aprovar esta reserva?')) router.post(`/reservas/${id}/aprovar`);
    };
    const recusar = (id: number) => {
        const motivo = prompt('Motivo da recusa (opcional):');
        if (motivo !== null) router.post(`/reservas/${id}/recusar`, { motivo });
    };
    const confirmarCaucao = (id: number) => {
        if (confirm('Confirmar que a caução foi recebida?')) router.post(`/reservas/${id}/confirmar-caucao`);
    };
    const apagarEspaco = (id: number) => {
        if (confirm('Apagar este espaço? As reservas associadas também serão removidas.')) router.delete(`/reservas/espacos/${id}`);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reservas" />
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">

                {/* Espaços */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h1 className="text-xl font-medium text-white">Espaços reserváveis</h1>
                            <p className="text-sm text-white/60">Salões, churrasqueiras e outras áreas comuns.</p>
                        </div>
                        <Link href="/reservas/espacos/novo" className="text-sm px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30">
                            Novo espaço
                        </Link>
                    </div>
                    {espacos.length === 0 ? (
                        <div className="p-8 rounded-xl bg-white/[0.03] border border-white/10 border-dashed text-center">
                            <p className="text-white/40 text-sm">Ainda não há espaços. Crie o primeiro com "Novo espaço".</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {espacos.map((e) => (
                                <div key={e.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="text-sm font-medium text-white">
                                            {e.nome}
                                            {!e.activo && <span className="ml-2 text-xs text-white/40">(inactivo)</span>}
                                        </p>
                                        <div className="flex gap-1">
                                            <Link href={`/reservas/espacos/${e.id}/editar`} className="text-xs px-2 py-1 rounded text-white/70 hover:bg-white/5">Editar</Link>
                                            <button onClick={() => apagarEspaco(e.id)} className="text-xs px-2 py-1 rounded text-red-300 hover:bg-red-500/10">Apagar</button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-white/50">
                                        {e.reservas_count} reserva(s) {e.tem_caucao && ' · caução ' + kz(e.valor_caucao)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Reservas */}
                <section>
                    <div className="mb-3">
                        <h2 className="text-xl font-medium text-white">Reservas</h2>
                        <p className="text-sm text-white/60">Últimas 50 reservas. Pendentes precisam da sua aprovação.</p>
                    </div>
                    {reservas.length === 0 ? (
                        <div className="p-8 rounded-xl bg-white/[0.03] border border-white/10 border-dashed text-center">
                            <p className="text-white/40 text-sm">Ainda não há reservas. As reservas dos condóminos aparecem aqui.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {reservas.map((r) => (
                                <div key={r.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">
                                                {r.espaco?.nome || `Espaço #${r.espaco_id}`}
                                                <span className={`ml-3 text-xs font-medium ${ESTADO_COR[r.estado] || 'text-white/60'}`}>
                                                    {ESTADO_LABEL[r.estado] || r.estado}
                                                </span>
                                            </p>
                                            <p className="text-xs text-white/60 mt-1">
                                                {r.user_nome} · {new Date(r.data).toLocaleDateString('pt-PT')} · {r.hora_inicio.slice(0,5)}–{r.hora_fim.slice(0,5)}
                                            </p>
                                            {r.motivo && <p className="text-xs text-white/40 mt-1 italic">"{r.motivo}"</p>}
                                            {r.comprovativo_caucao && (
                                                <a href={`/ficheiros/${r.comprovativo_caucao}`} target="_blank" rel="noreferrer"
                                                   className="inline-block text-xs text-cyan-300 hover:underline mt-1">
                                                    Ver comprovativo de caução
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {r.estado === 'pendente' && (
                                                <>
                                                    <button onClick={() => aprovar(r.id)} className="text-xs px-3 py-1.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-200 hover:bg-emerald-500/25">
                                                        Aprovar
                                                    </button>
                                                    <button onClick={() => recusar(r.id)} className="text-xs px-3 py-1.5 rounded bg-red-500/15 border border-red-500/25 text-red-200 hover:bg-red-500/25">
                                                        Recusar
                                                    </button>
                                                </>
                                            )}
                                            {r.estado === 'aguarda_caucao' && (
                                                <button onClick={() => confirmarCaucao(r.id)} className="text-xs px-3 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/25 text-cyan-200 hover:bg-cyan-500/25">
                                                    Confirmar caução
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </AuthenticatedLayout>
    );
}
