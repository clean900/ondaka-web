import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { FileText, FileBarChart, Download, Check } from 'lucide-react';

interface Seccao { slug: string; nome: string; }

interface Props {
    condominios: { id: number; nome: string }[];
    seccoes: Seccao[];
}

const PERIODOS = [
    { v: 3, label: '3 meses' },
    { v: 6, label: '6 meses' },
    { v: 12, label: '12 meses' },
    { v: 24, label: '24 meses' },
];

export default function Index({ condominios, seccoes }: Props) {
    const [titulo, setTitulo] = useState('');
    const [condominioId, setCondominioId] = useState('');
    const [meses, setMeses] = useState(12);
    const [selecionadas, setSelecionadas] = useState<string[]>(seccoes.map((s) => s.slug));

    const toggle = (slug: string) =>
        setSelecionadas((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

    const podeGerar = selecionadas.length > 0;

    const gerar = () => {
        const params = new URLSearchParams();
        if (titulo) params.set('titulo', titulo);
        if (condominioId) params.set('condominio_id', condominioId);
        params.set('meses', String(meses));
        selecionadas.forEach((s) => params.append('seccoes[]', s));
        window.open(`/relatorios/gerar?${params.toString()}`, '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Relatórios Personalizados" />

            <div className="mb-6 flex items-center gap-3">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(168,85,247,0.12)', border: '0.5px solid rgba(168,85,247,0.3)' }}
                >
                    <FileBarChart className="w-5 h-5 text-[#A855F7]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Relatórios Personalizados</h1>
                    <p className="text-sm text-white/60 mt-1">
                        Escolha as secções, o período e o condomínio, e gere um relatório PDF à medida.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Configuração */}
                <div className="lg:col-span-2 card">
                    <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">Secções a incluir</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                        {seccoes.map((s) => {
                            const on = selecionadas.includes(s.slug);
                            return (
                                <button
                                    key={s.slug}
                                    type="button"
                                    onClick={() => toggle(s.slug)}
                                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition ${
                                        on
                                            ? 'border-[#A855F7]/50 bg-[#A855F7]/10'
                                            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <span
                                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                                            on ? 'bg-[#A855F7]' : 'bg-white/10'
                                        }`}
                                    >
                                        {on && <Check className="w-3.5 h-3.5 text-white" />}
                                    </span>
                                    <span className="text-sm text-white">{s.nome}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Título (opcional)</label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Relatório Personalizado"
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Condomínio</label>
                            <select value={condominioId} onChange={(e) => setCondominioId(e.target.value)} className="input">
                                <option value="">Todos os condomínios</option>
                                {condominios.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Período</label>
                        <div className="flex gap-2 flex-wrap">
                            {PERIODOS.map((p) => (
                                <button
                                    key={p.v}
                                    type="button"
                                    onClick={() => setMeses(p.v)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                        meses === p.v
                                            ? 'bg-gradient-to-r from-[#00D4FF] to-[#A855F7] text-white'
                                            : 'bg-white/5 text-white/60 hover:text-white'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pré-visualização / gerar */}
                <div className="card flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-white/60" />
                        <h2 className="text-sm font-semibold text-white/80">Resumo</h2>
                    </div>
                    <ul className="text-sm text-white/60 space-y-1.5 mb-4 flex-1">
                        <li>Secções: <span className="text-white">{selecionadas.length}</span></li>
                        <li>Período: <span className="text-white">últimos {meses} meses</span></li>
                        <li>Âmbito: <span className="text-white">{condominioId ? condominios.find((c) => String(c.id) === condominioId)?.nome : 'Todos os condomínios'}</span></li>
                    </ul>
                    <button
                        type="button"
                        onClick={gerar}
                        disabled={!podeGerar}
                        className="inline-flex items-center justify-center gap-2 text-sm py-2.5 rounded-lg font-medium text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #A855F7 100%)' }}
                    >
                        <Download className="w-4 h-4" />
                        Gerar PDF
                    </button>
                    {!podeGerar && <p className="text-[11px] text-white/40 mt-2 text-center">Escolha pelo menos uma secção.</p>}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
