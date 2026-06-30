import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { FileText, FileBarChart, Download, Check, Mail, Trash2, Clock, GripVertical, Plus, X, LayoutGrid } from 'lucide-react';

interface Seccao { slug: string; nome: string; }
interface Bloco { slug: string; nome: string; }
interface BlocoLayout { key: number; tipo: string; titulo?: string; }

interface Agendado {
    id: number;
    titulo: string;
    condominio_id: number | null;
    seccoes: string[];
    meses: number;
    frequencia: string;
    dia: number;
    destinatarios: string;
    ativo: boolean;
    ultimo_envio_em: string | null;
}

interface Props {
    condominios: { id: number; nome: string }[];
    seccoes: Seccao[];
    blocos: Bloco[];
    agendados: Agendado[];
}

const PERIODOS = [
    { v: 3, label: '3 meses' },
    { v: 6, label: '6 meses' },
    { v: 12, label: '12 meses' },
    { v: 24, label: '24 meses' },
];

export default function Index({ condominios, seccoes, blocos, agendados }: Props) {
    const [titulo, setTitulo] = useState('');
    const [condominioId, setCondominioId] = useState('');
    const [meses, setMeses] = useState(12);
    const [selecionadas, setSelecionadas] = useState<string[]>(seccoes.map((s) => s.slug));

    // Agendamento por email
    const [destinatarios, setDestinatarios] = useState('');
    const [frequencia, setFrequencia] = useState('mensal');
    const [dia, setDia] = useState(1);

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

    const agendar = () => {
        if (!podeGerar || !destinatarios.trim()) return;
        router.post('/relatorios/agendar', {
            titulo, condominio_id: condominioId || null, meses,
            seccoes: selecionadas, frequencia, dia, destinatarios,
        }, { preserveScroll: true, onSuccess: () => setDestinatarios('') });
    };

    const removerAgendamento = (id: number) => {
        if (!confirm('Remover este agendamento?')) return;
        router.delete(`/relatorios/agendar/${id}`, { preserveScroll: true });
    };

    const nomeCond = (id: number | null) => id ? (condominios.find((c) => c.id === id)?.nome ?? '—') : 'Todos';

    // ── Construtor visual (drag-and-drop) ──
    const [tituloGeral, setTituloGeral] = useState('');
    const [layout, setLayout] = useState<BlocoLayout[]>([]);
    const [aGerar, setAGerar] = useState(false);
    const keyRef = useRef(1);
    const dragIndex = useRef<number | null>(null);

    const addBloco = (tipo: string) =>
        setLayout((l) => [...l, { key: keyRef.current++, tipo, titulo: tipo === 'titulo' ? 'Nova secção' : undefined }]);
    const removerBloco = (key: number) => setLayout((l) => l.filter((b) => b.key !== key));
    const setTituloBloco = (key: number, v: string) =>
        setLayout((l) => l.map((b) => (b.key === key ? { ...b, titulo: v } : b)));

    const onDragStart = (i: number) => { dragIndex.current = i; };
    const onDragOverItem = (e: React.DragEvent, i: number) => {
        e.preventDefault();
        const from = dragIndex.current;
        if (from === null || from === i) return;
        setLayout((l) => {
            const copy = [...l];
            const [moved] = copy.splice(from, 1);
            copy.splice(i, 0, moved);
            return copy;
        });
        dragIndex.current = i;
    };

    const nomeBloco = (tipo: string) => blocos.find((b) => b.slug === tipo)?.nome ?? tipo;

    const gerarConstrutor = async () => {
        if (layout.length === 0 || aGerar) return;
        setAGerar(true);
        try {
            const cookie = document.cookie.split('; ').find((r) => r.startsWith('XSRF-TOKEN='))?.split('=')[1];
            const res = await fetch('/relatorios/construtor', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf',
                    'X-XSRF-TOKEN': cookie ? decodeURIComponent(cookie) : '',
                },
                body: JSON.stringify({
                    titulo: tituloGeral || null,
                    condominio_id: condominioId || null,
                    meses,
                    blocos: JSON.stringify(layout.map((b) => ({ tipo: b.tipo, titulo: b.titulo ?? null }))),
                }),
            });
            if (!res.ok) throw new Error('falhou');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio-${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch {
            alert('Não foi possível gerar o relatório.');
        } finally {
            setAGerar(false);
        }
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

            {/* Construtor visual (drag-and-drop) */}
            <div className="card mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <LayoutGrid className="w-4 h-4 text-[#A855F7]" />
                    <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Construtor visual</h2>
                </div>
                <p className="text-xs text-white/50 mb-4">Adicione blocos (clique na paleta) e <strong>arraste para reordenar</strong>. Usa o período e o condomínio escolhidos abaixo.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Paleta */}
                    <div>
                        <div className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Blocos disponíveis</div>
                        <div className="space-y-1.5">
                            {blocos.map((b) => (
                                <button
                                    key={b.slug}
                                    type="button"
                                    onClick={() => addBloco(b.slug)}
                                    className="w-full flex items-center justify-between gap-2 p-2.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-left transition"
                                >
                                    <span className="text-sm text-white">{b.nome}</span>
                                    <Plus className="w-3.5 h-3.5 text-white/40" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-[11px] text-white/40 uppercase tracking-wider">Layout do relatório ({layout.length})</div>
                            <input
                                type="text"
                                value={tituloGeral}
                                onChange={(e) => setTituloGeral(e.target.value)}
                                placeholder="Título do relatório"
                                className="input !py-1 !text-xs max-w-[200px]"
                            />
                        </div>

                        {layout.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-white/40 text-sm">
                                Adicione blocos da paleta para montar o relatório.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {layout.map((b, i) => (
                                    <div
                                        key={b.key}
                                        draggable
                                        onDragStart={() => onDragStart(i)}
                                        onDragOver={(e) => onDragOverItem(e, i)}
                                        onDragEnd={() => { dragIndex.current = null; }}
                                        className="flex items-center gap-2 p-2.5 rounded-lg border border-white/10 bg-white/[0.04] cursor-move"
                                    >
                                        <GripVertical className="w-4 h-4 text-white/30 flex-shrink-0" />
                                        <span className="text-[11px] text-white/40 w-5">{i + 1}</span>
                                        {b.tipo === 'titulo' ? (
                                            <input
                                                type="text"
                                                value={b.titulo ?? ''}
                                                onChange={(e) => setTituloBloco(b.key, e.target.value)}
                                                onDragStart={(e) => e.preventDefault()}
                                                placeholder="Texto do título"
                                                className="flex-1 bg-transparent border-b border-white/10 text-sm text-white focus:outline-none focus:border-[#A855F7]"
                                            />
                                        ) : (
                                            <span className="flex-1 text-sm text-white">{nomeBloco(b.tipo)}</span>
                                        )}
                                        <button onClick={() => removerBloco(b.key)} className="text-white/40 hover:text-red-400 flex-shrink-0">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={gerarConstrutor}
                            disabled={layout.length === 0 || aGerar}
                            className="mt-4 inline-flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-lg font-medium text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #A855F7 100%)' }}
                        >
                            <Download className="w-4 h-4" />
                            {aGerar ? 'A gerar...' : 'Gerar PDF do construtor'}
                        </button>
                    </div>
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

            {/* Agendar por email */}
            <div className="card mt-4">
                <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-[#00D4FF]" />
                    <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Agendar envio por email</h2>
                </div>
                <p className="text-xs text-white/50 mb-4">Usa as secções, período, condomínio e título escolhidos acima. O relatório é gerado e enviado automaticamente na frequência definida.</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Destinatários (emails, separados por vírgula)</label>
                        <input type="text" value={destinatarios} onChange={(e) => setDestinatarios(e.target.value)} placeholder="gestor@empresa.ao, admin@empresa.ao" className="input" />
                    </div>
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Frequência</label>
                        <select value={frequencia} onChange={(e) => setFrequencia(e.target.value)} className="input">
                            <option value="mensal">Mensal</option>
                            <option value="semanal">Semanal</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">{frequencia === 'semanal' ? 'Dia da semana (1=Seg)' : 'Dia do mês'}</label>
                        <input type="number" min={1} max={frequencia === 'semanal' ? 7 : 28} value={dia} onChange={(e) => setDia(parseInt(e.target.value) || 1)} className="input" />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={agendar}
                    disabled={!podeGerar || !destinatarios.trim()}
                    className="mt-4 inline-flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-lg font-medium text-white transition disabled:opacity-40 disabled:cursor-not-allowed bg-white/10 hover:bg-white/15"
                >
                    <Clock className="w-4 h-4" />
                    Criar agendamento
                </button>

                {agendados.length > 0 && (
                    <div className="mt-5 border-t border-white/10 pt-4 space-y-2">
                        {agendados.map((a) => (
                            <div key={a.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                                <div className="min-w-0">
                                    <div className="text-sm text-white truncate">{a.titulo}</div>
                                    <div className="text-[11px] text-white/50 truncate">
                                        {a.frequencia === 'semanal' ? `Semanal · dia ${a.dia}` : `Mensal · dia ${a.dia}`} · {nomeCond(a.condominio_id)} · {a.meses}m · {a.destinatarios}
                                    </div>
                                </div>
                                <button onClick={() => removerAgendamento(a.id)} className="text-red-400 hover:text-red-300 flex-shrink-0" title="Remover">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
