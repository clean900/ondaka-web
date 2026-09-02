import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    ArrowLeft, Handshake, MousePointerClick, Building2, Users, Clock, CheckCircle2, Wallet, Mail, Phone, Landmark,
    Ban, Play, Percent, UserPlus, FileText, Trash2, StickyNote, ExternalLink,
} from 'lucide-react';
import {
    fmtKz, fmtNum, fmtPct, fmtData, fmtDataHora, StatCard, PageHeader, Seccao, Vazio, Th, Td, Modal, CopiarBotao,
    EstadoAfiliadoBadge, EstadoComissaoBadge, NivelBadge, SubscricaoBadge, ProgressoNivel, BarrasMensais,
} from '@/Components/Afiliados/ui';
import type { Afiliado, ResumoAfiliado, ClienteIndicado, Comissao, Pagamento, ConfigAfiliados } from '@/types/afiliados';

interface ComissaoAprovada { id: number; descricao: string; origem_numero: string | null; empresa: string | null; valor_comissao_kz: string; aprovada_em: string | null }
interface Props {
    afiliado: Afiliado;
    resumo: ResumoAfiliado;
    clientes: ClienteIndicado[];
    comissoes: Comissao[];
    comissoes_aprovadas: ComissaoAprovada[];
    pagamentos: Pagamento[];
    empresas_disponiveis: { id: number; nome: string; nif: string | null; tipo_cliente: string }[];
    config: ConfigAfiliados;
}

export default function Show({ afiliado, resumo, clientes, comissoes, comissoes_aprovadas, pagamentos, empresas_disponiveis, config }: Props) {
    const [modal, setModal] = useState<null | 'recusar' | 'suspender' | 'taxa' | 'atribuir' | 'pagar' | 'anular'>(null);
    const [comissaoAnular, setComissaoAnular] = useState<Comissao | null>(null);
    const base = `/super-admin/afiliados/${afiliado.id}`;

    const fMotivo = useForm({ motivo: '' });
    const fTaxa = useForm<{ taxa_manual_pct: string }>({ taxa_manual_pct: afiliado.taxa_manual_pct ?? '' });
    const fNotas = useForm({ notas_admin: afiliado.notas_admin ?? '' });
    const fAtribuir = useForm({ empresa_id: '', notificar: true });
    const fAnular = useForm({ motivo: '' });
    const fPagar = useForm<{ comissoes: number[]; retencao_pct: string; metodo: string; referencia_bancaria: string; iban_destino: string; pago_em: string; notas: string; comprovativo: File | null }>({
        comissoes: comissoes_aprovadas.map((c) => c.id),
        retencao_pct: config.retencao_pct,
        metodo: 'transferencia_bancaria',
        referencia_bancaria: '',
        iban_destino: afiliado.iban ?? '',
        pago_em: new Date().toISOString().slice(0, 10),
        notas: '',
        comprovativo: null,
    });

    const totalSel = useMemo(() => comissoes_aprovadas.filter((c) => fPagar.data.comissoes.includes(c.id)).reduce((s, c) => s + Number(c.valor_comissao_kz), 0), [fPagar.data.comissoes, comissoes_aprovadas]);
    const retSel = Math.round(totalSel * (Number(fPagar.data.retencao_pct) || 0)) / 100;
    const liqSel = totalSel - retSel;

    const abrir = (m: typeof modal) => { fMotivo.reset(); fAnular.reset(); setModal(m); };
    const postMotivo = (accao: 'recusar' | 'suspender') => fMotivo.post(`${base}/${accao}`, { preserveScroll: true, onSuccess: () => setModal(null) });

    return (
        <AuthenticatedLayout>
            <Head title={`Afiliado: ${afiliado.nome}`} />
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader
                    icon={Handshake}
                    titulo={afiliado.nome}
                    subtitulo={<span className="flex flex-wrap items-center gap-2"><Link href="/super-admin/afiliados" className="inline-flex items-center gap-1 text-cyan-300 hover:underline"><ArrowLeft className="h-3.5 w-3.5" /> Afiliados</Link> · <EstadoAfiliadoBadge estado={afiliado.estado} /> <NivelBadge nivel={afiliado.nivel} taxa={afiliado.taxa_actual_pct} /> {afiliado.taxa_manual_pct !== null && <span className="text-xs text-purple-300">taxa manual</span>} · código <span className="font-mono text-white">{afiliado.codigo}</span></span>}
                    accoes={<>
                        {afiliado.estado === 'pendente' && <><button type="button" onClick={() => { if (confirm(`Aprovar ${afiliado.nome}?`)) router.post(`${base}/aprovar`, {}, { preserveScroll: true }); }} className="btn-primary"><CheckCircle2 className="h-4 w-4" /> Aprovar</button><button type="button" onClick={() => abrir('recusar')} className="btn-danger"><Ban className="h-4 w-4" /> Recusar</button></>}
                        {afiliado.estado === 'activo' && <button type="button" onClick={() => abrir('suspender')} className="btn-danger"><Ban className="h-4 w-4" /> Suspender</button>}
                        {(afiliado.estado === 'suspenso' || afiliado.estado === 'recusado') && <button type="button" onClick={() => { if (confirm('Reactivar este afiliado?')) router.post(`${base}/reactivar`, {}, { preserveScroll: true }); }} className="btn-primary"><Play className="h-4 w-4" /> Reactivar</button>}
                        <button type="button" onClick={() => abrir('taxa')} className="btn-secondary"><Percent className="h-4 w-4" /> Taxa</button>
                        <button type="button" onClick={() => abrir('atribuir')} className="btn-secondary"><UserPlus className="h-4 w-4" /> Atribuir cliente</button>
                        <button type="button" onClick={() => abrir('pagar')} disabled={comissoes_aprovadas.length === 0} className="btn-primary"><Wallet className="h-4 w-4" /> Registar pagamento{comissoes_aprovadas.length > 0 && ` (${fmtKz(resumo.aprovada_kz, 0)})`}</button>
                    </>}
                />

                {afiliado.estado === 'suspenso' && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"><strong>Suspenso</strong> a {fmtDataHora(afiliado.suspenso_em)}: {afiliado.motivo_suspensao}</div>}
                {afiliado.estado === 'recusado' && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"><strong>Recusado:</strong> {afiliado.motivo_recusa}</div>}
                {afiliado.estado === 'activo' && !afiliado.dados_pagamento_completos && <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200"><strong>Sem IBAN.</strong> O afiliado ainda não preencheu os dados bancários — não é possível pagar.</div>}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
                    <StatCard label="Cliques" valor={fmtNum(resumo.cliques)} icon={MousePointerClick} tom="neutro" />
                    <StatCard label="Registos" valor={fmtNum(resumo.registos)} icon={Building2} tom="ciano" sub={`${resumo.registos_mes} este mês`} />
                    <StatCard label="Clientes pagantes" valor={fmtNum(resumo.clientes_pagantes)} icon={Users} tom="roxo" sub={`${resumo.clientes_activos} activos`} />
                    <StatCard label="Base gerada" valor={fmtKz(resumo.base_gerada_kz, 0)} icon={Building2} tom="neutro" sub="sem imposto" />
                    <StatCard label="Em carência" valor={fmtKz(resumo.pendente_kz, 0)} icon={Clock} tom="amber" sub={`${resumo.pendente_n}`} />
                    <StatCard label="Aprovado a pagar" valor={fmtKz(resumo.aprovada_kz, 0)} icon={CheckCircle2} tom={resumo.atinge_minimo ? 'verde' : 'ciano'} sub={resumo.atinge_minimo ? '≥ mínimo' : `mínimo ${fmtKz(resumo.pagamento_minimo_kz, 0)}`} />
                    <StatCard label="Pago (líquido)" valor={fmtKz(resumo.total_pago_liquido_kz, 0)} icon={Wallet} tom="verde" sub={`${pagamentos.length} pagamento(s)`} />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Seccao titulo="Perfil">
                        <div className="space-y-2 p-5 text-sm">
                            <L k="Tipo" v={afiliado.tipo === 'empresa' ? 'Empresa' : 'Particular'} />
                            <L k="Email" v={<span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-white/40" /> {afiliado.email}</span>} />
                            <L k="Telefone" v={<span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-white/40" /> {afiliado.telefone ?? '—'}</span>} />
                            <L k="NIF" v={afiliado.nif ?? '—'} />
                            <L k="Utilizador" v={afiliado.user ? `${afiliado.user.name} (#${afiliado.user.id})` : '—'} />
                            <L k="Empresa cliente ligada" v={afiliado.empresa_gestora ? <Link href={`/super-admin/clientes/${afiliado.empresa_gestora.id}`} className="text-cyan-300 hover:underline">{afiliado.empresa_gestora.nome}</Link> : '—'} />
                            <L k="Candidatura" v={fmtDataHora(afiliado.created_at)} />
                            <L k="Aprovado" v={afiliado.aprovado_em ? `${fmtDataHora(afiliado.aprovado_em)}${afiliado.aprovado_por ? ` por ${afiliado.aprovado_por}` : ''}` : '—'} />
                            <div className="pt-2">
                                <div className="text-[11px] uppercase tracking-wider text-white/40">Link</div>
                                <div className="mt-1 flex items-center gap-2"><code className="flex-1 truncate rounded bg-black/30 px-2 py-1 text-xs text-cyan-200">{afiliado.link}</code><CopiarBotao texto={afiliado.link} label="" className="px-2 py-1" /></div>
                            </div>
                            {afiliado.como_divulga && <div className="pt-2"><div className="text-[11px] uppercase tracking-wider text-white/40">Como divulga</div><div className="mt-1 text-xs leading-relaxed text-white/70">{afiliado.como_divulga}</div></div>}
                        </div>
                    </Seccao>

                    <Seccao titulo={<span className="flex items-center gap-2"><Landmark className="h-4 w-4 text-emerald-300" /> Dados de pagamento</span>}>
                        <div className="space-y-2 p-5 text-sm">
                            <L k="IBAN" v={<span className="font-mono text-xs">{afiliado.iban ?? '—'}</span>} />
                            <L k="Banco" v={afiliado.banco ?? '—'} />
                            <L k="Titular" v={afiliado.titular_conta ?? '—'} />
                            <L k="Último pagamento" v={resumo.ultimo_pagamento ? `${resumo.ultimo_pagamento.numero} · ${fmtKz(resumo.ultimo_pagamento.valor_liquido_kz)} · ${fmtData(resumo.ultimo_pagamento.pago_em)}` : '—'} />
                            <div className="pt-3"><ProgressoNivel clientes={resumo.clientes_pagantes} nivel={resumo.nivel} proximo={resumo.proximo_nivel} /></div>
                        </div>
                    </Seccao>

                    <Seccao titulo={<span className="flex items-center gap-2"><StickyNote className="h-4 w-4 text-amber-300" /> Notas internas</span>}>
                        <form onSubmit={(e) => { e.preventDefault(); fNotas.patch(`${base}/notas`, { preserveScroll: true }); }} className="space-y-3 p-5">
                            <textarea className="input min-h-[140px]" value={fNotas.data.notas_admin} onChange={(e) => fNotas.setData('notas_admin', e.target.value)} placeholder="Só visível ao super-admin. Ex.: contacto feito por telefone, acordo especial…" />
                            <div className="flex justify-end"><button type="submit" disabled={fNotas.processing || !fNotas.isDirty} className="btn-secondary">Guardar notas</button></div>
                        </form>
                    </Seccao>
                </div>

                <Seccao titulo="Comissões nos últimos 12 meses">
                    <div className="p-5">{Number(resumo.total_gerado_kz) > 0 ? <BarrasMensais serie={resumo.serie_12m} altura={120} /> : <Vazio titulo="Sem comissões ainda" />}</div>
                </Seccao>

                <Seccao titulo={`Clientes indicados (${clientes.length})`}>
                    {clientes.length === 0 ? <Vazio titulo="Sem clientes indicados" texto="Use «Atribuir cliente» para ligar manualmente um cliente existente (indicação feita fora do link)." /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10"><tr><Th>Cliente</Th><Th>Registado</Th><Th>Origem</Th><Th>Subscrição</Th><Th right>Imóveis</Th><Th right>Pagamentos</Th><Th right>Base</Th><Th right>Comissão</Th><Th>Indicação</Th><Th></Th></tr></thead>
                                <tbody className="divide-y divide-white/5">
                                    {clientes.map((c) => (
                                        <tr key={c.id} className="hover:bg-white/[0.02]">
                                            <Td><Link href={`/super-admin/clientes/${c.id}`} className="font-medium text-white hover:text-cyan-300">{c.nome}</Link><div className="text-xs text-white/40">{c.tipo_cliente === 'admin_independente' ? 'Admin. independente' : 'Empresa gestora'} · {[c.municipio, c.provincia].filter(Boolean).join(', ')}</div></Td>
                                            <Td>{fmtData(c.atribuido_em ?? c.registado_em)}</Td>
                                            <Td>{c.origem === 'manual' ? <span className="badge bg-white/5 text-white/60 border border-white/10">Manual</span> : <span className="badge-info">Link</span>}</Td>
                                            <Td><SubscricaoBadge estado={c.subscricao_estado} /></Td>
                                            <Td right mono>{c.num_imoveis}</Td>
                                            <Td right mono>{c.n_pagamentos}</Td>
                                            <Td right mono>{fmtKz(c.base_kz)}</Td>
                                            <Td right mono><span className="text-emerald-300">{fmtKz(c.comissao_kz)}</span></Td>
                                            <Td>{c.atribuicao_activa ? <span className="badge-success">{c.expira_em ? `até ${fmtData(c.expira_em)}` : 'vitalícia'}</span> : <span className="badge-danger">expirou</span>}</Td>
                                            <Td><button type="button" onClick={() => { if (confirm(`Remover a atribuição de ${c.nome}? As comissões já geradas mantêm-se.`)) router.post(`${base}/remover-cliente`, { empresa_id: c.id }, { preserveScroll: true }); }} className="btn-ghost px-2 py-1 text-xs text-red-300"><Trash2 className="h-3.5 w-3.5" /></button></Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Seccao>

                <Seccao titulo={`Comissões (${comissoes.length}${comissoes.length >= 100 ? ' mais recentes' : ''})`} accoes={<Link href={`/super-admin/afiliados/comissoes?afiliado_id=${afiliado.id}`} className="btn-ghost text-xs">Livro-razão completo <ExternalLink className="h-3.5 w-3.5" /></Link>}>
                    {comissoes.length === 0 ? <Vazio titulo="Sem comissões" /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10"><tr><Th>Data</Th><Th>Cliente</Th><Th>Documento</Th><Th right>Pago c/ imp.</Th><Th right>Base</Th><Th right>Taxa</Th><Th right>Comissão</Th><Th>Estado</Th><Th>Detalhe</Th><Th></Th></tr></thead>
                                <tbody className="divide-y divide-white/5">
                                    {comissoes.map((c) => (
                                        <tr key={c.id} className="hover:bg-white/[0.02]">
                                            <Td>{fmtData(c.pago_pelo_cliente_em ?? c.created_at)}</Td>
                                            <Td>{c.empresa?.nome ?? '—'}</Td>
                                            <Td><div className="font-mono text-xs text-white">{c.origem_numero ?? '—'}</div><div className="line-clamp-1 max-w-[280px] text-xs text-white/50">{c.descricao}</div></Td>
                                            <Td right mono>{fmtKz(c.valor_pago_total_kz)}</Td>
                                            <Td right mono>{fmtKz(c.valor_base_kz)}</Td>
                                            <Td right mono>{fmtPct(c.taxa_pct)}</Td>
                                            <Td right mono><span className="font-semibold text-emerald-300">{fmtKz(c.valor_comissao_kz)}</span></Td>
                                            <Td><EstadoComissaoBadge estado={c.estado} /></Td>
                                            <Td><div className="text-xs text-white/50">{c.estado === 'pendente' && <>Aprova a {fmtData(c.disponivel_em)}</>}{c.estado === 'aprovada' && <>Aprovada {fmtData(c.aprovada_em)}</>}{c.estado === 'paga' && <>{c.pagamento?.numero} · {fmtData(c.paga_em)}</>}{c.estado === 'anulada' && <>{c.motivo_anulacao}</>}</div></Td>
                                            <Td><div className="flex justify-end gap-1">
                                                {c.estado === 'pendente' && <button type="button" onClick={() => { if (confirm('Aprovar antes do fim da carência?')) router.post(`/super-admin/afiliados/comissoes/${c.id}/aprovar`, {}, { preserveScroll: true }); }} className="btn-ghost px-2 py-1 text-xs">Aprovar</button>}
                                                {(c.estado === 'pendente' || c.estado === 'aprovada') && <button type="button" onClick={() => { setComissaoAnular(c); abrir('anular'); }} className="btn-ghost px-2 py-1 text-xs text-red-300">Anular</button>}
                                            </div></Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Seccao>

                <Seccao titulo={`Pagamentos (${pagamentos.length})`}>
                    {pagamentos.length === 0 ? <Vazio titulo="Ainda sem pagamentos" texto="Quando houver comissões aprovadas, use «Registar pagamento»." /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10"><tr><Th>Nº</Th><Th>Data</Th><Th right>Comissões</Th><Th right>Bruto</Th><Th right>Retenção</Th><Th right>Líquido</Th><Th>Método</Th><Th>Referência</Th><Th>IBAN</Th><Th>Comprovativo</Th><Th>Registado por</Th></tr></thead>
                                <tbody className="divide-y divide-white/5">
                                    {pagamentos.map((p) => (
                                        <tr key={p.id}>
                                            <Td><span className="font-mono text-white">{p.numero}</span></Td><Td>{fmtData(p.pago_em)}</Td><Td right mono>{p.num_comissoes}</Td><Td right mono>{fmtKz(p.valor_bruto_kz)}</Td>
                                            <Td right mono><span className="text-white/50">{Number(p.retencao_valor_kz) > 0 ? `${fmtKz(p.retencao_valor_kz)} (${fmtPct(p.retencao_pct)})` : '—'}</span></Td>
                                            <Td right mono><span className="font-semibold text-emerald-300">{fmtKz(p.valor_liquido_kz)}</span></Td>
                                            <Td>{p.metodo_label}</Td><Td><span className="font-mono text-xs">{p.referencia_bancaria ?? '—'}</span></Td><Td><span className="font-mono text-xs">{p.iban_destino ?? '—'}</span></Td>
                                            <Td>{p.tem_comprovativo ? <a href={`/super-admin/afiliados/pagamentos/${p.id}/comprovativo`} target="_blank" rel="noopener noreferrer" className="btn-ghost px-2 py-1 text-xs"><FileText className="h-3.5 w-3.5" /> Ver</a> : '—'}</Td>
                                            <Td>{p.registado_por ?? '—'}{p.notas && <div className="text-xs text-white/40">{p.notas}</div>}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Seccao>
            </div>

            {/* ===== Modais ===== */}
            <Modal aberto={modal === 'recusar'} onClose={() => setModal(null)} titulo="Recusar candidatura">
                <form onSubmit={(e) => { e.preventDefault(); postMotivo('recusar'); }} className="space-y-3">
                    <p className="text-sm text-white/60">O afiliado recebe um email com o motivo.</p>
                    <input className="input" value={fMotivo.data.motivo} onChange={(e) => fMotivo.setData('motivo', e.target.value)} placeholder="Motivo" required minLength={3} />
                    {fMotivo.errors.motivo && <div className="text-xs text-red-400">{fMotivo.errors.motivo}</div>}
                    <div className="flex justify-end gap-2"><button type="button" onClick={() => setModal(null)} className="btn-ghost">Cancelar</button><button type="submit" disabled={fMotivo.processing} className="btn-danger">Recusar</button></div>
                </form>
            </Modal>

            <Modal aberto={modal === 'suspender'} onClose={() => setModal(null)} titulo="Suspender afiliado">
                <form onSubmit={(e) => { e.preventDefault(); postMotivo('suspender'); }} className="space-y-3">
                    <p className="text-sm text-white/60">Enquanto suspenso, o link não atribui clientes e não são criadas comissões. As comissões existentes mantêm-se.</p>
                    <input className="input" value={fMotivo.data.motivo} onChange={(e) => fMotivo.setData('motivo', e.target.value)} placeholder="Motivo (visível ao afiliado)" required minLength={3} />
                    {fMotivo.errors.motivo && <div className="text-xs text-red-400">{fMotivo.errors.motivo}</div>}
                    <div className="flex justify-end gap-2"><button type="button" onClick={() => setModal(null)} className="btn-ghost">Cancelar</button><button type="submit" disabled={fMotivo.processing} className="btn-danger">Suspender</button></div>
                </form>
            </Modal>

            <Modal aberto={modal === 'taxa'} onClose={() => setModal(null)} titulo="Taxa de comissão">
                <form onSubmit={(e) => { e.preventDefault(); fTaxa.patch(`${base}/taxa`, { preserveScroll: true, onSuccess: () => setModal(null) }); }} className="space-y-3">
                    <div className="rounded-lg bg-white/[0.03] p-3 text-sm text-white/70">Nível automático actual: <NivelBadge nivel={resumo.nivel} /> com {resumo.clientes_pagantes} cliente(s) pagante(s) → {fmtPct(config.niveis.find((n) => n.nivel === resumo.nivel)?.taxa_pct ?? 0)}. Uma taxa manual substitui o nível (deixe vazio para voltar ao automático).</div>
                    <div><label className="mb-1 block text-xs text-white/60">Taxa manual (%)</label><input type="number" step="0.5" min={0} max={100} className="input" value={fTaxa.data.taxa_manual_pct} onChange={(e) => fTaxa.setData('taxa_manual_pct', e.target.value)} placeholder="Ex.: 12" />{fTaxa.errors.taxa_manual_pct && <div className="mt-1 text-xs text-red-400">{fTaxa.errors.taxa_manual_pct}</div>}</div>
                    <div className="flex justify-end gap-2"><button type="button" onClick={() => setModal(null)} className="btn-ghost">Cancelar</button><button type="submit" disabled={fTaxa.processing} className="btn-primary">Guardar</button></div>
                </form>
            </Modal>

            <Modal aberto={modal === 'atribuir'} onClose={() => setModal(null)} titulo="Atribuir cliente existente">
                <form onSubmit={(e) => { e.preventDefault(); fAtribuir.post(`${base}/atribuir-cliente`, { preserveScroll: true, onSuccess: () => { setModal(null); fAtribuir.reset(); } }); }} className="space-y-3">
                    <p className="text-sm text-white/60">Para indicações feitas fora do link (contacto directo, evento). Só aparecem clientes ainda sem afiliado. A partir daqui, os pagamentos deste cliente geram comissão.</p>
                    <select className="input" value={fAtribuir.data.empresa_id} onChange={(e) => fAtribuir.setData('empresa_id', e.target.value)} required>
                        <option value="">Seleccionar cliente…</option>
                        {empresas_disponiveis.map((e) => <option key={e.id} value={e.id}>{e.nome}{e.nif ? ` · ${e.nif}` : ''} ({e.tipo_cliente === 'admin_independente' ? 'Admin. indep.' : 'Empresa'})</option>)}
                    </select>
                    {fAtribuir.errors.empresa_id && <div className="text-xs text-red-400">{fAtribuir.errors.empresa_id}</div>}
                    <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={fAtribuir.data.notificar} onChange={(e) => fAtribuir.setData('notificar', e.target.checked)} /> Notificar o afiliado por email</label>
                    <div className="flex justify-end gap-2"><button type="button" onClick={() => setModal(null)} className="btn-ghost">Cancelar</button><button type="submit" disabled={fAtribuir.processing || !fAtribuir.data.empresa_id} className="btn-primary">Atribuir</button></div>
                </form>
            </Modal>

            <Modal aberto={modal === 'anular'} onClose={() => setModal(null)} titulo="Anular comissão">
                {comissaoAnular && (
                    <form onSubmit={(e) => { e.preventDefault(); fAnular.post(`/super-admin/afiliados/comissoes/${comissaoAnular.id}/anular`, { preserveScroll: true, onSuccess: () => setModal(null) }); }} className="space-y-3">
                        <div className="rounded-lg bg-white/[0.03] p-3 text-sm"><div className="text-white">{comissaoAnular.descricao}</div><div className="text-xs text-white/50">{fmtKz(comissaoAnular.valor_comissao_kz)}</div></div>
                        <input className="input" value={fAnular.data.motivo} onChange={(e) => fAnular.setData('motivo', e.target.value)} placeholder="Motivo (visível ao afiliado)" required minLength={3} />
                        {fAnular.errors.motivo && <div className="text-xs text-red-400">{fAnular.errors.motivo}</div>}
                        <div className="flex justify-end gap-2"><button type="button" onClick={() => setModal(null)} className="btn-ghost">Cancelar</button><button type="submit" disabled={fAnular.processing} className="btn-danger">Anular</button></div>
                    </form>
                )}
            </Modal>

            <Modal aberto={modal === 'pagar'} onClose={() => setModal(null)} titulo={`Registar pagamento a ${afiliado.nome}`} largura="max-w-3xl">
                <form onSubmit={(e) => { e.preventDefault(); fPagar.post(`${base}/pagamentos`, { preserveScroll: true, forceFormData: true, onSuccess: () => setModal(null) }); }} className="space-y-4">
                    <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-white/60"><span>Comissões aprovadas a incluir</span><span className="flex gap-2"><button type="button" onClick={() => fPagar.setData('comissoes', comissoes_aprovadas.map((c) => c.id))} className="text-cyan-300 hover:underline">todas</button><button type="button" onClick={() => fPagar.setData('comissoes', [])} className="text-cyan-300 hover:underline">nenhuma</button></span></div>
                        <div className="max-h-56 overflow-y-auto rounded-lg border border-white/10">
                            {comissoes_aprovadas.map((c) => (
                                <label key={c.id} className="flex cursor-pointer items-center gap-3 border-b border-white/5 px-3 py-2 text-sm last:border-0 hover:bg-white/[0.03]">
                                    <input type="checkbox" checked={fPagar.data.comissoes.includes(c.id)} onChange={(e) => fPagar.setData('comissoes', e.target.checked ? [...fPagar.data.comissoes, c.id] : fPagar.data.comissoes.filter((id) => id !== c.id))} />
                                    <span className="min-w-0 flex-1 truncate text-white/80">{c.origem_numero && <span className="font-mono text-white">{c.origem_numero} · </span>}{c.empresa} — {c.descricao}</span>
                                    <span className="text-xs text-white/40">{fmtData(c.aprovada_em)}</span>
                                    <span className="font-mono text-emerald-300">{fmtKz(c.valor_comissao_kz)}</span>
                                </label>
                            ))}
                        </div>
                        {fPagar.errors.comissoes && <div className="mt-1 text-xs text-red-400">{fPagar.errors.comissoes}</div>}
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                        <div><label className="mb-1 block text-xs text-white/60">Retenção na fonte (%)</label><input type="number" step="0.5" min={0} max={100} className="input" value={fPagar.data.retencao_pct} onChange={(e) => fPagar.setData('retencao_pct', e.target.value)} /></div>
                        <div><label className="mb-1 block text-xs text-white/60">Método</label><select className="input" value={fPagar.data.metodo} onChange={(e) => fPagar.setData('metodo', e.target.value)}><option value="transferencia_bancaria">Transferência bancária</option><option value="deposito">Depósito</option><option value="multicaixa_express">Multicaixa Express</option><option value="outro">Outro</option></select></div>
                        <div><label className="mb-1 block text-xs text-white/60">Data do pagamento</label><input type="date" className="input" value={fPagar.data.pago_em} onChange={(e) => fPagar.setData('pago_em', e.target.value)} required /></div>
                        <div><label className="mb-1 block text-xs text-white/60">Referência bancária</label><input className="input" value={fPagar.data.referencia_bancaria} onChange={(e) => fPagar.setData('referencia_bancaria', e.target.value)} /></div>
                        <div><label className="mb-1 block text-xs text-white/60">IBAN de destino</label><input className="input font-mono" value={fPagar.data.iban_destino} onChange={(e) => fPagar.setData('iban_destino', e.target.value)} /></div>
                        <div><label className="mb-1 block text-xs text-white/60">Comprovativo (PDF/imagem)</label><input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="input text-xs" onChange={(e) => fPagar.setData('comprovativo', e.target.files?.[0] ?? null)} />{fPagar.errors.comprovativo && <div className="mt-1 text-xs text-red-400">{fPagar.errors.comprovativo}</div>}</div>
                        <div className="md:col-span-3"><label className="mb-1 block text-xs text-white/60">Notas</label><input className="input" value={fPagar.data.notas} onChange={(e) => fPagar.setData('notas', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 rounded-lg bg-white/[0.03] p-3 text-sm">
                        <div><div className="text-xs text-white/40">Bruto ({fPagar.data.comissoes.length})</div><div className="font-mono text-white">{fmtKz(totalSel)}</div></div>
                        <div><div className="text-xs text-white/40">Retenção</div><div className="font-mono text-amber-300">- {fmtKz(retSel)}</div></div>
                        <div><div className="text-xs text-white/40">Líquido a pagar</div><div className="font-mono text-lg font-bold text-emerald-300">{fmtKz(liqSel)}</div></div>
                    </div>
                    {totalSel > 0 && totalSel < Number(config.pagamento_minimo_kz) && <div className="text-xs text-amber-300">Abaixo do mínimo configurado ({fmtKz(config.pagamento_minimo_kz, 0)}). Pode registar na mesma.</div>}
                    <div className="flex justify-end gap-2"><button type="button" onClick={() => setModal(null)} className="btn-ghost">Cancelar</button><button type="submit" disabled={fPagar.processing || fPagar.data.comissoes.length === 0} className="btn-primary"><Wallet className="h-4 w-4" /> Registar pagamento</button></div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

function L({ k, v }: { k: string; v: React.ReactNode }) {
    return <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-2 last:border-0 last:pb-0"><span className="text-white/50">{k}</span><span className="text-right text-white">{v}</span></div>;
}
