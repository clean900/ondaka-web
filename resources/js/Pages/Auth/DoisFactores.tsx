import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent, useEffect, useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { Shield, MessageSquare, ArrowLeft } from 'lucide-react';

interface Props {
    telefoneMascarado: string;
}

export default function DoisFactores({ telefoneMascarado }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        codigo: '',
    });

    const [contadorReenvio, setContadorReenvio] = useState(30);
    const [digitos, setDigitos] = useState<string[]>(['', '', '', '', '', '']);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (contadorReenvio <= 0) return;
        const timer = setInterval(() => setContadorReenvio((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [contadorReenvio]);

    useEffect(() => {
        setData('codigo', digitos.join(''));
    }, [digitos]);

    const handleChange = (index: number, valor: string) => {
        const digit = valor.replace(/\D/g, '').slice(-1);
        const novos = [...digitos];
        novos[index] = digit;
        setDigitos(novos);

        if (digit && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digitos[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const texto = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (texto.length === 0) return;

        const novos = texto.padEnd(6, '').split('').slice(0, 6);
        setDigitos(novos);
        inputsRef.current[Math.min(texto.length, 5)]?.focus();
    };

    const submeter = (e: FormEvent) => {
        e.preventDefault();
        post('/2fa/verificar');
    };

    const reenviar = () => {
        router.post(
            '/2fa/reenviar',
            {},
            {
                onSuccess: () => {
                    setContadorReenvio(60);
                    setDigitos(['', '', '', '', '', '']);
                    inputsRef.current[0]?.focus();
                },
            }
        );
    };

    const codigoCompleto = digitos.every((d) => d !== '');

    return (
        <>
            <Head title="Verificação de Segurança" />
            <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 mesh-bg" />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #A855F7 0%, transparent 70%)' }}
                />

                <div className="w-full max-w-md relative z-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 relative animate-pulse-glow"
                            style={{
                                background: 'linear-gradient(135deg, #00D4FF 0%, #A855F7 60%, #EC4899 100%)',
                            }}
                        >
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            Verificação em 2 passos
                        </h1>
                        <p className="text-sm text-white/50 mt-1.5">
                            Confirme que é você para continuar
                        </p>
                    </div>

                    {/* Card */}
                    <div
                        className="rounded-2xl p-7 backdrop-blur-xl"
                        style={{
                            background: 'rgba(22, 22, 58, 0.6)',
                            border: '0.5px solid rgba(168, 85, 247, 0.2)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                        }}
                    >
                        {/* Info SMS */}
                        <div
                            className="flex items-start gap-3 p-4 rounded-lg mb-6"
                            style={{
                                background: 'rgba(0, 212, 255, 0.06)',
                                border: '0.5px solid rgba(0, 212, 255, 0.25)',
                            }}
                        >
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(0, 212, 255, 0.15)' }}
                            >
                                <MessageSquare className="w-4 h-4 text-[#00D4FF]" />
                            </div>
                            <div className="text-sm">
                                <div className="text-white leading-relaxed">
                                    Enviámos um código para{' '}
                                    <span className="font-mono font-semibold text-[#00D4FF]">
                                        {telefoneMascarado}
                                    </span>
                                </div>
                                <div className="text-xs text-white/50 mt-0.5">
                                    Válido por 5 minutos
                                </div>
                            </div>
                        </div>

                        {/* 6 inputs */}
                        <form onSubmit={submeter} className="space-y-5">
                            <div>
                                <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">
                                    Código de verificação
                                </label>
                                <div className="flex gap-2 justify-between">
                                    {digitos.map((digito, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => {
                                                inputsRef.current[i] = el;
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digito}
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
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.border = '0.5px solid rgba(0, 212, 255, 0.6)';
                                                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.25)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.border = `0.5px solid ${digito ? 'rgba(0, 212, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`;
                                                e.currentTarget.style.boxShadow = digito ? '0 0 15px rgba(0, 212, 255, 0.15)' : 'none';
                                            }}
                                        />
                                    ))}
                                </div>
                                {errors.codigo && (
                                    <p className="mt-2 text-xs text-red-400">{errors.codigo}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !codigoCompleto}
                                className="btn-primary w-full"
                            >
                                {processing ? 'A verificar...' : 'Verificar e entrar'}
                            </button>
                        </form>

                        {/* Reenviar */}
                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={reenviar}
                                disabled={contadorReenvio > 0}
                                className="text-sm text-[#00D4FF] hover:text-[#A855F7] disabled:text-white/30 disabled:cursor-not-allowed transition font-medium"
                            >
                                {contadorReenvio > 0
                                    ? `Reenviar código em ${contadorReenvio}s`
                                    : 'Reenviar código'}
                            </button>
                        </div>
                    </div>

                    {/* Voltar */}
                    <div className="text-center mt-6">
                        <button
                            onClick={() => router.post('/logout')}
                            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Voltar ao login
                        </button>
                    </div>

                    <p className="text-center text-[11px] text-white/30 mt-4">
                        Não recebeu o SMS? Verifique o número no seu perfil.
                    </p>
                </div>
            </div>
        </>
    );
}
