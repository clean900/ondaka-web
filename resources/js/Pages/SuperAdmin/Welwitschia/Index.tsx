import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Building2, Link2, KeyRound, Users, FileText, RefreshCw, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
    configurado: boolean;
    ligado: boolean;
    identidade: { filial: string | null; tenant_id: number | null; branch_id: number | null } | null;
    ondaka: { clientes: number; facturas: number };
    url: string;
}

export default function Index({ configurado, ligado, identidade, ondaka, url }: Props) {
    const form = useForm({ token: '', url: '' });

    const guardar = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/welwitschia/chave', { preserveScroll: true, onSuccess: () => form.reset('token') });
    };

    const sincronizar = () => {
        router.post('/admin/welwitschia/sincronizar', {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Integração Welwitschia" />

            <div className="mb-6 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)', border: '0.5px solid rgba(16,185,129,0.3)' }}>
                    <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Integração Welwitschia</h1>
                    <p className="text-sm text-white/60 mt-1">Envia clientes e faturas do ONDAKA para o ERP central (certificado AGT).</p>
                </div>
                {ligado ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ligado{identidade?.filial ? ` · filial ${identidade.filial}` : ''}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 border border-white/10">
                        <XCircle className="w-3.5 h-3.5" /> {configurado ? 'Sem ligação' : 'Não configurado'}
                    </span>
                )}
            </div>

            {/* Como funciona */}
            <div className="card mb-4 flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-[#00D4FF] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/70 leading-relaxed">
                    Direção única: <strong className="text-white">ONDAKA → Welwitschia</strong>. Cada empresa gestora vira um <strong className="text-white">cliente</strong> e cada
                    fatura da plataforma vira uma <strong className="text-white">venda</strong> na Welwitschia, que emite a faturação certificada pela AGT.
                    O ONDAKA <strong className="text-white">não recebe</strong> dados da Welwitschia.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Chave */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-3">
                        <KeyRound className="w-4 h-4 text-white/60" />
                        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Chave de integração</h2>
                    </div>
                    <p className="text-xs text-white/50 mb-4">Cole a chave gerada na Welwitschia (Definições → Integrações). A integração arranca automaticamente.</p>
                    <form onSubmit={guardar} className="space-y-3">
                        <div>
                            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Chave (token)</label>
                            <input
                                type="text"
                                value={form.data.token}
                                onChange={(e) => form.setData('token', e.target.value)}
                                placeholder="wel_..."
                                className="input font-mono text-sm"
                            />
                            {form.errors.token && <p className="text-xs text-red-400 mt-1">{form.errors.token}</p>}
                        </div>
                        <div>
                            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">URL da API (opcional)</label>
                            <input
                                type="text"
                                value={form.data.url}
                                onChange={(e) => form.setData('url', e.target.value)}
                                placeholder={url}
                                className="input text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={form.processing || !form.data.token.trim()}
                            className="inline-flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-lg font-medium text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #A855F7 100%)' }}
                        >
                            <Link2 className="w-4 h-4" /> {form.processing ? 'A ligar...' : 'Guardar e ligar'}
                        </button>
                    </form>
                </div>

                {/* Envio do ONDAKA */}
                <div className="card">
                    <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">O que o ONDAKA envia</h2>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="rounded-xl p-4" style={{ background: 'rgba(0,212,255,0.08)', border: '0.5px solid rgba(0,212,255,0.25)' }}>
                            <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-[#00D4FF]" /><span className="text-[10px] uppercase tracking-wider text-white/50">Clientes</span></div>
                            <div className="text-2xl font-bold text-white">{ondaka.clientes}</div>
                            <div className="text-[11px] text-white/40">empresas gestoras</div>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: 'rgba(168,85,247,0.08)', border: '0.5px solid rgba(168,85,247,0.25)' }}>
                            <div className="flex items-center gap-2 mb-1"><FileText className="w-4 h-4 text-[#A855F7]" /><span className="text-[10px] uppercase tracking-wider text-white/50">Faturas</span></div>
                            <div className="text-2xl font-bold text-white">{ondaka.facturas}</div>
                            <div className="text-[11px] text-white/40">faturas da plataforma</div>
                        </div>
                    </div>
                    <p className="text-xs text-white/50 mb-3">Novos registos e faturas são enviados automaticamente. Use o botão para reenviar tudo (backfill).</p>
                    <button
                        type="button"
                        onClick={sincronizar}
                        disabled={!ligado}
                        className="inline-flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-lg font-medium text-white transition disabled:opacity-40 disabled:cursor-not-allowed bg-white/10 hover:bg-white/15"
                    >
                        <RefreshCw className="w-4 h-4" /> Sincronizar tudo agora
                    </button>
                    {!ligado && <p className="text-[11px] text-white/40 mt-2">Configure a chave para activar.</p>}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
