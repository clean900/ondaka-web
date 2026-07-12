import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BX6gg7g7.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { ArrowLeft, Users, Info, Save } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function AssembleiaForm({ condominios }) {
  const { data, setData, post, processing, errors } = useForm({
    condominio_id: "",
    tipo: "ordinaria",
    titulo: "",
    ordem_do_dia: "",
    observacoes: "",
    data_agendada: "",
    data_segunda_convocatoria: "",
    local: "Virtual",
    modo: "virtual",
    quorum_minimo_percent: 50,
    enviar_convocatorias_ja: false
  });
  const submit = (e) => {
    e.preventDefault();
    post("/assembleias");
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Nova assembleia — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8 max-w-3xl", children: [
      /* @__PURE__ */ jsxs(Link, { href: "/assembleias", className: "inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
        "Voltar"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Users, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Nova assembleia" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Agendar reunião de condóminos" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Condomínio" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: data.condominio_id,
              onChange: (e) => setData("condominio_id", e.target.value),
              required: true,
              className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Seleccione um condomínio..." }),
                condominios.map((c) => /* @__PURE__ */ jsxs("option", { value: c.id, children: [
                  c.nome,
                  " (",
                  c.codigo,
                  ")"
                ] }, c.id))
              ]
            }
          ),
          errors.condominio_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.condominio_id })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Detalhes" }),
          /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1.5", children: "Tipo" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: data.tipo,
                  onChange: (e) => setData("tipo", e.target.value),
                  className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "ordinaria", children: "Ordinária" }),
                    /* @__PURE__ */ jsx("option", { value: "extraordinaria", children: "Extraordinária" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1.5", children: "Modo" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: data.modo,
                  onChange: (e) => setData("modo", e.target.value),
                  className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "virtual", children: "Virtual" }),
                    /* @__PURE__ */ jsx("option", { value: "presencial", children: "Presencial" }),
                    /* @__PURE__ */ jsx("option", { value: "hibrida", children: "Híbrida" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1.5", children: "Título *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.titulo,
                onChange: (e) => setData("titulo", e.target.value),
                required: true,
                maxLength: 200,
                placeholder: "Ex: 1ª Assembleia Ordinária 2026",
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600"
              }
            ),
            errors.titulo && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.titulo })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1.5", children: "Ordem do dia *" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: data.ordem_do_dia,
                onChange: (e) => setData("ordem_do_dia", e.target.value),
                required: true,
                rows: 5,
                placeholder: "1. Aprovação das contas do exercício anterior\n2. Eleição do novo administrador\n3. Outros assuntos",
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 font-mono"
              }
            ),
            errors.ordem_do_dia && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.ordem_do_dia })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1.5", children: "Observações" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: data.observacoes,
                onChange: (e) => setData("observacoes", e.target.value),
                rows: 2,
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Agendamento" }),
          /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1.5", children: "Data e hora (1ª convocatória) *" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "datetime-local",
                  value: data.data_agendada,
                  onChange: (e) => setData("data_agendada", e.target.value),
                  required: true,
                  className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                }
              ),
              errors.data_agendada && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.data_agendada })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1.5", children: "2ª convocatória (opcional)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "datetime-local",
                  value: data.data_segunda_convocatoria,
                  onChange: (e) => setData("data_segunda_convocatoria", e.target.value),
                  className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                }
              )
            ] })
          ] }),
          data.modo !== "virtual" && /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1.5", children: "Local (se presencial/híbrida)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.local,
                onChange: (e) => setData("local", e.target.value),
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1.5", children: "Quórum mínimo (%)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: data.quorum_minimo_percent,
                onChange: (e) => setData("quorum_minimo_percent", Number(e.target.value)),
                min: 0,
                max: 100,
                step: 0.01,
                className: "w-32 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-1", children: "Percentagem de fracções necessária para deliberar (DP 141/15: ≥50% em 1ª)" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/5 border border-cyan-500/30 rounded-xl p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(Info, { className: "h-5 w-5 text-cyan-400 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-cyan-300 mb-1", children: "Enviar convocatórias agora?" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 mb-3", children: "Enviam-se email + SMS (1 SMS por condómino da sua feature sms_sender_id). Se preferir, pode enviar mais tarde na página de detalhe." }),
            /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: data.enviar_convocatorias_ja,
                  onChange: (e) => setData("enviar_convocatorias_ja", e.target.checked),
                  className: "w-4 h-4 rounded bg-zinc-900 border-zinc-700"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-200", children: "Enviar convocatórias automaticamente após criar" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [
          /* @__PURE__ */ jsx(Link, { href: "/assembleias", className: "text-sm text-zinc-400 hover:text-zinc-200", children: "Cancelar" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-5 py-2.5 text-sm font-medium disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
                processing ? "A criar..." : "Criar assembleia"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  AssembleiaForm as default
};
