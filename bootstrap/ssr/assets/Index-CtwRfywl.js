import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { Receipt, Clock, CheckCircle2, TrendingUp, Search, XCircle, AlertCircle } from "lucide-react";
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
function Index({ facturas, stats, empresas, filtros }) {
  const [busca, setBusca] = useState(filtros.busca || "");
  const [estado, setEstado] = useState(filtros.estado || "");
  const [empresaId, setEmpresaId] = useState(filtros.empresa_id || "");
  const aplicarFiltros = (overrides = {}) => {
    const params = {
      busca: overrides.busca ?? busca,
      estado: overrides.estado ?? estado,
      empresa_id: overrides.empresa_id ?? empresaId
    };
    Object.keys(params).forEach((k) => {
      if (!params[k]) delete params[k];
    });
    router.get("/super-admin/facturas-plataforma", params, { preserveState: true, replace: true });
  };
  const anularFactura = async (factura) => {
    var _a;
    const motivo = prompt(`Anular factura ${factura.numero}?

Indique o motivo:`);
    if (!motivo) return;
    try {
      const csrf = ((_a = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a.content) || "";
      const r = await fetch(`/super-admin/facturas-plataforma/${factura.id}/anular`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrf
        },
        credentials: "same-origin",
        body: JSON.stringify({ motivo })
      });
      const data = await r.json();
      if (r.ok && data.success) {
        alert(data.message);
        router.reload();
      } else {
        alert(data.message || "Erro ao anular.");
      }
    } catch (err) {
      alert("Erro de ligação.");
    }
  };
  return /* @__PURE__ */ jsxs(
    AuthenticatedLayout,
    {
      header: /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold text-zinc-100", children: [
        /* @__PURE__ */ jsx(Receipt, { className: "mr-2 inline h-5 w-5" }),
        "Facturas Plataforma (Super-Admin)"
      ] }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Facturas Plataforma" }),
        /* @__PURE__ */ jsx("div", { className: "py-6", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4 md:grid-cols-4", children: [
            /* @__PURE__ */ jsx(
              StatCard,
              {
                label: "Total Facturas",
                valor: stats.total_facturas.toString(),
                icon: /* @__PURE__ */ jsx(Receipt, { className: "h-5 w-5 text-cyan-400" })
              }
            ),
            /* @__PURE__ */ jsx(
              StatCard,
              {
                label: "Pendente (valor)",
                valor: `${fmt(stats.valor_pendente_kz)} Kz`,
                sublabel: `${stats.pendentes} facturas`,
                icon: /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5 text-yellow-400" })
              }
            ),
            /* @__PURE__ */ jsx(
              StatCard,
              {
                label: "Pago Total",
                valor: `${fmt(stats.valor_pago_kz)} Kz`,
                sublabel: `${stats.pagas} facturas`,
                icon: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-green-400" })
              }
            ),
            /* @__PURE__ */ jsx(
              StatCard,
              {
                label: `Pago em ${(/* @__PURE__ */ new Date()).toLocaleDateString("pt-PT", { month: "long" })}`,
                valor: `${fmt(stats.valor_pago_mes_actual_kz)} Kz`,
                icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-purple-400" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs uppercase text-zinc-500", children: "Pesquisar" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: busca,
                    onChange: (e) => setBusca(e.target.value),
                    onKeyDown: (e) => e.key === "Enter" && aplicarFiltros(),
                    placeholder: "Número factura ou empresa...",
                    className: "w-full rounded border border-zinc-700 bg-zinc-800 py-2 pl-10 pr-3 text-sm text-white"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs uppercase text-zinc-500", children: "Estado" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: estado,
                  onChange: (e) => {
                    setEstado(e.target.value);
                    aplicarFiltros({ estado: e.target.value });
                  },
                  className: "w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Todos" }),
                    /* @__PURE__ */ jsx("option", { value: "pendente", children: "Pendente" }),
                    /* @__PURE__ */ jsx("option", { value: "paga", children: "Paga" }),
                    /* @__PURE__ */ jsx("option", { value: "anulada", children: "Anulada" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs uppercase text-zinc-500", children: "Empresa" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: empresaId,
                  onChange: (e) => {
                    setEmpresaId(e.target.value);
                    aplicarFiltros({ empresa_id: e.target.value });
                  },
                  className: "w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Todas" }),
                    empresas.map((e) => /* @__PURE__ */ jsx("option", { value: e.id, children: e.nome }, e.id))
                  ]
                }
              )
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900", children: facturas.data.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-12 text-center text-sm text-zinc-500", children: "Sem facturas para mostrar." }) : /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
            /* @__PURE__ */ jsx("thead", { className: "border-b border-zinc-800 bg-zinc-950/50", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500", children: "Factura" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500", children: "Empresa" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500", children: "Período" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500", children: "Total" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center text-xs font-medium uppercase text-zinc-500", children: "Estado" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500", children: "Vencimento" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500", children: "Acções" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-zinc-800", children: facturas.data.map((f) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-zinc-850", children: [
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                /* @__PURE__ */ jsx("div", { className: "font-mono text-sm font-medium text-white", children: f.numero }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: fmtData(f.data_emissao) })
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-sm", children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium text-zinc-100", children: f.empresa.nome }),
                f.empresa.nif && /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-500", children: [
                  "NIF: ",
                  f.empresa.nif
                ] })
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-sm text-zinc-300", children: [
                fmtData(f.periodo_inicio),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-500", children: [
                  "a ",
                  fmtData(f.periodo_fim)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-right font-semibold text-white", children: [
                fmt(f.valor_total_kz),
                " Kz"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsx(EstadoBadge, { estado: f.estado }) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-zinc-300", children: fmtData(f.data_vencimento) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: f.estado === "pendente" && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => anularFactura(f),
                  className: "text-xs text-red-400 hover:text-red-300",
                  children: "Anular"
                }
              ) })
            ] }, f.id)) })
          ] }) }),
          facturas.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between text-sm text-zinc-400", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              "Página ",
              facturas.current_page,
              " de ",
              facturas.last_page,
              " (",
              facturas.total,
              " facturas)"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: facturas.links.map((link, i) => link.url ? /* @__PURE__ */ jsx(
              Link,
              {
                href: link.url,
                preserveState: true,
                className: `rounded px-3 py-1 ${link.active ? "bg-cyan-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`,
                dangerouslySetInnerHTML: { __html: link.label }
              },
              i
            ) : /* @__PURE__ */ jsx(
              "span",
              {
                className: "rounded px-3 py-1 text-zinc-600",
                dangerouslySetInnerHTML: { __html: link.label }
              },
              i
            )) })
          ] })
        ] }) })
      ]
    }
  );
}
function StatCard({ label, valor, sublabel, icon }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-zinc-500", children: label }),
      icon
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-2 text-xl font-bold text-white", children: valor }),
    sublabel && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-zinc-500", children: sublabel })
  ] });
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
  Index as default
};
