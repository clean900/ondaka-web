import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft, Save, Building2, MapPin, FileText,
    DollarSign, Shield, Home, Layers, Store, Grid3x3,
} from 'lucide-react';
import { FormEvent, PropsWithChildren, ReactNode } from 'react';
import type { Condominio, TipoCondominio } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
    condominio?: Condominio;
    provincias: string[];
}

export default function Form({ condominio, provincias }: Props) {
    const editar = !!condominio;

    const { data, setData, post, put, processing, errors } = useForm<any>({
        nome: condominio?.nome ?? '',
        codigo: condominio?.codigo ?? '',
        tipo: condominio?.tipo ?? 'vertical',
        numero_blocos_previsto: condominio?.numero_blocos_previsto ?? '',
        tem_area_comercial: condominio?.tem_area_comercial ?? false,
        nif: condominio?.nif ?? '',
        morada: condominio?.morada ?? '',
        provincia: condominio?.provincia ?? 'Luanda',
        municipio: condominio?.municipio ?? '',
        distrito_urbano: condominio?.distrito_urbano ?? '',
        bairro: condominio?.bairro ?? '',
        data_constituicao: condominio?.data_constituicao ?? '',
        numero_matricula: condominio?.numero_matricula ?? '',
        conservatoria: condominio?.conservatoria ?? '',
        iban: condominio?.iban ?? '',
        banco: condominio?.banco ?? '',
        moeda: condominio?.moeda ?? 'AOA',
        ucf_valor_actual: condominio?.ucf_valor_actual ?? '',
        percentagem_fundo_reserva: condominio?.percentagem_fundo_reserva ?? 10,
        estado: condominio?.estado ?? 'activo',
    });

    const submeter = (e: FormEvent) => {
        e.preventDefault();
        if (editar) {
            put(`/condominios/${condominio!.id}`);
        } else {
            post('/condominios');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={editar ? `Editar ${condominio!.nome}` : 'Novo Condomínio'} />

            <div className="max-w-4xl mx-auto">
                <Link
                    href="/condominios"
                    className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar à lista
                </Link>

                <div className="flex items-start gap-4 mb-8">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
                            border: '0.5px solid rgba(0, 212, 255, 0.3)',
                        }}
                    >
                        <Building2 className="w-6 h-6 text-[#00D4FF]" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            {editar ? `Editar ${condominio!.nome}` : 'Novo condomínio'}
                        </h1>
                        <p className="text-sm text-white/60 mt-1">
                            {editar ? 'Actualize os dados do condomínio.' : 'Preencha os dados para criar um novo condomínio.'}
                        </p>
                    </div>
                </div>

                <form onSubmit={submeter} className="space-y-5">

                    {!editar && (
                        <Seccao icon={Grid3x3} iconColor="#A855F7" titulo="Tipo de empreendimento">
                            <p className="text-xs text-white/50 mb-1">
                                Seleccione o formato que melhor descreve este condomínio.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                <TipoCard
                                    activo={data.tipo === 'vertical'}
                                    icon={Building2}
                                    label="Vertical (Prédios)"
                                    descricao="Edifícios com apartamentos"
                                    exemplo="Ex: Torres Atlântico, Acquaville"
                                    cor="#00D4FF"
                                    onClick={() => setData('tipo', 'vertical')}
                                />
                                <TipoCard
                                    activo={data.tipo === 'horizontal'}
                                    icon={Home}
                                    label="Horizontal (Vivendas)"
                                    descricao="Moradias/vivendas térreas, duplex, triplex"
                                    exemplo="Ex: Dolce Vita, Vale do Imbondeiro"
                                    cor="#A855F7"
                                    onClick={() => setData('tipo', 'horizontal')}
                                />
                                <TipoCard
                                    activo={data.tipo === 'misto'}
                                    icon={Layers}
                                    label="Misto"
                                    descricao="Combina edifícios, vivendas e/ou comércio"
                                    exemplo="Ex: Villa Nostra, Zenith Towers"
                                    cor="#EC4899"
                                    onClick={() => setData('tipo', 'misto')}
                                />
                                <TipoCard
                                    activo={data.tipo === 'loteamento'}
                                    icon={Store}
                                    label="Loteamento"
                                    descricao="Lotes/terrenos para urbanização"
                                    exemplo="Ex: Centralidades, Fases urbanizadas"
                                    cor="#10B981"
                                    onClick={() => setData('tipo', 'loteamento')}
                                />
                            </div>
                            {errors.tipo && <p className="mt-2 text-xs text-red-400">{errors.tipo}</p>}
                        </Seccao>
                    )}

                    <Seccao icon={Building2} iconColor="#00D4FF" titulo="Identificação">
                        <Campo label="Nome" erro={errors.nome} obrigatorio>
                            <input
                                type="text"
                                value={data.nome}
                                onChange={(e) => setData('nome', e.target.value)}
                                className="input"
                                placeholder={data.tipo === 'horizontal' ? 'Ex: Dolce Vita Talatona' : 'Ex: Torres Atlântico'}
                            />
                        </Campo>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Campo label="Código" erro={errors.codigo} obrigatorio ajuda="Ex: COND-LUA-001">
                                <input
                                    type="text"
                                    value={data.codigo}
                                    onChange={(e) => setData('codigo', e.target.value.toUpperCase())}
                                    className="input font-mono"
                                    placeholder="COND-XXX-000"
                                />
                            </Campo>
                            <Campo label="NIF" erro={errors.nif}>
                                <input
                                    type="text"
                                    value={data.nif}
                                    onChange={(e) => setData('nif', e.target.value)}
                                    className="input"
                                    placeholder="5999999999"
                                />
                            </Campo>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Campo
                                label={labelNumeroBlocos(data.tipo)}
                                erro={errors.numero_blocos_previsto}
                                ajuda="Opcional — ajuda no planeamento"
                            >
                                <input
                                    type="number"
                                    min="1"
                                    value={data.numero_blocos_previsto}
                                    onChange={(e) => setData('numero_blocos_previsto', e.target.value)}
                                    className="input"
                                    placeholder="Ex: 2"
                                />
                            </Campo>
                            {(data.tipo === 'horizontal' || data.tipo === 'loteamento' || data.tipo === 'misto') && (
                                <div className="flex items-end">
                                    <label className="flex items-center gap-3 cursor-pointer select-none py-2">
                                        <input
                                            type="checkbox"
                                            checked={data.tem_area_comercial}
                                            onChange={(e) => setData('tem_area_comercial', e.target.checked)}
                                            className="rounded border-white/20 bg-white/5 text-[#00D4FF] focus:ring-[#00D4FF]/30 focus:ring-offset-0"
                                        />
                                        <span className="text-sm text-white">Tem área comercial (lojas/escritórios)</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </Seccao>

                    <Seccao icon={MapPin} iconColor="#A855F7" titulo="Localização">
                        <Campo label="Morada" erro={errors.morada} obrigatorio>
                            <textarea
                                value={data.morada}
                                onChange={(e) => setData('morada', e.target.value)}
                                rows={2}
                                className="input resize-none"
                                placeholder="Rua / Avenida, número, complemento..."
                            />
                        </Campo>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Campo label="Província" erro={errors.provincia} obrigatorio>
                                <select
                                    value={data.provincia}
                                    onChange={(e) => setData('provincia', e.target.value)}
                                    className="input"
                                >
                                    {provincias.map((p) => (
                                        <option key={p} value={p} className="bg-[#16163A]">{p}</option>
                                    ))}
                                </select>
                            </Campo>
                            <Campo label="Município" erro={errors.municipio} obrigatorio>
                                <input
                                    type="text"
                                    value={data.municipio}
                                    onChange={(e) => setData('municipio', e.target.value)}
                                    className="input"
                                />
                            </Campo>
                            <Campo label="Bairro" erro={errors.bairro}>
                                <input
                                    type="text"
                                    value={data.bairro}
                                    onChange={(e) => setData('bairro', e.target.value)}
                                    className="input"
                                />
                            </Campo>
                        </div>
                    </Seccao>

                    <Seccao icon={FileText} iconColor="#EC4899" titulo="Dados legais (DP 141/15)">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Campo label="Data de constituição" erro={errors.data_constituicao}>
                                <input
                                    type="date"
                                    value={typeof data.data_constituicao === 'string' ? data.data_constituicao.slice(0, 10) : ''}
                                    onChange={(e) => setData('data_constituicao', e.target.value)}
                                    className="input"
                                />
                            </Campo>
                            <Campo label="Nº matrícula predial" erro={errors.numero_matricula}>
                                <input
                                    type="text"
                                    value={data.numero_matricula}
                                    onChange={(e) => setData('numero_matricula', e.target.value)}
                                    className="input"
                                    placeholder="CRP-LUA-2022/0415"
                                />
                            </Campo>
                        </div>
                        <Campo label="Conservatória" erro={errors.conservatoria}>
                            <input
                                type="text"
                                value={data.conservatoria}
                                onChange={(e) => setData('conservatoria', e.target.value)}
                                className="input"
                                placeholder="Conservatória do Registo Predial de..."
                            />
                        </Campo>
                    </Seccao>

                    <Seccao icon={DollarSign} iconColor="#00D4FF" titulo="Financeiro">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Campo label="Banco" erro={errors.banco}>
                                <input
                                    type="text"
                                    value={data.banco}
                                    onChange={(e) => setData('banco', e.target.value)}
                                    className="input"
                                    placeholder="BFA, BAI, BIC..."
                                />
                            </Campo>
                            <Campo label="IBAN" erro={errors.iban} ajuda="AO06 XXXX XXXX XXXX XXXX XXXX X">
                                <input
                                    type="text"
                                    value={data.iban}
                                    onChange={(e) => setData('iban', e.target.value)}
                                    className="input font-mono"
                                    placeholder="AO06 0000 0000 0000 0000 0000 0"
                                />
                            </Campo>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Campo label="Valor actual UCF (Kz)" erro={errors.ucf_valor_actual} ajuda="Unidade de Correcção Fiscal">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.ucf_valor_actual}
                                    onChange={(e) => setData('ucf_valor_actual', e.target.value)}
                                    className="input"
                                    placeholder="88.00"
                                />
                            </Campo>
                            <Campo label="% Fundo de reserva" erro={errors.percentagem_fundo_reserva} obrigatorio ajuda="DP 141/15 Art. 20: mínimo 10%">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="10"
                                    max="100"
                                    value={data.percentagem_fundo_reserva}
                                    onChange={(e) => setData('percentagem_fundo_reserva', parseFloat(e.target.value))}
                                    className="input"
                                />
                            </Campo>
                        </div>

                        <div
                            className="flex items-start gap-3 p-4 rounded-lg"
                            style={{
                                background: 'rgba(0, 212, 255, 0.05)',
                                border: '0.5px solid rgba(0, 212, 255, 0.2)',
                            }}
                        >
                            <Shield className="h-4 w-4 text-[#00D4FF] flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-white/70 leading-relaxed">
                                Conforme <span className="text-white font-medium">Decreto Presidencial 141/15 de 29 de Junho</span>,
                                o fundo de reserva deve corresponder a pelo menos 10% das quotas mensais
                                e as quotas não podem exceder 6 UCF por m² de área privativa.
                            </p>
                        </div>
                    </Seccao>

                    <div className="flex items-center justify-end gap-3 pt-5 mt-6" style={{ borderTop: '0.5px solid rgba(255, 255, 255, 0.05)' }}>
                        <Link href="/condominios" className="btn-secondary">Cancelar</Link>
                        <button type="submit" disabled={processing} className="btn-primary">
                            <Save className="h-4 w-4" />
                            {processing ? 'A guardar...' : editar ? 'Guardar alterações' : 'Criar condomínio'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

function labelNumeroBlocos(tipo: TipoCondominio): string {
    const map: Record<TipoCondominio, string> = {
        vertical: 'Nº de edifícios previstos',
        horizontal: 'Nº de conjuntos previstos',
        misto: 'Nº de blocos previstos',
        loteamento: 'Nº de fases previstas',
    };
    return map[tipo] ?? 'Nº de blocos';
}

function TipoCard({
    activo, icon: Icon, label, descricao, exemplo, cor, onClick,
}: {
    activo: boolean;
    icon: React.ElementType;
    label: string;
    descricao: string;
    exemplo: string;
    cor: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'text-left p-4 rounded-xl transition-all',
                activo ? 'text-white' : 'text-white/60 hover:text-white',
            )}
            style={{
                background: activo ? `${cor}12` : 'rgba(255,255,255,0.02)',
                border: `0.5px solid ${activo ? cor + '60' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: activo ? `0 0 20px ${cor}20` : 'none',
            }}
        >
            <div className="flex items-start gap-3">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${cor}15`, border: `0.5px solid ${cor}35` }}
                >
                    <Icon className="w-4 h-4" style={{ color: cor }} />
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-sm mb-0.5" style={{ color: activo ? cor : undefined }}>
                        {label}
                    </div>
                    <div className="text-xs text-white/60 mb-1.5">{descricao}</div>
                    <div className="text-[10px] text-white/40">{exemplo}</div>
                </div>
            </div>
        </button>
    );
}

function Seccao({
    icon: Icon, iconColor, titulo, children,
}: PropsWithChildren<{ icon: React.ElementType; iconColor: string; titulo: string }>) {
    return (
        <div className="card">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/5">
                <Icon className="w-4 h-4" style={{ color: iconColor }} />
                <h2 className="text-sm font-semibold text-white uppercase tracking-[1px]">{titulo}</h2>
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Campo({
    label, erro, obrigatorio, ajuda, children,
}: {
    label: string;
    erro?: string;
    obrigatorio?: boolean;
    ajuda?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wider">
                {label} {obrigatorio && <span className="text-[#EC4899]">*</span>}
            </label>
            {children}
            {ajuda && !erro && <p className="mt-1.5 text-[11px] text-white/40">{ajuda}</p>}
            {erro && <p className="mt-1.5 text-xs text-red-400">{erro}</p>}
        </div>
    );
}
