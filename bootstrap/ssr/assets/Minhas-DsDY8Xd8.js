import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BhN0vln8.js";
import { Head, Link } from "@inertiajs/react";
import { Receipt, Plus, Clock, Ban, CircleX, CircleCheck, CircleAlert } from "lucide-react";
import "react";
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
function OrdensMinhas({ ordens, contadores }) {
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "As minhas ordens" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-6 py-8 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(Receipt, { className: "h-5 w-5 text-cyan-400" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-zinc-100", children: "As minhas ordens" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Histórico de compras e subscrições" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("funcionalidades.index"),
            className: "rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white text-sm font-medium px-4 py-2",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 inline mr-1.5" }),
              "Loja de add-ons"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500 uppercase tracking-wide", children: "Total" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold text-zinc-100 mt-1", children: contadores.total })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-amber-500/5 border border-amber-500/30 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-amber-400/80 uppercase tracking-wide", children: "Pendentes" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold text-amber-300 mt-1", children: contadores.pendentes })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-emerald-400/80 uppercase tracking-wide", children: "Aprovadas" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold text-emerald-300 mt-1", children: contadores.aprovadas })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-zinc-700/30 border border-zinc-700 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500 uppercase tracking-wide", children: "Expiradas" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold text-zinc-400 mt-1", children: contadores.expiradas })
        ] })
      ] }),
      ordens.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center", children: [
        /* @__PURE__ */ jsx(Receipt, { className: "h-12 w-12 mx-auto mb-3 text-zinc-700" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-zinc-300 mb-1", children: "Ainda sem ordens" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500 mb-4", children: "Explore a loja de add-ons para começar" }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("funcionalidades.index"),
            className: "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white text-sm font-medium px-4 py-2",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              "Ver add-ons"
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800", children: ordens.data.map((ordem) => {
          const Icon = ESTADO_ICONS[ordem.estado] ?? Receipt;
          return /* @__PURE__ */ jsx(
            Link,
            {
              href: route("ordens.show", ordem.id),
              className: "block p-4 hover:bg-zinc-800/30 transition",
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `shrink-0 h-9 w-9 rounded-lg border flex items-center justify-center ${ESTADO_STYLES[ordem.estado] ?? ""}`,
                    children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-mono text-zinc-200", children: ordem.numero }),
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: `text-[10px] px-2 py-0.5 rounded border ${ESTADO_STYLES[ordem.estado] ?? ""}`,
                        children: ordem.estado_label
                      }
                    ),
                    ordem.tem_pagamentos && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-zinc-500", children: [
                      "· ",
                      ordem.pagamentos_count,
                      " comprovativo",
                      ordem.pagamentos_count !== 1 ? "s" : ""
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-300 truncate", children: ordem.descricao_item }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 mt-1", children: [
                    new Date(ordem.created_at).toLocaleDateString("pt-PT"),
                    ordem.prazo_pagamento && ["pendente", "em_revisao"].includes(ordem.estado) && /* @__PURE__ */ jsxs(Fragment, { children: [
                      " ",
                      "·",
                      " ",
                      /* @__PURE__ */ jsxs(
                        "span",
                        {
                          className: ordem.expirou ? "text-rose-400" : "text-amber-400",
                          children: [
                            "Prazo:",
                            " ",
                            new Date(ordem.prazo_pagamento).toLocaleDateString(
                              "pt-PT"
                            )
                          ]
                        }
                      )
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-right shrink-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-zinc-200", children: formatMoeda(ordem.valor_total) }),
                  ordem.saldo_em_falta > 0 && ["pendente", "em_revisao"].includes(ordem.estado) && /* @__PURE__ */ jsxs("div", { className: "text-xs text-amber-400 mt-0.5", children: [
                    "Em falta: ",
                    formatMoeda(ordem.saldo_em_falta)
                  ] })
                ] })
              ] })
            },
            ordem.id
          );
        }) }),
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
  OrdensMinhas as default
};
