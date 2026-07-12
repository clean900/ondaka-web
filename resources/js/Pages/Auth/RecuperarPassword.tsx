import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { FormEvent, useEffect, useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { Phone, Lock, ArrowRight, ArrowLeft, KeyRound, MessageSquare, ShieldCheck } from 'lucide-react';

type Fase = 'telefone' | 'codigo' | 'nova';

interface PageProps {
    flash?: { fase?: string; status?: string };
    [key: string]: unknown;
}

export default function RecuperarPassword() {
    const { props } = usePage<PageProps>();
    const flashFase = props.flash?.fase as Fase | undefined;
    const flashStatus = props.flash?.status;

    // Se o utilizador pediu para recuar (mudar número), força fase telefone.
    const [recuar, setRecuar] = useState(false);

    // Fase efetiva: o que o backend mandou manda, exceto se o user recuou.
    const fase: Fase = recuar ? 'telefone' : (flashFase ?? 'telefone');

    const titulo = fase === 'telefone' ? 'Enviamos-lhe um código por SMS'
        : fase === 'codigo' ? 'Verifique as suas mensagens'
        : 'Defina uma palavra-passe segura';

    return (
        <>
            <Head title="Recuperar palavra-passe" />
            <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0 mesh-bg" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #A855F7 0%, transparent 70%)' }} />

                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-8">
                        <div className="mb-4 text-xl font-extrabold tracking-[0.15em] gradient-ondaka-text">ONDAKA</div>
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 relative animate-pulse-glow"
                            style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #A855F7 60%, #EC4899 100%)' }}>
                            {fase === 'telefone' && <KeyRound className="w-7 h-7 text-white" />}
                            {fase === 'codigo' && <MessageSquare className="w-7 h-7 text-white" />}
                            {fase === 'nova' && <ShieldCheck className="w-7 h-7 text-white" />}
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Recuperar acesso</h1>
                        <p className="text-sm text-white/50 mt-1.5">{titulo}</p>
                    </div>

                    <div className="rounded-2xl p-7 backdrop-blur-xl"
                        style={{ background: 'rgba(22, 22, 58, 0.6)', border: '0.5px solid rgba(168, 85, 247, 0.2)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)' }}>
                        {fase === 'telefone' && <FaseTelefone status={flashStatus} onEnviado={() => setRecuar(false)} />}
                        {fase === 'codigo' && <FaseCodigo onVoltar={() => setRecuar(true)} />}
                        {fase === 'nova' && <FaseNova />}
                    </div>

                    <div className="text-center mt-6">
                        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition">
                            <ArrowLeft className="w-3 h-3" />
                            Voltar ao login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

function FaseTelefone({ status, onEnviado }: { status?: string; onEnviado: () => void }) {
    const { data, setData, post, processing, errors } = useForm({ telefone: '' });
    const submeter = (e: FormEvent) => {
        e.preventDefault();
        post('/recuperar-password/enviar', { onSuccess: onEnviado });
    };

    return (
        <>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Esqueceu a palavra-passe?</h2>
                <p className="text-sm text-white/60 mt-1">Introduza o número de telemóvel associado à sua conta.</p>
            </div>
            <form onSubmit={submeter} className="space-y-4">
                <div>
                    <label htmlFor="telefone" className="block text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wider">Telemóvel</label>
                    <div className="relative group">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#00D4FF] transition" />
                        <input id="telefone" type="tel" inputMode="tel" value={data.telefone}
                            onChange={(e) => setData('telefone', e.target.value)}
                            className="input pl-10" required autoFocus placeholder="9XX XXX XXX" />
                    </div>
                    {errors.telefone && (<p className="mt-1.5 text-xs text-red-400">{errors.telefone}</p>)}
                    {status && (<p className="mt-1.5 text-xs text-[#00D4FF]">{status}</p>)}
                </div>
                <button type="submit" disabled={processing} className="btn-primary w-full mt-6 group">
                    {processing ? <>A enviar...</> : <>Enviar código<ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" /></>}
                </button>
            </form>
        </>
    );
}

function FaseCodigo({ onVoltar }: { onVoltar: () => void }) {
    const { data, setData, post, processing, errors } = useForm({ codigo: '' });
    const [contadorReenvio, setContadorReenvio] = useState(30);
    const [digitos, setDigitos] = useState<string[]>(['', '', '', '', '', '']);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const reenvioForm = useForm({ telefone: '' });

    useEffect(() => {
        if (contadorReenvio <= 0) return;
        const t = setInterval(() => setContadorReenvio((c) => c - 1), 1000);
        return () => clearInterval(t);
    }, [contadorReenvio]);

    useEffect(() => { setData('codigo', digitos.join('')); }, [digitos]);
    useEffect(() => { inputsRef.current[0]?.focus(); }, []);

    const handleChange = (i: number, v: string) => {
        const d = v.replace(/\D/g, '').slice(-1);
        const novos = [...digitos]; novos[i] = d; setDigitos(novos);
        if (d && i < 5) inputsRef.current[i + 1]?.focus();
    };
    const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digitos[i] && i > 0) inputsRef.current[i - 1]?.focus();
        else if (e.key === 'ArrowLeft' && i > 0) inputsRef.current[i - 1]?.focus();
        else if (e.key === 'ArrowRight' && i < 5) inputsRef.current[i + 1]?.focus();
    };
    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const texto = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!texto) return;
        setDigitos(texto.padEnd(6, '').split('').slice(0, 6));
        inputsRef.current[Math.min(texto.length, 5)]?.focus();
    };

    const submeter = (e: FormEvent) => { e.preventDefault(); post('/recuperar-password/verificar'); };
    const reenviar = () => {
        reenvioForm.post('/recuperar-password/enviar', {
            onSuccess: () => { setContadorReenvio(60); setDigitos(['', '', '', '', '', '']); inputsRef.current[0]?.focus(); },
        });
    };
    const codigoCompleto = digitos.every((d) => d !== '');

    return (
        <>
            <div className="flex items-start gap-3 p-4 rounded-lg mb-6"
                style={{ background: 'rgba(0, 212, 255, 0.06)', border: '0.5px solid rgba(0, 212, 255, 0.25)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0, 212, 255, 0.15)' }}>
                    <MessageSquare className="w-4 h-4 text-[#00D4FF]" />
                </div>
                <div className="text-sm">
                    <div className="text-white leading-relaxed">Se existir uma conta, enviámos um código por SMS.</div>
                    <div className="text-xs text-white/50 mt-0.5">Válido por 5 minutos</div>
                </div>
            </div>
            <form onSubmit={submeter} className="space-y-5">
                <div>
                    <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">Código de verificação</label>
                    <div className="flex gap-2 justify-between">
                        {digitos.map((digito, i) => (
                            <input key={i} ref={(el) => { inputsRef.current[i] = el; }}
                                type="text" inputMode="numeric" maxLength={1} value={digito}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                onPaste={handlePaste}
                                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                                className="w-12 h-14 text-center text-xl font-bold text-white rounded-lg transition-all"
                                style={{
                                    background: digito ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                                    border: `0.5px solid ${digito ? 'rgba(0, 212, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                                    outline: 'none',
                                    boxShadow: digito ? '0 0 15px rgba(0, 212, 255, 0.15)' : 'none',
                                }} />
                        ))}
                    </div>
                    {errors.codigo && (<p className="mt-2 text-xs text-red-400">{errors.codigo}</p>)}
                </div>
                <button type="submit" disabled={processing || !codigoCompleto} className="btn-primary w-full">
                    {processing ? 'A verificar...' : 'Verificar código'}
                </button>
            </form>
            <div className="mt-6 text-center flex items-center justify-center gap-4">
                <button type="button" onClick={onVoltar} className="text-xs text-white/40 hover:text-white/70 transition">
                    Mudar número
                </button>
                <button type="button" onClick={reenviar} disabled={contadorReenvio > 0}
                    className="text-sm text-[#00D4FF] hover:text-[#A855F7] disabled:text-white/30 disabled:cursor-not-allowed transition font-medium">
                    {contadorReenvio > 0 ? `Reenviar em ${contadorReenvio}s` : 'Reenviar código'}
                </button>
            </div>
        </>
    );
}

function FaseNova() {
    const { data, setData, post, processing, errors } = useForm({ password: '', password_confirmation: '' });
    const submeter = (e: FormEvent) => { e.preventDefault(); post('/recuperar-password/redefinir'); };

    return (
        <form onSubmit={submeter} className="space-y-4">
            <div>
                <label htmlFor="password" className="block text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wider">Nova palavra-passe</label>
                <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#00D4FF] transition" />
                    <input id="password" type="password" value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="input pl-10" required autoFocus autoComplete="new-password" placeholder="••••••••" />
                </div>
                {errors.password && (<p className="mt-1.5 text-xs text-red-400">{errors.password}</p>)}
            </div>
            <div>
                <label htmlFor="password_confirmation" className="block text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wider">Confirmar palavra-passe</label>
                <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#00D4FF] transition" />
                    <input id="password_confirmation" type="password" value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className="input pl-10" required autoComplete="new-password" placeholder="••••••••" />
                </div>
            </div>
            <button type="submit" disabled={processing} className="btn-primary w-full mt-6 group">
                {processing ? <>A guardar...</> : <>Guardar e voltar ao login<ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" /></>}
            </button>
        </form>
    );
}
