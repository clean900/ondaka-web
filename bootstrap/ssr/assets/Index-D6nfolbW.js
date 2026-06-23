import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BevyWQSg.js";
import { Head } from "@inertiajs/react";
import { DollarSign, Users, Building2, TrendingDown, Clock, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const fmt = (v) => new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const fmtData = (v) => {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("pt-PT");
};
function Index({ dados }) {
  const { kpis, pipeline, receita_por_escalao, clientes_recentes } = dados;
  return /* @__PURE__ */ jsxs(
    AuthenticatedLayout,
    {
      header: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-zinc-100", children: "📊 Dashboard Super-Admin" }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-500", children: [
          "Soluções Simples · ",
          (/* @__PURE__ */ new Date()).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })
        ] })
      ] }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Dashboard Super-Admin" }),
        /* @__PURE__ */ jsx("div", { className: "py-6", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-gradient-to-br from-purple-900/20 to-zinc-900 p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-purple-300", children: "MRR (Receita Recorrente Mensal)" }),
                /* @__PURE__ */ jsx(DollarSign, { className: "h-5 w-5 text-purple-400" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-3xl font-bold text-white", children: [
                fmt(kpis.mrr_kz),
                " Kz"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-zinc-400", children: [
                "ARR: ",
                fmt(kpis.arr_kz),
                " Kz"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-zinc-500", children: "Clientes B2B activos" }),
                /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-cyan-400" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-white", children: kpis.clientes_activos }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-cyan-400", children: [
                "+",
                kpis.novos_este_mes,
                " este mês"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-zinc-500", children: "Imóveis sob gestão" }),
                /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5 text-blue-400" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-white", children: kpis.imoveis_total }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-zinc-500", children: [
                "~",
                kpis.imoveis_media_por_cliente,
                " por cliente"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-zinc-500", children: "Churn (30 dias)" }),
                /* @__PURE__ */ jsx(TrendingDown, { className: `h-5 w-5 ${kpis.churn_rate_30d > 5 ? "text-red-400" : "text-yellow-400"}` })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: `text-3xl font-bold ${kpis.churn_rate_30d > 5 ? "text-red-400" : "text-yellow-400"}`, children: [
                kpis.churn_rate_30d,
                "%"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-zinc-500", children: [
                kpis.cancelamentos_30d,
                " cancelamento(s)"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Pipeline" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-500", children: "Estado actual" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsx(PipelineRow, { icon: /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-yellow-400" }), label: "Em trial", value: pipeline.trial, colorClass: "text-yellow-400" }),
                /* @__PURE__ */ jsx(PipelineRow, { icon: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-green-400" }), label: "Activos pagantes", value: pipeline.activa, colorClass: "text-green-400" }),
                /* @__PURE__ */ jsx(PipelineRow, { icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-orange-400" }), label: "Modo limitado", value: pipeline.limitado, colorClass: "text-orange-400" }),
                /* @__PURE__ */ jsx(PipelineRow, { icon: /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4 text-red-400" }), label: "Cancelados", value: pipeline.cancelada, colorClass: "text-red-400" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Receita por escalão" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-500", children: "MRR equivalente" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-3", children: receita_por_escalao.map((e) => /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "mb-1 flex justify-between text-sm", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-zinc-400", children: [
                    e.nome,
                    " ",
                    /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-600", children: [
                      "(",
                      e.num_clientes,
                      " ",
                      e.num_clientes === 1 ? "cliente" : "clientes",
                      ")"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "font-medium text-zinc-200", children: [
                    fmt(e.mrr_kz),
                    " Kz"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-zinc-800", children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `h-2 rounded-full ${e.mrr_pct > 0 ? "bg-gradient-to-r from-cyan-500 to-purple-600" : "bg-zinc-700"}`,
                    style: { width: `${Math.max(e.mrr_pct, 2)}%` }
                  }
                ) })
              ] }, e.nome)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-zinc-800 p-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Clientes B2B recentes" }),
              /* @__PURE__ */ jsx("a", { href: "/super-admin/facturas-plataforma", className: "text-xs text-cyan-400 hover:underline", children: "Ver facturas →" })
            ] }),
            clientes_recentes.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-12 text-center text-sm text-zinc-500", children: "Sem clientes ainda." }) : /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
              /* @__PURE__ */ jsx("thead", { className: "border-b border-zinc-800", children: /* @__PURE__ */ jsxs("tr", { className: "text-xs uppercase tracking-wider text-zinc-500", children: [
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Cliente" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Tipo" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Plano" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Imóveis" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "MRR" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Estado" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Desde" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-zinc-800 text-sm", children: clientes_recentes.map((c) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-zinc-800/30", children: [
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-zinc-100", children: c.empresa_nome }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `rounded px-2 py-0.5 text-xs ${c.tipo_cliente === "admin_independente" ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"}`, children: c.tipo_cliente === "admin_independente" ? "👤 Admin" : "🏢 Empresa" }) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-zinc-300", children: c.ciclo }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-zinc-300", children: c.num_imoveis }),
                /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 font-medium text-white", children: [
                  fmt(c.mrr_estimado_kz),
                  " Kz"
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(EstadoBadge, { estado: c.estado }) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs text-zinc-500", children: fmtData(c.desde) })
              ] }, c.id)) })
            ] })
          ] })
        ] }) })
      ]
    }
  );
}
function PipelineRow({ icon, label, value, colorClass }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg bg-zinc-800/30 p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      icon,
      /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-300", children: label })
    ] }),
    /* @__PURE__ */ jsx("span", { className: `text-lg font-bold ${colorClass}`, children: value })
  ] });
}
function EstadoBadge({ estado }) {
  const config = {
    trial: { color: "bg-yellow-500/20 text-yellow-300", label: "● Trial" },
    activa: { color: "bg-green-500/20 text-green-300", label: "● Activa" },
    limitado: { color: "bg-orange-500/20 text-orange-300", label: "● Limitado" },
    cancelada: { color: "bg-red-500/20 text-red-300", label: "● Cancelada" }
  };
  const c = config[estado] ?? { color: "bg-zinc-700 text-zinc-300", label: estado };
  return /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-0.5 text-xs ${c.color}`, children: c.label });
}
export {
  Index as default
};
