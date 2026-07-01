import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dfn1r3bR.js";
import { Head } from "@inertiajs/react";
import { Building2, Link2, AlertCircle, FileText, TrendingUp, Wallet, Users } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const kz = (v) => new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 }).format(Number(v)) + " Kz";
const estadoCor = {
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  overdue: "bg-red-500/15 text-red-300 border-red-500/30",
  draft: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  partial: "bg-amber-500/15 text-amber-300 border-amber-500/30"
};
function Index({ ligado, erro, identidade, reconciliacao, facturas, clientes }) {
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "ERP Welwitschia" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-11 h-11 rounded-xl flex items-center justify-center", style: { background: "rgba(16,185,129,0.12)", border: "0.5px solid rgba(16,185,129,0.3)" }, children: /* @__PURE__ */ jsx(Building2, { className: "w-5 h-5 text-emerald-400" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white tracking-tight", children: "ERP Welwitschia" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Consolidação financeira do ONDAKA no ERP central." })
      ] }),
      ligado && identidade && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20", children: [
        /* @__PURE__ */ jsx(Link2, { className: "w-3.5 h-3.5" }),
        " Ligado · filial ",
        identidade.filial
      ] })
    ] }),
    !ligado ? /* @__PURE__ */ jsxs("div", { className: "card flex items-center gap-3 text-white/70", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5 text-red-400 flex-shrink-0" }),
      /* @__PURE__ */ jsx("span", { children: erro ?? "Sem ligação à Welwitschia." })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      reconciliacao && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6", children: [
        /* @__PURE__ */ jsx(Kpi, { label: "Faturado", valor: kz(reconciliacao.faturado), icon: FileText, cor: "#00D4FF" }),
        /* @__PURE__ */ jsx(Kpi, { label: "Recebido", valor: kz(reconciliacao.recebido), icon: TrendingUp, cor: "#10B981" }),
        /* @__PURE__ */ jsx(Kpi, { label: "Em dívida", valor: kz(reconciliacao.em_divida), icon: AlertCircle, cor: "#EF4444" }),
        /* @__PURE__ */ jsx(Kpi, { label: "Nº de faturas", valor: String(reconciliacao.num_facturas), icon: Wallet, cor: "#A855F7" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 card", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold text-white/80 uppercase tracking-wider mb-3", children: [
            "Faturas (",
            facturas.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-white/40 text-xs uppercase tracking-wider border-b border-white/10", children: [
              /* @__PURE__ */ jsx("th", { className: "text-left py-2 pr-2", children: "Fatura" }),
              /* @__PURE__ */ jsx("th", { className: "text-right px-2", children: "Total" }),
              /* @__PURE__ */ jsx("th", { className: "text-right px-2", children: "Pago" }),
              /* @__PURE__ */ jsx("th", { className: "text-right px-2", children: "Saldo" }),
              /* @__PURE__ */ jsx("th", { className: "text-right pl-2", children: "Estado" })
            ] }) }),
            /* @__PURE__ */ jsxs("tbody", { children: [
              facturas.map((f) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/5", children: [
                /* @__PURE__ */ jsx("td", { className: "py-2 pr-2 text-white/80 font-mono text-[12px]", children: f.invoice_number }),
                /* @__PURE__ */ jsx("td", { className: "text-right px-2 text-white/80", children: kz(f.total_amount) }),
                /* @__PURE__ */ jsx("td", { className: "text-right px-2 text-emerald-300/90", children: kz(f.paid_amount) }),
                /* @__PURE__ */ jsx("td", { className: "text-right px-2 text-white/70", children: kz(f.balance_amount) }),
                /* @__PURE__ */ jsx("td", { className: "text-right pl-2", children: /* @__PURE__ */ jsx("span", { className: `inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${estadoCor[f.display_status] ?? estadoCor.draft}`, children: f.display_status }) })
              ] }, f.invoice_number)),
              facturas.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "py-6 text-center text-white/40", children: "Sem faturas." }) })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "card", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-white/60" }),
            /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold text-white/80 uppercase tracking-wider", children: [
              "Clientes (",
              clientes.length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 max-h-[420px] overflow-y-auto", children: [
            clientes.map((c) => /* @__PURE__ */ jsxs("div", { className: "p-2.5 rounded-lg bg-white/[0.03] border border-white/5", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm text-white truncate", children: c.name }),
              c.email && /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/40 truncate", children: c.email })
            ] }, c.id)),
            clientes.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-white/40 text-sm", children: "Sem clientes." })
          ] })
        ] })
      ] }),
      (reconciliacao == null ? void 0 : reconciliacao.gerado_em) && /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-white/30 mt-4", children: [
        "Dados da Welwitschia · atualizado ",
        new Date(reconciliacao.gerado_em).toLocaleString("pt-PT")
      ] })
    ] })
  ] });
}
function Kpi({ label, valor, icon: Icon, cor }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl p-4", style: { background: `linear-gradient(135deg, ${cor}12 0%, ${cor}04 100%)`, border: `0.5px solid ${cor}30` }, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
      /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4", style: { color: cor } }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider text-white/50", children: label })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-white", children: valor })
  ] });
}
export {
  Index as default
};
