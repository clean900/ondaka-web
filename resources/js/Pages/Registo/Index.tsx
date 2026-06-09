import { Head, Link, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
    Building2, User, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react';

const provincias = [
    "Luanda", "Bengo", "Benguela", "Bié", "Cabinda", "Cuando-Cubango",
    "Cuanza-Norte", "Cuanza-Sul", "Cunene", "Huambo", "Huíla",
    "Lunda-Norte", "Lunda-Sul", "Malanje", "Moxico", "Namibe",
    "Uíge", "Zaire"
];

type TipoCliente = "empresa_gestora" | "admin_independente";
type TipoDocumento = "NIF" | "BI" | "PASSAPORTE";

export default function Registo() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    const { data, setData, post, processing, errors } = useForm({
        tipo_cliente: "" as TipoCliente | "",
        nome_empresa: "",
        documento_tipo: "NIF" as TipoDocumento,
        documento_numero: "",
        nome_completo_responsavel: "",
        provincia: "",
        municipio: "",
        telefone: "",
        email_contacto: "",
        user_nome: "",
        user_email: "",
        user_password: "",
        user_password_confirmation: "",
        aceita_termos: false,
    });

    const isEmpresa = data.tipo_cliente === "empresa_gestora";
    const isAdmin = data.tipo_cliente === "admin_independente";

    const goNext = () => {
        const novosErros: Record<string, string> = {};

        if (step === 1) {
            if (!data.tipo_cliente) {
                toast.error('Por favor escolha o tipo de cliente para continuar.');
                return;
            }
        }

        if (step === 2) {
            const labels: Record<string, string> = {
                nome_empresa: 'Nome da empresa',
                documento_numero: 'Numero do documento (NIF/BI)',
                provincia: 'Provincia',
                municipio: 'Municipio',
                telefone: 'Telefone',
                email_contacto: 'Email de contacto',
            };
            for (const f of Object.keys(labels)) {
                const valor = data[f as keyof typeof data];
                if (!valor || (typeof valor === 'string' && !valor.trim())) {
                    novosErros[f] = labels[f] + ' e obrigatorio.';
                }
            }

            if (Object.keys(novosErros).length > 0) {
                setLocalErrors(novosErros);
                toast.error('Por favor preencha os campos em falta (' + Object.keys(novosErros).length + ').');
                setTimeout(() => {
                    const primeiro = Object.keys(novosErros)[0];
                    const el = document.querySelector('[name="' + primeiro + '"]') as HTMLElement;
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.focus();
                    }
                }, 100);
                return;
            }
        }

        setLocalErrors({});
        setStep((step + 1) as 1 | 2 | 3);
    };

    const goPrev = () => {
        setStep((step - 1) as 1 | 2 | 3);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("registo.store"));
    };

    return (
        <>
            <Head title="Criar conta · ONDAKA" />

            <div className="min-h-screen bg-[#0a0a1a] text-zinc-100" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", system-ui, sans-serif" }}>
                {/* TOP BAR simplificado */}
                <header className="border-b border-blue-900/30 bg-[#0a0a1a]/90">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/img/ondaka-logo.png" alt="ONDAKA" className="h-9 w-9 rounded" />
                            <div>
                                <div className="text-base font-bold tracking-wide">ONDAKA</div>
                                <div className="text-[10px] text-zinc-500">Soluções Simples, Lda</div>
                            </div>
                        </Link>
                        <Link href="/login" className="text-sm text-zinc-400 hover:text-white">
                            Já tem conta? Entrar →
                        </Link>
                    </div>
                </header>

                <div className="relative">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" />
                    <div className="absolute left-0 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
                    <div className="absolute right-0 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />

                    <div className="relative mx-auto max-w-3xl px-6 py-12">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h1 className="mb-2 text-3xl font-bold md:text-4xl">
                                Criar{" "}
                                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">conta</span>
                            </h1>
                            <p className="text-sm text-zinc-400">30 dias de trial gratuito · Sem compromisso</p>
                        </div>

                        {/* Stepper */}
                        <div className="mb-10">
                            <div className="flex items-center justify-between gap-2">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className="flex flex-1 items-center gap-2">
                                        <div
                                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold transition ${
                                                step >= s
                                                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                                                    : "border border-zinc-700 bg-zinc-900 text-zinc-500"
                                            }`}
                                        >
                                            {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                                        </div>
                                        {s < 3 && (
                                            <div className={`h-0.5 flex-1 transition ${step > s ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-zinc-800"}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 flex justify-between text-xs text-zinc-500">
                                <span className={step >= 1 ? "text-zinc-300" : ""}>Tipo de cliente</span>
                                <span className={step >= 2 ? "text-zinc-300" : ""}>Dados</span>
                                <span className={step >= 3 ? "text-zinc-300" : ""}>Conta de acesso</span>
                            </div>
                        </div>

                        {/* Card principal */}
                        <form onSubmit={submit} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur">
                            {/* PASSO 1 — Tipo cliente */}
                            {step === 1 && (
                                <div>
                                    <h2 className="mb-2 text-xl font-bold">Qual é o seu perfil?</h2>
                                    <p className="mb-6 text-sm text-zinc-400">Escolha a opção que melhor descreve a sua actividade.</p>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => setData("tipo_cliente", "empresa_gestora")}
                                            className={`group relative rounded-xl border p-6 text-left transition ${
                                                data.tipo_cliente === "empresa_gestora"
                                                    ? "border-blue-500 bg-gradient-to-br from-blue-500/15 to-purple-500/10 shadow-lg shadow-blue-500/20"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-blue-500/50"
                                            }`}
                                        >
                                            <Building2 className="mb-3 h-10 w-10 text-blue-400" strokeWidth={1.5} />
                                            <h3 className="mb-1 font-semibold">Empresa Gestora</h3>
                                            <p className="text-xs text-zinc-400">
                                                Sociedade comercial com vários condomínios sob gestão.
                                            </p>
                                            {data.tipo_cliente === "empresa_gestora" && (
                                                <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-blue-400" />
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setData("tipo_cliente", "admin_independente")}
                                            className={`group relative rounded-xl border p-6 text-left transition ${
                                                data.tipo_cliente === "admin_independente"
                                                    ? "border-purple-500 bg-gradient-to-br from-purple-500/15 to-blue-500/10 shadow-lg shadow-purple-500/20"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-purple-500/50"
                                            }`}
                                        >
                                            <User className="mb-3 h-10 w-10 text-purple-400" strokeWidth={1.5} />
                                            <h3 className="mb-1 font-semibold">Admin Independente</h3>
                                            <p className="text-xs text-zinc-400">
                                                Pessoa singular responsável por 1 condomínio.
                                            </p>
                                            {data.tipo_cliente === "admin_independente" && (
                                                <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-purple-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* PASSO 2 — Dados */}
                            {step === 2 && (
                                <div>
                                    <h2 className="mb-2 text-xl font-bold">
                                        {isEmpresa ? "Dados da empresa" : "Os seus dados"}
                                    </h2>
                                    <p className="mb-6 text-sm text-zinc-400">
                                        {isEmpresa
                                            ? "Preencha os dados da empresa gestora."
                                            : "Preencha os seus dados como administrador."}
                                    </p>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="md:col-span-2">
                                            <label className="mb-1 block text-xs font-semibold text-zinc-300">
                                                {isEmpresa ? "Nome da empresa" : "Nome completo"}
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nome_empresa}
                                                onChange={(e) => setData("nome_empresa", e.target.value)}
                                                placeholder={isEmpresa ? "Soluções Simples, Lda" : "João Silva"}
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                            {(errors.nome_empresa || localErrors.nome_empresa) && <p className="mt-1 text-xs text-red-400">{errors.nome_empresa || localErrors.nome_empresa}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-zinc-300">Tipo documento</label>
                                            <select
                                                value={data.documento_tipo}
                                                onChange={(e) => setData("documento_tipo", e.target.value as TipoDocumento)}
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="NIF">NIF</option>
                                                <option value="BI">BI</option>
                                                <option value="PASSAPORTE">Passaporte</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-zinc-300">
                                                Número {data.documento_tipo}
                                            </label>
                                            <input
                                                type="text"
                                                value={data.documento_numero}
                                                onChange={(e) => setData("documento_numero", e.target.value)}
                                                placeholder="5417890123"
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                            {(errors.documento_numero || localErrors.documento_numero) && <p className="mt-1 text-xs text-red-400">{errors.documento_numero || localErrors.documento_numero}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-zinc-300">Província</label>
                                            <select
                                                value={data.provincia}
                                                onChange={(e) => setData("provincia", e.target.value)}
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="">Seleccionar...</option>
                                                {provincias.map((p) => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                            {(errors.provincia || localErrors.provincia) && <p className="mt-1 text-xs text-red-400">{errors.provincia || localErrors.provincia}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-zinc-300">Município</label>
                                            <input
                                                type="text"
                                                value={data.municipio}
                                                onChange={(e) => setData("municipio", e.target.value)}
                                                placeholder="Talatona"
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                            {(errors.municipio || localErrors.municipio) && <p className="mt-1 text-xs text-red-400">{errors.municipio || localErrors.municipio}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-zinc-300">Telefone</label>
                                            <input
                                                type="tel"
                                                value={data.telefone}
                                                onChange={(e) => setData("telefone", e.target.value)}
                                                placeholder="+244 923 456 789"
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                            {(errors.telefone || localErrors.telefone) && <p className="mt-1 text-xs text-red-400">{errors.telefone || localErrors.telefone}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-zinc-300">Email contacto</label>
                                            <input
                                                type="email"
                                                value={data.email_contacto}
                                                onChange={(e) => setData("email_contacto", e.target.value)}
                                                placeholder="contacto@empresa.com"
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                            {(errors.email_contacto || localErrors.email_contacto) && <p className="mt-1 text-xs text-red-400">{errors.email_contacto || localErrors.email_contacto}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PASSO 3 — Conta acesso */}
                            {step === 3 && (
                                <div>
                                    <h2 className="mb-2 text-xl font-bold">Conta de acesso</h2>
                                    <p className="mb-6 text-sm text-zinc-400">Os seus dados de login para a plataforma.</p>

                                    <div className="grid gap-4">
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-zinc-300">Nome do utilizador</label>
                                            <input
                                                type="text"
                                                value={data.user_nome}
                                                onChange={(e) => setData("user_nome", e.target.value)}
                                                placeholder="João Silva"
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                            {(errors.user_nome || localErrors.user_nome) && <p className="mt-1 text-xs text-red-400">{errors.user_nome || localErrors.user_nome}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-zinc-300">Email de login</label>
                                            <input
                                                type="email"
                                                value={data.user_email}
                                                onChange={(e) => setData("user_email", e.target.value)}
                                                placeholder="seu@email.com"
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                            {(errors.user_email || localErrors.user_email) && <p className="mt-1 text-xs text-red-400">{errors.user_email || localErrors.user_email}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-zinc-300">Password (mín. 8 caracteres)</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={data.user_password}
                                                    onChange={(e) => setData("user_password", e.target.value)}
                                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {(errors.user_password || localErrors.user_password) && <p className="mt-1 text-xs text-red-400">{errors.user_password || localErrors.user_password}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-zinc-300">Confirmar password</label>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={data.user_password_confirmation}
                                                onChange={(e) => setData("user_password_confirmation", e.target.value)}
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                                            <input
                                                type="checkbox"
                                                checked={data.aceita_termos}
                                                onChange={(e) => setData("aceita_termos", e.target.checked)}
                                                className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-blue-500"
                                            />
                                            <span className="text-xs text-zinc-300">
                                                Aceito os <a href="/termos" target="_blank" className="text-blue-400 hover:underline">Termos e Condições</a> e a <a href="/privacidade" target="_blank" className="text-blue-400 hover:underline">Política de Privacidade</a> da ONDAKA.
                                            </span>
                                        </label>
                                        {errors.aceita_termos && <p className="text-xs text-red-400">{errors.aceita_termos}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Erros gerais */}
                            {Object.keys(errors).length > 0 && step === 3 && (
                                <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                                    <div className="text-xs text-red-300">
                                        Verifique os campos com erro acima.
                                    </div>
                                </div>
                            )}

                            {/* Botões */}
                            <div className="mt-8 flex items-center justify-between gap-3">
                                {step > 1 ? (
                                    <button
                                        type="button"
                                        onClick={goPrev}
                                        className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-semibold transition hover:border-zinc-600"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Anterior
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={goNext}
                                        disabled={step === 1 && !data.tipo_cliente}
                                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Continuar
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={processing || !data.aceita_termos}
                                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing ? "A criar conta..." : "Criar conta e começar trial →"}
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Trust signals */}
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> 30 dias grátis</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> Sem cartão de crédito</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> Cancele quando quiser</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
