import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BhN0vln8.js";
import { Head } from "@inertiajs/react";
import { Wallet, AlertCircle, CheckCircle2, TrendingUp, Receipt, CreditCard, FileText, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ESTADO_LABELS = {
  aberta: { label: "Em aberto", cor: "text-amber-300 bg-amber-500/10 border-amber-500/30", icon: Clock },
  em_aberto: { label: "Em aberto", cor: "text-amber-300 bg-amber-500/10 border-amber-500/30", icon: Clock },
  paga_parcial: { label: "Pago parcial", cor: "text-blue-300 bg-blue-500/10 border-blue-500/30", icon: Clock },
  pago_parcial: { label: "Pago parcial", cor: "text-blue-300 bg-blue-500/10 border-blue-500/30", icon: Clock },
  paga: { label: "Paga", cor: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2 },
  pago: { label: "Pago", cor: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", cor: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30", icon: XCircle },
  cancelado: { label: "Cancelado", cor: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30", icon: XCircle }
};
const formatarKz = (valor) => {
  const num = parseFloat(valor);
  if (isNaN(num)) return "0 Kz";
  return new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num) + " Kz";
};
const formatarData = (data) => {
  if (!data) return "—";
  const d = new Date(data);
  return d.toLocaleDateString("pt-PT");
};
function MinhasQuotas({ quotas, lancamentos, credito_total, kpis }) {
  const todosItens = [...quotas, ...lancamentos];
  const [filtroEstado, setFiltroEstado] = useState("aberto");
  const itensFiltrados = todosItens.filter((i) => {
    if (filtroEstado === "aberto") return ["aberta", "em_aberto", "paga_parcial", "pago_parcial"].includes(i.estado);
    if (filtroEstado === "pago") return ["paga", "pago"].includes(i.estado);
    if (filtroEstado === "cancelado") return ["cancelada", "cancelado"].includes(i.estado);
    return true;
  });
  const totalEmAbertoNum = parseFloat(kpis.total_em_aberto);
  const creditoNum = parseFloat(kpis.credito);
  const saldoLiquido = totalEmAbertoNum - creditoNum;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Minhas Quotas — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8 max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Wallet, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Minhas quotas e pagamentos" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Veja todas as suas obrigações e o seu saldo" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 border border-amber-500/25 p-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "h-3 w-3" }),
            "Em aberto"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-amber-300", children: formatarKz(kpis.total_em_aberto) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 mt-1", children: [
            kpis.total_abertas,
            " ",
            kpis.total_abertas === 1 ? "item" : "itens"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/5 border border-emerald-500/25 p-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }),
            "Pagas"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-emerald-300", children: kpis.total_pagas }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-1", children: kpis.total_pagas === 1 ? "item liquidado" : "itens liquidados" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-br from-cyan-500/15 to-purple-500/5 border border-cyan-500/25 p-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3" }),
            "Crédito disponível"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-cyan-300", children: formatarKz(kpis.credito) }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-1", children: "A favor" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `rounded-xl bg-gradient-to-br ${saldoLiquido > 0 ? "from-red-500/15 to-pink-500/5 border-red-500/25" : "from-emerald-500/15 to-cyan-500/5 border-emerald-500/25"} border p-4`, children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Receipt, { className: "h-3 w-3" }),
            "Saldo líquido"
          ] }),
          /* @__PURE__ */ jsx("p", { className: `text-2xl font-bold ${saldoLiquido > 0 ? "text-red-300" : "text-emerald-300"}`, children: formatarKz(String(Math.abs(saldoLiquido))) }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-1", children: saldoLiquido > 0 ? "a pagar" : saldoLiquido < 0 ? "a favor" : "em dia" })
        ] })
      ] }),
      totalEmAbertoNum > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/30 p-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-zinc-100", children: "Pague tudo de uma vez" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 mt-0.5", children: [
            "Receba uma única referência ProxyPay para liquidar ",
            formatarKz(kpis.total_em_aberto)
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            disabled: true,
            title: "Em desenvolvimento",
            className: "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2.5 text-sm font-medium shadow-lg opacity-60 cursor-not-allowed",
            children: [
              /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }),
              "Pagar tudo (em breve)"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => setFiltroEstado("aberto"), className: `px-3 py-1.5 rounded-lg text-sm font-medium transition ${filtroEstado === "aberto" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"}`, children: [
          "Em aberto (",
          kpis.total_abertas,
          ")"
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setFiltroEstado("pago"), className: `px-3 py-1.5 rounded-lg text-sm font-medium transition ${filtroEstado === "pago" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"}`, children: [
          "Pagas (",
          kpis.total_pagas,
          ")"
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setFiltroEstado("cancelado"), className: `px-3 py-1.5 rounded-lg text-sm font-medium transition ${filtroEstado === "cancelado" ? "bg-zinc-700/30 text-zinc-300 border border-zinc-600/40" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"}`, children: "Canceladas" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setFiltroEstado("todos"), className: `px-3 py-1.5 rounded-lg text-sm font-medium transition ${filtroEstado === "todos" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"}`, children: "Todas" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: itensFiltrados.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx(FileText, { className: "h-10 w-10 text-zinc-700 mx-auto mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-zinc-500 text-sm", children: "Sem itens nesta categoria." })
      ] }) : /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-zinc-900/80 border-b border-zinc-800 text-xs uppercase text-zinc-400", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3", children: "Item" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 hidden md:table-cell", children: "Vencimento" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3", children: "Valor" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 hidden md:table-cell", children: "Em falta" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3", children: "Estado" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: itensFiltrados.map((i) => {
          const cfg = ESTADO_LABELS[i.estado] ?? { label: i.estado, cor: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30", icon: Clock };
          const EstadoIcon = cfg.icon;
          return /* @__PURE__ */ jsxs("tr", { className: "border-b border-zinc-800/40 hover:bg-zinc-900/40", children: [
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-zinc-100 font-medium", children: i.titulo }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500", children: i.descricao }),
              i.tipo_item === "lancamento" && i.tipo_label && /* @__PURE__ */ jsx("span", { className: "inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30", children: i.tipo_label })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-zinc-400 hidden md:table-cell text-xs", children: formatarData(i.data_vencimento) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right text-zinc-100 font-medium", children: formatarKz(i.valor) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right hidden md:table-cell", children: parseFloat(i.valor_em_falta) > 0 ? /* @__PURE__ */ jsx("span", { className: "text-amber-300 font-semibold", children: formatarKz(i.valor_em_falta) }) : /* @__PURE__ */ jsx("span", { className: "text-zinc-600", children: "—" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${cfg.cor}`, children: [
              /* @__PURE__ */ jsx(EstadoIcon, { className: "h-3 w-3" }),
              cfg.label
            ] }) })
          ] }, `${i.tipo_item}-${i.id}`);
        }) })
      ] }) })
    ] })
  ] });
}
export {
  MinhasQuotas as default
};
