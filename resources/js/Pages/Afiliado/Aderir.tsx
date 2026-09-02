import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Handshake, Link2, Wallet, ShieldCheck, Clock, Building2 } from 'lucide-react';
import { fmtKz, fmtPct, PageHeader, Seccao, NivelBadge } from '@/Components/Afiliados/ui';
import type { ConfigAfiliados } from '@/types/afiliados';

interface Props {
    config: ConfigAfiliados;
    empresa: { id: number; nome: string; nif: string | null } | null;
    user: { name: string; email: string; telefone: string | null; nif: string | null };
}

export default function Aderir({ config, empresa, user }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        tipo: empresa ? 'empresa' : 'particular',
        nome: empresa ? empresa.nome : user.name,
        nif: (empresa ? empresa.nif : user.nif) ?? '',
        telefone: user.telefone ?? '',
        iban: '',
        banco: '',
        titular_conta: '',
        como_divulga: '',
        aceita_termos: false,
    });

    return (
        <AuthenticatedLayout>
            <Head title="Programa de Afiliados" />
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader icon={Handshake} titulo="Programa de Afiliados ONDAKA" subtitulo={`Indique outras empresas gestoras e administradores e ganhe ${fmtPct(config.taxa_min_pct)} a ${fmtPct(config.taxa_max_pct)} de tudo o que pagarem à ONDAKA`} />

                {!config.programa_activo && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">O programa de afiliados não está a aceitar adesões de momento.</div>
                )}

                <div className="grid gap-4 lg:grid-cols-5">
                    {/* Como funciona */}
                    <div className="space-y-4 lg:col-span-3">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Passo icon={Link2} n="1" titulo="Partilhe o seu link" texto="Recebe um código e um link únicos. Quem se registar através deles fica ligado a si (o link fica memorizado durante a visita e nos dias seguintes)." />
                            <Passo icon={Building2} n="2" titulo="O cliente usa a ONDAKA" texto="Trial grátis, depois subscrição, add-ons e pacotes SMS. Todos os pagamentos à ONDAKA contam — não só o primeiro." />
                            <Passo icon={Wallet} n="3" titulo="Recebe a comissão" texto={`Sobre o valor sem imposto de cada pagamento. Após ${config.carencia_dias} dias de carência fica aprovada; a ONDAKA paga por transferência a partir de ${fmtKz(config.pagamento_minimo_kz, 0)}.`} />
                        </div>

                        <Seccao titulo="Níveis de comissão — sobem automaticamente com os clientes pagantes">
                            <div className="grid gap-0 divide-y divide-white/5 md:grid-cols-3 md:divide-x md:divide-y-0">
                                {config.niveis.map((n) => (
                                    <div key={n.nivel} className="p-5">
                                        <NivelBadge nivel={n.nivel} />
                                        <div className="mt-3 text-3xl font-bold text-white">{fmtPct(n.taxa_pct)}</div>
                                        <div className="mt-1 text-xs text-white/50">{n.max_clientes === null ? `${n.min_clientes} ou mais clientes pagantes` : n.min_clientes === 0 ? `até ${n.max_clientes} clientes pagantes` : `${n.min_clientes} a ${n.max_clientes} clientes pagantes`}</div>
                                    </div>
                                ))}
                            </div>
                        </Seccao>

                        <Seccao titulo="Regras do programa">
                            <ul className="grid gap-3 p-5 text-sm text-white/70 md:grid-cols-2">
                                <Regra icon={ShieldCheck}>A comissão calcula-se sobre o valor <strong className="text-white">sem imposto</strong> (IVA/IPC) de cada pagamento efectivamente recebido pela ONDAKA.</Regra>
                                <Regra icon={Clock}>Carência de {config.carencia_dias} dias por comissão para cobrir estornos. Pagamentos anulados anulam a comissão.</Regra>
                                <Regra icon={Wallet}>Pagamento por transferência bancária quando o saldo aprovado atinge {fmtKz(config.pagamento_minimo_kz, 0)}{Number(config.retencao_pct) > 0 ? `, com retenção na fonte de ${fmtPct(config.retencao_pct)}` : ''}.</Regra>
                                <Regra icon={Building2}>{config.duracao_meses > 0 ? `Cada cliente gera comissão durante ${config.duracao_meses} meses.` : 'Cada cliente gera comissão enquanto for cliente (vitalício).'} Não é possível indicar a própria empresa nem clientes já existentes.</Regra>
                            </ul>
                        </Seccao>
                    </div>

                    {/* Formulário */}
                    <Seccao titulo="Aderir ao programa" className="lg:col-span-2">
                        <form onSubmit={(e) => { e.preventDefault(); post('/afiliado/aderir'); }} className="space-y-4 p-5">
                            <div>
                                <label className="mb-1 block text-xs text-white/60">Adere como</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['particular', 'empresa'] as const).map((t) => (
                                        <button type="button" key={t} onClick={() => { setData('tipo', t); if (t === 'empresa' && empresa) { setData('nome', empresa.nome); setData('nif', empresa.nif ?? ''); } if (t === 'particular') { setData('nome', user.name); setData('nif', user.nif ?? ''); } }} className={`rounded-lg border px-3 py-2 text-sm ${data.tipo === t ? 'border-purple-500 bg-purple-500/15 text-white' : 'border-white/10 text-white/60 hover:bg-white/5'}`}>{t === 'particular' ? 'Particular (eu)' : empresa ? `Empresa (${empresa.nome})` : 'Empresa'}</button>
                                    ))}
                                </div>
                            </div>
                            <Campo label="Nome do afiliado" erro={errors.nome}><input className="input" value={data.nome} onChange={(e) => setData('nome', e.target.value)} /></Campo>
                            <div className="grid grid-cols-2 gap-3">
                                <Campo label="NIF" erro={errors.nif}><input className="input" value={data.nif} onChange={(e) => setData('nif', e.target.value)} /></Campo>
                                <Campo label="Telefone" erro={errors.telefone}><input className="input" value={data.telefone} onChange={(e) => setData('telefone', e.target.value)} /></Campo>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                                <div className="mb-2 text-xs font-medium text-white/70">Conta para receber comissões (pode preencher depois)</div>
                                <div className="space-y-2">
                                    <input className="input font-mono" placeholder="IBAN" value={data.iban} onChange={(e) => setData('iban', e.target.value.toUpperCase())} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input className="input" placeholder="Banco" value={data.banco} onChange={(e) => setData('banco', e.target.value)} />
                                        <input className="input" placeholder="Titular" value={data.titular_conta} onChange={(e) => setData('titular_conta', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <Campo label="Como pretende divulgar a ONDAKA? (opcional)" erro={errors.como_divulga}><textarea className="input min-h-[80px]" value={data.como_divulga} onChange={(e) => setData('como_divulga', e.target.value)} /></Campo>
                            <label className="flex items-start gap-2 text-xs text-white/70">
                                <input type="checkbox" className="mt-0.5" checked={data.aceita_termos} onChange={(e) => setData('aceita_termos', e.target.checked)} />
                                <span>Li e aceito as regras do programa de afiliados ONDAKA.</span>
                            </label>
                            {errors.aceita_termos && <div className="text-xs text-red-400">{errors.aceita_termos}</div>}
                            <button type="submit" disabled={processing || !config.programa_activo} className="btn-primary w-full">
                                <Handshake className="h-4 w-4" /> {config.aprovacao_automatica ? 'Aderir e obter o meu link' : 'Enviar adesão para aprovação'}
                            </button>
                            <p className="text-center text-[11px] text-white/40">{config.aprovacao_automatica ? 'A conta fica activa de imediato.' : 'A ONDAKA aprova a adesão e avisa por email.'}</p>
                        </form>
                    </Seccao>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Passo({ icon: Icon, n, titulo, texto }: { icon: React.ElementType; n: string; titulo: string; texto: string }) {
    return (
        <div className="card-elevated">
            <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-xs font-bold text-white">{n}</span><Icon className="h-4 w-4 text-cyan-300" /></div>
            <div className="mt-3 font-semibold text-white">{titulo}</div>
            <div className="mt-1 text-xs leading-relaxed text-white/60">{texto}</div>
        </div>
    );
}

function Regra({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
    return <li className="flex items-start gap-2"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-purple-300" /><span>{children}</span></li>;
}

function Campo({ label, erro, children }: { label: string; erro?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-xs text-white/60">{label}</label>
            {children}
            {erro && <div className="mt-1 text-xs text-red-400">{erro}</div>}
        </div>
    );
}
