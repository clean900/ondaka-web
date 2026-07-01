import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { usePage, Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { MessageSquare, CheckCircle2, Info, Building2, Save, Clock } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function EstadoBadge({ estado }) {
  if (estado === "configurado") {
    return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" }),
      " Configurado"
    ] });
  }
  if (estado === "pendente") {
    return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs font-medium text-amber-400", children: [
      /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
      " A aguardar equipa ONDAKA"
    ] });
  }
  return /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1.5 text-xs font-medium text-white/40", children: "Sem nome definido" });
}
function LinhaCondominio({ cond }) {
  const [nome, setNome] = useState(cond.sender_name ?? "");
  const { setData, post, processing, errors } = useForm({
    condominio_id: cond.id,
    sender_name: cond.sender_name ?? ""
  });
  const submit = (e) => {
    e.preventDefault();
    setData("sender_name", nome);
    post(route("configuracoes.sms-sender.guardar"), { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "rounded-lg border border-white/10 bg-white/5 p-4 space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ jsx(Building2, { className: "w-4 h-4 text-white/40 flex-shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-white truncate", children: cond.nome })
      ] }),
      /* @__PURE__ */ jsx(EstadoBadge, { estado: cond.estado })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/50 mb-1", children: "Nome do remetente (máx 11 caracteres)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: nome,
            maxLength: 11,
            onChange: (e) => setNome(e.target.value.toUpperCase()),
            placeholder: "Ex: TALATONA",
            className: "w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50"
          }
        ),
        errors.sender_name && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.sender_name })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "submit",
          disabled: processing || nome.trim().length === 0,
          className: "inline-flex items-center gap-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 px-4 py-2 text-sm font-medium text-white transition",
          children: [
            /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
            " Guardar"
          ]
        }
      )
    ] })
  ] });
}
function SmsSender() {
  const { featureActiva, condominios, flash } = usePage().props;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "SMS — Nome do remetente" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto p-6 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-white flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "w-6 h-6 text-cyan-400" }),
          "Nome do remetente (SMS)"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: 'Defina o nome que aparece como remetente nos SMS de cada condomínio (ex: "TALATONA"). Depois de guardar, a equipa ONDAKA configura o registo junto da operadora e ativa o nome personalizado.' })
      ] }),
      (flash == null ? void 0 : flash.success) && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-emerald-200", children: flash.success })
      ] }),
      (flash == null ? void 0 : flash.error) && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(Info, { className: "w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-red-200", children: flash.error })
      ] }),
      !featureActiva && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(Info, { className: "w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-200", children: 'O add-on "Sender ID personalizado" não está ativo. Ative-o na Loja para configurar nomes de remetente personalizados.' })
      ] }),
      condominios.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-white/40", children: "Não há condomínios para configurar." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: condominios.map((cond) => /* @__PURE__ */ jsx(LinhaCondominio, { cond }, cond.id)) })
    ] })
  ] });
}
export {
  SmsSender as default
};
