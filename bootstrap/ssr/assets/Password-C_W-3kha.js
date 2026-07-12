import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BX6gg7g7.js";
import { useForm, Head } from "@inertiajs/react";
import { useState } from "react";
import { Key, AlertTriangle, Lock, EyeOff, Eye, CheckCircle2 } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Password({ forcar_troca }) {
  const [showActual, setShowActual] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const { data, setData, patch, processing, errors, reset } = useForm({
    password_actual: "",
    password: "",
    password_confirmation: ""
  });
  const submit = (e) => {
    e.preventDefault();
    patch(route("perfil.password.update"), {
      onSuccess: () => reset()
    });
  };
  const passwordForte = data.password.length >= 8;
  const passwordsMatcham = data.password.length > 0 && data.password === data.password_confirmation;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Alterar password" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-white tracking-tight flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Key, { className: "w-6 h-6 text-[#00D4FF]" }),
          "Alterar password"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: forcar_troca ? "Por motivos de segurança, deve definir uma nova password antes de continuar." : "Defina uma nova password para a sua conta." })
      ] }),
      forcar_troca && /* @__PURE__ */ jsxs("div", { className: "mb-5 rounded-lg p-4 bg-amber-500/8 border border-amber-500/30 flex gap-3", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-white/85 leading-relaxed", children: [
          /* @__PURE__ */ jsx("strong", { className: "text-amber-300", children: "Troca obrigatória:" }),
          " Um administrador definiu a sua password inicial. Para sua segurança, deve definir uma nova password antes de aceder à plataforma."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "card-elevated space-y-5", children: [
        !forcar_troca && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: [
            /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3 inline mr-1" }),
            "Password actual *"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: showActual ? "text" : "password",
                required: true,
                className: "input pr-10",
                value: data.password_actual,
                onChange: (e) => setData("password_actual", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowActual(!showActual),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white",
                children: showActual ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
              }
            )
          ] }),
          errors.password_actual && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400 mt-1", children: errors.password_actual })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: [
            /* @__PURE__ */ jsx(Key, { className: "w-3 h-3 inline mr-1" }),
            "Nova password *"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: showNova ? "text" : "password",
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
                onClick: () => setShowNova(!showNova),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white",
                children: showNova ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
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
            "Confirmar nova password *"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: showConf ? "text" : "password",
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
                onClick: () => setShowConf(!showConf),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white",
                children: showConf ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
              }
            )
          ] }),
          data.password_confirmation.length > 0 && /* @__PURE__ */ jsxs("div", { className: `text-[10px] mt-1.5 flex items-center gap-1 ${passwordsMatcham ? "text-emerald-400" : "text-amber-400"}`, children: [
            passwordsMatcham ? /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx("span", { children: "✗" }),
            passwordsMatcham ? "Passwords coincidem" : "As passwords não coincidem"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: processing || !passwordForte || !passwordsMatcham,
            className: "btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed",
            children: [
              /* @__PURE__ */ jsx(Key, { className: "w-4 h-4" }),
              processing ? "A guardar..." : "Alterar password"
            ]
          }
        )
      ] })
    ] })
  ] });
}
export {
  Password as default
};
