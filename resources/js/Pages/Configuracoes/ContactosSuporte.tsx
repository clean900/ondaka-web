import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Clock, Save, CheckCircle2, Info } from 'lucide-react';

interface Empresa {
    id: number;
    nome: string;
    email_contacto: string | null;
    telefone: string | null;
    whatsapp_suporte: string | null;
    morada: string | null;
    horario_atendimento: string | null;
    logotipo_path: string | null;
    logotipo_url: string | null;
}

interface PageProps {
    empresa: Empresa | null;
    configurado: boolean;
    flash?: { success?: string };
    [key: string]: unknown;
}

export default function ContactosSuporte() {
    const { empresa, configurado, flash } = usePage<PageProps>().props;

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        email_contacto: empresa?.email_contacto ?? '',
        telefone: empresa?.telefone ?? '',
        whatsapp_suporte: empresa?.whatsapp_suporte ?? '',
        morada: empresa?.morada ?? '',
        horario_atendimento: empresa?.horario_atendimento ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route('configuracoes.contactos-suporte.actualizar'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Contactos & Suporte" />

            <div className="max-w-3xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white">Contactos & Suporte</h1>
                    <p className="text-sm text-white/60 mt-1">
                        Estes contactos são apresentados aos condóminos na app móvel,
                        para que possam pedir ajuda à sua empresa gestora.
                    </p>
                </div>

                {/* Status */}
                {!configurado && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-100">
                            <p className="font-medium">Ainda não configurou nenhum canal de contacto.</p>
                            <p className="text-amber-200/80 mt-1">
                                Os condóminos verão uma mensagem a sugerir o chatbot até preencher pelo menos um campo.
                            </p>
                        </div>
                    </div>
                )}

                {flash?.success && (
                    <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 flex items-center gap-2 text-sm text-green-200">
                        <CheckCircle2 className="w-4 h-4" />
                        {flash.success}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={submit} className="space-y-5">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
                            Canais de comunicação
                        </h2>

                        {/* WhatsApp */}
                        <Field
                            icon={<MessageCircle className="w-4 h-4 text-green-400" />}
                            label="WhatsApp de suporte"
                            hint="Número internacional (ex: +244 923 456 789)"
                            value={data.whatsapp_suporte}
                            error={errors.whatsapp_suporte}
                            onChange={(v) => setData('whatsapp_suporte', v)}
                            placeholder="+244 923 456 789"
                        />

                        {/* Telefone */}
                        <Field
                            icon={<Phone className="w-4 h-4 text-cyan-400" />}
                            label="Telefone fixo / outro"
                            value={data.telefone}
                            error={errors.telefone}
                            onChange={(v) => setData('telefone', v)}
                            placeholder="+244 222 000 000"
                        />

                        {/* Email */}
                        <Field
                            icon={<Mail className="w-4 h-4 text-purple-400" />}
                            label="Email de suporte"
                            value={data.email_contacto}
                            error={errors.email_contacto}
                            onChange={(v) => setData('email_contacto', v)}
                            type="email"
                            placeholder="suporte@empresa.ao"
                        />
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/5 p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
                            Informação adicional
                        </h2>

                        {/* Morada */}
                        <Field
                            icon={<MapPin className="w-4 h-4 text-pink-400" />}
                            label="Morada do escritório"
                            value={data.morada}
                            error={errors.morada}
                            onChange={(v) => setData('morada', v)}
                            placeholder="Rua, número, bairro, cidade"
                            multiline
                        />

                        {/* Horário */}
                        <Field
                            icon={<Clock className="w-4 h-4 text-amber-400" />}
                            label="Horário de atendimento"
                            hint="Texto livre, ex: 'Seg-Sex 8h-17h'"
                            value={data.horario_atendimento}
                            error={errors.horario_atendimento}
                            onChange={(v) => setData('horario_atendimento', v)}
                            placeholder="Seg-Sex 8h-17h"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'A guardar...' : 'Guardar alterações'}
                        </button>
                    </div>

                    {recentlySuccessful && (
                        <p className="text-xs text-green-300 text-right">✓ Guardado</p>
                    )}
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

// ============================================================================
// Componente Field
// ============================================================================
interface FieldProps {
    icon: React.ReactNode;
    label: string;
    hint?: string;
    value: string;
    error?: string;
    onChange: (v: string) => void;
    type?: 'text' | 'email';
    placeholder?: string;
    multiline?: boolean;
}

function Field({ icon, label, hint, value, error, onChange, type = 'text', placeholder, multiline }: FieldProps) {
    return (
        <div>
            <label className="flex items-center gap-2 text-sm text-white/80 mb-1.5">
                {icon}
                <span>{label}</span>
            </label>
            {multiline ? (
                <textarea
                    rows={2}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition"
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition"
                />
            )}
            {hint && <p className="text-xs text-white/40 mt-1">{hint}</p>}
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
}
