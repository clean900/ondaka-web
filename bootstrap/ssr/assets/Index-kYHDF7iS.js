import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BlNlf6II.js";
import { useForm, Head } from "@inertiajs/react";
import { useState } from "react";
import { Megaphone, CheckSquare, Square, Building2, Send, AlertTriangle } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function ComunicadosIndex({ condominios }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    titulo: "",
    mensagem: "",
    condominio_ids: []
  });
  const [confirmar, setConfirmar] = useState(false);
  const todosSelecionados = condominios.length > 0 && data.condominio_ids.length === condominios.length;
  function toggleCondominio(id) {
    if (data.condominio_ids.includes(id)) {
      setData("condominio_ids", data.condominio_ids.filter((c) => c !== id));
    } else {
      setData("condominio_ids", [...data.condominio_ids, id]);
    }
  }
  function toggleTodos() {
    if (todosSelecionados) {
      setData("condominio_ids", []);
    } else {
      setData("condominio_ids", condominios.map((c) => c.id));
    }
  }
  function submeter() {
    post("/admin/comunicados/enviar", {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setConfirmar(false);
      }
    });
  }
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Comunicados" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500", children: /* @__PURE__ */ jsx(Megaphone, { className: "w-6 h-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Comunicados" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400", children: "Publica um aviso nos condominios que escolheres. Os condominos recebem na seccao Avisos, com push e email." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-5 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-zinc-300 mb-1", children: "Titulo" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: data.titulo,
              onChange: (e) => setData("titulo", e.target.value),
              maxLength: 120,
              placeholder: "Ex: Manutencao programada da plataforma",
              className: "w-full rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2 focus:border-cyan-500 outline-none"
            }
          ),
          errors.titulo && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400 mt-1", children: errors.titulo })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-zinc-300 mb-1", children: "Mensagem" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: data.mensagem,
              onChange: (e) => setData("mensagem", e.target.value),
              maxLength: 2e3,
              rows: 5,
              placeholder: "Escreve o comunicado...",
              className: "w-full rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2 focus:border-cyan-500 outline-none resize-y"
            }
          ),
          errors.mensagem && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400 mt-1", children: errors.mensagem })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-zinc-300", children: [
              "Condominios (",
              data.condominio_ids.length,
              " selecionado",
              data.condominio_ids.length === 1 ? "" : "s",
              ")"
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: toggleTodos,
                className: "text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1",
                children: [
                  todosSelecionados ? /* @__PURE__ */ jsx(CheckSquare, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Square, { className: "w-4 h-4" }),
                  todosSelecionados ? "Desmarcar todos" : "Selecionar todos"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "max-h-64 overflow-y-auto rounded-lg border border-zinc-800 divide-y divide-zinc-800", children: condominios.map((c) => {
            const checked = data.condominio_ids.includes(c.id);
            return /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => toggleCondominio(c.id),
                className: "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800/50 text-left",
                children: [
                  checked ? /* @__PURE__ */ jsx(CheckSquare, { className: "w-5 h-5 text-cyan-400 shrink-0" }) : /* @__PURE__ */ jsx(Square, { className: "w-5 h-5 text-zinc-600 shrink-0" }),
                  /* @__PURE__ */ jsx(Building2, { className: "w-4 h-4 text-zinc-500 shrink-0" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-200", children: c.nome }),
                  /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-600 ml-auto", children: [
                    "empresa #",
                    c.empresa_gestora_id
                  ] })
                ]
              },
              c.id
            );
          }) }),
          errors.condominio_ids && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400 mt-1", children: errors.condominio_ids })
        ] }),
        !confirmar ? /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            disabled: !data.titulo || !data.mensagem || data.condominio_ids.length === 0,
            onClick: () => setConfirmar(true),
            className: "w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium py-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90",
            children: [
              /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
              "Rever e enviar"
            ]
          }
        ) : /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5 text-amber-400 shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-200", children: [
              "Vais publicar este comunicado em ",
              /* @__PURE__ */ jsx("strong", { children: data.condominio_ids.length }),
              " condominio(s). Confirmas?"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setConfirmar(false),
                className: "flex-1 rounded-lg border border-zinc-700 text-zinc-300 py-2 hover:bg-zinc-800",
                children: "Voltar"
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                disabled: processing,
                onClick: submeter,
                className: "flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium py-2 disabled:opacity-50",
                children: [
                  /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
                  processing ? "A enviar..." : "Confirmar e enviar"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  ComunicadosIndex as default
};
