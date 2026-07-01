import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dfn1r3bR.js";
import { useForm, Head, router } from "@inertiajs/react";
import { Ban, Plus, ShieldAlert, Trash2 } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const TIPO_LABEL = {
  bi: "BI / Documento",
  matricula: "Matrícula",
  nome: "Nome"
};
function ListaNegra({ itens }) {
  const form = useForm({
    tipo: "bi",
    valor: "",
    motivo: "",
    partilhar_empresa: false
  });
  const submit = (e) => {
    e.preventDefault();
    form.post(route("visitantes.lista-negra.store"), {
      preserveScroll: true,
      onSuccess: () => form.reset("valor", "motivo")
    });
  };
  const remover = (id) => {
    if (!confirm("Remover este visitante da lista negra?")) return;
    router.delete(route("visitantes.lista-negra.destroy", id), { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Lista Negra de Visitantes" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-6 py-8 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(Ban, { className: "h-5 w-5 text-rose-400" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-zinc-100", children: "Lista Negra de Visitantes" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Visitantes banidos por BI, matrícula ou nome. A portaria recebe um alerta — não bloqueia automaticamente." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-4", children: "Adicionar à lista" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Tipo" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.data.tipo,
                onChange: (e) => form.setData("tipo", e.target.value),
                className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2 focus:border-cyan-500/50",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "bi", children: "BI / Documento" }),
                  /* @__PURE__ */ jsx("option", { value: "matricula", children: "Matrícula" }),
                  /* @__PURE__ */ jsx("option", { value: "nome", children: "Nome" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Valor" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: form.data.valor,
                onChange: (e) => form.setData("valor", e.target.value),
                placeholder: "Ex.: 0012345LA042 ou LD-12-34-AB",
                className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2 focus:border-cyan-500/50"
              }
            ),
            form.errors.valor && /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-400 mt-1", children: form.errors.valor })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs text-zinc-300 pb-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: form.data.partilhar_empresa,
                onChange: (e) => form.setData("partilhar_empresa", e.target.checked),
                className: "rounded bg-zinc-800 border-zinc-700 text-cyan-500"
              }
            ),
            "Todos os condomínios"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Motivo (opcional)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.data.motivo,
              onChange: (e) => form.setData("motivo", e.target.value),
              placeholder: "Ex.: agressão a guarda em 2026, furto...",
              className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2 focus:border-cyan-500/50"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: form.processing,
            className: "mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-500/90 hover:bg-rose-500 text-white font-medium px-4 py-2 text-sm disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              "Adicionar à lista negra"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden", children: itens.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-10 text-center text-zinc-500", children: [
        /* @__PURE__ */ jsx(ShieldAlert, { className: "h-10 w-10 mx-auto mb-3 text-zinc-700" }),
        "Nenhum visitante na lista negra."
      ] }) : /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-zinc-900 text-zinc-500 text-xs uppercase tracking-wide", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3", children: "Tipo" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3", children: "Valor" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3", children: "Motivo" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3", children: "Âmbito" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3", children: "Adicionado" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: itens.map((it) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-zinc-800/70", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-zinc-300", children: TIPO_LABEL[it.tipo] }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-zinc-100 font-medium", children: it.valor }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-zinc-400", children: it.motivo || "—" }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400", children: it.partilhar_empresa ? "Toda a empresa" : "Condomínio" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-zinc-500 text-xs", children: it.criado_em }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => remover(it.id),
              className: "text-zinc-500 hover:text-rose-400",
              title: "Remover",
              children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
            }
          ) })
        ] }, it.id)) })
      ] }) })
    ] })
  ] });
}
export {
  ListaNegra as default
};
