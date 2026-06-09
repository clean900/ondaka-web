import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { toast } from "sonner";
import { useState } from "react";
import { CheckCircle2, Building2, User, EyeOff, Eye, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
const provincias = [
  "Luanda",
  "Bengo",
  "Benguela",
  "Bié",
  "Cabinda",
  "Cuando-Cubango",
  "Cuanza-Norte",
  "Cuanza-Sul",
  "Cunene",
  "Huambo",
  "Huíla",
  "Lunda-Norte",
  "Lunda-Sul",
  "Malanje",
  "Moxico",
  "Namibe",
  "Uíge",
  "Zaire"
];
function Registo() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState({});
  const { data, setData, post, processing, errors } = useForm({
    tipo_cliente: "",
    nome_empresa: "",
    documento_tipo: "NIF",
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
    aceita_termos: false
  });
  const isEmpresa = data.tipo_cliente === "empresa_gestora";
  data.tipo_cliente === "admin_independente";
  const goNext = () => {
    const novosErros = {};
    if (step === 1) {
      if (!data.tipo_cliente) {
        toast.error("Por favor escolha o tipo de cliente para continuar.");
        return;
      }
    }
    if (step === 2) {
      const labels = {
        nome_empresa: "Nome da empresa",
        documento_numero: "Numero do documento (NIF/BI)",
        provincia: "Provincia",
        municipio: "Municipio",
        telefone: "Telefone",
        email_contacto: "Email de contacto"
      };
      for (const f of Object.keys(labels)) {
        const valor = data[f];
        if (!valor || typeof valor === "string" && !valor.trim()) {
          novosErros[f] = labels[f] + " e obrigatorio.";
        }
      }
      if (Object.keys(novosErros).length > 0) {
        setLocalErrors(novosErros);
        toast.error("Por favor preencha os campos em falta (" + Object.keys(novosErros).length + ").");
        setTimeout(() => {
          const primeiro = Object.keys(novosErros)[0];
          const el = document.querySelector('[name="' + primeiro + '"]');
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus();
          }
        }, 100);
        return;
      }
    }
    setLocalErrors({});
    setStep(step + 1);
  };
  const goPrev = () => {
    setStep(step - 1);
  };
  const submit = (e) => {
    e.preventDefault();
    post(route("registo.store"));
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Criar conta · ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0a0a1a] text-zinc-100", style: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }, children: [
      /* @__PURE__ */ jsx("header", { className: "border-b border-blue-900/30 bg-[#0a0a1a]/90", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-3", children: [
        /* @__PURE__ */ jsxs(Link, { href: "/", className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("img", { src: "/img/ondaka-logo.png", alt: "ONDAKA", className: "h-9 w-9 rounded" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-base font-bold tracking-wide", children: "ONDAKA" }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-zinc-500", children: "Soluções Simples, Lda" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: "/login", className: "text-sm text-zinc-400 hover:text-white", children: "Já tem conta? Entrar →" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" }),
        /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" }),
        /* @__PURE__ */ jsx("div", { className: "absolute right-0 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" }),
        /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-3xl px-6 py-12", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-8 text-center", children: [
            /* @__PURE__ */ jsxs("h1", { className: "mb-2 text-3xl font-bold md:text-4xl", children: [
              "Criar",
              " ",
              /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent", children: "conta" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400", children: "30 dias de trial gratuito · Sem compromisso" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-10", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between gap-2", children: [1, 2, 3].map((s) => /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: `flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold transition ${step >= s ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30" : "border border-zinc-700 bg-zinc-900 text-zinc-500"}`,
                  children: step > s ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" }) : s
                }
              ),
              s < 3 && /* @__PURE__ */ jsx("div", { className: `h-0.5 flex-1 transition ${step > s ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-zinc-800"}` })
            ] }, s)) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 flex justify-between text-xs text-zinc-500", children: [
              /* @__PURE__ */ jsx("span", { className: step >= 1 ? "text-zinc-300" : "", children: "Tipo de cliente" }),
              /* @__PURE__ */ jsx("span", { className: step >= 2 ? "text-zinc-300" : "", children: "Dados" }),
              /* @__PURE__ */ jsx("span", { className: step >= 3 ? "text-zinc-300" : "", children: "Conta de acesso" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur", children: [
            step === 1 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "mb-2 text-xl font-bold", children: "Qual é o seu perfil?" }),
              /* @__PURE__ */ jsx("p", { className: "mb-6 text-sm text-zinc-400", children: "Escolha a opção que melhor descreve a sua actividade." }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setData("tipo_cliente", "empresa_gestora"),
                    className: `group relative rounded-xl border p-6 text-left transition ${data.tipo_cliente === "empresa_gestora" ? "border-blue-500 bg-gradient-to-br from-blue-500/15 to-purple-500/10 shadow-lg shadow-blue-500/20" : "border-zinc-800 bg-zinc-900 hover:border-blue-500/50"}`,
                    children: [
                      /* @__PURE__ */ jsx(Building2, { className: "mb-3 h-10 w-10 text-blue-400", strokeWidth: 1.5 }),
                      /* @__PURE__ */ jsx("h3", { className: "mb-1 font-semibold", children: "Empresa Gestora" }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400", children: "Sociedade comercial com vários condomínios sob gestão." }),
                      data.tipo_cliente === "empresa_gestora" && /* @__PURE__ */ jsx(CheckCircle2, { className: "absolute right-3 top-3 h-5 w-5 text-blue-400" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setData("tipo_cliente", "admin_independente"),
                    className: `group relative rounded-xl border p-6 text-left transition ${data.tipo_cliente === "admin_independente" ? "border-purple-500 bg-gradient-to-br from-purple-500/15 to-blue-500/10 shadow-lg shadow-purple-500/20" : "border-zinc-800 bg-zinc-900 hover:border-purple-500/50"}`,
                    children: [
                      /* @__PURE__ */ jsx(User, { className: "mb-3 h-10 w-10 text-purple-400", strokeWidth: 1.5 }),
                      /* @__PURE__ */ jsx("h3", { className: "mb-1 font-semibold", children: "Admin Independente" }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400", children: "Pessoa singular responsável por 1 condomínio." }),
                      data.tipo_cliente === "admin_independente" && /* @__PURE__ */ jsx(CheckCircle2, { className: "absolute right-3 top-3 h-5 w-5 text-purple-400" })
                    ]
                  }
                )
              ] })
            ] }),
            step === 2 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "mb-2 text-xl font-bold", children: isEmpresa ? "Dados da empresa" : "Os seus dados" }),
              /* @__PURE__ */ jsx("p", { className: "mb-6 text-sm text-zinc-400", children: isEmpresa ? "Preencha os dados da empresa gestora." : "Preencha os seus dados como administrador." }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: isEmpresa ? "Nome da empresa" : "Nome completo" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: data.nome_empresa,
                      onChange: (e) => setData("nome_empresa", e.target.value),
                      placeholder: isEmpresa ? "Soluções Simples, Lda" : "João Silva",
                      className: "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    }
                  ),
                  (errors.nome_empresa || localErrors.nome_empresa) && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-400", children: errors.nome_empresa || localErrors.nome_empresa })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: "Tipo documento" }),
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      value: data.documento_tipo,
                      onChange: (e) => setData("documento_tipo", e.target.value),
                      className: "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none",
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "NIF", children: "NIF" }),
                        /* @__PURE__ */ jsx("option", { value: "BI", children: "BI" }),
                        /* @__PURE__ */ jsx("option", { value: "PASSAPORTE", children: "Passaporte" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: [
                    "Número ",
                    data.documento_tipo
                  ] }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: data.documento_numero,
                      onChange: (e) => setData("documento_numero", e.target.value),
                      placeholder: "5417890123",
                      className: "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    }
                  ),
                  (errors.documento_numero || localErrors.documento_numero) && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-400", children: errors.documento_numero || localErrors.documento_numero })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: "Província" }),
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      value: data.provincia,
                      onChange: (e) => setData("provincia", e.target.value),
                      className: "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none",
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar..." }),
                        provincias.map((p) => /* @__PURE__ */ jsx("option", { value: p, children: p }, p))
                      ]
                    }
                  ),
                  (errors.provincia || localErrors.provincia) && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-400", children: errors.provincia || localErrors.provincia })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: "Município" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: data.municipio,
                      onChange: (e) => setData("municipio", e.target.value),
                      placeholder: "Talatona",
                      className: "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    }
                  ),
                  (errors.municipio || localErrors.municipio) && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-400", children: errors.municipio || localErrors.municipio })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: "Telefone" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "tel",
                      value: data.telefone,
                      onChange: (e) => setData("telefone", e.target.value),
                      placeholder: "+244 923 456 789",
                      className: "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    }
                  ),
                  (errors.telefone || localErrors.telefone) && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-400", children: errors.telefone || localErrors.telefone })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: "Email contacto" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "email",
                      value: data.email_contacto,
                      onChange: (e) => setData("email_contacto", e.target.value),
                      placeholder: "contacto@empresa.com",
                      className: "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    }
                  ),
                  (errors.email_contacto || localErrors.email_contacto) && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-400", children: errors.email_contacto || localErrors.email_contacto })
                ] })
              ] })
            ] }),
            step === 3 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "mb-2 text-xl font-bold", children: "Conta de acesso" }),
              /* @__PURE__ */ jsx("p", { className: "mb-6 text-sm text-zinc-400", children: "Os seus dados de login para a plataforma." }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: "Nome do utilizador" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: data.user_nome,
                      onChange: (e) => setData("user_nome", e.target.value),
                      placeholder: "João Silva",
                      className: "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    }
                  ),
                  (errors.user_nome || localErrors.user_nome) && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-400", children: errors.user_nome || localErrors.user_nome })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: "Email de login" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "email",
                      value: data.user_email,
                      onChange: (e) => setData("user_email", e.target.value),
                      placeholder: "seu@email.com",
                      className: "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    }
                  ),
                  (errors.user_email || localErrors.user_email) && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-400", children: errors.user_email || localErrors.user_email })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: "Password (mín. 8 caracteres)" }),
                  /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: showPassword ? "text" : "password",
                        value: data.user_password,
                        onChange: (e) => setData("user_password", e.target.value),
                        className: "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setShowPassword(!showPassword),
                        className: "absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300",
                        children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
                      }
                    )
                  ] }),
                  (errors.user_password || localErrors.user_password) && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-400", children: errors.user_password || localErrors.user_password })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: "Confirmar password" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: showPassword ? "text" : "password",
                      value: data.user_password_confirmation,
                      onChange: (e) => setData("user_password_confirmation", e.target.value),
                      className: "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: data.aceita_termos,
                      onChange: (e) => setData("aceita_termos", e.target.checked),
                      className: "mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-blue-500"
                    }
                  ),
                  /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-300", children: [
                    "Aceito os ",
                    /* @__PURE__ */ jsx("a", { href: "/termos", target: "_blank", className: "text-blue-400 hover:underline", children: "Termos e Condições" }),
                    " e a ",
                    /* @__PURE__ */ jsx("a", { href: "/privacidade", target: "_blank", className: "text-blue-400 hover:underline", children: "Política de Privacidade" }),
                    " da ONDAKA."
                  ] })
                ] }),
                errors.aceita_termos && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400", children: errors.aceita_termos })
              ] })
            ] }),
            Object.keys(errors).length > 0 && step === 3 && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-red-300", children: "Verifique os campos com erro acima." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-8 flex items-center justify-between gap-3", children: [
              step > 1 ? /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: goPrev,
                  className: "flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-semibold transition hover:border-zinc-600",
                  children: [
                    /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
                    "Anterior"
                  ]
                }
              ) : /* @__PURE__ */ jsx("div", {}),
              step < 3 ? /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: goNext,
                  disabled: step === 1 && !data.tipo_cliente,
                  className: "flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50",
                  children: [
                    "Continuar",
                    /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
                  ]
                }
              ) : /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: processing || !data.aceita_termos,
                  className: "flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50",
                  children: processing ? "A criar conta..." : "Criar conta e começar trial →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-green-400" }),
              " 30 dias grátis"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-green-400" }),
              " Sem cartão de crédito"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-green-400" }),
              " Cancele quando quiser"
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  Registo as default
};
