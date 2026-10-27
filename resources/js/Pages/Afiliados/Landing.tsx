import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Handshake, Link2, Building2, Wallet, ShieldCheck, Clock, ArrowRight, CheckCircle2, Eye, EyeOff, ChevronDown, Smartphone, MessageSquare, Receipt } from 'lucide-react';
import { fmtKz, fmtPct, NivelBadge } from '@/Components/Afiliados/ui';
import type { ConfigAfiliados } from '@/types/afiliados';

interface Props {
    config: ConfigAfiliados;
    autenticado: boolean;
    ja_afiliado: boolean;
    exemplo: { preco_imovel_mes: string; imoveis: number; meses: number; base_kz: string; comissoes: Record<string, string> };
}

export default function Landing({ config, autenticado, ja_afiliado, exemplo }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        nome: '', tipo: 'particular', nif: '', email: '', telefone: '', como_divulga: '', password: '', password_confirmation: '', aceita_termos: false,
    });

    const faqs = [
        { q: 'O que conta para a comissão?', a: `Todos os pagamentos que o cliente indicado faz à ONDAKA: subscrição mensal/semestral/anual, add-ons da loja e pacotes de SMS. A base é o valor sem imposto (IVA/IPC). Os pagamentos dos condóminos ao condomínio não são receita da ONDAKA e não contam.` },
        { q: 'Durante quanto tempo recebo?', a: config.duracao_meses > 0 ? `Durante ${config.duracao_meses} meses após o registo do cliente.` : 'Enquanto o cliente for cliente da ONDAKA — a indicação é vitalícia.' },
        { q: 'Como é que o cliente fica ligado a mim?', a: `Ao abrir o seu link, o código fica memorizado no browser durante ${config.cookie_dias} dias. Se o cliente se registar nesse período, fica atribuído a si. Também pode indicar o seu código directamente no registo.` },
        { q: 'Quando e como sou pago?', a: `Cada comissão tem ${config.carencia_dias} dias de carência (protecção contra estornos) e passa depois a aprovada. Quando o total aprovado atinge ${fmtKz(config.pagamento_minimo_kz, 0)}, a ONDAKA paga por transferência bancária para o seu IBAN e disponibiliza o comprovativo no seu painel.` },
        { q: 'Como subo de nível?', a: `O nível depende do número de clientes indicados que já pagaram pelo menos uma vez: ${config.niveis.map((n) => `${n.label} ${fmtPct(n.taxa_pct)} (${n.max_clientes === null ? n.min_clientes + '+' : n.min_clientes === 0 ? 'até ' + n.max_clientes : n.min_clientes + '–' + n.max_clientes} clientes)`).join(', ')}. A subida é automática e aplica-se às comissões seguintes.` },
        { q: 'Posso indicar a minha própria empresa?', a: 'Não. Auto-indicações e clientes já registados na ONDAKA não geram comissão. Uma empresa gestora que já é cliente pode, no entanto, aderir ao programa e indicar outras.' },
    ];
    const [faqAberta, setFaqAberta] = useState<number | null>(0);

    return (
        <>
            <Head title="Programa de Afiliados · ONDAKA" />
            <div className="min-h-screen bg-[#0a0a1a] text-zinc-100" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
                <header className="sticky top-0 z-50 border-b border-blue-900/30 bg-[#0a0a1a]/90 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/img/ondaka-logo.png" alt="ONDAKA" className="h-9 w-9 rounded" />
                            <div><div className="text-base font-bold tracking-wide">ONDAKA</div><div className="text-[10px] text-zinc-500">Programa de Afiliados</div></div>
                        </Link>
                        <nav className="hidden gap-8 text-sm md:flex">
                            <a href="#como" className="text-zinc-300 hover:text-white">Como funciona</a>
                            <a href="#niveis" className="text-zinc-300 hover:text-white">Comissões</a>
                            <a href="#regras" className="text-zinc-300 hover:text-white">Regras</a>
                            <a href="#faq" className="text-zinc-300 hover:text-white">Perguntas</a>
                            <Link href="/login" className="text-zinc-300 hover:text-white">Entrar</Link>
                        </nav>
                        <a href={ja_afiliado ? '/afiliado' : autenticado ? '/afiliado/aderir' : '#candidatura'} className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-purple-500">
                            {ja_afiliado ? 'O meu painel →' : 'Quero ser afiliado →'}
                        </a>
                    </div>
                </header>

                {/* HERO */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-purple-900/30" />
                    <div className="absolute left-0 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
                    <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />
                    <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-200"><Handshake className="h-3.5 w-3.5" /> Programa de Afiliados ONDAKA</div>
                            <h1 className="text-4xl font-bold leading-tight md:text-5xl">Indique gestoras de condomínio. <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Ganhe {fmtPct(config.taxa_min_pct)} a {fmtPct(config.taxa_max_pct)}</span> de tudo o que pagarem.</h1>
                            <p className="mt-5 max-w-xl text-lg text-zinc-400">Cada empresa gestora ou administrador independente que se registar com o seu link gera-lhe comissão em <strong className="text-zinc-200">todos os pagamentos</strong> que fizer à ONDAKA — subscrição, add-ons e SMS — {config.duracao_meses > 0 ? `durante ${config.duracao_meses} meses` : 'para sempre'}.</p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <a href={ja_afiliado ? '/afiliado' : autenticado ? '/afiliado/aderir' : '#candidatura'} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 hover:from-blue-400 hover:to-purple-500">{ja_afiliado ? 'Abrir o meu painel' : 'Candidatar-me agora'} <ArrowRight className="h-4 w-4" /></a>
                                <a href="#como" className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 hover:border-zinc-500">Ver como funciona</a>
                            </div>
                            <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
                                <Kpi v={`${fmtPct(config.taxa_min_pct)}–${fmtPct(config.taxa_max_pct)}`} l="comissão por pagamento" />
                                <Kpi v={config.duracao_meses > 0 ? `${config.duracao_meses} meses` : 'Vitalício'} l="por cliente indicado" />
                                <Kpi v={`${config.carencia_dias} dias`} l="de carência, depois é pago" />
                            </div>
                        </div>
                        {/* Exemplo */}
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
                            <div className="text-xs uppercase tracking-wider text-zinc-500">Exemplo real</div>
                            <div className="mt-1 text-lg font-semibold">Um cliente com {exemplo.imoveis} imóveis, durante {exemplo.meses} meses</div>
                            <div className="mt-4 space-y-2 text-sm">
                                <Row k={`${exemplo.imoveis} imóveis × ${fmtKz(exemplo.preco_imovel_mes, 0)}/mês × ${exemplo.meses} meses`} v={<span className="font-mono">{fmtKz(exemplo.base_kz, 0)}</span>} />
                                <div className="text-xs text-zinc-500">valor sem imposto, sem descontos de período</div>
                            </div>
                            <div className="mt-5 grid grid-cols-3 gap-3">
                                {config.niveis.map((n) => (
                                    <div key={n.nivel} className="rounded-xl border border-zinc-800 bg-black/30 p-3 text-center">
                                        <NivelBadge nivel={n.nivel} />
                                        <div className="mt-2 text-xs text-zinc-500">{fmtPct(n.taxa_pct)}</div>
                                        <div className="mt-1 text-lg font-bold text-emerald-300">{fmtKz(exemplo.comissoes[n.nivel], 0)}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-xs text-zinc-500">A sua comissão por esse cliente, num ano. Add-ons e pacotes SMS que o cliente compre somam-se.</div>
                        </div>
                    </div>
                </section>

                {/* COMO FUNCIONA */}
                <section id="como" className="border-t border-blue-900/30 py-16">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="text-3xl font-bold">Como funciona</h2>
                        <p className="mt-2 text-zinc-400">Três passos. Sem custos, sem quotas mínimas.</p>
                        <div className="mt-8 grid gap-6 md:grid-cols-3">
                            <Passo n="1" icon={Link2} titulo="Recebe o seu link" texto={`Depois de aprovado, tem um código e um link únicos no seu painel. Partilhe por WhatsApp, email, SMS ou em pessoa. Quem clicar fica ligado a si durante ${config.cookie_dias} dias.`} />
                            <Passo n="2" icon={Building2} titulo="O cliente regista-se e usa a ONDAKA" texto="A empresa gestora ou o administrador independente cria conta com 30 dias grátis. Depois subscreve, activa add-ons e compra SMS — tudo pago à ONDAKA." />
                            <Passo n="3" icon={Wallet} titulo="Recebe comissão em cada pagamento" texto={`Cada pagamento gera uma comissão sobre o valor sem imposto. Passados ${config.carencia_dias} dias fica aprovada; quando atinge ${fmtKz(config.pagamento_minimo_kz, 0)}, recebe por transferência.`} />
                        </div>
                    </div>
                </section>

                {/* NÍVEIS */}
                <section id="niveis" className="border-t border-blue-900/30 py-16">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="text-3xl font-bold">Comissões que sobem consigo</h2>
                        <p className="mt-2 text-zinc-400">O nível depende de quantos clientes indicados já pagaram pelo menos uma vez. Sobe automaticamente.</p>
                        <div className="mt-8 grid gap-6 md:grid-cols-3">
                            {config.niveis.map((n) => (
                                <div key={n.nivel} className={`rounded-2xl border p-6 ${n.nivel === 'ouro' ? 'border-yellow-400/40 bg-gradient-to-br from-yellow-500/10 to-transparent' : n.nivel === 'prata' ? 'border-zinc-400/30 bg-zinc-900/60' : 'border-amber-700/40 bg-zinc-900/60'}`}>
                                    <NivelBadge nivel={n.nivel} />
                                    <div className="mt-4 text-5xl font-bold">{fmtPct(n.taxa_pct)}</div>
                                    <div className="mt-2 text-sm text-zinc-400">{n.max_clientes === null ? `${n.min_clientes} ou mais clientes pagantes` : n.min_clientes === 0 ? `Até ${n.max_clientes} clientes pagantes` : `${n.min_clientes} a ${n.max_clientes} clientes pagantes`}</div>
                                    <ul className="mt-4 space-y-1.5 text-sm text-zinc-300">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Subscrições</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Add-ons da loja</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Pacotes de SMS</li>
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            <Conta icon={Receipt} t="Subscrição da plataforma" d="Mensal, semestral ou anual, por imóvel gerido." />
                            <Conta icon={Smartphone} t="Add-ons" d="Marketplace, reservas, portaria, BI, domínio próprio, etc." />
                            <Conta icon={MessageSquare} t="SMS" d="Pacotes de SMS e Sender ID personalizado." />
                        </div>
                    </div>
                </section>

                {/* REGRAS */}
                <section id="regras" className="border-t border-blue-900/30 py-16">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="text-3xl font-bold">Regras do programa</h2>
                        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Regra icon={ShieldCheck} t="Base sem imposto" d="A comissão calcula-se sobre o valor sem IVA/IPC de cada pagamento efectivamente recebido pela ONDAKA." />
                            <Regra icon={Clock} t={`Carência de ${config.carencia_dias} dias`} d="Protege contra estornos. Se o pagamento for anulado, a comissão é anulada." />
                            <Regra icon={Wallet} t={`Pagamento a partir de ${fmtKz(config.pagamento_minimo_kz, 0)}`} d={`Por transferência bancária para o IBAN do afiliado${Number(config.retencao_pct) > 0 ? `, com retenção na fonte de ${fmtPct(config.retencao_pct)}` : ''}. Comprovativo no painel.`} />
                            <Regra icon={Link2} t={`Link memorizado ${config.cookie_dias} dias`} d="O último link clicado ganha. Um cliente só pode estar ligado a um afiliado." />
                            <Regra icon={Building2} t={config.duracao_meses > 0 ? `${config.duracao_meses} meses por cliente` : 'Indicação vitalícia'} d="Enquanto a indicação estiver activa, todos os pagamentos do cliente contam." />
                            <Regra icon={Handshake} t="Sem auto-indicação" d="Não pode indicar a sua própria empresa nem clientes já registados. A ONDAKA pode suspender contas com actividade fraudulenta." />
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="border-t border-blue-900/30 py-16">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="text-3xl font-bold">Perguntas frequentes</h2>
                        <div className="mt-8 grid gap-3 md:grid-cols-2">
                            {faqs.map((f, i) => (
                                <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50">
                                    <button type="button" onClick={() => setFaqAberta(faqAberta === i ? null : i)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-medium">{f.q}<ChevronDown className={`h-4 w-4 shrink-0 transition ${faqAberta === i ? 'rotate-180' : ''}`} /></button>
                                    {faqAberta === i && <div className="px-5 pb-4 text-sm leading-relaxed text-zinc-400">{f.a}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CANDIDATURA */}
                <section id="candidatura" className="border-t border-blue-900/30 py-16">
                    <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2 md:items-start">
                        <div>
                            <h2 className="text-3xl font-bold">{ja_afiliado ? 'Já é afiliado' : autenticado ? 'Já tem conta ONDAKA' : 'Candidatura'}</h2>
                            <p className="mt-3 text-zinc-400">
                                {ja_afiliado ? 'Aceda ao seu painel para ver o link, os clientes indicados e as comissões.' : autenticado ? 'Adira ao programa a partir da sua conta — o código fica ligado ao seu utilizador.' : config.aprovacao_automatica ? 'Crie a sua conta de afiliado. Fica activa de imediato e recebe o seu link por email.' : 'Crie a sua conta de afiliado. A ONDAKA analisa a candidatura e avisa por email quando estiver aprovada — normalmente em 1 a 2 dias úteis.'}
                            </p>
                            <ul className="mt-6 space-y-2 text-sm text-zinc-300">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Sem custos de adesão</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Painel com cliques, registos, comissões e pagamentos</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Materiais prontos para WhatsApp, email e SMS</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Aberto a particulares e empresas em Angola</li>
                            </ul>
                            {(ja_afiliado || autenticado) && (
                                <Link href={ja_afiliado ? '/afiliado' : '/afiliado/aderir'} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg">{ja_afiliado ? 'Abrir o meu painel' : 'Aderir ao programa'} <ArrowRight className="h-4 w-4" /></Link>
                            )}
                        </div>
                        {!autenticado && (
                            <form onSubmit={(e) => { e.preventDefault(); post('/afiliados/candidatar'); }} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
                                {!config.programa_activo && <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">O programa não está a aceitar candidaturas de momento.</div>}
                                <div className="mb-4 grid grid-cols-2 gap-2">
                                    {(['particular', 'empresa'] as const).map((t) => (
                                        <button type="button" key={t} onClick={() => setData('tipo', t)} className={`rounded-lg border px-3 py-2 text-sm ${data.tipo === t ? 'border-blue-500 bg-blue-500/15 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>{t === 'particular' ? 'Sou particular' : 'Sou uma empresa'}</button>
                                    ))}
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <F label={data.tipo === 'empresa' ? 'Nome da empresa' : 'Nome completo'} erro={errors.nome} full><input name="nome" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" value={data.nome} onChange={(e) => setData('nome', e.target.value)} required /></F>
                                    <F label="Email" erro={errors.email}><input type="email" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" value={data.email} onChange={(e) => setData('email', e.target.value)} required /></F>
                                    <F label="Telefone" erro={errors.telefone}><input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" value={data.telefone} onChange={(e) => setData('telefone', e.target.value)} placeholder="+244 9xx xxx xxx" required /></F>
                                    <F label="NIF (opcional agora)" erro={errors.nif}><input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" value={data.nif} onChange={(e) => setData('nif', e.target.value)} /></F>
                                    <F label="Password" erro={errors.password}>
                                        <div className="relative">
                                            <input type={showPassword ? 'text' : 'password'} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 pr-10 text-sm focus:border-blue-500 focus:outline-none" value={data.password} onChange={(e) => setData('password', e.target.value)} required minLength={8} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                        </div>
                                    </F>
                                    <F label="Confirmar password" erro={errors.password_confirmation} full><input type={showPassword ? 'text' : 'password'} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required /></F>
                                    <F label="Como pretende divulgar a ONDAKA? (opcional)" erro={errors.como_divulga} full><textarea className="min-h-[80px] w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" value={data.como_divulga} onChange={(e) => setData('como_divulga', e.target.value)} placeholder="Ex.: trabalho com gestoras em Luanda; tenho uma página de imobiliário; sou contabilista de condomínios…" /></F>
                                </div>
                                <label className="mt-4 flex items-start gap-2 text-xs text-zinc-400">
                                    <input type="checkbox" className="mt-0.5" checked={data.aceita_termos} onChange={(e) => setData('aceita_termos', e.target.checked)} />
                                    <span>Li e aceito as <a href="#regras" className="text-blue-400 underline">regras do programa</a> e os <Link href="/termos" className="text-blue-400 underline">termos</Link> e <Link href="/privacidade" className="text-blue-400 underline">política de privacidade</Link> da ONDAKA.</span>
                                </label>
                                {errors.aceita_termos && <div className="mt-1 text-xs text-red-400">{errors.aceita_termos}</div>}
                                <button type="submit" disabled={processing || !config.programa_activo} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50"><Handshake className="h-4 w-4" /> {config.aprovacao_automatica ? 'Criar conta de afiliado' : 'Enviar candidatura'}</button>
                                <p className="mt-3 text-center text-xs text-zinc-500">Já tem conta ONDAKA? <Link href="/login" className="text-blue-400 underline">Entre</Link> e adira a partir do painel.</p>
                            </form>
                        )}
                    </div>
                </section>

                <footer className="border-t border-blue-900/30 py-10">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 md:flex-row">
                        <div className="flex items-center gap-3"><img src="/img/ondaka-logo.png" alt="ONDAKA" className="h-8 w-8 rounded" /><div><div className="text-zinc-300">ONDAKA</div><div className="text-xs">© {new Date().getFullYear()} KAYANTEC — Comércio e Prestação de Serviços, Lda</div></div></div>
                        <div className="flex gap-6 text-xs"><Link href="/" className="hover:text-white">Início</Link><Link href="/catalogo" className="hover:text-white">Catálogo</Link><Link href="/loja" className="hover:text-white">Loja</Link><Link href="/termos" className="hover:text-white">Termos</Link><Link href="/privacidade" className="hover:text-white">Privacidade</Link></div>
                    </div>
                </footer>
            </div>
        </>
    );
}

function Kpi({ v, l }: { v: string; l: string }) {
    return <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"><div className="text-lg font-bold text-white">{v}</div><div className="text-xs text-zinc-500">{l}</div></div>;
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
    return <div className="flex items-center justify-between gap-3"><span className="text-zinc-400">{k}</span><span className="text-white">{v}</span></div>;
}
function Passo({ n, icon: Icon, titulo, texto }: { n: string; icon: React.ElementType; titulo: string; texto: string }) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white">{n}</span><Icon className="h-5 w-5 text-blue-400" /></div>
            <div className="mt-4 text-lg font-semibold">{titulo}</div>
            <div className="mt-2 text-sm leading-relaxed text-zinc-400">{texto}</div>
        </div>
    );
}
function Conta({ icon: Icon, t, d }: { icon: React.ElementType; t: string; d: string }) {
    return <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"><Icon className="mt-0.5 h-5 w-5 text-emerald-400" /><div><div className="font-medium">{t}</div><div className="text-xs text-zinc-500">{d}</div></div></div>;
}
function Regra({ icon: Icon, t, d }: { icon: React.ElementType; t: string; d: string }) {
    return <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"><Icon className="h-5 w-5 text-purple-400" /><div className="mt-3 font-semibold">{t}</div><div className="mt-1 text-sm text-zinc-400">{d}</div></div>;
}
function F({ label, erro, children, full }: { label: string; erro?: string; children: React.ReactNode; full?: boolean }) {
    return <div className={full ? 'md:col-span-2' : ''}><label className="mb-1 block text-xs text-zinc-400">{label}</label>{children}{erro && <div className="mt-1 text-xs text-red-400">{erro}</div>}</div>;
}
