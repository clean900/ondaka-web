import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BlNlf6II.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import { Info, CheckCircle2, MessageCircle, Phone, Mail, MapPin, Clock, Save } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function ContactosSuporte() {
  const { empresa, configurado, flash } = usePage().props;
  const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
    email_contacto: (empresa == null ? void 0 : empresa.email_contacto) ?? "",
    telefone: (empresa == null ? void 0 : empresa.telefone) ?? "",
    whatsapp_suporte: (empresa == null ? void 0 : empresa.whatsapp_suporte) ?? "",
    morada: (empresa == null ? void 0 : empresa.morada) ?? "",
    horario_atendimento: (empresa == null ? void 0 : empresa.horario_atendimento) ?? ""
  });
  const submit = (e) => {
    e.preventDefault();
    patch(route("configuracoes.contactos-suporte.actualizar"), {
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Contactos & Suporte" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto p-6 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: "Contactos & Suporte" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Estes contactos são apresentados aos condóminos na app móvel, para que possam pedir ajuda à sua empresa gestora." })
      ] }),
      !configurado && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(Info, { className: "w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-amber-100", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Ainda não configurou nenhum canal de contacto." }),
          /* @__PURE__ */ jsx("p", { className: "text-amber-200/80 mt-1", children: "Os condóminos verão uma mensagem a sugerir o chatbot até preencher pelo menos um campo." })
        ] })
      ] }),
      (flash == null ? void 0 : flash.success) && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-green-500/30 bg-green-500/10 p-3 flex items-center gap-2 text-sm text-green-200", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" }),
        flash.success
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-white/10 bg-white/5 p-5 space-y-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white/80 uppercase tracking-wide", children: "Canais de comunicação" }),
          /* @__PURE__ */ jsx(
            Field,
            {
              icon: /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4 text-green-400" }),
              label: "WhatsApp de suporte",
              hint: "Número internacional (ex: +244 923 456 789)",
              value: data.whatsapp_suporte,
              error: errors.whatsapp_suporte,
              onChange: (v) => setData("whatsapp_suporte", v),
              placeholder: "+244 923 456 789"
            }
          ),
          /* @__PURE__ */ jsx(
            Field,
            {
              icon: /* @__PURE__ */ jsx(Phone, { className: "w-4 h-4 text-cyan-400" }),
              label: "Telefone fixo / outro",
              value: data.telefone,
              error: errors.telefone,
              onChange: (v) => setData("telefone", v),
              placeholder: "+244 222 000 000"
            }
          ),
          /* @__PURE__ */ jsx(
            Field,
            {
              icon: /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4 text-purple-400" }),
              label: "Email de suporte",
              value: data.email_contacto,
              error: errors.email_contacto,
              onChange: (v) => setData("email_contacto", v),
              type: "email",
              placeholder: "suporte@empresa.ao"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-white/10 bg-white/5 p-5 space-y-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white/80 uppercase tracking-wide", children: "Informação adicional" }),
          /* @__PURE__ */ jsx(
            Field,
            {
              icon: /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 text-pink-400" }),
              label: "Morada do escritório",
              value: data.morada,
              error: errors.morada,
              onChange: (v) => setData("morada", v),
              placeholder: "Rua, número, bairro, cidade",
              multiline: true
            }
          ),
          /* @__PURE__ */ jsx(
            Field,
            {
              icon: /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-amber-400" }),
              label: "Horário de atendimento",
              hint: "Texto livre, ex: 'Seg-Sex 8h-17h'",
              value: data.horario_atendimento,
              error: errors.horario_atendimento,
              onChange: (v) => setData("horario_atendimento", v),
              placeholder: "Seg-Sex 8h-17h"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: processing,
            className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
              processing ? "A guardar..." : "Guardar alterações"
            ]
          }
        ) }),
        recentlySuccessful && /* @__PURE__ */ jsx("p", { className: "text-xs text-green-300 text-right", children: "✓ Guardado" })
      ] })
    ] })
  ] });
}
function Field({ icon, label, hint, value, error, onChange, type = "text", placeholder, multiline }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/80 mb-1.5", children: [
      icon,
      /* @__PURE__ */ jsx("span", { children: label })
    ] }),
    multiline ? /* @__PURE__ */ jsx(
      "textarea",
      {
        rows: 2,
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        className: "w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition"
      }
    ) : /* @__PURE__ */ jsx(
      "input",
      {
        type,
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        className: "w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition"
      }
    ),
    hint && /* @__PURE__ */ jsx("p", { className: "text-xs text-white/40 mt-1", children: hint }),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: error })
  ] });
}
export {
  ContactosSuporte as default
};
