import { router } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle2, XCircle, Vote, Plus, Clock, Lock } from 'lucide-react';

interface PontoVotacao {
    id: number;
    ordem: number;
    titulo: string;
    descricao: string | null;
    estado: 'pendente' | 'em_votacao' | 'encerrado';
    detectado_automaticamente: boolean;
    total_votos_sim: number;
    total_votos_nao: number;
    total_votos_abstencao: number;
    permilagem_sim: number;
    permilagem_nao: number;
    permilagem_abstencao: number;
    resultado: string | null;
    aberta_em: string | null;
    fechada_em: string | null;
    ja_votou?: boolean;
}

interface Props {
    assembleiaId: number;
    assembleiaEstado: string;
    pontos: PontoVotacao[];
    podeGerir: boolean;
    participantePresente: boolean;
}

export default function VotacoesPanel({ assembleiaId, assembleiaEstado, pontos, podeGerir, participantePresente }: Props) {
    const [mostrarFormManual, setMostrarFormManual] = useState(false);
    const [tituloManual, setTituloManual] = useState('');
    const [descricaoManual, setDescricaoManual] = useState('');

    const detectar = () => {
        router.post(`/assembleias/${assembleiaId}/votacoes/detectar`);
    };

    const criarManual = () => {
        if (!tituloManual.trim()) return;
        router.post(
            `/assembleias/${assembleiaId}/votacoes/manual`,
            { titulo: tituloManual, descricao: descricaoManual || null },
            {
                onSuccess: () => {
                    setMostrarFormManual(false);
                    setTituloManual('');
                    setDescricaoManual('');
                },
            }
        );
    };

    const abrirVotacao = (pontoId: number) => {
        if (!confirm('Abrir votação deste ponto? Participantes presentes poderão votar.')) return;
        router.post(`/assembleias/votacoes/${pontoId}/abrir`);
    };

    const fecharVotacao = (pontoId: number) => {
        if (!confirm('Fechar votação? O resultado será registado definitivamente.')) return;
        router.post(`/assembleias/votacoes/${pontoId}/fechar`);
    };

    const votar = (pontoId: number, opcao: 'sim' | 'nao' | 'abstencao') => {
        const labels = { sim: 'SIM', nao: 'NÃO', abstencao: 'ABSTENÇÃO' };
        if (!confirm(`Confirmar voto: ${labels[opcao]}? Esta acção não pode ser anulada.`)) return;
        router.post(`/assembleias/votacoes/${pontoId}/votar`, { opcao });
    };

    const estaActiva = assembleiaEstado === 'em_curso';
    const estaAgendada = assembleiaEstado === 'agendada';
    const estaConcluida = assembleiaEstado === 'concluida';

    if (pontos.length === 0 && !podeGerir) {
        return null;
    }

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <Vote className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-semibold text-zinc-200">
                        Votações ({pontos.length})
                    </h3>
                </div>
                {podeGerir && estaAgendada && pontos.length === 0 && (
                    <button
                        onClick={detectar}
                        className="text-xs px-3 py-1.5 rounded border border-purple-500/30 text-purple-300 hover:border-purple-500/50 hover:text-purple-200"
                    >
                        Detectar pontos deliberativos automaticamente
                    </button>
                )}
                {podeGerir && (estaAgendada || estaActiva) && (
                    <button
                        onClick={() => setMostrarFormManual(!mostrarFormManual)}
                        className="text-xs px-2.5 py-1 rounded border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        Adicionar ponto
                    </button>
                )}
            </div>

            {mostrarFormManual && (
                <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
                    <label className="block text-xs text-zinc-500 mb-1">Título do ponto</label>
                    <input
                        type="text"
                        value={tituloManual}
                        onChange={(e) => setTituloManual(e.target.value)}
                        placeholder="Ex: Aprovação das contas do exercício 2025"
                        className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:border-purple-500 focus:outline-none"
                    />
                    <label className="block text-xs text-zinc-500 mb-1 mt-3">Descrição (opcional)</label>
                    <textarea
                        value={descricaoManual}
                        onChange={(e) => setDescricaoManual(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:border-purple-500 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={() => { setMostrarFormManual(false); setTituloManual(''); setDescricaoManual(''); }}
                            className="text-xs px-3 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={criarManual}
                            disabled={!tituloManual.trim()}
                            className="text-xs px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Criar ponto
                        </button>
                    </div>
                </div>
            )}

            {pontos.length === 0 ? (
                <div className="p-6 text-center text-sm text-zinc-500">
                    {estaAgendada
                        ? 'Nenhum ponto de votação ainda. Detecta automaticamente ou adiciona manualmente.'
                        : 'Sem votações nesta assembleia.'}
                </div>
            ) : (
                <div className="divide-y divide-zinc-800">
                    {pontos.map((p) => (
                        <PontoItem
                            key={p.id}
                            ponto={p}
                            podeGerir={podeGerir}
                            podeVotar={estaActiva && participantePresente}
                            onAbrir={() => abrirVotacao(p.id)}
                            onFechar={() => fecharVotacao(p.id)}
                            onVotar={(op) => votar(p.id, op)}
                            mostrarResultado={estaConcluida || p.estado === 'encerrado'}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function PontoItem({
    ponto,
    podeGerir,
    podeVotar,
    onAbrir,
    onFechar,
    onVotar,
    mostrarResultado,
}: {
    ponto: PontoVotacao;
    podeGerir: boolean;
    podeVotar: boolean;
    onAbrir: () => void;
    onFechar: () => void;
    onVotar: (op: 'sim' | 'nao' | 'abstencao') => void;
    mostrarResultado: boolean;
}) {
    const totalVotos = ponto.total_votos_sim + ponto.total_votos_nao + ponto.total_votos_abstencao;
    const totalPerm = Number(ponto.permilagem_sim) + Number(ponto.permilagem_nao) + Number(ponto.permilagem_abstencao);

    return (
        <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-zinc-600 font-mono">#{ponto.ordem}</span>
                        <EstadoPontoBadge estado={ponto.estado} />
                        {ponto.detectado_automaticamente && (
                            <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                                auto
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-zinc-200 font-medium">{ponto.titulo}</p>
                    {ponto.descricao && (
                        <p className="text-xs text-zinc-500 mt-1 whitespace-pre-line">{ponto.descricao}</p>
                    )}
                </div>

                {podeGerir && ponto.estado === 'pendente' && (
                    <button
                        onClick={onAbrir}
                        className="text-xs px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white whitespace-nowrap"
                    >
                        Abrir votação
                    </button>
                )}
                {podeGerir && ponto.estado === 'em_votacao' && (
                    <button
                        onClick={onFechar}
                        className="text-xs px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white whitespace-nowrap inline-flex items-center gap-1"
                    >
                        <Lock className="w-3 h-3" /> Fechar votação
                    </button>
                )}
            </div>

            {/* Botões de votação (participante presente, votação em curso) */}
            {ponto.estado === 'em_votacao' && podeVotar && !ponto.ja_votou && (
                <div className="mt-3 p-3 bg-zinc-950/50 border border-purple-500/20 rounded-lg">
                    <p className="text-xs text-zinc-400 mb-2">O teu voto:</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onVotar('sim')}
                            className="flex-1 py-2 text-sm rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                        >
                            Sim
                        </button>
                        <button
                            onClick={() => onVotar('nao')}
                            className="flex-1 py-2 text-sm rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30"
                        >
                            Não
                        </button>
                        <button
                            onClick={() => onVotar('abstencao')}
                            className="flex-1 py-2 text-sm rounded bg-zinc-700/30 hover:bg-zinc-700/50 text-zinc-300 border border-zinc-600/30"
                        >
                            Abstenção
                        </button>
                    </div>
                </div>
            )}

            {ponto.estado === 'em_votacao' && podeVotar && ponto.ja_votou && (
                <div className="mt-3 p-2 bg-emerald-950/30 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 inline-flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Já votaste neste ponto.
                </div>
            )}

            {/* Resultado */}
            {mostrarResultado && ponto.estado === 'encerrado' && (
                <div className="mt-3 p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-zinc-500">Resultado:</span>
                        <ResultadoBadge resultado={ponto.resultado} />
                        <span className="text-xs text-zinc-500 ml-auto">
                            {totalVotos} votos · {totalPerm.toFixed(2)}‰
                        </span>
                    </div>
                    <div className="space-y-1.5">
                        <BarraResultado label="Sim" votos={ponto.total_votos_sim} permilagem={Number(ponto.permilagem_sim)} cor="emerald" />
                        <BarraResultado label="Não" votos={ponto.total_votos_nao} permilagem={Number(ponto.permilagem_nao)} cor="rose" />
                        <BarraResultado label="Abstenção" votos={ponto.total_votos_abstencao} permilagem={Number(ponto.permilagem_abstencao)} cor="zinc" />
                    </div>
                </div>
            )}

            {/* Votação em curso — mostrar contagem ao vivo */}
            {ponto.estado === 'em_votacao' && (
                <div className="mt-3 p-3 bg-purple-950/20 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2 text-xs text-purple-300">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        <span>Votação em curso — {totalVotos} votos registados ({totalPerm.toFixed(2)}‰)</span>
                    </div>
                    <div className="space-y-1.5">
                        <BarraResultado label="Sim" votos={ponto.total_votos_sim} permilagem={Number(ponto.permilagem_sim)} cor="emerald" />
                        <BarraResultado label="Não" votos={ponto.total_votos_nao} permilagem={Number(ponto.permilagem_nao)} cor="rose" />
                        <BarraResultado label="Abstenção" votos={ponto.total_votos_abstencao} permilagem={Number(ponto.permilagem_abstencao)} cor="zinc" />
                    </div>
                </div>
            )}
        </div>
    );
}

function EstadoPontoBadge({ estado }: { estado: string }) {
    const config: Record<string, { cor: string; label: string }> = {
        pendente: { cor: 'bg-zinc-500/20 text-zinc-400', label: 'Pendente' },
        em_votacao: { cor: 'bg-purple-500/20 text-purple-300', label: 'A votar' },
        encerrado: { cor: 'bg-zinc-600/20 text-zinc-400', label: 'Encerrado' },
    };
    const c = config[estado] ?? config.pendente;
    return <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.cor}`}>{c.label}</span>;
}

function ResultadoBadge({ resultado }: { resultado: string | null }) {
    if (!resultado) return null;
    const config: Record<string, { cor: string; label: string; Icon: typeof CheckCircle2 }> = {
        aprovado: { cor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'Aprovado', Icon: CheckCircle2 },
        rejeitado: { cor: 'bg-rose-500/20 text-rose-300 border-rose-500/30', label: 'Rejeitado', Icon: XCircle },
        empate: { cor: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'Empate', Icon: XCircle },
    };
    const c = config[resultado] ?? config.empate;
    const I = c.Icon;
    return (
        <span className={`text-xs px-2 py-0.5 rounded border inline-flex items-center gap-1 ${c.cor}`}>
            <I className="w-3 h-3" />
            {c.label}
        </span>
    );
}

function BarraResultado({
    label,
    votos,
    permilagem,
    cor,
}: {
    label: string;
    votos: number;
    permilagem: number;
    cor: 'emerald' | 'rose' | 'zinc';
}) {
    const maxPerm = 1000;
    const percent = (permilagem / maxPerm) * 100;
    const corClass = cor === 'emerald' ? 'bg-emerald-500' : cor === 'rose' ? 'bg-rose-500' : 'bg-zinc-500';

    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-20 text-zinc-400">{label}</span>
            <div className="flex-1 h-2 bg-zinc-800 rounded overflow-hidden">
                <div className={`h-full ${corClass} transition-all`} style={{ width: `${Math.min(percent, 100)}%` }} />
            </div>
            <span className="w-24 text-right text-zinc-500 font-mono text-[11px]">
                {votos} · {permilagem.toFixed(2)}‰
            </span>
        </div>
    );
}
