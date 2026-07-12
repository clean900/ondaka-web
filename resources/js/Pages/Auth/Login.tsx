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
                        <img
                            src="/apple-touch-icon.png"
                            alt="ONDAKA"
                            className="w-20 h-20 rounded-2xl mb-5 mx-auto block animate-pulse-glow shadow-lg shadow-purple-500/20"
                        />
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

                    {/* Descarregar a app móvel */}
                    <div className="mt-6 text-center">
                        <p className="text-[11px] text-white/40 mb-2.5">Condómino? Descarregue a app móvel</p>
                        <div className="flex items-center justify-center gap-2.5">
                            <a href="https://play.google.com/store/apps/details?id=ao.ondaka.ondaka_app" target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition">
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#fff" aria-hidden="true"><path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z"/></svg>
                                <span className="text-xs font-medium text-white/80">Google Play</span>
                            </a>
                            <a href="https://apps.apple.com/app/id6782891593" target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition">
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#fff" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.036-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/></svg>
                                <span className="text-xs font-medium text-white/80">App Store</span>
                            </a>
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
