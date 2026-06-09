import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';

export default function Invalido() {
    return (
        <>
            <Head title="Convite inválido - ONDAKA" />

            <div
                className="min-h-screen flex items-center justify-center p-4"
                style={{
                    background: 'radial-gradient(ellipse at top, rgba(239,68,68,0.12) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(168,85,247,0.08) 0%, transparent 50%), #0A0A1F',
                }}
            >
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-[#00D4FF]" />
                            <span className="text-2xl font-bold gradient-ondaka-text">ONDAKA</span>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-[#16163A]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
                        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5"
                            style={{ background: 'rgba(239,68,68,0.12)', border: '0.5px solid rgba(239,68,68,0.3)' }}>
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>

                        <h1 className="text-xl font-semibold text-white mb-2">
                            Convite inválido
                        </h1>

                        <p className="text-sm text-white/60 leading-relaxed mb-6">
                            Este link de convite não é válido. Pode ter expirado, sido cancelado ou já ter sido usado.
                        </p>

                        <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 mb-6 text-left">
                            <div className="text-xs text-white/70 leading-relaxed">
                                <strong className="text-amber-300">O que fazer?</strong><br />
                                Contacte a pessoa que o convidou para que envie um novo convite.
                                Os convites são válidos durante 7 dias após serem enviados.
                            </div>
                        </div>

                        <Link
                            href="/"
                            className="btn-primary w-full justify-center"
                        >
                            Voltar à página inicial
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="text-center mt-6 text-xs text-white/40">
                        © ONDAKA · Soluções Simples, Lda
                    </div>
                </div>
            </div>
        </>
    );
}
