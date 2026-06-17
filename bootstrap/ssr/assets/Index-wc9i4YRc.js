import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-C7SEgtpD.js";
import { Head, Link, router } from "@inertiajs/react";
import { MessageSquare, Plus, Filter, ThumbsUp, ThumbsDown, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const CATEGORIAS = {
  geral: "Geral",
  financeiro: "Financeiro",
  manutencao: "Manutenção",
  assembleias: "Assembleias",
  seguranca: "Segurança",
  contactos: "Contactos"
};
function FaqIndex({ faqs, condominios, filtros }) {
  const [filtroCondominio, setFiltroCondominio] = useState(filtros.condominio_id || "");
  const [filtroCategoria, setFiltroCategoria] = useState(filtros.categoria || "");
  const aplicarFiltros = () => {
    router.get(route("faqs.index"), {
      condominio_id: filtroCondominio || void 0,
      categoria: filtroCategoria || void 0
    }, { preserveState: true });
  };
  const apagar = (id) => {
    if (!confirm("Tens a certeza que queres apagar esta FAQ? Esta acção não pode ser desfeita.")) return;
    router.delete(route("faqs.destroy", id));
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "FAQs" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold text-zinc-100 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "w-6 h-6 text-cyan-400" }),
            "FAQs do Chatbot"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 mt-1", children: "Perguntas frequentes que o chatbot responde automaticamente aos condóminos" })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("faqs.create"),
            className: "inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-4 py-2 text-sm",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Nova FAQ"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4 text-zinc-500" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filtroCondominio,
            onChange: (e) => setFiltroCondominio(e.target.value),
            className: "px-3 py-1.5 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Todos os condomínios" }),
              /* @__PURE__ */ jsx("option", { value: "null", children: "Apenas gerais" }),
              condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filtroCategoria,
            onChange: (e) => setFiltroCategoria(e.target.value),
            className: "px-3 py-1.5 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Todas as categorias" }),
              Object.entries(CATEGORIAS).map(([k, v]) => /* @__PURE__ */ jsx("option", { value: k, children: v }, k))
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: aplicarFiltros,
            className: "px-3 py-1.5 text-sm rounded border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200",
            children: "Aplicar"
          }
        )
      ] }) }),
      faqs.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center", children: [
        /* @__PURE__ */ jsx(MessageSquare, { className: "w-12 h-12 text-zinc-700 mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-zinc-400 mb-2", children: "Nenhuma FAQ cadastrada ainda." }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500 mb-4", children: "Cria a primeira FAQ para o chatbot começar a responder automaticamente." }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("faqs.create"),
            className: "inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-4 py-2 text-sm",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              " Criar primeira FAQ"
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden", children: [
        /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-zinc-950/50 text-xs text-zinc-500 uppercase", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Pergunta" }),
            /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Categoria" }),
            /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Condomínio" }),
            /* @__PURE__ */ jsx("th", { className: "text-center p-3", children: "Estado" }),
            /* @__PURE__ */ jsx("th", { className: "text-center p-3", children: "Uso" }),
            /* @__PURE__ */ jsx("th", { className: "text-right p-3", children: "Acções" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: faqs.data.map((f) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-zinc-800 hover:bg-zinc-900/50", children: [
            /* @__PURE__ */ jsxs("td", { className: "p-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-zinc-200 font-medium", children: f.pergunta }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-0.5 line-clamp-1", children: f.resposta })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300", children: CATEGORIAS[f.categoria] || f.categoria }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3 text-xs text-zinc-400", children: f.condominio ? f.condominio.nome : /* @__PURE__ */ jsx("span", { className: "italic text-zinc-600", children: "Geral" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3 text-center", children: f.activa ? /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300", children: "activa" }) : /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-1 rounded bg-zinc-500/20 text-zinc-400", children: "inactiva" }) }),
            /* @__PURE__ */ jsxs("td", { className: "p-3 text-center text-xs text-zinc-400", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                f.vezes_respondida,
                "x"
              ] }),
              f.util_sim + f.util_nao > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mt-1", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-0.5 text-emerald-400", children: [
                  /* @__PURE__ */ jsx(ThumbsUp, { className: "w-3 h-3" }),
                  " ",
                  f.util_sim
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-0.5 text-rose-400", children: [
                  /* @__PURE__ */ jsx(ThumbsDown, { className: "w-3 h-3" }),
                  " ",
                  f.util_nao
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "p-3 text-right", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex gap-1", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("faqs.edit", f.id),
                  className: "p-1.5 text-zinc-400 hover:text-cyan-400 rounded",
                  children: /* @__PURE__ */ jsx(Edit, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => apagar(f.id),
                  className: "p-1.5 text-zinc-400 hover:text-rose-400 rounded",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                }
              )
            ] }) })
          ] }, f.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3 text-xs text-zinc-500 border-t border-zinc-800", children: [
          faqs.from || 0,
          "-",
          faqs.to || 0,
          " de ",
          faqs.total
        ] })
      ] })
    ] })
  ] });
}
export {
  FaqIndex as default
};
