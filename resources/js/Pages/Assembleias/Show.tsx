import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Users, Video, Send, Play, Square, XCircle, CheckCircle2, AlertCircle, Mail, MessageSquare, Calendar, MapPin, Copy } from 'lucide-react';
import { useState } from 'react';
import VotacoesPanel from './VotacoesPanel';

interface Participante {
    id: number;
    condomino_id: number;
    nome: string;
    documento: string | null;
    numero_fraccoes: number;
    permilagem_total: number;
    email_convocacao: string | null;
    telefone_convocacao: string | null;
    email_enviado: boolean;
    sms_enviado: boolean;
    presente: boolean;
    entrou_em: string | null;
}

interface Assembleia {
    id: number;
    numero: string;
    titulo: string;
    tipo: string;
    tipo_label: string;
    ordem_do_dia: string;
    observacoes: string | null;
    data_agendada: string;
    data_segunda_convocatoria: string | null;
    local: string;
    modo: string;
    sala_jitsi: string;
    url_jitsi: string;
    estado: string;
    estado_label: string;
    iniciada_em: string | null;
    terminada_em: string | null;
    total_fraccoes: number;
    quorum_minimo_percent: number;
    convocatorias_enviadas: { emails?: number; sms?: number; enviadas_em?: string } | null;
    condominio: { id: number; nome: string };
    criada_por: string | null;
    participantes: Participante[];
    quorum: {
        fraccoes_presentes: number;
        total_fraccoes: number;
        percent_fraccoes: number;
        tem_quorum: boolean;
        quorum_minimo: number;
    };
    pontos_votacao: Array<{
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
        ja_votou: boolean;
    }>;
    participante_actual_id: number | null;
    pode_gerir: boolean;
}

export default function AssembleiaShow({ assembleia }: { assembleia: Assembleia }) {
    const [filtroPart, setFiltroPart] = useState<'todos' | 'presentes' | 'ausentes'>('todos');

    const data = new Date(assembleia.data_agendada);

    const enviarConvocatorias = () => {
        if (!confirm('Enviar email + SMS a todos os condóminos convocados? Consume saldo da feature sms_sender_id.')) return;
        router.post(`/assembleias/${assembleia.id}/convocatorias`);
    };

    const iniciar = () => {
        if (!confirm('Iniciar assembleia agora?')) return;
        router.post(`/assembleias/${assembleia.id}/iniciar`);
    };

    const terminar = () => {
        if (!confirm('Terminar assembleia? Presenças serão consolidadas.')) return;
        router.post(`/assembleias/${assembleia.id}/terminar`);
    };

    const cancelar = () => {
        if (!confirm('Cancelar assembleia? Esta acção não pode ser desfeita.')) return;
        router.post(`/assembleias/${assembleia.id}/cancelar`);
    };

    const copiarLink = () => {
        const url = window.location.origin + `/assembleias/${assembleia.id}/entrar`;
        navigator.clipboard.writeText(url);
        alert('Link copiado!');
    };

    const regenerar = () => {
        if (!confirm('Actualizar lista de participantes com base nos contratos de propriedade actuais? Participantes já convocados serão mantidos.')) return;
        router.post(`/assembleias/${assembleia.id}/regenerar-participantes`);
    };

    const participantesFiltrados = assembleia.participantes.filter((p) => {
        if (filtroPart === 'presentes') return p.presente;
        if (filtroPart === 'ausentes') return !p.presente;
        return true;
    });

    const estaEmCurso = assembleia.estado === 'em_curso';
    const podeEntrar = estaEmCurso;

    return (
        <AuthenticatedLayout>
            <Head title={`${assembleia.numero} — ONDAKA`} />

            <div className="p-6 md:p-8 max-w-6xl">
                <Link href="/assembleias" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </Link>

                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-zinc-100 font-mono">{assembleia.numero}</h1>
                                <EstadoBadge estado={assembleia.estado} label={assembleia.estado_label} />
                            </div>
                            <p className="text-sm text-zinc-400">{assembleia.titulo}</p>
                            <p className="text-xs text-zinc-500">{assembleia.tipo_label} · {assembleia.condominio.nome}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {assembleia.estado === 'agendada' && (
                            <>
                                <button onClick={enviarConvocatorias} className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-4 py-2 text-sm">
                                    <Send className="h-4 w-4" />
                                    Enviar convocatórias
                                </button>
                                <button onClick={iniciar} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-4 py-2 text-sm">
                                    <Play className="h-4 w-4" />
                                    Iniciar
                                </button>
                                <button onClick={cancelar} className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 text-sm">
                                    <XCircle className="h-4 w-4" />
                                    Cancelar
                                </button>
                            </>
                        )}
                        {estaEmCurso && (
                            <button onClick={terminar} className="inline-flex items-center gap-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border border-zinc-600 px-4 py-2 text-sm">
                                <Square className="h-4 w-4" />
                                Terminar
                            </button>
                        )}
                        {(assembleia.estado === 'concluida' || assembleia.estado === 'sem_quorum') && (
                            <a
                                href={`/assembleias/${assembleia.id}/acta`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 px-4 py-2 text-sm"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Descarregar acta PDF
                            </a>
                        )}
                    </div>
                </div>

                {/* Jitsi quando em curso */}
                {estaEmCurso && assembleia.modo !== 'presencial' && (
                    <div className="bg-zinc-900/50 border border-emerald-500/30 rounded-xl p-5 mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                                <Video className="h-4 w-4" />
                                Sala virtual em curso
                            </h3>
                            <button onClick={copiarLink} className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5">
                                <Copy className="h-3 w-3" />
                                Copiar link de entrada
                            </button>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                            <a
                                href={assembleia.url_jitsi}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-5 py-2.5 text-sm font-semibold"
                            >
                                <Video className="h-4 w-4" />
                                Abrir Jitsi numa nova tab
                            </a>
                            <p className="text-xs text-zinc-500 font-mono break-all">{assembleia.url_jitsi}</p>
                        </div>
                    </div>
                )}

                {/* Grid principal */}
                <div className="grid md:grid-cols-3 gap-4">
                    {/* Coluna principal */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Ordem do dia */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Ordem do dia</h3>
                            <div className="text-sm text-zinc-200 whitespace-pre-line">{assembleia.ordem_do_dia}</div>
                        </div>

                        {assembleia.observacoes && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Observações</h3>
                                <p className="text-sm text-zinc-300 whitespace-pre-line">{assembleia.observacoes}</p>
                            </div>
                        )}

                        {/* Votações */}
                        <VotacoesPanel
                            assembleiaId={assembleia.id}
                            assembleiaEstado={assembleia.estado}
                            pontos={assembleia.pontos_votacao || []}
                            podeGerir={assembleia.pode_gerir}
                            participantePresente={
                                !!assembleia.participante_actual_id &&
                                assembleia.participantes.some(
                                    (p) => p.id === assembleia.participante_actual_id && p.presente
                                )
                            }
                        />

                        {/* Lista de participantes */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                                <h3 className="text-sm font-semibold text-zinc-200">Participantes ({assembleia.participantes.length})</h3>
                                <div className="flex items-center gap-2">
                                    {assembleia.estado === 'agendada' && (
                                        <button
                                            onClick={regenerar}
                                            className="text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded border border-cyan-500/30 hover:border-cyan-500/50"
                                        >
                                            Actualizar lista
                                        </button>
                                    )}
                                    <div className="flex gap-1 text-xs">
                                        <button
                                            onClick={() => setFiltroPart('todos')}
                                            className={`px-2.5 py-1 rounded-md ${filtroPart === 'todos' ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            Todos
                                        </button>
                                        <button
                                            onClick={() => setFiltroPart('presentes')}
                                            className={`px-2.5 py-1 rounded-md ${filtroPart === 'presentes' ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            Presentes ({assembleia.participantes.filter(p => p.presente).length})
                                        </button>
                                        <button
                                            onClick={() => setFiltroPart('ausentes')}
                                            className={`px-2.5 py-1 rounded-md ${filtroPart === 'ausentes' ? 'bg-zinc-500/20 text-zinc-300' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            Ausentes ({assembleia.participantes.filter(p => !p.presente).length})
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {participantesFiltrados.length === 0 ? (
                                <div className="p-8 text-center text-sm text-zinc-500">Nenhum participante a mostrar.</div>
                            ) : (
                                <div className="divide-y divide-zinc-800/50">
                                    {participantesFiltrados.map((p) => (
                                        <div key={p.id} className="p-3 flex items-center gap-3">
                                            <div className={`h-2 w-2 rounded-full shrink-0 ${p.presente ? 'bg-emerald-400' : 'bg-zinc-700'}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-zinc-200 truncate">{p.nome}</p>
                                                <div className="flex items-center gap-3 text-xs text-zinc-500">
                                                    <span>{p.numero_fraccoes} fracçã{p.numero_fraccoes === 1 ? 'o' : 'es'}</span>
                                                    <span>·</span>
                                                    <span>{p.permilagem_total.toFixed(4)}‰</span>
                                                    {p.entrou_em && (<>
                                                        <span>·</span>
                                                        <span className="text-emerald-500/80">
                                                            entrou às {new Date(p.entrou_em).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </>)}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 text-xs">
                                                {p.email_enviado && <span title="Email enviado" className="text-cyan-500/70"><Mail className="h-3.5 w-3.5" /></span>}
                                                {p.sms_enviado && <span title="SMS enviado" className="text-purple-500/70"><MessageSquare className="h-3.5 w-3.5" /></span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coluna direita */}
                    <div className="space-y-4">
                        {/* Quórum */}
                        <div className={`rounded-xl p-5 border ${assembleia.quorum.tem_quorum ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-amber-500/5 border-amber-500/30'}`}>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Quórum</h3>
                            <div className={`text-2xl font-bold ${assembleia.quorum.tem_quorum ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {assembleia.quorum.percent_fraccoes}%
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                                {assembleia.quorum.fraccoes_presentes} de {assembleia.quorum.total_fraccoes} fracções
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                                Mínimo: {assembleia.quorum.quorum_minimo}%
                                {assembleia.quorum.tem_quorum ? (
                                    <span className="text-emerald-400 ml-2">✓ atingido</span>
                                ) : (
                                    <span className="text-amber-400 ml-2">⚠ abaixo</span>
                                )}
                            </p>
                        </div>

                        {/* Agendamento */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Agendamento</h3>
                            <dl className="space-y-2 text-sm">
                                <div>
                                    <dt className="text-xs text-zinc-500 flex items-center gap-1.5"><Calendar className="h-3 w-3" />1ª convocatória</dt>
                                    <dd className="text-zinc-200">{data.toLocaleString('pt-PT')}</dd>
                                </div>
                                {assembleia.data_segunda_convocatoria && (
                                    <div>
                                        <dt className="text-xs text-zinc-500">2ª convocatória</dt>
                                        <dd className="text-zinc-400">{new Date(assembleia.data_segunda_convocatoria).toLocaleString('pt-PT')}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-xs text-zinc-500 flex items-center gap-1.5"><MapPin className="h-3 w-3" />Local</dt>
                                    <dd className="text-zinc-200">{assembleia.local}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Convocatórias */}
                        {assembleia.convocatorias_enviadas && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Convocatórias</h3>
                                <dl className="space-y-1.5 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-zinc-500">Emails</dt>
                                        <dd className="text-cyan-400">{assembleia.convocatorias_enviadas.emails ?? 0}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-zinc-500">SMS</dt>
                                        <dd className="text-purple-400">{assembleia.convocatorias_enviadas.sms ?? 0}</dd>
                                    </div>
                                </dl>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Timeline</h3>
                            <dl className="space-y-2 text-sm">
                                {assembleia.criada_por && (
                                    <div>
                                        <dt className="text-xs text-zinc-500">Criada por</dt>
                                        <dd className="text-zinc-300">{assembleia.criada_por}</dd>
                                    </div>
                                )}
                                {assembleia.iniciada_em && (
                                    <div>
                                        <dt className="text-xs text-emerald-400/80">Iniciada</dt>
                                        <dd className="text-zinc-300">{new Date(assembleia.iniciada_em).toLocaleString('pt-PT')}</dd>
                                    </div>
                                )}
                                {assembleia.terminada_em && (
                                    <div>
                                        <dt className="text-xs text-zinc-400">Terminada</dt>
                                        <dd className="text-zinc-300">{new Date(assembleia.terminada_em).toLocaleString('pt-PT')}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function EstadoBadge({ estado, label }: { estado: string; label: string }) {
    const config: Record<string, { color: string; Icon: typeof CheckCircle2 }> = {
        agendada: { color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', Icon: Calendar },
        em_curso: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', Icon: Video },
        concluida: { color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30', Icon: CheckCircle2 },
        cancelada: { color: 'text-red-400 bg-red-500/10 border-red-500/30', Icon: XCircle },
        sem_quorum: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', Icon: AlertCircle },
    };
    const cfg = config[estado] ?? config.agendada;
    const { Icon } = cfg;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium ${cfg.color}`}>
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}
