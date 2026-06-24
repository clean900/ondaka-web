import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BlNlf6II.js";
import { Head, Link } from "@inertiajs/react";
import { FileText, Receipt, XCircle, CheckCircle2, Clock, AlertCircle } from "lucide-react";
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
  const d = new Date(v);
  return d.toLocaleDateString("pt-PT");
};
function Facturas({ facturas, subscricao }) {
  return /* @__PURE__ */ jsxs(
    AuthenticatedLayout,
    {
      header: /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold text-zinc-100", children: [
        /* @__PURE__ */ jsx(Receipt, { className: "mr-2 inline h-5 w-5" }),
        "Facturas da Subscrição"
      ] }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Facturas Subscrição" }),
        /* @__PURE__ */ jsx("div", { className: "py-6", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: "As suas facturas" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-zinc-400", children: "Histórico de facturas emitidas da sua subscrição ONDAKA." })
            ] }),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: "/subscricao",
                className: "rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700",
                children: "← Voltar à subscrição"
              }
            )
          ] }),
          facturas.length === 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center", children: [
            /* @__PURE__ */ jsx(FileText, { className: "mx-auto h-12 w-12 text-zinc-700" }),
            /* @__PURE__ */ jsx("h3", { className: "mt-4 text-base font-medium text-zinc-200", children: "Sem facturas ainda" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-zinc-500", children: (subscricao == null ? void 0 : subscricao.estado) === "trial" ? "Está em período de trial. Não há facturas a pagar até o trial terminar." : "Quando uma factura for emitida, aparecerá aqui." })
          ] }),
          facturas.length > 0 && /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
            /* @__PURE__ */ jsx("thead", { className: "border-b border-zinc-800 bg-zinc-950/50", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500", children: "Factura" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500", children: "Período" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500", children: "Imóveis" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500", children: "Total" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center text-xs font-medium uppercase text-zinc-500", children: "Estado" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500", children: "Vencimento" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-zinc-800", children: facturas.map((f) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-zinc-850", children: [
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium text-white", children: f.numero }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-500", children: [
                  "Emitida ",
                  fmtData(f.data_emissao)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-sm text-zinc-300", children: [
                fmtData(f.periodo_inicio),
                " ",
                /* @__PURE__ */ jsx("br", {}),
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-500", children: [
                  "a ",
                  fmtData(f.periodo_fim)
                ] })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-zinc-300", children: f.num_imoveis }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxs("div", { className: "font-semibold text-white", children: [
                fmt(f.valor_total_kz),
                " Kz"
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsx(EstadoBadge, { estado: f.estado }) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-zinc-300", children: fmtData(f.data_vencimento) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsx(
                Link,
                {
                  href: `/subscricao/facturas/${f.id}`,
                  className: "text-sm text-cyan-400 hover:text-cyan-300",
                  children: "Ver →"
                }
              ) })
            ] }, f.id)) })
          ] }) })
        ] }) })
      ]
    }
  );
}
function EstadoBadge({ estado }) {
  const config = {
    pendente: { Icon: Clock, cor: "text-yellow-400", bg: "bg-yellow-500/20", label: "Pendente" },
    paga: { Icon: CheckCircle2, cor: "text-green-400", bg: "bg-green-500/20", label: "Paga" },
    anulada: { Icon: XCircle, cor: "text-red-400", bg: "bg-red-500/20", label: "Anulada" }
  };
  const { Icon, cor, bg, label } = config[estado] || { Icon: AlertCircle, cor: "text-zinc-400", bg: "bg-zinc-700", label: estado };
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${cor}`, children: [
    /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
    label
  ] });
}
export {
  Facturas as default
};
