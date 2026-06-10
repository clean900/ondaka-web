import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { MessageSquare, Save, CheckCircle2, Clock, Info, Building2 } from 'lucide-react';

interface CondominioConfig {
    id: number;
    nome: string;
    sender_name: string | null;
    estado: 'sem_config' | 'pendente' | 'configurado';
}

interface PageProps {
    featureActiva: boolean;
    condominios: CondominioConfig[];
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

function EstadoBadge({ estado }: { estado: CondominioConfig['estado'] }) {
    if (estado === 'configurado') {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Configurado
            </span>
        );
    }
    if (estado === 'pendente') {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
                <Clock className="w-4 h-4" /> A aguardar equipa ONDAKA
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/40">
            Sem nome definido
        </span>
    );
}

function LinhaCondominio({ cond }: { cond: CondominioConfig }) {
    const [nome, setNome] = useState(cond.sender_name ?? '');
    const { setData, post, processing, errors } = useForm({
        condominio_id: cond.id,
        sender_name: cond.sender_name ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setData('sender_name', nome);
        post(route('configuracoes.sms-sender.guardar'), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-4 h-4 text-white/40 flex-shrink-0" />
                    <span className="font-medium text-white truncate">{cond.nome}</span>
                </div>
                <EstadoBadge estado={cond.estado} />
            </div>
            <div className="flex items-end gap-2">
                <div className="flex-1">
                    <label className="block text-xs text-white/50 mb-1">
                        Nome do remetente (máx 11 caracteres)
                    </label>
                    <input
                        type="text"
                        value={nome}
                        maxLength={11}
                        onChange={(e) => setNome(e.target.value.toUpperCase())}
                        placeholder="Ex: TALATONA"
                        className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50"
                    />
                    {errors.sender_name && (
                        <p className="text-xs text-red-400 mt-1">{errors.sender_name}</p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={processing || nome.trim().length === 0}
                    className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 px-4 py-2 text-sm font-medium text-white transition"
                >
                    <Save className="w-4 h-4" /> Guardar
                </button>
            </div>
        </form>
    );
}

export default function SmsSender() {
    const { featureActiva, condominios, flash } = usePage<PageProps>().props;

    return (
        <AuthenticatedLayout>
            <Head title="SMS — Nome do remetente" />

            <div className="max-w-3xl mx-auto p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-cyan-400" />
                        Nome do remetente (SMS)
                    </h1>
                    <p className="text-sm text-white/60 mt-1">
                        Defina o nome que aparece como remetente nos SMS de cada condomínio
                        (ex: "TALATONA"). Depois de guardar, a equipa ONDAKA configura o
                        registo junto da operadora e ativa o nome personalizado.
                    </p>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-emerald-200">{flash.success}</p>
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-200">{flash.error}</p>
                    </div>
                )}

                {!featureActiva && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-200">
                            O add-on "Sender ID personalizado" não está ativo. Ative-o na Loja
                            para configurar nomes de remetente personalizados.
                        </p>
                    </div>
                )}

                {condominios.length === 0 ? (
                    <p className="text-sm text-white/40">Não há condomínios para configurar.</p>
                ) : (
                    <div className="space-y-3">
                        {condominios.map((cond) => (
                            <LinhaCondominio key={cond.id} cond={cond} />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
