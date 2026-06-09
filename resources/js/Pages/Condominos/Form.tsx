import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft, Save, UserCircle, Building, Phone, MapPin,
    FileText, Briefcase, Lock, Eye, EyeOff,
} from 'lucide-react';
import { FormEvent, PropsWithChildren, ReactNode, useState } from 'react';
import type { Condomino, TipoCondomino } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
    condomino?: Condomino;
    tipoInicial?: TipoCondomino;
    provincias: string[];
}

export default function Form({ condomino, tipoInicial, provincias }: Props) {
    const editar = !!condomino;

    const { data, setData, post, put, processing, errors } = useForm<any>({
        tipo: condomino?.tipo ?? tipoInicial ?? 'singular',
        nome_completo: condomino?.nome_completo ?? '',
        nome_comercial: condomino?.nome_comercial ?? '',

        // Singular
        numero_bi: condomino?.numero_bi ?? '',
        data_nascimento: condomino?.data_nascimento ?? '',
        genero: condomino?.genero ?? '',
        nacionalidade: condomino?.nacionalidade ?? 'Angolana',
        estado_civil: condomino?.estado_civil ?? '',
        profissao: condomino?.profissao ?? '',

        // Empresa
        nif: condomino?.nif ?? '',
        data_constituicao_empresa: condomino?.data_constituicao_empresa ?? '',
        numero_registo_comercial: condomino?.numero_registo_comercial ?? '',

        // Contactos
        telefone_principal: condomino?.telefone_principal ?? '',
        telefone_alternativo: condomino?.telefone_alternativo ?? '',
        email: condomino?.email ?? '',

        // Morada
        morada: condomino?.morada ?? '',
        provincia: condomino?.provincia ?? 'Luanda',
        municipio: condomino?.municipio ?? '',
        bairro: condomino?.bairro ?? '',

        // Representante (empresa)
        representante_nome: condomino?.representante_nome ?? '',
        representante_bi: condomino?.representante_bi ?? '',
        representante_cargo: condomino?.representante_cargo ?? '',
        representante_telefone: condomino?.representante_telefone ?? '',
        representante_email: condomino?.representante_email ?? '',

        observacoes: condomino?.observacoes ?? '',
        estado: condomino?.estado ?? 'activo',

        // Conta de utilizador (apenas no store)
        criar_user: false as boolean,
        password: '',
        password_confirmation: '',
        must_change_password: false as boolean,
    });

    const [verPassword, setVerPassword] = useState(false);

    const [tabActiva, setTabActiva] = useState<'identificacao' | 'contactos' | 'extra'>('identificacao');

    const submeter = (e: FormEvent) => {
        e.preventDefault();
        if (editar) {
            put(`/condominos/${condomino!.id}`);
        } else {
            post('/condominos');
        }
    };

    const ehEmpresa = data.tipo === 'empresa';
    const ehSingular = data.tipo === 'singular';

    return (
        <AuthenticatedLayout>
            <Head title={editar ? `Editar ${condomino!.nome_completo}` : 'Novo condómino'} />

            <div className="max-w-4xl mx-auto">
                <Link
                    href="/condominos"
                    className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar à lista
                </Link>

                <div className="flex items-start gap-4 mb-6">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: ehEmpresa
                                ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)'
                                : 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%)',
                            border: `0.5px solid ${ehEmpresa ? 'rgba(236, 72, 153, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`,
                        }}
                    >
                        {ehEmpresa
                            ? <Building className="w-6 h-6 text-[#EC4899]" />
                            : <UserCircle className="w-6 h-6 text-[#A855F7]" />}
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            {editar ? `Editar ${condomino!.nome_completo}` : 'Novo condómino'}
                        </h1>
                        <p className="text-sm text-white/60 mt-1">
                            {editar ? 'Actualize os dados.' : 'Preencha os dados do novo condómino.'}
                        </p>
                    </div>
                </div>

                {/* Toggle Tipo (só na criação) */}
                {!editar && (
                    <div className="mb-6 inline-flex p-1 rounded-lg bg-white/5 border border-white/10">
                        <button
                            type="button"
                            onClick={() => setData('tipo', 'singular')}
                            className={cn(
                                'px-4 py-2 rounded-md text-sm font-medium transition',
                                ehSingular ? 'text-white' : 'text-white/50 hover:text-white/80',
                            )}
                            style={ehSingular ? {
                                background: 'linear-gradient(135deg, #A855F7 0%, #00D4FF 100%)',
                            } : undefined}
                        >
                            <UserCircle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                            Pessoa singular
                        </button>
                        <button
                            type="button"
                            onClick={() => setData('tipo', 'empresa')}
                            className={cn(
                                'px-4 py-2 rounded-md text-sm font-medium transition',
                                ehEmpresa ? 'text-white' : 'text-white/50 hover:text-white/80',
                            )}
                            style={ehEmpresa ? {
                                background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)',
                            } : undefined}
                        >
                            <Building className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                            Empresa
                        </button>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 mb-5 border-b border-white/5">
                    <TabButton activa={tabActiva === 'identificacao'} onClick={() => setTabActiva('identificacao')} icon={FileText} label="Identificação" />
                    <TabButton activa={tabActiva === 'contactos'} onClick={() => setTabActiva('contactos')} icon={Phone} label="Contactos" />
                    {ehEmpresa && (
                        <TabButton activa={tabActiva === 'extra'} onClick={() => setTabActiva('extra')} icon={Briefcase} label="Representante" />
                    )}
                </div>

                <form onSubmit={submeter} className="space-y-5">
                    {/* Identificação */}
                    {tabActiva === 'identificacao' && (
                        <>
                            <Seccao icon={FileText} iconColor={ehEmpresa ? '#EC4899' : '#A855F7'} titulo={ehEmpresa ? 'Dados da empresa' : 'Dados pessoais'}>
                                <Campo label={ehEmpresa ? 'Razão social' : 'Nome completo'} erro={errors.nome_completo} obrigatorio>
                                    <input
                                        type="text"
                                        value={data.nome_completo}
                                        onChange={(e) => setData('nome_completo', e.target.value)}
                                        className="input"
                                        placeholder={ehEmpresa ? 'Nome legal da empresa' : 'Nome próprio + apelidos'}
                                    />
                                </Campo>

                                {ehEmpresa && (
                                    <Campo label="Nome comercial" erro={errors.nome_comercial} ajuda="Se diferente da razão social">
                                        <input
                                            type="text"
                                            value={data.nome_comercial}
                                            onChange={(e) => setData('nome_comercial', e.target.value)}
                                            className="input"
                                        />
                                    </Campo>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {ehSingular && (
                                        <>
                                            <Campo label="Nº BI" erro={errors.numero_bi}>
                                                <input
                                                    type="text"
                                                    value={data.numero_bi}
                                                    onChange={(e) => setData('numero_bi', e.target.value.toUpperCase())}
                                                    className="input font-mono"
                                                    placeholder="000000000LA000"
                                                />
                                            </Campo>
                                            <Campo label="Data de nascimento" erro={errors.data_nascimento}>
                                                <input
                                                    type="date"
                                                    value={typeof data.data_nascimento === 'string' ? data.data_nascimento.slice(0, 10) : ''}
                                                    onChange={(e) => setData('data_nascimento', e.target.value)}
                                                    className="input"
                                                />
                                            </Campo>
                                        </>
                                    )}

                                    {ehEmpresa && (
                                        <>
                                            <Campo label="NIF" erro={errors.nif} obrigatorio>
                                                <input
                                                    type="text"
                                                    value={data.nif}
                                                    onChange={(e) => setData('nif', e.target.value)}
                                                    className="input font-mono"
                                                    placeholder="5999999999"
                                                />
                                            </Campo>
                                            <Campo label="Data constituição" erro={errors.data_constituicao_empresa}>
                                                <input
                                                    type="date"
                                                    value={typeof data.data_constituicao_empresa === 'string' ? data.data_constituicao_empresa.slice(0, 10) : ''}
                                                    onChange={(e) => setData('data_constituicao_empresa', e.target.value)}
                                                    className="input"
                                                />
                                            </Campo>
                                        </>
                                    )}
                                </div>

                                {ehSingular && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Campo label="Género" erro={errors.genero}>
                                            <select value={data.genero} onChange={(e) => setData('genero', e.target.value)} className="input">
                                                <option value="">—</option>
                                                <option value="masculino">Masculino</option>
                                                <option value="feminino">Feminino</option>
                                                <option value="outro">Outro</option>
                                            </select>
                                        </Campo>
                                        <Campo label="Nacionalidade" erro={errors.nacionalidade}>
                                            <input type="text" value={data.nacionalidade} onChange={(e) => setData('nacionalidade', e.target.value)} className="input" />
                                        </Campo>
                                        <Campo label="Estado civil" erro={errors.estado_civil}>
                                            <select value={data.estado_civil} onChange={(e) => setData('estado_civil', e.target.value)} className="input">
                                                <option value="">—</option>
                                                <option value="solteiro">Solteiro(a)</option>
                                                <option value="casado">Casado(a)</option>
                                                <option value="uniao_facto">União de facto</option>
                                                <option value="divorciado">Divorciado(a)</option>
                                                <option value="viuvo">Viúvo(a)</option>
                                            </select>
                                        </Campo>
                                    </div>
                                )}

                                {ehSingular && (
                                    <Campo label="Profissão" erro={errors.profissao}>
                                        <input type="text" value={data.profissao} onChange={(e) => setData('profissao', e.target.value)} className="input" />
                                    </Campo>
                                )}

                                {ehEmpresa && (
                                    <Campo label="Nº registo comercial" erro={errors.numero_registo_comercial}>
                                        <input type="text" value={data.numero_registo_comercial} onChange={(e) => setData('numero_registo_comercial', e.target.value)} className="input" />
                                    </Campo>
                                )}
                            </Seccao>
                        </>
                    )}

                    {/* Contactos */}
                    {tabActiva === 'contactos' && (
                        <>
                            <Seccao icon={Phone} iconColor="#00D4FF" titulo="Contactos">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Campo label="Telefone principal" erro={errors.telefone_principal}>
                                        <input
                                            type="tel"
                                            value={data.telefone_principal}
                                            onChange={(e) => setData('telefone_principal', e.target.value)}
                                            className="input"
                                            placeholder="+244 9XX XXX XXX"
                                        />
                                    </Campo>
                                    <Campo label="Telefone alternativo" erro={errors.telefone_alternativo}>
                                        <input
                                            type="tel"
                                            value={data.telefone_alternativo}
                                            onChange={(e) => setData('telefone_alternativo', e.target.value)}
                                            className="input"
                                        />
                                    </Campo>
                                </div>
                                <Campo label="Email" erro={errors.email}>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="input"
                                        placeholder="nome@exemplo.com"
                                    />
                                </Campo>
                            </Seccao>

                            {/* Secção criar conta utilizador — só ao criar novo condómino */}
                            {!editar && (
                                <Seccao icon={Lock} iconColor="#10B981" titulo="Conta de utilizador (opcional)">
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                        <input
                                            type="checkbox"
                                            id="criar_user"
                                            checked={data.criar_user}
                                            onChange={(e) => setData('criar_user', e.target.checked)}
                                            className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                                        />
                                        <label htmlFor="criar_user" className="flex-1 cursor-pointer">
                                            <div className="text-sm font-medium text-white">Criar conta de utilizador para este condómino</div>
                                            <div className="text-xs text-white/50 mt-0.5">
                                                Será criado um login com o email indicado. O condómino poderá aceder à app mobile e ao portal web.
                                            </div>
                                        </label>
                                    </div>

                                    {data.criar_user && (
                                        <>
                                            {!data.email && (
                                                <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                                    ⚠️ Para criar conta de utilizador é necessário preencher o campo Email acima.
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Campo label="Password inicial *" erro={errors.password}>
                                                    <div className="relative">
                                                        <input
                                                            type={verPassword ? 'text' : 'password'}
                                                            value={data.password}
                                                            onChange={(e) => setData('password', e.target.value)}
                                                            className="input pr-10"
                                                            placeholder="Mínimo 8 caracteres"
                                                            autoComplete="new-password"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setVerPassword(!verPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                                                        >
                                                            {verPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </Campo>
                                                <Campo label="Confirmar password *" erro={errors.password_confirmation}>
                                                    <input
                                                        type={verPassword ? 'text' : 'password'}
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        className="input"
                                                        placeholder="Repetir password"
                                                        autoComplete="new-password"
                                                    />
                                                </Campo>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                                <input
                                                    type="checkbox"
                                                    id="must_change_password"
                                                    checked={data.must_change_password}
                                                    onChange={(e) => setData('must_change_password', e.target.checked)}
                                                    className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                                                />
                                                <label htmlFor="must_change_password" className="flex-1 cursor-pointer">
                                                    <div className="text-sm text-white">Obrigar a alterar password no próximo login</div>
                                                    <div className="text-xs text-white/50 mt-0.5">
                                                        Recomendado por segurança quando o admin define a password.
                                                    </div>
                                                </label>
                                            </div>
                                        </>
                                    )}
                                </Seccao>
                            )}

                            <Seccao icon={MapPin} iconColor="#A855F7" titulo="Morada de correspondência">
                                <Campo label="Morada" erro={errors.morada}>
                                    <textarea
                                        value={data.morada}
                                        onChange={(e) => setData('morada', e.target.value)}
                                        rows={2}
                                        className="input resize-none"
                                    />
                                </Campo>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Campo label="Província" erro={errors.provincia}>
                                        <select value={data.provincia} onChange={(e) => setData('provincia', e.target.value)} className="input">
                                            {provincias.map((p) => <option key={p} value={p} className="bg-[#16163A]">{p}</option>)}
                                        </select>
                                    </Campo>
                                    <Campo label="Município" erro={errors.municipio}>
                                        <input type="text" value={data.municipio} onChange={(e) => setData('municipio', e.target.value)} className="input" />
                                    </Campo>
                                    <Campo label="Bairro" erro={errors.bairro}>
                                        <input type="text" value={data.bairro} onChange={(e) => setData('bairro', e.target.value)} className="input" />
                                    </Campo>
                                </div>
                            </Seccao>
                        </>
                    )}

                    {/* Representante (só empresa) */}
                    {tabActiva === 'extra' && ehEmpresa && (
                        <Seccao icon={Briefcase} iconColor="#EC4899" titulo="Representante legal">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Campo label="Nome" erro={errors.representante_nome}>
                                    <input type="text" value={data.representante_nome} onChange={(e) => setData('representante_nome', e.target.value)} className="input" />
                                </Campo>
                                <Campo label="BI" erro={errors.representante_bi}>
                                    <input type="text" value={data.representante_bi} onChange={(e) => setData('representante_bi', e.target.value.toUpperCase())} className="input font-mono" />
                                </Campo>
                            </div>
                            <Campo label="Cargo" erro={errors.representante_cargo}>
                                <input type="text" value={data.representante_cargo} onChange={(e) => setData('representante_cargo', e.target.value)} className="input" placeholder="CEO, Administrador..." />
                            </Campo>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Campo label="Telefone" erro={errors.representante_telefone}>
                                    <input type="tel" value={data.representante_telefone} onChange={(e) => setData('representante_telefone', e.target.value)} className="input" />
                                </Campo>
                                <Campo label="Email" erro={errors.representante_email}>
                                    <input type="email" value={data.representante_email} onChange={(e) => setData('representante_email', e.target.value)} className="input" />
                                </Campo>
                            </div>
                        </Seccao>
                    )}

                    {/* Observações (sempre visível) */}
                    <Seccao icon={FileText} iconColor="#64748B" titulo="Outras informações">
                        <Campo label="Observações" erro={errors.observacoes}>
                            <textarea
                                value={data.observacoes}
                                onChange={(e) => setData('observacoes', e.target.value)}
                                rows={3}
                                className="input resize-none"
                                placeholder="Notas internas..."
                            />
                        </Campo>
                        {editar && (
                            <Campo label="Estado" erro={errors.estado}>
                                <select value={data.estado} onChange={(e) => setData('estado', e.target.value)} className="input sm:w-48">
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                    <option value="arquivado">Arquivado</option>
                                </select>
                            </Campo>
                        )}
                    </Seccao>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-5 mt-6" style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
                        <Link href="/condominos" className="btn-secondary">Cancelar</Link>
                        <button type="submit" disabled={processing} className="btn-primary">
                            <Save className="h-4 w-4" />
                            {processing ? 'A guardar...' : editar ? 'Guardar alterações' : 'Criar condómino'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

function TabButton({
    activa, onClick, icon: Icon, label,
}: { activa: boolean; onClick: () => void; icon: React.ElementType; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-2 border-b-2 -mb-px',
                activa ? 'text-white border-[#00D4FF]' : 'text-white/50 hover:text-white/80 border-transparent',
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            {label}
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
