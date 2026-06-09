import { Head, router } from '@inertiajs/react';
import { Smartphone, Sparkles, LogOut } from 'lucide-react';

export default function UsarApp() {
    const sair = () => router.post('/logout');

    return (
        <>
            <Head title="Use o app móvel" />

            <div
                className="min-h-screen flex items-center justify-center px-4 py-12"
                style={{ background: 'radial-gradient(at top, #1a0b2e 0%, #0a0a0a 50%)' }}
            >
                <div className="max-w-md w-full text-center">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        <span
                            className="text-2xl font-bold tracking-wider bg-clip-text text-transparent"
                            style={{
                                backgroundImage: 'linear-gradient(90deg, #00D4FF, #A855F7, #EC4899)',
                            }}
                        >
                            ONDAKA
                        </span>
                    </div>

                    {/* Card principal */}
                    <div
                        className="rounded-2xl border border-white/10 p-8"
                        style={{
                            background: 'rgba(20, 20, 40, 0.6)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <div
                            className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #00D4FF20, #A855F720)',
                            }}
                        >
                            <Smartphone className="w-8 h-8 text-cyan-400" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-3">
                            Use o app móvel ONDAKA
                        </h1>
                        <p className="text-sm text-white/60 leading-relaxed mb-6">
                            A plataforma web ondaka.ao é para gestores. <br />
                            Como condómino, guarda ou prestador, <br />
                            tem uma experiência optimizada no app móvel.
                        </p>

                        {/* Botões stores (em breve) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                            <button
                                disabled
                                className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/40 cursor-not-allowed text-left"
                            >
                                <div className="text-xs text-white/30">Em breve</div>
                                <div className="font-medium">Google Play</div>
                            </button>
                            <button
                                disabled
                                className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/40 cursor-not-allowed text-left"
                            >
                                <div className="text-xs text-white/30">Em breve</div>
                                <div className="font-medium">App Store</div>
                            </button>
                        </div>

                        <button
                            onClick={sair}
                            className="text-sm text-white/60 hover:text-white inline-flex items-center gap-2 transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair
                        </button>
                    </div>

                    <p className="text-xs text-white/40 mt-6">
                        © ONDAKA · Soluções Simples, Lda
                    </p>
                </div>
            </div>
        </>
    );
}
