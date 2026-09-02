import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { UserCog, Landmark, Link2 } from 'lucide-react';
import { PageHeader, Seccao, PortalNav, CopiarBotao, NivelBadge, EstadoAfiliadoBadge } from '@/Components/Afiliados/ui';
import type { Afiliado, ConfigAfiliados } from '@/types/afiliados';

interface Props { afiliado: Afiliado; config: ConfigAfiliados }

export default function Dados({ afiliado }: Props) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        tipo: afiliado.tipo,
        nome: afiliado.nome ?? '',
        nif: afiliado.nif ?? '',
        telefone: afiliado.telefone ?? '',
        iban: afiliado.iban ?? '',
        banco: afiliado.banco ?? '',
        titular_conta: afiliado.titular_conta ?? '',
        como_divulga: afiliado.como_divulga ?? '',
    });

    return (
        <AuthenticatedLayout>
            <Head title="Dados de pagamento" />
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader icon={UserCog} titulo="Dados do afiliado e de pagamento" subtitulo="Os pagamentos de comissões são feitos por transferência bancária para o IBAN indicado" />
                <PortalNav activo="/afiliado/dados" />

                <form onSubmit={(e) => { e.preventDefault(); post('/afiliado/dados', { preserveScroll: true }); }} className="grid gap-4 lg:grid-cols-3">
                    <Seccao titulo="Identificação" className="lg:col-span-1">
                        <div className="space-y-4 p-5">
                            <div>
                                <label className="mb-1 block text-xs text-white/60">Tipo</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['particular', 'empresa'] as const).map((t) => (
                                        <button type="button" key={t} onClick={() => setData('tipo', t)} className={`rounded-lg border px-3 py-2 text-sm ${data.tipo === t ? 'border-purple-500 bg-purple-500/15 text-white' : 'border-white/10 text-white/60 hover:bg-white/5'}`}>{t === 'particular' ? 'Particular' : 'Empresa'}</button>
                                    ))}
                                </div>
                            </div>
                            <Campo label={data.tipo === 'empresa' ? 'Nome da empresa' : 'Nome completo'} erro={errors.nome}><input className="input" value={data.nome} onChange={(e) => setData('nome', e.target.value)} required /></Campo>
                            <Campo label="NIF" erro={errors.nif}><input className="input" value={data.nif} onChange={(e) => setData('nif', e.target.value)} placeholder="Necessário para o recibo da comissão" /></Campo>
                            <Campo label="Telefone" erro={errors.telefone}><input className="input" value={data.telefone} onChange={(e) => setData('telefone', e.target.value)} placeholder="+244 9xx xxx xxx" /></Campo>
                            <Campo label="Email da conta"><input className="input" value={afiliado.email} disabled /></Campo>
                        </div>
                    </Seccao>

                    <Seccao titulo={<span className="flex items-center gap-2"><Landmark className="h-4 w-4 text-emerald-300" /> Conta bancária para receber comissões</span>} className="lg:col-span-1">
                        <div className="space-y-4 p-5">
                            <Campo label="IBAN" erro={errors.iban}><input className="input font-mono" value={data.iban} onChange={(e) => setData('iban', e.target.value.toUpperCase())} placeholder="AO06 0000 0000 0000 0000 0000 0" maxLength={40} /></Campo>
                            <Campo label="Banco" erro={errors.banco}><input className="input" value={data.banco} onChange={(e) => setData('banco', e.target.value)} placeholder="BAI, BFA, BIC, Standard Bank…" /></Campo>
                            <Campo label="Titular da conta" erro={errors.titular_conta}><input className="input" value={data.titular_conta} onChange={(e) => setData('titular_conta', e.target.value)} placeholder="Nome exactamente como no banco" /></Campo>
                            <Campo label="Como divulga a ONDAKA (opcional)" erro={errors.como_divulga}><textarea className="input min-h-[96px]" value={data.como_divulga} onChange={(e) => setData('como_divulga', e.target.value)} placeholder="Ex.: contactos com gestoras de condomínio em Luanda, redes sociais, eventos…" /></Campo>
                            <div className="flex items-center justify-between gap-3 pt-2">
                                <span className="text-xs text-white/40">{isDirty ? 'Alterações por guardar' : 'Sem alterações'}</span>
                                <button type="submit" disabled={processing || !isDirty} className="btn-primary">Guardar dados</button>
                            </div>
                        </div>
                    </Seccao>

                    <Seccao titulo={<span className="flex items-center gap-2"><Link2 className="h-4 w-4 text-cyan-300" /> A sua conta de afiliado</span>} className="lg:col-span-1">
                        <div className="space-y-4 p-5 text-sm">
                            <div className="flex items-center gap-2"><EstadoAfiliadoBadge estado={afiliado.estado} /><NivelBadge nivel={afiliado.nivel} taxa={afiliado.taxa_actual_pct} /></div>
                            <div>
                                <div className="text-[11px] uppercase tracking-wider text-white/40">Código</div>
                                <div className="text-2xl font-bold tracking-widest text-white">{afiliado.codigo}</div>
                            </div>
                            <div>
                                <div className="text-[11px] uppercase tracking-wider text-white/40">Link</div>
                                <div className="mt-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-cyan-200 break-all">{afiliado.link}</div>
                                <div className="mt-2"><CopiarBotao texto={afiliado.link} label="Copiar link" /></div>
                            </div>
                            <div className="text-xs text-white/50">
                                Afiliado desde {afiliado.created_at ? new Date(afiliado.created_at).toLocaleDateString('pt-PT') : '—'}{afiliado.aprovado_em ? ` · aprovado a ${new Date(afiliado.aprovado_em).toLocaleDateString('pt-PT')}` : ''}.
                                {afiliado.empresa_gestora && <> Ligado à empresa <strong className="text-white/80">{afiliado.empresa_gestora.nome}</strong> (não gera comissão sobre a própria empresa).</>}
                            </div>
                            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs leading-relaxed text-white/50">
                                O código e o link não podem ser alterados. Para mudar o email de acesso use o <a href="/perfil" className="text-cyan-300 underline">perfil</a>.
                            </div>
                        </div>
                    </Seccao>
                </form>
            </div>
        </AuthenticatedLayout>
    );
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
