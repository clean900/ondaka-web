import { Head, useForm, Link } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Lock, Mail, Shield, ArrowRight } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submeter = (e: FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Entrar" />
            <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
                {/* Background mesh + orbs */}
                <div className="absolute inset-0 mesh-bg" />
                <div
                    className="absolute top-0 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #00D4FF 0%, transparent 70%)' }}
                />
                <div
                    className="absolute bottom-0 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)' }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #A855F7 0%, transparent 70%)' }}
                />

                {/* Conteúdo */}
                <div className="w-full max-w-md relative z-10">
                    {/* Logo */}
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 relative animate-pulse-glow"
                            style={{
                                background: 'linear-gradient(135deg, #00D4FF 0%, #A855F7 60%, #EC4899 100%)',
                            }}
                        >
                            <span className="text-white font-bold text-2xl">O</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            <span className="gradient-ondaka-text">ONDAKA</span>
                        </h1>
                        <p className="text-sm text-white/50 mt-1.5">
                            Gestão inteligente para o seu lar
                        </p>
                    </div>

                    {/* Card */}
                    <div
                        className="rounded-2xl p-7 backdrop-blur-xl animate-slide-up"
                        style={{
                            background: 'rgba(22, 22, 58, 0.6)',
                            border: '0.5px solid rgba(168, 85, 247, 0.2)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                        }}
                    >
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-white">Entrar</h2>
                            <p className="text-sm text-white/60 mt-1">
                                Introduza as suas credenciais para continuar.
                            </p>
                        </div>

                        <form onSubmit={submeter} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wider"
                                >
                                    Email
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#00D4FF] transition" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="input pl-10"
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        placeholder="admin@ondaka.ao"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label
                                        htmlFor="password"
                                        className="block text-xs font-medium text-white/70 uppercase tracking-wider"
                                    >
                                        Palavra-passe
                                    </label>
                                    <Link
                                        href="/recuperar-password"
                                        className="text-xs text-[#00D4FF] hover:text-[#A855F7] transition font-medium normal-case tracking-normal"
                                    >
                                        Esqueceu?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#00D4FF] transition" />
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="input pl-10"
                                        required
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-white/20 bg-white/5 text-[#00D4FF] focus:ring-[#00D4FF]/30 focus:ring-offset-0"
                                    />
                                    Lembrar-me neste dispositivo
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary w-full mt-6 group"
                            >
                                {processing ? (
                                    <>A entrar...</>
                                ) : (
                                    <>
                                        Entrar
                                        <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Security badge */}
                        <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-white/40">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Ligação segura · Autenticação 2FA</span>
                        </div>
                    </div>

                    <p className="text-center text-[11px] text-white/30 mt-6 leading-relaxed">
                        Ao entrar, concorda com os termos de utilização.
                        <br />
                        Conformidade com <span className="text-white/50">DP 141/15 de 29 de Junho de 2015</span> (Angola).
                    </p>
                </div>
            </div>
        </>
    );
}
