import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-ChtKe8ca.js";
import { Head, Link, router } from "@inertiajs/react";
import { MessageSquare, Search, CircleX, Clock, CircleCheck } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ESTADO_CONFIG = {
  enviado: {
    label: "Enviado",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    icon: CircleCheck
  },
  entregue: {
    label: "Entregue",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    icon: CircleCheck
  },
  pendente: {
    label: "Pendente",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    icon: Clock
  },
  falhado: {
    label: "Falhado",
    color: "text-red-400 bg-red-500/10 border-red-500/30",
    icon: CircleX
  },
  rejeitado: {
    label: "Rejeitado",
    color: "text-red-400 bg-red-500/10 border-red-500/30",
    icon: CircleX
  }
};
const CATEGORIA_LABELS = {
  sistema: "Sistema",
  notificacao: "Notificação",
  manual_cliente: "Manual (cliente)",
  manual_admin: "Manual (admin)",
  teste: "Teste"
};
function AdminSmsIndex({ logs, contadores, filtros }) {
  const [busca, setBusca] = useState(filtros.q || "");
  const aplicarFiltro = (chave, valor) => {
    router.get(
      "/admin/sms",
      { ...filtros, [chave]: valor },
      { preserveState: true, preserveScroll: true }
    );
  };
  const submeterBusca = (e) => {
    e.preventDefault();
    aplicarFiltro("q", busca);
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Admin SMS — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(MessageSquare, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "SMS" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Logs, envios e reenvio de mensagens" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-zinc-500", children: "Enviados hoje" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-emerald-400 mt-1", children: contadores.enviados_hoje })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-zinc-500", children: "Falhas hoje" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-red-400 mt-1", children: contadores.falhas_hoje })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-zinc-500", children: "Total hoje" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-zinc-100 mt-1", children: contadores.total_hoje })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-zinc-500", children: "Sucesso 24h" }),
          /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-cyan-400 mt-1", children: [
            contadores.taxa_sucesso_24h,
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "%" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-cyan-400/80", children: "Saldo TelcoSMS" }),
          /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-zinc-100 mt-1", children: [
            contadores.saldo_provider !== null ? contadores.saldo_provider : "—",
            /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-500 ml-1", children: "SMS" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-3", children: [
        /* @__PURE__ */ jsx("form", { onSubmit: submeterBusca, className: "flex-1", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: busca,
              onChange: (e) => setBusca(e.target.value),
              placeholder: "Pesquisar por número, mensagem, trigger...",
              className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filtros.estado ?? "",
            onChange: (e) => aplicarFiltro("estado", e.target.value),
            className: "bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Todos estados" }),
              /* @__PURE__ */ jsx("option", { value: "enviado", children: "Enviado" }),
              /* @__PURE__ */ jsx("option", { value: "entregue", children: "Entregue" }),
              /* @__PURE__ */ jsx("option", { value: "pendente", children: "Pendente" }),
              /* @__PURE__ */ jsx("option", { value: "falhado", children: "Falhado" }),
              /* @__PURE__ */ jsx("option", { value: "rejeitado", children: "Rejeitado" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filtros.categoria ?? "",
            onChange: (e) => aplicarFiltro("categoria", e.target.value),
            className: "bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Todas categorias" }),
              /* @__PURE__ */ jsx("option", { value: "sistema", children: "Sistema" }),
              /* @__PURE__ */ jsx("option", { value: "notificacao", children: "Notificação" }),
              /* @__PURE__ */ jsx("option", { value: "manual_cliente", children: "Manual cliente" }),
              /* @__PURE__ */ jsx("option", { value: "manual_admin", children: "Manual admin" }),
              /* @__PURE__ */ jsx("option", { value: "teste", children: "Teste" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filtros.periodo ?? "hoje",
            onChange: (e) => aplicarFiltro("periodo", e.target.value),
            className: "bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50",
            children: [
              /* @__PURE__ */ jsx("option", { value: "hoje", children: "Hoje" }),
              /* @__PURE__ */ jsx("option", { value: "7d", children: "Últimos 7 dias" }),
              /* @__PURE__ */ jsx("option", { value: "30d", children: "Últimos 30 dias" }),
              /* @__PURE__ */ jsx("option", { value: "90d", children: "Últimos 90 dias" })
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: logs.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-12 text-center", children: [
        /* @__PURE__ */ jsx(MessageSquare, { className: "h-12 w-12 text-zinc-700 mx-auto mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-zinc-400", children: "Nenhum SMS encontrado" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-600 mt-1", children: "Ajuste os filtros ou envie um SMS de teste" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-zinc-800 bg-zinc-950/50", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold", children: "Data" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold", children: "Número" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold", children: "Mensagem" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold", children: "Categoria" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold", children: "Trigger" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold", children: "Estado" }),
          /* @__PURE__ */ jsx("th", {})
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: logs.data.map((sms) => {
          const config = ESTADO_CONFIG[sms.estado] ?? ESTADO_CONFIG.pendente;
          const Icon = config.icon;
          const data = new Date(sms.created_at);
          return /* @__PURE__ */ jsxs(
            "tr",
            {
              className: "border-b border-zinc-800/50 hover:bg-zinc-900/40 transition",
              children: [
                /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-sm text-zinc-400 whitespace-nowrap", children: [
                  /* @__PURE__ */ jsx("div", { children: data.toLocaleDateString("pt-PT") }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-600", children: data.toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit"
                  }) })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm font-mono text-zinc-300", children: sms.numero_mascarado }),
                /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-sm text-zinc-400 max-w-md", children: [
                  /* @__PURE__ */ jsx("div", { className: "truncate", children: sms.mensagem }),
                  /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-600 mt-0.5", children: [
                    sms.tamanho_chars,
                    " chars · ",
                    sms.segmentos,
                    " segmento",
                    sms.segmentos > 1 ? "s" : ""
                  ] })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-zinc-400", children: CATEGORIA_LABELS[sms.categoria] ?? sms.categoria }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs text-zinc-500 font-mono", children: sms.trigger ?? "—" }),
                /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                  /* @__PURE__ */ jsxs(
                    "span",
                    {
                      className: `inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${config.color}`,
                      children: [
                        /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
                        config.label
                      ]
                    }
                  ),
                  sms.saldo_devolvido && /* @__PURE__ */ jsx("div", { className: "text-xs text-amber-400/70 mt-1", children: "↩ crédito devolvido" })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: `/admin/sms/${sms.id}`,
                    className: "text-xs text-cyan-400 hover:text-cyan-300 whitespace-nowrap",
                    children: "Abrir →"
                  }
                ) })
              ]
            },
            sms.id
          );
        }) })
      ] }) }) }),
      logs.meta.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500", children: [
          "Mostrando ",
          logs.data.length,
          " de ",
          logs.meta.total,
          " · Página",
          " ",
          logs.meta.current_page,
          " de ",
          logs.meta.last_page
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: logs.links.map((link, idx) => /* @__PURE__ */ jsx(
          "button",
          {
            disabled: !link.url,
            onClick: () => link.url && router.get(link.url, {}, { preserveScroll: true }),
            className: `px-3 py-1.5 text-xs rounded-md ${link.active ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : link.url ? "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800" : "text-zinc-700 cursor-not-allowed"}`,
            dangerouslySetInnerHTML: { __html: link.label }
          },
          idx
        )) })
      ] })
    ] })
  ] });
}
export {
  AdminSmsIndex as default
};
