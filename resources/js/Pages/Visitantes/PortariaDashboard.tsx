import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, DoorOpen, Clock, AlertTriangle, Key, Car } from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface Kpis {
    total_hoje: number;
    dentro: number;
    ainda_muito: number;
    permanencia_media_min: number;
    metodo_top: string;
}
interface AindaDentro {
    id: number;
    entrou_em: string;
    matricula: string | null;
    visitante: { nome: string } | null;
    fraccao: { identificador: string } | null;
}
interface PageProps {
    kpis: Kpis;
    fluxo: { hora: string; total: number }[];
    top_fraccoes: { fraccao: string; total: number }[];
    ainda_dentro: AindaDentro[];
}

function duracao(iso: string) {
    const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 60) return `há ${min} min`;
    const h = Math.floor(min / 60);
    return `há ${h}h${min % 60 ? ` ${min % 60}min` : ''}`;
}

function permanenciaLabel(min: number) {
    if (!min) return '—';
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)}h ${min % 60}min`;
}

const METODO: Record<string, string> = { qr: 'QR Code', otp: 'Código OTP', manual: 'Manual', '—': '—' };

export default function PortariaDashboard({ kpis, fluxo, top_fraccoes, ainda_dentro }: PageProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard de portaria — ONDAKA" />
            <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">Dashboard de portaria</h1>
                        <p className="text-sm text-zinc-500">Fluxo de visitas e alertas</p>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <Kpi icon={<DoorOpen className="h-4 w-4" />} label="Visitas hoje" value={kpis.total_hoje} />
                    <Kpi icon={<DoorOpen className="h-4 w-4" />} label="Ainda dentro" value={kpis.dentro}
                        accent={kpis.ainda_muito > 0 ? 'amber' : undefined} />
                    <Kpi icon={<Clock className="h-4 w-4" />} label="Permanência média" value={permanenciaLabel(kpis.permanencia_media_min)} />
                    <Kpi icon={<Key className="h-4 w-4" />} label="Método mais usado" value={METODO[kpis.metodo_top] ?? kpis.metodo_top} />
                </div>

                {kpis.ainda_muito > 0 && (
                    <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                        <p className="text-sm text-amber-200">
                            {kpis.ainda_muito} {kpis.ainda_muito === 1 ? 'visitante está' : 'visitantes estão'} dentro há mais de 12 horas.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                        <h2 className="text-sm font-medium text-zinc-400 mb-3">Fluxo (últimas 24h)</h2>
                        <div className="h-56">
                            <ResponsiveContainer>
                                <AreaChart data={fluxo} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="hora" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} interval={3} />
                                    <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ background: '#0F0F23', border: '1px solid #27272a', borderRadius: 8 }} />
                                    <Area type="monotone" dataKey="total" name="Visitas" stroke="#00D4FF" fill="#00D4FF33" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                        <h2 className="text-sm font-medium text-zinc-400 mb-3">Imóveis mais visitados (30 dias)</h2>
                        <div className="h-56">
                            <ResponsiveContainer>
                                <BarChart data={top_fraccoes} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis type="number" allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                                    <YAxis type="category" dataKey="fraccao" width={90} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ background: '#0F0F23', border: '1px solid #27272a', borderRadius: 8 }} />
                                    <Bar dataKey="total" name="Visitas" fill="#A855F7" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Ainda dentro */}
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                        <h2 className="text-sm font-medium text-zinc-200">Ainda dentro ({ainda_dentro.length})</h2>
                        <Link href="/visitantes/dentro-agora" className="text-xs text-cyan-400 hover:text-cyan-300">Gerir →</Link>
                    </div>
                    {ainda_dentro.length === 0 ? (
                        <p className="p-8 text-center text-zinc-500 text-sm">Ninguém dentro agora.</p>
                    ) : (
                        <div className="divide-y divide-zinc-800">
                            {ainda_dentro.map((v) => {
                                const muito = (Date.now() - new Date(v.entrou_em).getTime()) > 12 * 3600 * 1000;
                                return (
                                    <div key={v.id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                                        <div className="min-w-0">
                                            <p className="text-zinc-200 truncate">{v.visitante?.nome ?? 'Visitante'}</p>
                                            <p className="text-xs text-zinc-500">
                                                {v.fraccao ? `Imóvel ${v.fraccao.identificador}` : '—'}
                                                {v.matricula && <span className="inline-flex items-center gap-1 ml-2"><Car className="h-3 w-3" />{v.matricula}</span>}
                                            </p>
                                        </div>
                                        <span className={`text-xs flex-shrink-0 ${muito ? 'text-amber-400 font-medium' : 'text-zinc-500'}`}>
                                            {duracao(v.entrou_em)}
                                        </span>
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

function Kpi({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number | string; accent?: 'amber' }) {
    return (
        <div className={`rounded-xl border p-4 ${accent === 'amber' ? 'border-amber-500/40 bg-amber-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5">{icon}{label}</p>
            <p className={`text-2xl font-bold mt-1 ${accent === 'amber' ? 'text-amber-400' : 'text-zinc-100'}`}>{value}</p>
        </div>
    );
}
