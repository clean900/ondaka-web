import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-TDdsYzgz.js";
import { useForm, Head } from "@inertiajs/react";
import { useState } from "react";
import { AlertTriangle, UserCircle, Key, Mail, Phone, Globe, Save, EyeOff, Eye, CheckCircle2 } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function PerfilIndex({ user }) {
  const [tab, setTab] = useState("perfil");
  const perfilForm = useForm({
    name: user.name,
    email: user.email,
    telefone: user.telefone ?? "",
    locale: user.locale
  });
  const passwordForm = useForm({
    password_actual: "",
    password: "",
    password_confirmation: ""
  });
  const [showActual, setShowActual] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const submitPerfil = (e) => {
    e.preventDefault();
    perfilForm.patch(route("perfil.update"));
  };
  const submitPassword = (e) => {
    e.preventDefault();
    passwordForm.patch(route("perfil.password.update"), {
      onSuccess: () => passwordForm.reset()
    });
  };
  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Meu perfil" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white",
            style: {
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(0, 212, 255, 0.2) 100%)",
              border: "0.5px solid rgba(168, 85, 247, 0.4)"
            },
            children: initials
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white tracking-tight", children: user.name }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/50 mt-0.5", children: user.email }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-2 mt-1", children: user.roles.map((r) => /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70", children: r }, r)) })
        ] })
      ] }),
      user.must_change_password && tab === "perfil" && /* @__PURE__ */ jsxs("div", { className: "mb-5 rounded-lg p-4 bg-amber-500/8 border border-amber-500/30 flex gap-3", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-amber-100", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Tem de alterar a sua password." }),
          /* @__PURE__ */ jsx("p", { className: "text-amber-200/70 mt-0.5", children: "Por motivos de segurança, deve definir uma password pessoal." }),
          /* @__PURE__ */ jsx("button", { onClick: () => setTab("password"), className: "mt-2 text-amber-300 underline hover:text-amber-200", children: "Ir para Alterar Password →" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-5 border-b border-white/10", children: [
        /* @__PURE__ */ jsx(TabButton, { activa: tab === "perfil", onClick: () => setTab("perfil"), icon: UserCircle, label: "Dados pessoais" }),
        /* @__PURE__ */ jsx(TabButton, { activa: tab === "password", onClick: () => setTab("password"), icon: Key, label: "Alterar password" })
      ] }),
      tab === "perfil" && /* @__PURE__ */ jsxs("form", { onSubmit: submitPerfil, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs(Seccao, { icon: UserCircle, iconColor: "#A855F7", titulo: "Dados pessoais", children: [
          /* @__PURE__ */ jsx(Campo, { label: "Nome completo *", erro: perfilForm.errors.name, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: perfilForm.data.name,
              onChange: (e) => perfilForm.setData("name", e.target.value),
              className: "input",
              autoComplete: "name"
            }
          ) }),
          /* @__PURE__ */ jsx(Campo, { label: "Email *", erro: perfilForm.errors.email, icon: Mail, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              value: perfilForm.data.email,
              onChange: (e) => perfilForm.setData("email", e.target.value),
              className: "input",
              autoComplete: "email"
            }
          ) }),
          /* @__PURE__ */ jsx(Campo, { label: "Telefone", erro: perfilForm.errors.telefone, icon: Phone, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "tel",
              value: perfilForm.data.telefone,
              onChange: (e) => perfilForm.setData("telefone", e.target.value),
              className: "input",
              placeholder: "+244 9XX XXX XXX",
              autoComplete: "tel"
            }
          ) }),
          /* @__PURE__ */ jsx(Campo, { label: "Idioma", erro: perfilForm.errors.locale, icon: Globe, children: /* @__PURE__ */ jsxs(
            "select",
            {
              value: perfilForm.data.locale,
              onChange: (e) => perfilForm.setData("locale", e.target.value),
              className: "input",
              children: [
                /* @__PURE__ */ jsx("option", { value: "pt_AO", className: "bg-[#16163A]", children: "Português (Angola)" }),
                /* @__PURE__ */ jsx("option", { value: "pt_PT", className: "bg-[#16163A]", children: "Português (Portugal)" }),
                /* @__PURE__ */ jsx("option", { value: "en", className: "bg-[#16163A]", children: "English" })
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: perfilForm.processing,
            className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white text-sm font-medium transition disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
              perfilForm.processing ? "A guardar..." : "Guardar alterações"
            ]
          }
        ) })
      ] }),
      tab === "password" && /* @__PURE__ */ jsxs("form", { onSubmit: submitPassword, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs(Seccao, { icon: Key, iconColor: "#00D4FF", titulo: "Alterar password", children: [
          /* @__PURE__ */ jsx(Campo, { label: "Password actual *", erro: passwordForm.errors.password_actual, children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: showActual ? "text" : "password",
                value: passwordForm.data.password_actual,
                onChange: (e) => passwordForm.setData("password_actual", e.target.value),
                className: "input pr-10",
                autoComplete: "current-password"
              }
            ),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowActual(!showActual), className: "absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white", children: showActual ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" }) })
          ] }) }),
          /* @__PURE__ */ jsxs(Campo, { label: "Nova password *", erro: passwordForm.errors.password, children: [
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: showNova ? "text" : "password",
                  value: passwordForm.data.password,
                  onChange: (e) => passwordForm.setData("password", e.target.value),
                  className: "input pr-10",
                  placeholder: "Mínimo 8 caracteres",
                  autoComplete: "new-password"
                }
              ),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowNova(!showNova), className: "absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white", children: showNova ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" }) })
            ] }),
            passwordForm.data.password.length > 0 && passwordForm.data.password.length < 8 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-amber-400 mt-1", children: [
              "Mínimo 8 caracteres (",
              passwordForm.data.password.length,
              "/8)"
            ] }),
            passwordForm.data.password.length >= 8 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-emerald-400 mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3 h-3" }),
              " Comprimento OK"
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Campo, { label: "Confirmar nova password *", erro: passwordForm.errors.password_confirmation, children: [
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: showConf ? "text" : "password",
                  value: passwordForm.data.password_confirmation,
                  onChange: (e) => passwordForm.setData("password_confirmation", e.target.value),
                  className: "input pr-10",
                  autoComplete: "new-password"
                }
              ),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowConf(!showConf), className: "absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white", children: showConf ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" }) })
            ] }),
            passwordForm.data.password_confirmation.length > 0 && passwordForm.data.password !== passwordForm.data.password_confirmation && /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-400 mt-1", children: "As passwords não coincidem." }),
            passwordForm.data.password_confirmation.length > 0 && passwordForm.data.password === passwordForm.data.password_confirmation && passwordForm.data.password.length >= 8 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-emerald-400 mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3 h-3" }),
              " Passwords coincidem"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: passwordForm.processing,
            className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white text-sm font-medium transition disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsx(Key, { className: "w-4 h-4" }),
              passwordForm.processing ? "A guardar..." : "Alterar password"
            ]
          }
        ) })
      ] })
    ] })
  ] });
}
function TabButton({ activa, onClick, icon: Icon, label }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: `flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition ${activa ? "text-white border-b-2 border-cyan-400" : "text-white/50 hover:text-white/80 border-b-2 border-transparent"}`,
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }),
        label
      ]
    }
  );
}
function Seccao({ icon: Icon, iconColor, titulo, children }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl p-5 bg-white/[0.02] border border-white/5 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-3 border-b border-white/5", children: [
      /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4", style: { color: iconColor } }),
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white", children: titulo })
    ] }),
    children
  ] });
}
function Campo({ label, erro, icon: Icon, children }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("label", { className: "text-xs font-medium text-white/60 mb-1.5 flex items-center gap-1.5", children: [
      Icon && /* @__PURE__ */ jsx(Icon, { className: "w-3 h-3" }),
      label
    ] }),
    children,
    erro && /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-400 mt-1", children: erro })
  ] });
}
export {
  PerfilIndex as default
};
