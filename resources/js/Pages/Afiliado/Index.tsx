import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Handshake, MousePointerClick, Building2, Users, Clock, CheckCircle2, Wallet, TrendingUp,
    Link2, MessageCircle, Mail, Smartphone, AlertTriangle, ArrowRight, Landmark,
} from 'lucide-react';
import {
    fmtKz, fmtNum, fmtPct, fmtData, StatCard, PageHeader, Seccao, Vazio, Th, Td, PortalNav,
    CopiarBotao, BarrasMensais, ProgressoNivel, NivelBadge, EstadoComissaoBadge, SubscricaoBadge,
} from '@/Components/Afiliados/ui';
import type { Afiliado, ResumoAfiliado, ConfigAfiliados, Comissao, ClienteIndicado, Materiais } from '@/types/afiliados';

interface Props {
    afiliado: Afiliado;
    resumo: ResumoAfiliado;
    config: ConfigAfiliados;
    ultimas_comissoes: Comissao[];
    clientes_recentes: ClienteIndicado[];
    materiais: Materiais;
}

export default function Index({ afiliado, resumo, config, ultimas_comissoes, clientes_recentes, materiais }: Props) {
    const activo = afiliado.estado === 'activo';

    return (
        <AuthenticatedLayout>
            <Head title="Painel de afiliado" />
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader
                    icon={Handshake}
                    titulo="Painel de afiliado"
                    subtitulo={<span>Código <strong className="text-white">{afiliado.codigo}</strong> · <NivelBadge nivel={afiliado.nivel} taxa={afiliado.taxa_actual_pct} /> {afiliado.taxa_manual_pct !== null && <span className="ml-1 text-xs text-purple-300">(taxa definida pela ONDAKA)</span>}</span>}
                />
                <PortalNav activo="/afiliado" />

                {afiliado.estado === 'pendente' && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                        <Clock className="mt-0.5 h-5 w-5 shrink-0" />
                        <div><strong>Candidatura em análise.</strong> O seu link só começa a atribuir clientes depois da aprovação pela ONDAKA. Avisamos por email. Entretanto pode preencher os <Link href="/afiliado/dados" className="underline">dados de pagamento</Link>.</div>
                    </div>
                )}
                {afiliado.estado === 'suspenso' && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div><strong>Conta suspensa.</strong> {afiliado.motivo_suspensao || 'Contacte a ONDAKA para mais informações.'} Enquanto suspensa, o link não atribui clientes nem gera comissões.</div>
                    </div>
                )}
                {afiliado.estado === 'recusado' && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div><strong>Candidatura não aprovada.</strong> {afiliado.motivo_recusa || 'Contacte a ONDAKA para mais informações.'}</div>
                    </div>
                )}
                {activo && !afiliado.dados_pagamento_completos && (
                    <div className="flex items-start gap-3 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm text-cyan-100">
                        <Landmark className="mt-0.5 h-5 w-5 shrink-0" />
                        <div><strong>Falta o IBAN.</strong> Para receber as comissões preencha os <Link href="/afiliado/dados" className="underline">dados de pagamento</Link> (IBAN, banco e titular).</div>
                    </div>
                )}

                {/* KPIs */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                    <StatCard label="Cliques no link" valor={fmtNum(resumo.cliques)} icon={MousePointerClick} tom="neutro" sub="1 por visitante/dia" />
                    <StatCard label="Registos" valor={fmtNum(resumo.registos)} icon={Building2} tom="ciano" sub={`${resumo.registos_mes} este mês`} />
                    <StatCard label="Clientes pagantes" valor={fmtNum(resumo.clientes_pagantes)} icon={Users} tom="roxo" sub={`${resumo.clientes_activos} com subscrição activa`} />
                    <StatCard label="Em carência" valor={fmtKz(resumo.pendente_kz, 0)} icon={Clock} tom="amber" sub={`${resumo.pendente_n} comissão(ões) · ${resumo.carencia_dias} dias`} />
                    <StatCard label="Aprovado (a pagar)" valor={fmtKz(resumo.aprovada_kz, 0)} icon={CheckCircle2} tom="verde" sub={resumo.atinge_minimo ? 'Atinge o mínimo de pagamento' : `Mínimo: ${fmtKz(resumo.pagamento_minimo_kz, 0)}`} />
                    <StatCard label="Já pago" valor={fmtKz(resumo.paga_kz, 0)} icon={Wallet} tom="verde" sub={resumo.ultimo_pagamento ? `Último: ${fmtData(resumo.ultimo_pagamento.pago_em)}` : 'Sem pagamentos ainda'} />
                </div>

                {/* Link + nível + regras */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <Seccao titulo={<span className="flex items-center gap-2"><Link2 className="h-4 w-4 text-cyan-300" /> O seu link de indicação</span>}>
                        <div className="space-y-4 p-5">
                            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-sm text-cyan-200 break-all">{materiais.link}</div>
                            <div className="flex flex-wrap gap-2">
                                <CopiarBotao texto={materiais.link} label="Copiar link" />
                                <a href={materiais.whatsapp_url} target="_blank" rel="noopener noreferrer" className="btn-primary"><MessageCircle className="h-4 w-4" /> Partilhar no WhatsApp</a>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-lg bg-white/[0.03] p-3">
                                    <div className="text-[11px] uppercase tracking-wider text-white/40">Código</div>
                                    <div className="mt-1 text-lg font-bold tracking-widest text-white">{afiliado.codigo}</div>
                                </div>
                                <div className="rounded-lg bg-white/[0.03] p-3">
                                    <div className="text-[11px] uppercase tracking-wider text-white/40">Memorizado</div>
                                    <div className="mt-1 text-lg font-bold text-white">{config.cookie_dias} dias</div>
                                    <div className="text-[11px] text-white/40">após o clique</div>
                                </div>
                            </div>
                            <p className="text-xs text-white/50">O cliente pode também indicar o seu código no registo. Qualquer página pública do ONDAKA com <code className="text-cyan-200">?ref={afiliado.codigo}</code> funciona.</p>
                        </div>
                    </Seccao>

                    <Seccao titulo={<span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-purple-300" /> Nível e taxa de comissão</span>}>
                        <div className="space-y-4 p-5">
                            <ProgressoNivel clientes={resumo.clientes_pagantes} nivel={resumo.nivel} proximo={resumo.proximo_nivel} />
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40"><th className="py-1.5 text-left">Nível</th><th className="py-1.5 text-left">Clientes pagantes</th><th className="py-1.5 text-right">Comissão</th></tr></thead>
                                <tbody>
                                    {config.niveis.map((n) => (
                                        <tr key={n.nivel} className={n.nivel === resumo.nivel ? 'bg-white/[0.04]' : ''}>
                                            <td className="py-2"><NivelBadge nivel={n.nivel} /></td>
                                            <td className="py-2 text-white/70">{n.max_clientes === null ? `${n.min_clientes}+` : n.min_clientes === 0 ? `até ${n.max_clientes}` : `${n.min_clientes} a ${n.max_clientes}`}</td>
                                            <td className="py-2 text-right font-semibold text-white">{fmtPct(n.taxa_pct)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="text-xs text-white/50">A comissão aplica-se a <strong className="text-white/80">todos os pagamentos</strong> dos seus clientes à ONDAKA (subscrição, add-ons, pacotes SMS), sobre o valor <strong className="text-white/80">sem imposto</strong>.</p>
                        </div>
                    </Seccao>

                    <Seccao titulo={<span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-emerald-300" /> Pagamento das comissões</span>}>
                        <div className="space-y-3 p-5 text-sm">
                            <Linha k="Carência" v={`${resumo.carencia_dias} dias após o pagamento do cliente`} />
                            <Linha k="Mínimo para pagamento" v={fmtKz(resumo.pagamento_minimo_kz, 0)} />
                            <Linha k="Aprovado neste momento" v={<span className={resumo.atinge_minimo ? 'text-emerald-300 font-semibold' : 'text-white'}>{fmtKz(resumo.aprovada_kz)}</span>} />
                            <Linha k="Total gerado" v={fmtKz(resumo.total_gerado_kz)} />
                            <Linha k="Total recebido (líquido)" v={fmtKz(resumo.total_pago_liquido_kz)} />
                            <Linha k="Último pagamento" v={resumo.ultimo_pagamento ? `${resumo.ultimo_pagamento.numero} · ${fmtKz(resumo.ultimo_pagamento.valor_liquido_kz)} · ${fmtData(resumo.ultimo_pagamento.pago_em)}` : '—'} />
                            <Linha k="IBAN" v={afiliado.iban ? <span className="font-mono text-xs">{afiliado.iban}</span> : <Link href="/afiliado/dados" className="text-cyan-300 underline">preencher</Link>} />
                            {config.duracao_meses > 0 && <Linha k="Duração da indicação" v={`${config.duracao_meses} meses por cliente`} />}
                        </div>
                    </Seccao>
                </div>

                {/* Gráfico + materiais */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <Seccao className="lg:col-span-2" titulo="Comissões geradas nos últimos 12 meses" accoes={<span className="text-xs text-white/50">Este mês: <strong className="text-white">{fmtKz(resumo.mes_actual_kz)}</strong></span>}>
                        <div className="p-5">
                            {Number(resumo.total_gerado_kz) > 0 ? <BarrasMensais serie={resumo.serie_12m} altura={180} /> : <Vazio titulo="Ainda sem comissões" texto="Partilhe o seu link. Quando um cliente indicado pagar à ONDAKA, a comissão aparece aqui." />}
                        </div>
                    </Seccao>

                    <Seccao titulo="Materiais de divulgação">
                        <div className="space-y-4 p-5">
                            <Material icon={MessageCircle} titulo="Mensagem WhatsApp" texto={materiais.whatsapp} accao={<a href={materiais.whatsapp_url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">Abrir</a>} />
                            <Material icon={Mail} titulo="Email" texto={`${materiais.email_assunto}\n\n${materiais.email_corpo}`} accao={<a href={materiais.email_url} className="btn-ghost text-xs">Abrir</a>} />
                            <Material icon={Smartphone} titulo="SMS" texto={materiais.sms} />
                        </div>
                    </Seccao>
                </div>

                {/* Últimas comissões + clientes recentes */}
                <div className="grid gap-4 xl:grid-cols-2">
                    <Seccao titulo="Últimas comissões" accoes={<Link href="/afiliado/comissoes" className="btn-ghost text-xs">Ver todas <ArrowRight className="h-3.5 w-3.5" /></Link>}>
                        {ultimas_comissoes.length === 0 ? <Vazio titulo="Sem comissões" texto="As comissões aparecem quando um cliente indicado paga." /> : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-white/10"><tr><Th>Data</Th><Th>Cliente</Th><Th>Descrição</Th><Th right>Base</Th><Th right>Taxa</Th><Th right>Comissão</Th><Th>Estado</Th></tr></thead>
                                    <tbody className="divide-y divide-white/5">
                                        {ultimas_comissoes.map((c) => (
                                            <tr key={c.id}>
                                                <Td>{fmtData(c.created_at)}</Td>
                                                <Td><span className="font-medium text-white">{c.empresa?.nome ?? '—'}</span></Td>
                                                <Td><span className="line-clamp-2 text-xs text-white/60">{c.descricao}</span></Td>
                                                <Td right mono>{fmtKz(c.valor_base_kz)}</Td>
                                                <Td right mono>{fmtPct(c.taxa_pct)}</Td>
                                                <Td right mono><span className="font-semibold text-emerald-300">{fmtKz(c.valor_comissao_kz)}</span></Td>
                                                <Td><EstadoComissaoBadge estado={c.estado} /></Td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Seccao>

                    <Seccao titulo="Clientes indicados recentes" accoes={<Link href="/afiliado/clientes" className="btn-ghost text-xs">Ver todos <ArrowRight className="h-3.5 w-3.5" /></Link>}>
                        {clientes_recentes.length === 0 ? <Vazio titulo="Ainda sem clientes" texto="Quando alguém se registar com o seu link, aparece aqui." /> : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-white/10"><tr><Th>Cliente</Th><Th>Registado</Th><Th>Subscrição</Th><Th right>Pagamentos</Th><Th right>Comissão gerada</Th></tr></thead>
                                    <tbody className="divide-y divide-white/5">
                                        {clientes_recentes.map((c) => (
                                            <tr key={c.id}>
                                                <Td><div className="font-medium text-white">{c.nome}</div><div className="text-xs text-white/40">{c.tipo_cliente === 'admin_independente' ? 'Admin. independente' : 'Empresa gestora'} · {c.provincia ?? '—'}</div></Td>
                                                <Td>{fmtData(c.atribuido_em ?? c.registado_em)}</Td>
                                                <Td><SubscricaoBadge estado={c.subscricao_estado} /></Td>
                                                <Td right mono>{c.n_pagamentos}</Td>
                                                <Td right mono><span className="font-semibold text-emerald-300">{fmtKz(c.comissao_kz)}</span></Td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Seccao>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Linha({ k, v }: { k: string; v: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-2 last:border-0 last:pb-0">
            <span className="text-white/50">{k}</span>
            <span className="text-right text-white">{v}</span>
        </div>
    );
}

function Material({ icon: Icon, titulo, texto, accao }: { icon: React.ElementType; titulo: string; texto: string; accao?: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-white"><Icon className="h-4 w-4 text-cyan-300" /> {titulo}</div>
                <div className="flex gap-1">{accao}<CopiarBotao texto={texto} label="Copiar" className="px-2.5 py-1.5 text-xs" /></div>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-white/60">{texto}</pre>
        </div>
    );
}
