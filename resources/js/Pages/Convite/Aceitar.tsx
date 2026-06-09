import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Sparkles, Lock, Eye, EyeOff, CheckCircle2, Building2, Shield } from 'lucide-react';

interface Convite {
    token: string;
    nome: string;
    email: string;
    role_name: string;
    empresa_nome: string | null;
    condominio_nome: string | null;
    expira_em: string;
}

interface Props {
    convite: Convite;
}

const roleLabel: Record<string, string> = {
    'super-admin': 'Super Administrador',
    'admin-empresa': 'Administrador de Empresa',
    'gestor': 'Gestor de Condomínios',
    'administrador-condominio': 'Administrador de Condomínio',
    'condomino': 'Condómino',
    'funcionario': 'Funcionário',
    'prestador': 'Prestador de Serviços',
    'guarda': 'Guarda / Porteiro',
};

export default function Aceitar({ convite }: Props) {
    const [showPwd, setShowPwd] = useState(false);
    const [showPwdConf, setShowPwdConf] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/convite/${convite.token}`);
    };

    const passwordForte = data.password.length >= 8;
    const passwordsMatcham = data.password.length > 0 && data.password === data.password_confirmation;

    return (
        <>
            <Head title="Activar conta - ONDAKA" />

            <div
                className="min-h-screen flex items-center justify-center p-4"
                style={{
                    background: 'radial-gradient(ellipse at top, rgba(168,85,247,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(0,212,255,0.1) 0%, transparent 50%), #0A0A1F',
                }}
            >
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-[#00D4FF]" />
                            <span className="text-2xl font-bold gradient-ondaka-text">ONDAKA</span>
                        </div>
                        <p className="text-xs text-white/50">Plataforma de Gestão de Condomínios</p>
                    </div>

                    {/* Card */}
                    <div className="bg-[#16163A]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <h1 className="text-xl font-semibold text-white mb-1">
                            Olá, {convite.nome.split(' ')[0]} 👋
                        </h1>
                        <p className="text-sm text-white/60 mb-5">
                            Para activar a sua conta, defina uma password segura.
                        </p>

                        {/* Resumo do convite */}
                        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 mb-5 space-y-2.5">
                            <div className="flex items-start gap-2.5 text-xs">
                                <Shield className="w-3.5 h-3.5 text-[#00D4FF] flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-white/50 text-[10px] uppercase tracking-wide mb-0.5">Função</div>
                                    <div className="text-white font-medium">{roleLabel[convite.role_name] ?? convite.role_name}</div>
                                </div>
                            </div>
                            {convite.empresa_nome && (
                                <div className="flex items-start gap-2.5 text-xs">
                                    <Building2 className="w-3.5 h-3.5 text-[#A855F7] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-white/50 text-[10px] uppercase tracking-wide mb-0.5">Empresa</div>
                                        <div className="text-white font-medium">{convite.empresa_nome}</div>
                                    </div>
                                </div>
                            )}
                            {convite.condominio_nome && (
                                <div className="flex items-start gap-2.5 text-xs">
                                    <Building2 className="w-3.5 h-3.5 text-[#EC4899] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-white/50 text-[10px] uppercase tracking-wide mb-0.5">Condomínio</div>
                                        <div className="text-white font-medium">{convite.condominio_nome}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">
                                    <Lock className="w-3 h-3 inline mr-1" />
                                    Nova password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPwd ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        className="input pr-10"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                    >
                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <div className="text-xs text-red-400 mt-1">{errors.password}</div>}
                                <div className="text-[10px] text-white/40 mt-1.5 flex items-center gap-1">
                                    <span className={passwordForte ? 'text-emerald-400' : ''}>
                                        {passwordForte ? '✓' : '○'}
                                    </span>
                                    Mínimo 8 caracteres
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">
                                    <Lock className="w-3 h-3 inline mr-1" />
                                    Confirmar password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPwdConf ? 'text' : 'password'}
                                        required
                                        className="input pr-10"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwdConf(!showPwdConf)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                    >
                                        {showPwdConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {data.password_confirmation.length > 0 && (
                                    <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${passwordsMatcham ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {passwordsMatcham ? <CheckCircle2 className="w-3 h-3" /> : <span>✗</span>}
                                        {passwordsMatcham ? 'Passwords coincidem' : 'As passwords não coincidem'}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !passwordForte || !passwordsMatcham}
                                className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'A activar...' : 'Activar a minha conta'}
                            </button>
                        </form>

                        <div className="text-center mt-4 text-[10px] text-white/40">
                            Convite válido até {new Date(convite.expira_em).toLocaleDateString('pt-PT')}
                        </div>
                    </div>

                    <div className="text-center mt-6 text-xs text-white/40">
                        © ONDAKA · Soluções Simples, Lda · Luanda, Angola
                    </div>
                </div>
            </div>
        </>
    );
}
