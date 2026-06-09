import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useForm, Head } from "@inertiajs/react";
import { useState } from "react";
import { Sparkles, Shield, Building2, Lock, EyeOff, Eye, CheckCircle2 } from "lucide-react";
const roleLabel = {
  "super-admin": "Super Administrador",
  "admin-empresa": "Administrador de Empresa",
  "gestor": "Gestor de Condomínios",
  "administrador-condominio": "Administrador de Condomínio",
  "condomino": "Condómino",
  "funcionario": "Funcionário",
  "prestador": "Prestador de Serviços",
  "guarda": "Guarda / Porteiro"
};
function Aceitar({ convite }) {
  const [showPwd, setShowPwd] = useState(false);
  const [showPwdConf, setShowPwdConf] = useState(false);
  const { data, setData, post, processing, errors } = useForm({
    password: "",
    password_confirmation: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(`/convite/${convite.token}`);
  };
  const passwordForte = data.password.length >= 8;
  const passwordsMatcham = data.password.length > 0 && data.password === data.password_confirmation;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Activar conta - ONDAKA" }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "min-h-screen flex items-center justify-center p-4",
        style: {
          background: "radial-gradient(ellipse at top, rgba(168,85,247,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(0,212,255,0.1) 0%, transparent 50%), #0A0A1F"
        },
        children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
            /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-[#00D4FF]" }),
              /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold gradient-ondaka-text", children: "ONDAKA" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50", children: "Plataforma de Gestão de Condomínios" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#16163A]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl", children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-xl font-semibold text-white mb-1", children: [
              "Olá, ",
              convite.nome.split(" ")[0],
              " 👋"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mb-5", children: "Para activar a sua conta, defina uma password segura." }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-white/[0.02] border border-white/5 p-4 mb-5 space-y-2.5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 text-xs", children: [
                /* @__PURE__ */ jsx(Shield, { className: "w-3.5 h-3.5 text-[#00D4FF] flex-shrink-0 mt-0.5" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-white/50 text-[10px] uppercase tracking-wide mb-0.5", children: "Função" }),
                  /* @__PURE__ */ jsx("div", { className: "text-white font-medium", children: roleLabel[convite.role_name] ?? convite.role_name })
                ] })
              ] }),
              convite.empresa_nome && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 text-xs", children: [
                /* @__PURE__ */ jsx(Building2, { className: "w-3.5 h-3.5 text-[#A855F7] flex-shrink-0 mt-0.5" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-white/50 text-[10px] uppercase tracking-wide mb-0.5", children: "Empresa" }),
                  /* @__PURE__ */ jsx("div", { className: "text-white font-medium", children: convite.empresa_nome })
                ] })
              ] }),
              convite.condominio_nome && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 text-xs", children: [
                /* @__PURE__ */ jsx(Building2, { className: "w-3.5 h-3.5 text-[#EC4899] flex-shrink-0 mt-0.5" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-white/50 text-[10px] uppercase tracking-wide mb-0.5", children: "Condomínio" }),
                  /* @__PURE__ */ jsx("div", { className: "text-white font-medium", children: convite.condominio_nome })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: [
                  /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3 inline mr-1" }),
                  "Nova password"
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: showPwd ? "text" : "password",
                      required: true,
                      minLength: 8,
                      className: "input pr-10",
                      value: data.password,
                      onChange: (e) => setData("password", e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setShowPwd(!showPwd),
                      className: "absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white",
                      children: showPwd ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
                    }
                  )
                ] }),
                errors.password && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400 mt-1", children: errors.password }),
                /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-white/40 mt-1.5 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx("span", { className: passwordForte ? "text-emerald-400" : "", children: passwordForte ? "✓" : "○" }),
                  "Mínimo 8 caracteres"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: [
                  /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3 inline mr-1" }),
                  "Confirmar password"
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: showPwdConf ? "text" : "password",
                      required: true,
                      className: "input pr-10",
                      value: data.password_confirmation,
                      onChange: (e) => setData("password_confirmation", e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setShowPwdConf(!showPwdConf),
                      className: "absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white",
                      children: showPwdConf ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
                    }
                  )
                ] }),
                data.password_confirmation.length > 0 && /* @__PURE__ */ jsxs("div", { className: `text-[10px] mt-1.5 flex items-center gap-1 ${passwordsMatcham ? "text-emerald-400" : "text-amber-400"}`, children: [
                  passwordsMatcham ? /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx("span", { children: "✗" }),
                  passwordsMatcham ? "Passwords coincidem" : "As passwords não coincidem"
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: processing || !passwordForte || !passwordsMatcham,
                  className: "btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed",
                  children: processing ? "A activar..." : "Activar a minha conta"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-center mt-4 text-[10px] text-white/40", children: [
              "Convite válido até ",
              new Date(convite.expira_em).toLocaleDateString("pt-PT")
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-center mt-6 text-xs text-white/40", children: "© ONDAKA · Soluções Simples, Lda · Luanda, Angola" })
        ] })
      }
    )
  ] });
}
export {
  Aceitar as default
};
