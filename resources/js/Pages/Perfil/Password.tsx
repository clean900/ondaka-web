import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, Key } from 'lucide-react';

interface Props {
    forcar_troca: boolean;
}

export default function Password({ forcar_troca }: Props) {
    const [showActual, setShowActual] = useState(false);
    const [showNova, setShowNova] = useState(false);
    const [showConf, setShowConf] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        password_actual: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route('perfil.password.update'), {
            onSuccess: () => reset(),
        });
    };

    const passwordForte = data.password.length >= 8;
    const passwordsMatcham = data.password.length > 0 && data.password === data.password_confirmation;

    return (
        <AuthenticatedLayout>
            <Head title="Alterar password" />

            <div className="max-w-xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Key className="w-6 h-6 text-[#00D4FF]" />
                        Alterar password
                    </h1>
                    <p className="text-sm text-white/60 mt-1">
                        {forcar_troca
                            ? 'Por motivos de segurança, deve definir uma nova password antes de continuar.'
                            : 'Defina uma nova password para a sua conta.'}
                    </p>
                </div>

                {forcar_troca && (
                    <div className="mb-5 rounded-lg p-4 bg-amber-500/8 border border-amber-500/30 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-white/85 leading-relaxed">
                            <strong className="text-amber-300">Troca obrigatória:</strong> Um administrador definiu
                            a sua password inicial. Para sua segurança, deve definir uma nova password antes de
                            aceder à plataforma.
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="card-elevated space-y-5">
                    {!forcar_troca && (
                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">
                                <Lock className="w-3 h-3 inline mr-1" />
                                Password actual *
                            </label>
                            <div className="relative">
                                <input
                                    type={showActual ? 'text' : 'password'}
                                    required
                                    className="input pr-10"
                                    value={data.password_actual}
                                    onChange={(e) => setData('password_actual', e.target.value)}
                                />
                                <button type="button" onClick={() => setShowActual(!showActual)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                                    {showActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password_actual && <div className="text-xs text-red-400 mt-1">{errors.password_actual}</div>}
                        </div>
                    )}

                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">
                            <Key className="w-3 h-3 inline mr-1" />
                            Nova password *
                        </label>
                        <div className="relative">
                            <input
                                type={showNova ? 'text' : 'password'}
                                required
                                minLength={8}
                                className="input pr-10"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <button type="button" onClick={() => setShowNova(!showNova)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                                {showNova ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <div className="text-xs text-red-400 mt-1">{errors.password}</div>}
                        <div className="text-[10px] text-white/40 mt-1.5 flex items-center gap-1">
                            <span className={passwordForte ? 'text-emerald-400' : ''}>{passwordForte ? '✓' : '○'}</span>
                            Mínimo 8 caracteres
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5">
                            <Lock className="w-3 h-3 inline mr-1" />
                            Confirmar nova password *
                        </label>
                        <div className="relative">
                            <input
                                type={showConf ? 'text' : 'password'}
                                required
                                className="input pr-10"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                            <button type="button" onClick={() => setShowConf(!showConf)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                                {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                        <Key className="w-4 h-4" />
                        {processing ? 'A guardar...' : 'Alterar password'}
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
