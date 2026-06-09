import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft, Save, Home, Calendar, DollarSign, FileText,
    UserCircle, Briefcase,
} from 'lucide-react';
import { FormEvent, PropsWithChildren, ReactNode } from 'react';
import type { Condomino } from '@/types';
import { cn } from '@/lib/utils';

interface FraccaoOption {
    id: number;
    identificador: string;
    area_privativa_m2: number;
    edificio_nome: string | null;
    condominio_nome: string | null;
}

interface ProprietarioOption {
    id: number;
    nome: string;
}

interface Props {
    condomino: Condomino;
    fraccaoId?: number | null;
    fraccoes: FraccaoOption[];
    proprietarios: ProprietarioOption[];
}

export default function Form({ condomino, fraccaoId, fraccoes, proprietarios }: Props) {
    const { data, setData, post, processing, errors } = useForm<any>({
        fraccao_id: fraccaoId ?? '',
        tipo: 'proprietario',
        percentagem_propriedade: 100,
        data_inicio: new Date().toISOString().slice(0, 10),
        data_fim: '',
        numero_contrato: '',
        data_contrato: '',
        valor_renda_mensal: '',
        proprietario_id: '',
        responsavel_facturacao: false,
        recebe_comunicacoes: true,
        observacoes: '',
        estado: 'activo',
    });

    const submeter = (e: FormEvent) => {
        e.preventDefault();
        post(`/condominos/${condomino.id}/contratos`);
    };

    const ehProprietario = data.tipo === 'proprietario';
    const ehInquilino = data.tipo === 'inquilino';

    return (
        <AuthenticatedLayout>
            <Head title="Associar fracção" />

            <div className="max-w-3xl mx-auto">
                <Link href={`/condominos/${condomino.id}`} className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar a {condomino.nome_completo}
                </Link>

                <div className="flex items-start gap-4 mb-8">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
                            border: '0.5px solid rgba(0, 212, 255, 0.3)',
                        }}
                    >
                        <Home className="w-6 h-6 text-[#00D4FF]" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            Associar fracção
                        </h1>
                        <p className="text-sm text-white/60 mt-1">
                            Adicionar uma fracção ao condómino <span className="text-white">{condomino.nome_completo}</span>.
                        </p>
                    </div>
                </div>

                <form onSubmit={submeter} className="space-y-5">
                    {/* Tipo de ocupação */}
                    <Seccao icon={FileText} iconColor="#A855F7" titulo="Tipo de ocupação">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <TipoCard
                                tipo="proprietario"
                                activo={data.tipo === 'proprietario'}
                                icon={Home}
                                label="Proprietário"
                                cor="#A855F7"
                                onClick={() => setData('tipo', 'proprietario')}
                            />
                            <TipoCard
                                tipo="inquilino"
                                activo={data.tipo === 'inquilino'}
                                icon={Briefcase}
                                label="Inquilino"
                                cor="#00D4FF"
                                onClick={() => setData('tipo', 'inquilino')}
                            />
                            <TipoCard
                                tipo="usufructo"
                                activo={data.tipo === 'usufructo'}
                                icon={FileText}
                                label="Usufruto"
                                cor="#F59E0B"
                                onClick={() => setData('tipo', 'usufructo')}
                            />
                            <TipoCard
                                tipo="cedencia"
                                activo={data.tipo === 'cedencia'}
                                icon={FileText}
                                label="Cedência"
                                cor="#64748B"
                                onClick={() => setData('tipo', 'cedencia')}
                            />
                        </div>
                    </Seccao>

                    {/* Fracção */}
                    <Seccao icon={Home} iconColor="#00D4FF" titulo="Fracção">
                        <Campo label="Selecione a fracção" erro={errors.fraccao_id} obrigatorio>
                            <select
                                value={data.fraccao_id}
                                onChange={(e) => setData('fraccao_id', e.target.value)}
                                className="input"
                            >
                                <option value="">— Escolha uma fracção —</option>
                                {fraccoes.map((f) => (
                                    <option key={f.id} value={f.id} className="bg-[#16163A]">
                                        {f.condominio_nome} / {f.edificio_nome} / {f.identificador} ({f.area_privativa_m2} m²)
                                    </option>
                                ))}
                            </select>
                        </Campo>

                        {ehProprietario && (
                            <Campo label="Percentagem de propriedade (%)" erro={errors.percentagem_propriedade} ajuda="Use 100% se é dono único. Em caso de comproprietários, ajuste.">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max="100"
                                    value={data.percentagem_propriedade}
                                    onChange={(e) => setData('percentagem_propriedade', parseFloat(e.target.value))}
                                    className="input sm:w-40"
                                />
                            </Campo>
                        )}

                        {ehInquilino && (
                            <>
                                <Campo label="Valor da renda mensal (Kz)" erro={errors.valor_renda_mensal}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.valor_renda_mensal}
                                        onChange={(e) => setData('valor_renda_mensal', e.target.value)}
                                        className="input"
                                        placeholder="0.00"
                                    />
                                </Campo>
                                <Campo label="Proprietário (senhorio)" erro={errors.proprietario_id} ajuda="Opcional — quem recebe a renda">
                                    <select
                                        value={data.proprietario_id}
                                        onChange={(e) => setData('proprietario_id', e.target.value)}
                                        className="input"
                                    >
                                        <option value="">—</option>
                                        {proprietarios.map((p) => (
                                            <option key={p.id} value={p.id} className="bg-[#16163A]">{p.nome}</option>
                                        ))}
                                    </select>
                                </Campo>
                            </>
                        )}
                    </Seccao>

                    {/* Datas */}
                    <Seccao icon={Calendar} iconColor="#EC4899" titulo="Vigência">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Campo label="Data de início" erro={errors.data_inicio} obrigatorio>
                                <input
                                    type="date"
                                    value={data.data_inicio}
                                    onChange={(e) => setData('data_inicio', e.target.value)}
                                    className="input"
                                />
                            </Campo>
                            <Campo label="Data de fim" erro={errors.data_fim} ajuda="Deixe em branco se for por tempo indeterminado">
                                <input
                                    type="date"
                                    value={data.data_fim}
                                    onChange={(e) => setData('data_fim', e.target.value)}
                                    className="input"
                                />
                            </Campo>
                        </div>
                    </Seccao>

                    {/* Contrato (opcional) */}
                    <Seccao icon={FileText} iconColor="#64748B" titulo="Dados do contrato (opcional)">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Campo label="Nº contrato" erro={errors.numero_contrato}>
                                <input
                                    type="text"
                                    value={data.numero_contrato}
                                    onChange={(e) => setData('numero_contrato', e.target.value)}
                                    className="input"
                                />
                            </Campo>
                            <Campo label="Data contrato" erro={errors.data_contrato}>
                                <input
                                    type="date"
                                    value={data.data_contrato}
                                    onChange={(e) => setData('data_contrato', e.target.value)}
                                    className="input"
                                />
                            </Campo>
                        </div>
                    </Seccao>

                    {/* Configurações */}
                    <Seccao icon={UserCircle} iconColor="#10B981" titulo="Configurações">
                        <label className="flex items-center gap-3 cursor-pointer select-none py-1">
                            <input
                                type="checkbox"
                                checked={data.responsavel_facturacao}
                                onChange={(e) => setData('responsavel_facturacao', e.target.checked)}
                                className="rounded border-white/20 bg-white/5 text-[#00D4FF] focus:ring-[#00D4FF]/30 focus:ring-offset-0"
                            />
                            <div>
                                <div className="text-sm text-white">Responsável pela facturação do condomínio</div>
                                <div className="text-[11px] text-white/50 mt-0.5">
                                    {ehInquilino
                                        ? 'O inquilino paga as quotas do condomínio em vez do proprietário'
                                        : 'Este condómino recebe as facturas do condomínio'
                                    }
                                </div>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer select-none py-1">
                            <input
                                type="checkbox"
                                checked={data.recebe_comunicacoes}
                                onChange={(e) => setData('recebe_comunicacoes', e.target.checked)}
                                className="rounded border-white/20 bg-white/5 text-[#00D4FF] focus:ring-[#00D4FF]/30 focus:ring-offset-0"
                            />
                            <div>
                                <div className="text-sm text-white">Recebe comunicações do condomínio</div>
                                <div className="text-[11px] text-white/50 mt-0.5">
                                    Avisos, chat, votações e outros
                                </div>
                            </div>
                        </label>
                        <Campo label="Observações" erro={errors.observacoes}>
                            <textarea
                                value={data.observacoes}
                                onChange={(e) => setData('observacoes', e.target.value)}
                                rows={3}
                                className="input resize-none"
                            />
                        </Campo>
                    </Seccao>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-5 mt-6" style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
                        <Link href={`/condominos/${condomino.id}`} className="btn-secondary">Cancelar</Link>
                        <button type="submit" disabled={processing} className="btn-primary">
                            <Save className="h-4 w-4" />
                            {processing ? 'A guardar...' : 'Criar contrato'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

function TipoCard({
    tipo, activo, icon: Icon, label, cor, onClick,
}: { tipo: string; activo: boolean; icon: React.ElementType; label: string; cor: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'p-3 rounded-lg transition-all flex flex-col items-center gap-2',
                activo ? 'text-white' : 'text-white/60 hover:text-white',
            )}
            style={{
                background: activo ? `${cor}15` : 'rgba(255,255,255,0.02)',
                border: `0.5px solid ${activo ? cor : 'rgba(255,255,255,0.1)'}`,
                boxShadow: activo ? `0 0 20px ${cor}20` : 'none',
            }}
        >
            <Icon className="w-4 h-4" style={{ color: activo ? cor : undefined }} />
            <span className="text-xs font-medium">{label}</span>
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
}: { label: string; erro?: string; obrigatorio?: boolean; ajuda?: string; children: ReactNode }) {
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
