import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Building2, Layers, Store, Briefcase, Grid3x3, Home } from 'lucide-react';
import { FormEvent, PropsWithChildren, ReactNode } from 'react';
import type { Edificio, Condominio, TipoBloco, TipoCondominio } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
    edificio?: Edificio;
    condominio: Pick<Condominio, 'id' | 'nome' | 'codigo' | 'tipo'>;
}

// Mapa de tipos de bloco disponíveis por tipo de condomínio
const TIPOS_BLOCO_DISPONIVEIS: Record<TipoCondominio, TipoBloco[]> = {
    vertical: ['torre', 'comercial', 'empresarial'],
    horizontal: ['conjunto', 'comercial'],
    misto: ['torre', 'conjunto', 'comercial', 'empresarial'],
    loteamento: ['loteamento', 'comercial'],
};

const TIPO_BLOCO_CONFIG: Record<TipoBloco, { label: string; descricao: string; icon: React.ElementType; cor: string }> = {
    torre: {
        label: 'Torre/Edifício',
        descricao: 'Prédio com apartamentos',
        icon: Building2,
        cor: '#00D4FF',
    },
    conjunto: {
        label: 'Conjunto de Vivendas',
        descricao: 'Agrupamento de moradias',
        icon: Home,
        cor: '#A855F7',
    },
    comercial: {
        label: 'Galeria Comercial',
        descricao: 'Lojas agrupadas',
        icon: Store,
        cor: '#EC4899',
    },
    empresarial: {
        label: 'Bloco Empresarial',
        descricao: 'Escritórios',
        icon: Briefcase,
        cor: '#F59E0B',
    },
    loteamento: {
        label: 'Fase de Loteamento',
        descricao: 'Agrupamento de lotes',
        icon: Grid3x3,
        cor: '#10B981',
    },
};

export default function Form({ edificio, condominio }: Props) {
    const editar = !!edificio;
    const tiposDisponiveis = TIPOS_BLOCO_DISPONIVEIS[condominio.tipo] ?? ['torre'];
    const tipoInicial = edificio?.tipo_bloco ?? tiposDisponiveis[0];

    const { data, setData, post, put, processing, errors } = useForm<any>({
        condominio_id: condominio.id,
        nome: edificio?.nome ?? '',
        codigo: edificio?.codigo ?? '',
        tipo_bloco: tipoInicial,
        numero_pisos: edificio?.numero_pisos ?? 1,
        pisos_subsolo: edificio?.pisos_subsolo ?? 0,
        tem_elevador: edificio?.tem_elevador ?? false,
        numero_elevadores: edificio?.numero_elevadores ?? 0,
        descricao: edificio?.descricao ?? '',
    });

    const submeter = (e: FormEvent) => {
        e.preventDefault();
        if (editar) {
            put(`/edificios/${edificio!.id}`);
        } else {
            post(`/condominios/${condominio.id}/edificios`);
        }
    };

    const config = TIPO_BLOCO_CONFIG[data.tipo_bloco as TipoBloco] ?? TIPO_BLOCO_CONFIG.torre;
    const mostrarPisos = data.tipo_bloco === 'torre' || data.tipo_bloco === 'empresarial';
    const labelHeader = tituloFormulario(condominio.tipo, editar, edificio?.nome);

    return (
        <AuthenticatedLayout>
            <Head title={labelHeader} />

            <div className="max-w-3xl mx-auto">
                <Link
                    href={`/condominios/${condominio.id}`}
                    className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar a {condominio.nome}
                </Link>

                <div className="flex items-start gap-4 mb-8">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: `linear-gradient(135deg, ${config.cor}25 0%, ${config.cor}10 100%)`,
                            border: `0.5px solid ${config.cor}50`,
                        }}
                    >
                        <config.icon className="w-6 h-6" style={{ color: config.cor }} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            {labelHeader}
                        </h1>
                        <p className="text-sm text-white/60 mt-1">
                            {editar ? 'Actualize os dados.' : `Adicione um novo ${condominio.tipo === 'horizontal' ? 'conjunto' : 'bloco'} ao condomínio.`}
                        </p>
                    </div>
                </div>

                <form onSubmit={submeter} className="space-y-5">

                    {/* Tipo de bloco — só mostrar se houver mais que 1 disponível */}
                    {!editar && tiposDisponiveis.length > 1 && (
                        <Seccao icon={Grid3x3} iconColor="#A855F7" titulo="Tipo de bloco">
                            <p className="text-xs text-white/50 mb-3">
                                Escolha o tipo de bloco adequado a este condomínio.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {tiposDisponiveis.map((tipo) => {
                                    const cfg = TIPO_BLOCO_CONFIG[tipo];
                                    return (
                                        <TipoBlocoCard
                                            key={tipo}
                                            activo={data.tipo_bloco === tipo}
                                            icon={cfg.icon}
                                            label={cfg.label}
                                            descricao={cfg.descricao}
                                            cor={cfg.cor}
                                            onClick={() => setData('tipo_bloco', tipo)}
                                        />
                                    );
                                })}
                            </div>
                        </Seccao>
                    )}

                    <Seccao icon={config.icon} iconColor={config.cor} titulo="Identificação">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Campo label="Nome" erro={errors.nome} obrigatorio>
                                <input
                                    type="text"
                                    value={data.nome}
                                    onChange={(e) => setData('nome', e.target.value)}
                                    className="input"
                                    placeholder={placeholderNome(data.tipo_bloco)}
                                />
                            </Campo>
                            <Campo label="Código" erro={errors.codigo} obrigatorio ajuda="Ex: A, B, T1, Fase1">
                                <input
                                    type="text"
                                    value={data.codigo}
                                    onChange={(e) => setData('codigo', e.target.value.toUpperCase())}
                                    className="input font-mono"
                                    placeholder="A"
                                />
                            </Campo>
                        </div>
                    </Seccao>

                    {/* Pisos — só para torres e empresariais */}
                    {mostrarPisos && (
                        <Seccao icon={Layers} iconColor="#00D4FF" titulo="Estrutura">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Campo label="Nº de pisos" erro={errors.numero_pisos} obrigatorio>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.numero_pisos ?? 1}
                                        onChange={(e) => setData('numero_pisos', parseInt(e.target.value))}
                                        className="input"
                                    />
                                </Campo>
                                <Campo label="Pisos subsolo" erro={errors.pisos_subsolo}>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.pisos_subsolo ?? 0}
                                        onChange={(e) => setData('pisos_subsolo', parseInt(e.target.value))}
                                        className="input"
                                    />
                                </Campo>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer select-none py-1">
                                <input
                                    type="checkbox"
                                    checked={data.tem_elevador}
                                    onChange={(e) => setData('tem_elevador', e.target.checked)}
                                    className="rounded border-white/20 bg-white/5 text-[#00D4FF] focus:ring-[#00D4FF]/30 focus:ring-offset-0"
                                />
                                <span className="text-sm text-white">Tem elevador</span>
                            </label>

                            {data.tem_elevador && (
                                <Campo label="Nº de elevadores" erro={errors.numero_elevadores}>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.numero_elevadores}
                                        onChange={(e) => setData('numero_elevadores', parseInt(e.target.value))}
                                        className="input sm:w-32"
                                    />
                                </Campo>
                            )}
                        </Seccao>
                    )}

                    {/* Descrição — sempre */}
                    <Seccao icon={config.icon} iconColor={config.cor} titulo="Informações adicionais">
                        <Campo label="Descrição" erro={errors.descricao}>
                            <textarea
                                value={data.descricao}
                                onChange={(e) => setData('descricao', e.target.value)}
                                rows={3}
                                className="input resize-none"
                                placeholder="Notas, referências, características especiais..."
                            />
                        </Campo>
                    </Seccao>

                    <div className="flex items-center justify-end gap-3 pt-5 mt-6" style={{ borderTop: '0.5px solid rgba(255, 255, 255, 0.05)' }}>
                        <Link href={`/condominios/${condominio.id}`} className="btn-secondary">
                            Cancelar
                        </Link>
                        <button type="submit" disabled={processing} className="btn-primary">
                            <Save className="h-4 w-4" />
                            {processing ? 'A guardar...' : editar ? 'Guardar alterações' : `Criar ${labelAcao(data.tipo_bloco)}`}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

function tituloFormulario(tipoCondominio: TipoCondominio, editar: boolean, nome?: string): string {
    if (editar) return `Editar ${nome}`;
    const labels: Record<TipoCondominio, string> = {
        vertical: 'Novo edifício',
        horizontal: 'Novo conjunto',
        misto: 'Novo bloco',
        loteamento: 'Nova fase',
    };
    return labels[tipoCondominio] ?? 'Novo bloco';
}

function placeholderNome(tipoBloco: TipoBloco): string {
    const placeholders: Record<TipoBloco, string> = {
        torre: 'Torre A, Bloco Norte',
        conjunto: 'Vivendas Fase 1, Conjunto Principal',
        comercial: 'Galeria Entrada, Centro Comercial',
        empresarial: 'Torre Empresarial A',
        loteamento: 'Fase 1, Expansão Oeste',
    };
    return placeholders[tipoBloco] ?? 'Nome';
}

function labelAcao(tipoBloco: TipoBloco): string {
    const labels: Record<TipoBloco, string> = {
        torre: 'edifício',
        conjunto: 'conjunto',
        comercial: 'galeria',
        empresarial: 'bloco',
        loteamento: 'fase',
    };
    return labels[tipoBloco] ?? 'bloco';
}

function TipoBlocoCard({
    activo, icon: Icon, label, descricao, cor, onClick,
}: {
    activo: boolean;
    icon: React.ElementType;
    label: string;
    descricao: string;
    cor: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'text-left p-3 rounded-xl transition-all flex items-start gap-3',
                activo ? 'text-white' : 'text-white/60 hover:text-white',
            )}
            style={{
                background: activo ? `${cor}12` : 'rgba(255,255,255,0.02)',
                border: `0.5px solid ${activo ? cor + '60' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: activo ? `0 0 15px ${cor}20` : 'none',
            }}
        >
            <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${cor}15`, border: `0.5px solid ${cor}35` }}
            >
                <Icon className="w-4 h-4" style={{ color: cor }} />
            </div>
            <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: activo ? cor : undefined }}>
                    {label}
                </div>
                <div className="text-xs text-white/60 mt-0.5">{descricao}</div>
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
