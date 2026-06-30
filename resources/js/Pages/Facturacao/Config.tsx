import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft, Building2, Landmark, CreditCard, Save, AlertCircle,
    CheckCircle2, Eye, EyeOff,
} from 'lucide-react';
import { useState, FormEventHandler } from 'react';

interface Condominio {
    id: number;
    nome: string;
}

interface Config {
    banco_nome: string | null;
    iban: string | null;
    numero_conta: string | null;
    titular_conta: string | null;
    nif_emissor: string | null;
    proxypay_entity_id: number | null;
    proxypay_api_token: string | null; // mascarado pelo backend
    proxypay_sandbox: boolean;
    proxypay_activo: boolean;

    geracao_automatica: boolean;
    dia_geracao: number;
    dia_vencimento: number;
    limitar_acesso_divida: boolean;
    meses_limite_acesso: number;
    transparencia_financeira: boolean;
    acordo_min_prestacoes: number;
    acordo_max_prestacoes: number;
    acordo_entrada_minima_pct: string;
    acordo_juro_pct: string;

    multa_activa: boolean;
    dias_tolerancia_multa: number;
    multa_tipo: 'fixa' | 'percentagem';
    multa_valor_kz: string;
    multa_percentagem: string | null;
    multa_percentagem_base: 'divida' | 'original';
    multa_recorrente: boolean;
}

interface FlashMessages {
    success?: string;
}

interface Props {
    condominio: Condominio;
    config: Config;
    flash?: FlashMessages;
}

type Tab = 'coordenadas' | 'proxypay' | 'quotas' | 'multas';

export default function FacturacaoConfig({ condominio, config, flash }: Props) {
    const [tab, setTab] = useState<Tab>('coordenadas');
    const [showToken, setShowToken] = useState(false);

    // Form coordenadas bancárias
    const coordForm = useForm({
        banco_nome: config.banco_nome || '',
        iban: config.iban || '',
        numero_conta: config.numero_conta || '',
        titular_conta: config.titular_conta || '',
        nif_emissor: config.nif_emissor || '',
    });

    // Form ProxyPay
    const proxyForm = useForm({
        proxypay_entity_id: config.proxypay_entity_id || '',
        proxypay_api_token: config.proxypay_api_token || '',
        proxypay_sandbox: config.proxypay_sandbox,
        proxypay_activo: config.proxypay_activo,
    });

    const handleSubmitCoord: FormEventHandler = (e) => {
        e.preventDefault();
        coordForm.patch(route('condominios.facturacao.coordenadas-bancarias', condominio.id), {
            preserveScroll: true,
        });
    };

    const handleSubmitProxy: FormEventHandler = (e) => {
        e.preventDefault();
        proxyForm.patch(route('condominios.facturacao.proxypay', condominio.id), {
            preserveScroll: true,
        });
    };

    // Form Quotas
    const quotasForm = useForm({
        geracao_automatica: config.geracao_automatica,
        dia_geracao: config.dia_geracao,
        dia_vencimento: config.dia_vencimento,
        limitar_acesso_divida: config.limitar_acesso_divida ?? false,
        meses_limite_acesso: config.meses_limite_acesso ?? 3,
        transparencia_financeira: config.transparencia_financeira ?? true,
        acordo_min_prestacoes: config.acordo_min_prestacoes ?? 2,
        acordo_max_prestacoes: config.acordo_max_prestacoes ?? 6,
        acordo_entrada_minima_pct: config.acordo_entrada_minima_pct ?? '0',
        acordo_juro_pct: config.acordo_juro_pct ?? '0',
    });

    // Form Multas
    const multasForm = useForm({
        multa_activa: config.multa_activa,
        dias_tolerancia_multa: config.dias_tolerancia_multa,
        multa_tipo: config.multa_tipo,
        multa_valor_kz: config.multa_valor_kz || '',
        multa_percentagem: config.multa_percentagem || '',
        multa_percentagem_base: config.multa_percentagem_base,
        multa_recorrente: config.multa_recorrente,
    });

    const submitQuotas: FormEventHandler = (e) => {
        e.preventDefault();
        quotasForm.patch(route('condominios.facturacao.quotas', condominio.id), {
            preserveScroll: true,
        });
    };

    const submitMultas: FormEventHandler = (e) => {
        e.preventDefault();
        multasForm.patch(route('condominios.facturacao.multas', condominio.id), {
            preserveScroll: true,
        });
    };


    return (
        <AuthenticatedLayout>
            <Head title={`Facturação — ${condominio.nome}`} />

            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href={`/condominios/${condominio.id}`}
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4"
                    >
                        <ArrowLeft size={14} /> Voltar a {condominio.nome}
                    </Link>

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-white">Configuração de Facturação</h1>
                        <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
                            <Building2 size={14} /> {condominio.nome}
                        </p>
                    </div>

                    {/* Flash success */}
                    {flash?.success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex gap-3">
                            <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={18} />
                            <span className="text-emerald-400 text-sm font-semibold">{flash.success}</span>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="flex border-b border-zinc-800">
                            <TabButton
                                active={tab === 'coordenadas'}
                                onClick={() => setTab('coordenadas')}
                                icon={<Landmark size={16} />}
                                label="Coordenadas Bancárias"
                            />
                            <TabButton
                                active={tab === 'quotas'}
                                onClick={() => setTab('quotas')}
                                label="Taxas"
                            />
                            <TabButton
                                active={tab === 'multas'}
                                onClick={() => setTab('multas')}
                                label="Multas"
                            />
                            <TabButton
                                active={tab === 'proxypay'}
                                onClick={() => setTab('proxypay')}
                                icon={<CreditCard size={16} />}
                                label="Multicaixa Express (ProxyPay)"
                            />
                        </div>

                        <div className="p-6">
                            {tab === 'coordenadas' && (
                                <form onSubmit={handleSubmitCoord} className="space-y-4">
                                    <p className="text-sm text-zinc-400 mb-4">
                                        Estas coordenadas aparecem aos condóminos quando escolhem método de pagamento por <strong>transferência</strong> ou <strong>depósito bancário</strong>.
                                    </p>

                                    <Field
                                        label="Nome do banco"
                                        placeholder="Ex: Banco BAI"
                                        value={coordForm.data.banco_nome}
                                        onChange={(v) => coordForm.setData('banco_nome', v)}
                                        error={coordForm.errors.banco_nome}
                                    />

                                    <Field
                                        label="IBAN"
                                        placeholder="AO06 0000 0000 0000 0000 0000 0"
                                        value={coordForm.data.iban}
                                        onChange={(v) => coordForm.setData('iban', v)}
                                        error={coordForm.errors.iban}
                                        hint="Para pagamentos por transferência bancária"
                                    />

                                    <Field
                                        label="Nº de conta"
                                        placeholder="00000000000000000"
                                        value={coordForm.data.numero_conta}
                                        onChange={(v) => coordForm.setData('numero_conta', v)}
                                        error={coordForm.errors.numero_conta}
                                        hint="Para pagamentos por depósito"
                                    />

                                    <Field
                                        label="Beneficiário"
                                        placeholder="Ex: Condomínio do Edifício X"
                                        value={coordForm.data.titular_conta}
                                        onChange={(v) => coordForm.setData('titular_conta', v)}
                                        error={coordForm.errors.titular_conta}
                                    />

                                    <Field
                                        label="NIF do emissor"
                                        placeholder="5417000000"
                                        value={coordForm.data.nif_emissor}
                                        onChange={(v) => coordForm.setData('nif_emissor', v)}
                                        error={coordForm.errors.nif_emissor}
                                        hint="Aparece em facturas e recibos"
                                    />

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={coordForm.processing}
                                            className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2"
                                        >
                                            <Save size={16} />
                                            {coordForm.processing ? 'A guardar...' : 'Guardar coordenadas'}
                                        </button>
                                    </div>
                                </form>
                            )}

        
                    {tab === 'quotas' && (
                        <form onSubmit={submitQuotas} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                            <h2 className="text-lg font-bold text-white mb-2">Configuração de Taxas de Condomínio</h2>
                            <p className="text-xs text-zinc-400 mb-4">Parâmetros da geração mensal automática (Decreto 141/15).</p>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={quotasForm.data.geracao_automatica} onChange={(e) => quotasForm.setData('geracao_automatica', e.target.checked)} className="rounded bg-zinc-700 border-zinc-600 text-cyan-500" />
                                <span className="text-sm text-white">Geração automática mensal activa</span>
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Dia de geração (1-28)</label>
                                    <input type="number" min={1} max={28} value={quotasForm.data.dia_geracao} onChange={(e) => quotasForm.setData('dia_geracao', parseInt(e.target.value) || 1)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                                    {quotasForm.errors.dia_geracao && <p className="text-xs text-red-400 mt-1">{quotasForm.errors.dia_geracao}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Dia de vencimento (1-28)</label>
                                    <input type="number" min={1} max={28} value={quotasForm.data.dia_vencimento} onChange={(e) => quotasForm.setData('dia_vencimento', parseInt(e.target.value) || 1)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                                    {quotasForm.errors.dia_vencimento && <p className="text-xs text-red-400 mt-1">{quotasForm.errors.dia_vencimento}</p>}
                                </div>
                            </div>

                            <div className="border-t border-zinc-800 pt-4 mt-2">
                                <h3 className="text-sm font-bold text-white mb-1">Modo limitado por dívida</h3>
                                <p className="text-xs text-zinc-400 mb-3">Quando activo, condóminos com taxas em atraso ficam com acesso limitado (apenas extracto, pagamento e negociação) até regularizarem ou propor um acordo.</p>
                                <label className="flex items-center gap-3 cursor-pointer mb-3">
                                    <input type="checkbox" checked={quotasForm.data.limitar_acesso_divida} onChange={(e) => quotasForm.setData('limitar_acesso_divida', e.target.checked)} className="rounded bg-zinc-700 border-zinc-600 text-cyan-500" />
                                    <span className="text-sm text-white">Limitar acesso de condóminos com dívida</span>
                                </label>
                                {quotasForm.data.limitar_acesso_divida && (
                                    <div className="max-w-xs">
                                        <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">A partir de quantos meses em atraso</label>
                                        <input type="number" min={1} max={12} value={quotasForm.data.meses_limite_acesso} onChange={(e) => quotasForm.setData('meses_limite_acesso', parseInt(e.target.value) || 3)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                                        {quotasForm.errors.meses_limite_acesso && <p className="text-xs text-red-400 mt-1">{quotasForm.errors.meses_limite_acesso}</p>}
                                    </div>
                                )}
                                <div className="border-t border-zinc-800 pt-4 mt-4">
                                    <h3 className="text-sm font-bold text-white mb-1">Transparência financeira</h3>
                                    <p className="text-xs text-zinc-400 mb-3">Quando activo, os condóminos vêem no app o resumo financeiro do condomínio (receitas/despesas, fundo de reserva, cobrança e despesas por categoria — sem nomes de devedores) no ecrã "Contas do Condomínio".</p>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={quotasForm.data.transparencia_financeira} onChange={(e) => quotasForm.setData('transparencia_financeira', e.target.checked)} className="rounded bg-zinc-700 border-zinc-600 text-cyan-500" />
                                        <span className="text-sm text-white">Publicar transparência financeira aos condóminos</span>
                                    </label>
                                </div>
                                <div className="border-t border-zinc-800 pt-4 mt-4">
                                    <h4 className="text-sm font-bold text-white mb-1">Configuração de acordos</h4>
                                    <p className="text-xs text-zinc-400 mb-3">Regras para os planos de pagamento que os condóminos podem propor.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Mínimo de prestações</label>
                                            <input type="number" min={1} max={36} value={quotasForm.data.acordo_min_prestacoes} onChange={(e) => quotasForm.setData('acordo_min_prestacoes', parseInt(e.target.value) || 2)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                                            {quotasForm.errors.acordo_min_prestacoes && <p className="text-xs text-red-400 mt-1">{quotasForm.errors.acordo_min_prestacoes}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Máximo de prestações</label>
                                            <input type="number" min={1} max={36} value={quotasForm.data.acordo_max_prestacoes} onChange={(e) => quotasForm.setData('acordo_max_prestacoes', parseInt(e.target.value) || 6)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                                            {quotasForm.errors.acordo_max_prestacoes && <p className="text-xs text-red-400 mt-1">{quotasForm.errors.acordo_max_prestacoes}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Entrada mínima (%)</label>
                                            <input type="number" min={0} max={100} step="0.01" value={quotasForm.data.acordo_entrada_minima_pct} onChange={(e) => quotasForm.setData('acordo_entrada_minima_pct', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                                            {quotasForm.errors.acordo_entrada_minima_pct && <p className="text-xs text-red-400 mt-1">{quotasForm.errors.acordo_entrada_minima_pct}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Juro / agravamento (%)</label>
                                            <input type="number" min={0} max={100} step="0.01" value={quotasForm.data.acordo_juro_pct} onChange={(e) => quotasForm.setData('acordo_juro_pct', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                                            {quotasForm.errors.acordo_juro_pct && <p className="text-xs text-red-400 mt-1">{quotasForm.errors.acordo_juro_pct}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={quotasForm.processing} className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-bold">
                                {quotasForm.processing ? 'A guardar...' : 'Guardar configuração de Quotas'}
                            </button>
                        </form>
                    )}

                    {tab === 'multas' && (
                        <form onSubmit={submitMultas} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                            <h2 className="text-lg font-bold text-white mb-2">Configuração de Multas</h2>
                            <p className="text-xs text-zinc-400 mb-4">Aplicação automática quando lançamentos ficam em atraso.</p>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={multasForm.data.multa_activa} onChange={(e) => multasForm.setData('multa_activa', e.target.checked)} className="rounded bg-zinc-700 border-zinc-600 text-cyan-500" />
                                <span className="text-sm text-white">Multas automáticas activas</span>
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Dias de tolerância (após vencimento)</label>
                                    <input type="number" min={0} max={90} value={multasForm.data.dias_tolerancia_multa} onChange={(e) => multasForm.setData('dias_tolerancia_multa', parseInt(e.target.value) || 0)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                                    {multasForm.errors.dias_tolerancia_multa && <p className="text-xs text-red-400 mt-1">{multasForm.errors.dias_tolerancia_multa}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Tipo de multa</label>
                                    <select value={multasForm.data.multa_tipo} onChange={(e) => multasForm.setData('multa_tipo', e.target.value as 'fixa' | 'percentagem')} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                        <option value="fixa">Fixa (Kz)</option>
                                        <option value="percentagem">Percentagem (%)</option>
                                    </select>
                                </div>
                            </div>

                            {multasForm.data.multa_tipo === 'fixa' ? (
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Valor fixo (Kz)</label>
                                    <input type="number" step="0.01" min={0} value={multasForm.data.multa_valor_kz} onChange={(e) => multasForm.setData('multa_valor_kz', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" placeholder="Ex: 5000.00" />
                                    {multasForm.errors.multa_valor_kz && <p className="text-xs text-red-400 mt-1">{multasForm.errors.multa_valor_kz}</p>}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Percentagem (%)</label>
                                        <input type="number" step="0.01" min={0} max={100} value={multasForm.data.multa_percentagem} onChange={(e) => multasForm.setData('multa_percentagem', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" placeholder="Ex: 5.00" />
                                        {multasForm.errors.multa_percentagem && <p className="text-xs text-red-400 mt-1">{multasForm.errors.multa_percentagem}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">Calculada sobre</label>
                                        <select value={multasForm.data.multa_percentagem_base} onChange={(e) => multasForm.setData('multa_percentagem_base', e.target.value as 'divida' | 'original')} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                                            <option value="divida">Dívida actual (recalcula)</option>
                                            <option value="original">Valor original do lançamento</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={multasForm.data.multa_recorrente} onChange={(e) => multasForm.setData('multa_recorrente', e.target.checked)} className="rounded bg-zinc-700 border-zinc-600 text-cyan-500" />
                                <span className="text-sm text-white">Multa recorrente (aplica todos os meses enquanto há dívida)</span>
                            </label>

                            <button type="submit" disabled={multasForm.processing} className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-bold">
                                {multasForm.processing ? 'A guardar...' : 'Guardar configuração de Multas'}
                            </button>
                        </form>
                    )}
                    {tab === 'proxypay' && (
                                <form onSubmit={handleSubmitProxy} className="space-y-4">
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex gap-3 mb-4">
                                        <AlertCircle className="text-amber-400 flex-shrink-0" size={16} />
                                        <div className="text-amber-300/90 text-xs">
                                            <p className="font-semibold mb-1">Importante</p>
                                            <p>
                                                Cada condomínio tem suas <strong>próprias credenciais</strong> ProxyPay. O dinheiro pago pelos condóminos
                                                via Multicaixa Express vai <strong>directamente</strong> para a conta bancária deste condomínio.
                                            </p>
                                            <p className="mt-1">
                                                Pede credenciais ao teu gestor de conta no ProxyPay (entity_id e api_token).
                                            </p>
                                        </div>
                                    </div>

                                    <Field
                                        label="Entity ID"
                                        placeholder="99999"
                                        type="number"
                                        value={proxyForm.data.proxypay_entity_id?.toString() || ''}
                                        onChange={(v) => proxyForm.setData('proxypay_entity_id', v ? parseInt(v) : '')}
                                        error={proxyForm.errors.proxypay_entity_id}
                                        hint="Identificador do condomínio no ProxyPay"
                                    />

                                    <div>
                                        <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">API Token</label>
                                        <div className="relative">
                                            <input
                                                type={showToken ? 'text' : 'password'}
                                                placeholder={config.proxypay_api_token ? 'Token guardado (oculto)' : 'token-secreto-aqui'}
                                                value={proxyForm.data.proxypay_api_token}
                                                onChange={(e) => proxyForm.setData('proxypay_api_token', e.target.value)}
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowToken(!showToken)}
                                                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                                            >
                                                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Deixa em branco para manter o token actual.
                                        </p>
                                        {proxyForm.errors.proxypay_api_token && (
                                            <p className="text-xs text-red-400 mt-1">{proxyForm.errors.proxypay_api_token}</p>
                                        )}
                                    </div>

                                    <Toggle
                                        label="Modo Sandbox (testes)"
                                        hint="Activa para testar sem cobrar dinheiro real. Desactiva em produção."
                                        checked={proxyForm.data.proxypay_sandbox}
                                        onChange={(v) => proxyForm.setData('proxypay_sandbox', v)}
                                    />

                                    <Toggle
                                        label="ProxyPay activo"
                                        hint="Permite condóminos pagarem via Multicaixa Express. Requer credenciais válidas."
                                        checked={proxyForm.data.proxypay_activo}
                                        onChange={(v) => proxyForm.setData('proxypay_activo', v)}
                                    />

                                    {proxyForm.errors.proxypay_activo && (
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                                            {proxyForm.errors.proxypay_activo}
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={proxyForm.processing}
                                            className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2"
                                        >
                                            <Save size={16} />
                                            {proxyForm.processing ? 'A guardar...' : 'Guardar ProxyPay'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function TabButton({
    active, onClick, icon, label,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                active
                    ? 'text-cyan-400 border-cyan-500 bg-cyan-500/5'
                    : 'text-zinc-400 hover:text-white border-transparent'
            }`}
        >
            {icon}
            {label}
        </button>
    );
}

function Field({
    label, placeholder, value, onChange, error, hint, type = 'text',
}: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    hint?: string;
    type?: string;
}) {
    return (
        <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-semibold">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
            {hint && <p className="text-xs text-zinc-500 mt-1">{hint}</p>}
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
}

function Toggle({
    label, hint, checked, onChange,
}: {
    label: string;
    hint?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-4 bg-zinc-800/50 rounded-lg p-3">
            <div className="flex-1">
                <div className="text-sm text-white font-semibold">{label}</div>
                {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                    checked ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );
}
