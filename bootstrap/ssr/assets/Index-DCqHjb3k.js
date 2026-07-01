import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { Head, Link, router } from "@inertiajs/react";
import { Receipt, CircleAlert, FileCheck, DollarSign, Search, Clock, Ban, CircleX, CircleCheck } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function formatMoeda(valor) {
  return new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor) + " Kz";
}
const ESTADO_STYLES = {
  pendente: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  em_revisao: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
  aprovada: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  rejeitada: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  cancelada: "bg-zinc-700/30 border-zinc-700 text-zinc-400",
  expirada: "bg-zinc-700/30 border-zinc-700 text-zinc-400"
};
const ESTADO_ICONS = {
  pendente: Clock,
  em_revisao: CircleAlert,
  aprovada: CircleCheck,
  rejeitada: CircleX,
  cancelada: Ban,
  expirada: Clock
};
function AdminOrdensIndex({ ordens, contadores, filtros }) {
  const [busca, setBusca] = useState(filtros.busca ?? "");
  const [estado, setEstado] = useState(filtros.estado ?? "");
  const navegar = (novoEstado, novaBusca, apenasPendentes) => {
    router.get(
      route("admin.ordens.index"),
      {
        estado: novoEstado ?? estado ?? void 0,
        busca: novaBusca ?? busca ?? void 0,
        apenas_pendentes: apenasPendentes ? "1" : void 0
      },
      { preserveState: true }
    );
  };
  const handleBuscaKeyDown = (e) => {
    if (e.key === "Enter") {
      navegar(void 0, busca);
    }
  };
  const limparFiltros = () => {
    setBusca("");
    setEstado("");
    router.get(route("admin.ordens.index"));
  };
  const temFiltros = busca || estado || filtros.apenas_pendentes;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Admin — Ordens de compra" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-6 py-8 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(Receipt, { className: "h-5 w-5 text-cyan-400" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-zinc-100", children: "Ordens de compra" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Gestão e aprovação de compras" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500 uppercase tracking-wide", children: "Total" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold text-zinc-100 mt-1", children: contadores.total })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => navegar("", void 0, true),
            className: "bg-amber-500/5 border border-amber-500/30 rounded-xl p-4 text-left hover:bg-amber-500/10 transition",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-amber-400/80 uppercase tracking-wide flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(CircleAlert, { className: "h-3 w-3" }),
                " Pendentes"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold text-amber-300 mt-1", children: contadores.pendentes })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => navegar("aprovada"),
            className: "bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4 text-left hover:bg-emerald-500/10 transition",
            children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-emerald-400/80 uppercase tracking-wide", children: "Aprovadas" }),
              /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold text-emerald-300 mt-1", children: contadores.aprovadas })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "bg-cyan-500/5 border border-cyan-500/30 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-cyan-400/80 uppercase tracking-wide flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(FileCheck, { className: "h-3 w-3" }),
            " Por validar"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold text-cyan-300 mt-1", children: contadores.comprovativos_a_validar })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 col-span-2 md:col-span-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-500 uppercase tracking-wide flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(DollarSign, { className: "h-3 w-3" }),
            " Valor aprovado"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-semibold text-zinc-100 mt-1", children: formatMoeda(contadores.valor_aprovado_total) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 absolute left-3 top-3 text-zinc-500" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: busca,
              onChange: (e) => setBusca(e.target.value),
              onKeyDown: handleBuscaKeyDown,
              placeholder: "Pesquisar por número ou descrição...",
              className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-600 pl-9 pr-3 py-2"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: estado,
            onChange: (e) => {
              setEstado(e.target.value);
              navegar(e.target.value);
            },
            className: "rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Todos os estados" }),
              /* @__PURE__ */ jsx("option", { value: "pendente", children: "Pendente" }),
              /* @__PURE__ */ jsx("option", { value: "em_revisao", children: "Em análise" }),
              /* @__PURE__ */ jsx("option", { value: "aprovada", children: "Aprovada" }),
              /* @__PURE__ */ jsx("option", { value: "rejeitada", children: "Rejeitada" }),
              /* @__PURE__ */ jsx("option", { value: "cancelada", children: "Cancelada" }),
              /* @__PURE__ */ jsx("option", { value: "expirada", children: "Expirada" })
            ]
          }
        ),
        temFiltros && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: limparFiltros,
            className: "rounded-lg border border-zinc-800 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 px-3 py-2",
            children: "Limpar"
          }
        )
      ] }),
      ordens.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center", children: [
        /* @__PURE__ */ jsx(Receipt, { className: "h-12 w-12 mx-auto mb-3 text-zinc-700" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Nenhuma ordem encontrada com estes filtros." })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden", children: [
        /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-zinc-950/40 text-xs uppercase tracking-wide text-zinc-500", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Número" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Cliente" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Item" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right font-medium", children: "Valor" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Estado" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Criada" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-zinc-800", children: ordens.data.map((ordem) => {
            const Icon = ESTADO_ICONS[ordem.estado] ?? Receipt;
            return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-zinc-800/30 transition", children: [
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: route("admin.ordens.show", ordem.id),
                    className: "font-mono text-xs text-zinc-200 hover:text-cyan-300",
                    children: ordem.numero
                  }
                ),
                ordem.pagamentos_pendentes > 0 && /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-amber-400 mt-0.5", children: [
                  ordem.pagamentos_pendentes,
                  " comprovativo",
                  ordem.pagamentos_pendentes !== 1 ? "s" : "",
                  " por validar"
                ] })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-zinc-300", children: ordem.owner.nome }),
              /* @__PURE__ */ jsx(
                "td",
                {
                  className: "px-4 py-3 text-zinc-300 max-w-xs truncate",
                  title: ordem.descricao_item,
                  children: ordem.descricao_item
                }
              ),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right text-zinc-200 font-medium", children: formatMoeda(ordem.valor_total) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs(
                "span",
                {
                  className: `inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${ESTADO_STYLES[ordem.estado] ?? ""}`,
                  children: [
                    /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
                    ordem.estado_label
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs text-zinc-500", children: new Date(ordem.created_at).toLocaleDateString("pt-PT") }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("admin.ordens.show", ordem.id),
                  className: "text-xs text-cyan-400 hover:text-cyan-300",
                  children: "Abrir →"
                }
              ) })
            ] }, ordem.id);
          }) })
        ] }),
        ordens.last_page > 1 && /* @__PURE__ */ jsx("div", { className: "p-3 border-t border-zinc-800 flex items-center justify-center gap-2", children: ordens.links.map(
          (link, i) => link.url ? /* @__PURE__ */ jsx(
            Link,
            {
              href: link.url,
              className: `px-3 py-1 text-xs rounded ${link.active ? "bg-cyan-500/20 text-cyan-300" : "text-zinc-400 hover:bg-zinc-800"}`,
              dangerouslySetInnerHTML: { __html: link.label }
            },
            i
          ) : /* @__PURE__ */ jsx(
            "span",
            {
              className: "px-3 py-1 text-xs text-zinc-600",
              dangerouslySetInnerHTML: { __html: link.label }
            },
            i
          )
        ) })
      ] })
    ] })
  ] });
}
export {
  AdminOrdensIndex as default
};
