import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState, PropsWithChildren, ReactNode } from 'react';
import { UserCircle, Save, Mail, Phone, Globe, Key, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
        telefone: string | null;
        locale: string;
        roles: string[];
        must_change_password: boolean;
        foto_path: string | null;
    };
}

export default function PerfilIndex({ user }: Props) {
    const [tab, setTab] = useState<'perfil' | 'password'>('perfil');

    // Form Perfil
    const perfilForm = useForm({
        name: user.name,
        email: user.email,
        telefone: user.telefone ?? '',
        locale: user.locale,
    });

    // Form Password
    const passwordForm = useForm({
        password_actual: '',
        password: '',
        password_confirmation: '',
    });

    const [showActual, setShowActual] = useState(false);
    const [showNova, setShowNova] = useState(false);
    const [showConf, setShowConf] = useState(false);

    const submitPerfil = (e: FormEvent) => {
        e.preventDefault();
        perfilForm.patch(route('perfil.update'));
    };

    const submitPassword = (e: FormEvent) => {
        e.preventDefault();
        passwordForm.patch(route('perfil.password.update'), {
            onSuccess: () => passwordForm.reset(),
        });
    };

    const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    return (
        <AuthenticatedLayout>
            <Head title="Meu perfil" />

            <div className="max-w-3xl mx-auto">
                {/* Header com avatar */}
                <div className="flex items-center gap-4 mb-6">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
                        style={{
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(0, 212, 255, 0.2) 100%)',
                            border: '0.5px solid rgba(168, 85, 247, 0.4)',
                        }}
                    >
                        {initials}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white tracking-tight">{user.name}</h1>
                        <p className="text-sm text-white/50 mt-0.5">{user.email}</p>
                        <div className="flex gap-2 mt-1">
                            {user.roles.map((r) => (
                                <span key={r} className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70">
                                    {r}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Aviso must_change_password */}
                {user.must_change_password && tab === 'perfil' && (
                    <div className="mb-5 rounded-lg p-4 bg-amber-500/8 border border-amber-500/30 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-100">
                            <p className="font-medium">Tem de alterar a sua password.</p>
                            <p className="text-amber-200/70 mt-0.5">Por motivos de segurança, deve definir uma password pessoal.</p>
                            <button onClick={() => setTab('password')} className="mt-2 text-amber-300 underline hover:text-amber-200">
                                Ir para Alterar Password →
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-5 border-b border-white/10">
                    <TabButton activa={tab === 'perfil'} onClick={() => setTab('perfil')} icon={UserCircle} label="Dados pessoais" />
                    <TabButton activa={tab === 'password'} onClick={() => setTab('password')} icon={Key} label="Alterar password" />
                </div>

                {/* TAB Perfil */}
                {tab === 'perfil' && (
                    <form onSubmit={submitPerfil} className="space-y-5">
                        <Seccao icon={UserCircle} iconColor="#A855F7" titulo="Dados pessoais">
                            <Campo label="Nome completo *" erro={perfilForm.errors.name}>
                                <input
                                    type="text"
                                    value={perfilForm.data.name}
                                    onChange={(e) => perfilForm.setData('name', e.target.value)}
                                    className="input"
                                    autoComplete="name"
                                />
                            </Campo>

                            <Campo label="Email *" erro={perfilForm.errors.email} icon={Mail}>
                                <input
                                    type="email"
                                    value={perfilForm.data.email}
                                    onChange={(e) => perfilForm.setData('email', e.target.value)}
                                    className="input"
                                    autoComplete="email"
                                />
                            </Campo>

                            <Campo label="Telefone" erro={perfilForm.errors.telefone} icon={Phone}>
                                <input
                                    type="tel"
                                    value={perfilForm.data.telefone}
                                    onChange={(e) => perfilForm.setData('telefone', e.target.value)}
                                    className="input"
                                    placeholder="+244 9XX XXX XXX"
                                    autoComplete="tel"
                                />
                            </Campo>

                            <Campo label="Idioma" erro={perfilForm.errors.locale} icon={Globe}>
                                <select
                                    value={perfilForm.data.locale}
                                    onChange={(e) => perfilForm.setData('locale', e.target.value)}
                                    className="input"
                                >
                                    <option value="pt_AO" className="bg-[#16163A]">Português (Angola)</option>
                                    <option value="pt_PT" className="bg-[#16163A]">Português (Portugal)</option>
                                    <option value="en" className="bg-[#16163A]">English</option>
                                </select>
                            </Campo>
                        </Seccao>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={perfilForm.processing}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white text-sm font-medium transition disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {perfilForm.processing ? 'A guardar...' : 'Guardar alterações'}
                            </button>
                        </div>
                    </form>
                )}

                {/* TAB Password */}
                {tab === 'password' && (
                    <form onSubmit={submitPassword} className="space-y-5">
                        <Seccao icon={Key} iconColor="#00D4FF" titulo="Alterar password">
                            <Campo label="Password actual *" erro={passwordForm.errors.password_actual}>
                                <div className="relative">
                                    <input
                                        type={showActual ? 'text' : 'password'}
                                        value={passwordForm.data.password_actual}
                                        onChange={(e) => passwordForm.setData('password_actual', e.target.value)}
                                        className="input pr-10"
                                        autoComplete="current-password"
                                    />
                                    <button type="button" onClick={() => setShowActual(!showActual)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                                        {showActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </Campo>

                            <Campo label="Nova password *" erro={passwordForm.errors.password}>
                                <div className="relative">
                                    <input
                                        type={showNova ? 'text' : 'password'}
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        className="input pr-10"
                                        placeholder="Mínimo 8 caracteres"
                                        autoComplete="new-password"
                                    />
                                    <button type="button" onClick={() => setShowNova(!showNova)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                                        {showNova ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordForm.data.password.length > 0 && passwordForm.data.password.length < 8 && (
                                    <p className="text-xs text-amber-400 mt-1">Mínimo 8 caracteres ({passwordForm.data.password.length}/8)</p>
                                )}
                                {passwordForm.data.password.length >= 8 && (
                                    <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Comprimento OK</p>
                                )}
                            </Campo>

                            <Campo label="Confirmar nova password *" erro={passwordForm.errors.password_confirmation}>
                                <div className="relative">
                                    <input
                                        type={showConf ? 'text' : 'password'}
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        className="input pr-10"
                                        autoComplete="new-password"
                                    />
                                    <button type="button" onClick={() => setShowConf(!showConf)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                                        {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordForm.data.password_confirmation.length > 0 && passwordForm.data.password !== passwordForm.data.password_confirmation && (
                                    <p className="text-xs text-rose-400 mt-1">As passwords não coincidem.</p>
                                )}
                                {passwordForm.data.password_confirmation.length > 0 && passwordForm.data.password === passwordForm.data.password_confirmation && passwordForm.data.password.length >= 8 && (
                                    <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Passwords coincidem</p>
                                )}
                            </Campo>
                        </Seccao>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white text-sm font-medium transition disabled:opacity-50"
                            >
                                <Key className="w-4 h-4" />
                                {passwordForm.processing ? 'A guardar...' : 'Alterar password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function TabButton({ activa, onClick, icon: Icon, label }: { activa: boolean; onClick: () => void; icon: any; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition ${
                activa
                    ? 'text-white border-b-2 border-cyan-400'
                    : 'text-white/50 hover:text-white/80 border-b-2 border-transparent'
            }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}

function Seccao({ icon: Icon, iconColor, titulo, children }: PropsWithChildren<{ icon: any; iconColor: string; titulo: string }>) {
    return (
        <div className="rounded-xl p-5 bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Icon className="w-4 h-4" style={{ color: iconColor }} />
                <h2 className="text-sm font-semibold text-white">{titulo}</h2>
            </div>
            {children}
        </div>
    );
}

function Campo({ label, erro, icon: Icon, children }: PropsWithChildren<{ label: string; erro?: string; icon?: any }>): ReactNode {
    return (
        <div>
            <label className="text-xs font-medium text-white/60 mb-1.5 flex items-center gap-1.5">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
            </label>
            {children}
            {erro && <p className="text-xs text-rose-400 mt-1">{erro}</p>}
        </div>
    );
}
