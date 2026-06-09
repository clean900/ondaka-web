import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Info, Zap } from 'lucide-react';
import { FormEvent, useMemo } from 'react';

function formatMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-PT').format(valor) + ' Kz';
}

interface Pacote {
    id: number;
    nome: string;
    quantidade: number;
    preco: number;
}

interface Feature {
    id: number;
    nome: string;
    modelo_cobranca: 'subscription' | 'consumable' | 'one_time';
    modelo_cobranca_label: string;
    em_breve: boolean;
    unidade: string;
    preco_base: number | null;
    preco_activacao: number;
    pacotes: Pacote[];
}

interface Empresa {
    id: number;
    nome: string;
}

interface Condominio {
    id: number;
    nome: string;
    empresa_gestora_nome?: string | null;
}

interface Props {
    features: Feature[];
    empresas: Empresa[];
    condominios: Condominio[];
}

export default function AdminFeaturesNova({ features, empresas, condominios }: Props) {
    const form = useForm<{
        tipo_owner: 'empresa' | 'condominio';
        owner_id: string;
        feature_id: string;
        pacote_id: string;
        quantidade: string;
        meses: number;
        notas: string;
    }>({
        tipo_owner: 'empresa',
        owner_id: '',
        feature_id: '',
        pacote_id: '',
        quantidade: '',
        meses: 1,
        notas: '',
    });

    const featureSeleccionada = useMemo(
        () => features.find((f) => f.id === Number(form.data.feature_id)),
        [features, form.data.feature_id],
    );

    const owners: Array<Empresa | Condominio> =
        form.data.tipo_owner === 'empresa' ? empresas : condominios;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/admin/features');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Activar feature" />

            <div className="max-w-3xl mx-auto space-y-6 pt-2">
                <Link
                    href="/admin/features"
                    className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar à lista
                </Link>

                <div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight">Activar feature manualmente</h1>
                    <p className="text-sm text-white/60 mt-1">
                        Super-admin: activar feature para empresa ou condomínio sem passar por pagamento.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <label className="block text-sm text-white/80 mb-3">Tipo de destinatário</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['empresa', 'condominio'] as const).map((tipo) => (
                                <button
                                    key={tipo}
                                    type="button"
                                    onClick={() => {
                                        form.setData('tipo_owner', tipo);
                                        form.setData('owner_id', '');
                                    }}
                                    className={`p-3 rounded-lg text-sm transition-all ${
                                        form.data.tipo_owner === tipo
                                            ? 'bg-[#00D4FF]/10 border border-[#00D4FF]/40 text-[#8FE7FF]'
                                            : 'bg-white/[0.03] border border-white/10 text-white/70 hover:bg-white/[0.06]'
                                    }`}
                                >
                                    <div className="font-medium capitalize">
                                        {tipo === 'empresa' ? 'Empresa gestora' : 'Condomínio'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <label className="block text-sm text-white/80 mb-2">
                            {form.data.tipo_owner === 'empresa' ? 'Empresa' : 'Condomínio'}
                        </label>
                        <select
                            value={form.data.owner_id}
                            onChange={(e) => form.setData('owner_id', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                            required
                        >
                            <option value="">Seleccione...</option>
                            {owners.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.nome}
                                    {'empresa_gestora_nome' in o && o.empresa_gestora_nome
                                        ? ` (${o.empresa_gestora_nome})`
                                        : ''}
                                </option>
                            ))}
                        </select>
                        {form.errors.owner_id && (
                            <p className="text-xs text-red-400 mt-1">{form.errors.owner_id}</p>
                        )}
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <label className="block text-sm text-white/80 mb-2">Feature</label>
                        <select
                            value={form.data.feature_id}
                            onChange={(e) => {
                                form.setData('feature_id', e.target.value);
                                form.setData('pacote_id', '');
                                form.setData('quantidade', '');
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                            required
                        >
                            <option value="">Seleccione...</option>
                            {features.map((f) => (
                                <option key={f.id} value={f.id} disabled={f.em_breve}>
                                    {f.nome} ({f.modelo_cobranca_label}){f.em_breve ? ' — em breve' : ''}
                                </option>
                            ))}
                        </select>
                        {form.errors.feature_id && (
                            <p className="text-xs text-red-400 mt-1">{form.errors.feature_id}</p>
                        )}
                    </div>

                    {featureSeleccionada?.modelo_cobranca === 'consumable' && (
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                            <label className="block text-sm text-white/80">
                                Pacote ou quantidade customizada
                            </label>

                            {featureSeleccionada.pacotes.length > 0 && (
                                <div>
                                    <label className="block text-xs text-white/60 mb-2">Pacote padrão</label>
                                    <select
                                        value={form.data.pacote_id}
                                        onChange={(e) => {
                                            form.setData('pacote_id', e.target.value);
                                            form.setData('quantidade', '');
                                        }}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                                    >
                                        <option value="">Nenhum (usar quantidade custom)</option>
                                        {featureSeleccionada.pacotes.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nome}: {p.quantidade} {featureSeleccionada.unidade} por{' '}
                                                {formatMoeda(p.preco)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs text-white/60 mb-2">
                                    OU quantidade customizada
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.data.quantidade}
                                    onChange={(e) => {
                                        form.setData('quantidade', e.target.value);
                                        form.setData('pacote_id', '');
                                    }}
                                    placeholder={`Número de ${featureSeleccionada.unidade}`}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {featureSeleccionada?.modelo_cobranca === 'subscription' && (
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                            <label className="block text-sm text-white/80 mb-2">Duração em meses</label>
                            <input
                                type="number"
                                min="1"
                                max="36"
                                value={form.data.meses}
                                onChange={(e) => form.setData('meses', Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                            />
                            {featureSeleccionada.preco_base && (
                                <p className="text-xs text-white/60 mt-2">
                                    Valor estimado:{' '}
                                    {formatMoeda(
                                        featureSeleccionada.preco_base * form.data.meses +
                                            featureSeleccionada.preco_activacao,
                                    )}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <label className="block text-sm text-white/80 mb-2">
                            Notas administrativas (opcional)
                        </label>
                        <textarea
                            rows={3}
                            value={form.data.notas}
                            onChange={(e) => form.setData('notas', e.target.value)}
                            placeholder="Ex: Cortesia lançamento, Demonstração comercial, Ajuste pedido cliente..."
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm resize-none"
                        />
                    </div>

                    <div className="p-3 rounded-lg bg-[#00D4FF]/5 border border-[#00D4FF]/20 flex items-start gap-2 text-sm text-[#8FE7FF]">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                            Esta activação manual <strong>não cobra</strong>. Use para cortesias, testes ou ajustes.
                            Para registo fiscal com pagamento, use o sistema de ordens de compra (Fase 3).
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Link
                            href="/admin/features"
                            className="px-4 py-2 text-sm text-white/70 hover:text-white"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF] text-black text-sm font-medium hover:bg-[#8FE7FF] transition-colors disabled:opacity-50"
                        >
                            <Zap className="w-4 h-4" />
                            {form.processing ? 'A activar...' : 'Activar feature'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
