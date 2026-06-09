import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Home, Ruler, DollarSign, Settings, Shield } from 'lucide-react';
import { FormEvent, PropsWithChildren, ReactNode } from 'react';
import type { Fraccao, Edificio, TipoFraccao } from '@/types';

interface Props {
    fraccao?: Fraccao;
    edificio: Pick<Edificio, 'id' | 'nome' | 'codigo'> & {
        condominio?: { id: number; nome: string };
    };
    tipos_fraccao: Pick<TipoFraccao, 'id' | 'nome' | 'codigo'>[];
}

export default function Form({ fraccao, edificio, tipos_fraccao }: Props) {
    const editar = !!fraccao;

    const { data, setData, post, put, processing, errors } = useForm({
        edificio_id: edificio.id,
        tipo_fraccao_id: fraccao?.tipo_fraccao_id ?? tipos_fraccao[0]?.id ?? 0,
        identificador: fraccao?.identificador ?? '',
        piso: fraccao?.piso ?? 0,
        letra: fraccao?.letra ?? '',
        area_privativa_m2: fraccao?.area_privativa_m2 ?? 0,
        permilagem: fraccao?.permilagem ?? 0,
        quota_mensal_base: fraccao?.quota_mensal_base ?? 0,
        quota_mensal_fundo_reserva: fraccao?.quota_mensal_fundo_reserva ?? 0,
        numero_quartos: fraccao?.numero_quartos ?? '',
        numero_casas_banho: fraccao?.numero_casas_banho ?? '',
        tem_lugar_garagem: fraccao?.tem_lugar_garagem ?? false,
        numero_lugares_garagem: fraccao?.numero_lugares_garagem ?? 0,
        tem_arrecadacao: fraccao?.tem_arrecadacao ?? false,
        estado: fraccao?.estado ?? 'vaga',
        observacoes: fraccao?.observacoes ?? '',
    });

    const submeter = (e: FormEvent) => {
        e.preventDefault();
        if (editar) {
            put(`/fraccoes/${fraccao!.id}`);
        } else {
            post(`/edificios/${edificio.id}/fraccoes`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={editar ? `Editar ${fraccao!.identificador}` : 'Nova fracção'} />

            <div className="max-w-3xl mx-auto">
                <Link
                    href={`/edificios/${edificio.id}`}
                    className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar a {edificio.nome}
                </Link>

                <div className="flex items-start gap-4 mb-8">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
                            border: '0.5px solid rgba(236, 72, 153, 0.3)',
                        }}
                    >
                        <Home className="w-6 h-6 text-[#EC4899]" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            {editar ? `Editar ${fraccao!.identificador}` : `Nova fracção em ${edificio.nome}`}
                        </h1>
                        <p className="text-sm text-white/60 mt-1">
                            {editar ? 'Actualize os dados.' : 'Preencha os dados da nova fracção.'}
                        </p>
                    </div>
                </div>

                <form onSubmit={submeter} className="space-y-5">
                    {/* Identificação */}
                    <Seccao icon={Home} iconColor="#EC4899" titulo="Identificação">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Campo label="Tipo" erro={errors.tipo_fraccao_id} obrigatorio>
                                <select
                                    value={data.tipo_fraccao_id}
                                    onChange={(e) => setData('tipo_fraccao_id', parseInt(e.target.value))}
                                    className="input"
                                >
                                    {tipos_fraccao.map((t) => (
                                        <option key={t.id} value={t.id} className="bg-[#16163A]">
                                            {t.nome}
                                        </option>
                                    ))}
                                </select>
                            </Campo>
                            <Campo label="Identificador" erro={errors.identificador} obrigatorio ajuda="Ex: 3ºB, R/C Esq">
                                <input
                                    type="text"
                                    value={data.identificador}
                                    onChange={(e) => setData('identificador', e.target.value)}
                                    className="input"
                                    placeholder="3ºB"
                                />
                            </Campo>
                            <Campo label="Piso" erro={errors.piso} obrigatorio>
                                <input
                                    type="number"
                                    value={data.piso}
                                    onChange={(e) => setData('piso', parseInt(e.target.value))}
                                    className="input"
                                />
                            </Campo>
                        </div>
                    </Seccao>

                    {/* Área e permilagem */}
                    <Seccao icon={Ruler} iconColor="#00D4FF" titulo="Área e permilagem">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Campo label="Área privativa (m²)" erro={errors.area_privativa_m2} obrigatorio>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.area_privativa_m2}
                                    onChange={(e) => setData('area_privativa_m2', parseFloat(e.target.value))}
                                    className="input"
                                />
                            </Campo>
                            <Campo label="Permilagem (‰)" erro={errors.permilagem} obrigatorio ajuda="Percentagem em milésimas do edifício">
                                <input
                                    type="number"
                                    step="0.0001"
                                    min="0"
                                    value={data.permilagem}
                                    onChange={(e) => setData('permilagem', parseFloat(e.target.value))}
                                    className="input"
                                />
                            </Campo>
                        </div>
                    </Seccao>

                    {/* Quotas */}
                    <Seccao icon={DollarSign} iconColor="#A855F7" titulo="Quotas mensais (Kz)">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Campo label="Quota base" erro={errors.quota_mensal_base} obrigatorio>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.quota_mensal_base}
                                    onChange={(e) => setData('quota_mensal_base', parseFloat(e.target.value))}
                                    className="input"
                                />
                            </Campo>
                            <Campo label="Fundo de reserva" erro={errors.quota_mensal_fundo_reserva} obrigatorio>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.quota_mensal_fundo_reserva}
                                    onChange={(e) => setData('quota_mensal_fundo_reserva', parseFloat(e.target.value))}
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
                                <span className="text-white font-medium">DP 141/15 Art. 22:</span> a quota mensal total
                                não deve exceder 6 UCF × área privativa.
                            </p>
                        </div>
                    </Seccao>

                    {/* Características */}
                    <Seccao icon={Settings} iconColor="#10B981" titulo="Características">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Campo label="Nº quartos" erro={errors.numero_quartos}>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.numero_quartos}
                                    onChange={(e) => setData('numero_quartos', e.target.value)}
                                    className="input"
                                />
                            </Campo>
                            <Campo label="Nº casas de banho" erro={errors.numero_casas_banho}>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.numero_casas_banho}
                                    onChange={(e) => setData('numero_casas_banho', e.target.value)}
                                    className="input"
                                />
                            </Campo>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer select-none py-1">
                            <input
                                type="checkbox"
                                checked={data.tem_lugar_garagem}
                                onChange={(e) => setData('tem_lugar_garagem', e.target.checked)}
                                className="rounded border-white/20 bg-white/5 text-[#00D4FF] focus:ring-[#00D4FF]/30 focus:ring-offset-0"
                            />
                            <span className="text-sm text-white">Tem lugar de garagem</span>
                        </label>

                        {data.tem_lugar_garagem && (
                            <Campo label="Nº lugares garagem" erro={errors.numero_lugares_garagem}>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.numero_lugares_garagem}
                                    onChange={(e) => setData('numero_lugares_garagem', parseInt(e.target.value))}
                                    className="input sm:w-32"
                                />
                            </Campo>
                        )}

                        <label className="flex items-center gap-3 cursor-pointer select-none py-1">
                            <input
                                type="checkbox"
                                checked={data.tem_arrecadacao}
                                onChange={(e) => setData('tem_arrecadacao', e.target.checked)}
                                className="rounded border-white/20 bg-white/5 text-[#00D4FF] focus:ring-[#00D4FF]/30 focus:ring-offset-0"
                            />
                            <span className="text-sm text-white">Tem arrecadação</span>
                        </label>

                        <Campo label="Estado actual" erro={errors.estado} obrigatorio>
                            <select
                                value={data.estado}
                                onChange={(e) => setData('estado', e.target.value)}
                                className="input sm:w-48"
                            >
                                <option value="vaga" className="bg-[#16163A]">Vaga</option>
                                <option value="ocupada" className="bg-[#16163A]">Ocupada</option>
                                <option value="arrendada" className="bg-[#16163A]">Arrendada</option>
                                <option value="obras" className="bg-[#16163A]">Em obras</option>
                            </select>
                        </Campo>

                        <Campo label="Observações" erro={errors.observacoes}>
                            <textarea
                                value={data.observacoes}
                                onChange={(e) => setData('observacoes', e.target.value)}
                                rows={3}
                                className="input resize-none"
                            />
                        </Campo>
                    </Seccao>

                    <div
                        className="flex items-center justify-end gap-3 pt-5 mt-6"
                        style={{ borderTop: '0.5px solid rgba(255, 255, 255, 0.05)' }}
                    >
                        <Link href={`/edificios/${edificio.id}`} className="btn-secondary">
                            Cancelar
                        </Link>
                        <button type="submit" disabled={processing} className="btn-primary">
                            <Save className="h-4 w-4" />
                            {processing ? 'A guardar...' : editar ? 'Guardar alterações' : 'Criar fracção'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

function Seccao({
    icon: Icon,
    iconColor,
    titulo,
    children,
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
    label,
    erro,
    obrigatorio,
    ajuda,
    children,
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
