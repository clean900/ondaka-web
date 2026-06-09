import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { router, Head, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Search, Eye, User, Building2 } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const fmt = (v) => new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);
const fmtData = (v) => {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("pt-PT");
};
function Index({ clientes, filtros }) {
  const [busca, setBusca] = useState(filtros.busca || "");
  const [estado, setEstado] = useState(filtros.estado || "todos");
  const [tipo, setTipo] = useState(filtros.tipo || "todos");
  useEffect(() => {
    const t = setTimeout(() => {
      router.get("/super-admin/clientes", { busca, estado, tipo }, {
        preserveState: true,
        preserveScroll: true,
        replace: true
      });
    }, 400);
    return () => clearTimeout(t);
  }, [busca, estado, tipo]);
  return /* @__PURE__ */ jsxs(
    AuthenticatedLayout,
    {
      header: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-zinc-100", children: "Clientes B2B" }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-500", children: [
          clientes.total,
          " ",
          clientes.total === 1 ? "cliente" : "clientes"
        ] })
      ] }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Clientes B2B" }),
        /* @__PURE__ */ jsx("div", { className: "py-6", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
              /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Buscar por nome, NIF ou email...",
                  value: busca,
                  onChange: (e) => setBusca(e.target.value),
                  className: "w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: estado,
                onChange: (e) => setEstado(e.target.value),
                className: "rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "todos", children: "Todos os estados" }),
                  /* @__PURE__ */ jsx("option", { value: "trial", children: "Trial" }),
                  /* @__PURE__ */ jsx("option", { value: "activa", children: "Activa" }),
                  /* @__PURE__ */ jsx("option", { value: "limitado", children: "Limitado" }),
                  /* @__PURE__ */ jsx("option", { value: "cancelada", children: "Cancelada" }),
                  /* @__PURE__ */ jsx("option", { value: "sem_subscricao", children: "Sem subscrição" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: tipo,
                onChange: (e) => setTipo(e.target.value),
                className: "rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "todos", children: "Todos os tipos" }),
                  /* @__PURE__ */ jsx("option", { value: "empresa_gestora", children: "Empresa Gestora" }),
                  /* @__PURE__ */ jsx("option", { value: "admin_independente", children: "Admin Independente" })
                ]
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden", children: [
            clientes.data.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-12 text-center text-sm text-zinc-500", children: "Nenhum cliente encontrado com estes filtros." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
              /* @__PURE__ */ jsx("thead", { className: "border-b border-zinc-800 bg-zinc-900/50", children: /* @__PURE__ */ jsxs("tr", { className: "text-xs uppercase tracking-wider text-zinc-500", children: [
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Cliente" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Tipo" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Plano" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Imóveis" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "MRR" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Estado" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Trial / Desde" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Acção" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-zinc-800 text-sm", children: clientes.data.map((c) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-zinc-800/30 transition", children: [
                /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "font-medium text-zinc-100", children: c.nome }),
                  /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-500", children: [
                    c.documento_tipo,
                    " ",
                    c.nif
                  ] })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(TipoBadge, { tipo: c.tipo_cliente }) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-zinc-300", children: c.sub_ciclo ?? "—" }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right text-zinc-300", children: c.sub_num_imoveis ?? 0 }),
                /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-right font-medium text-white", children: [
                  fmt(c.mrr_kz),
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-500", children: "Kz" })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(EstadoBadge, { estado: c.sub_estado }) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs text-zinc-500", children: c.sub_estado === "trial" && c.trial_dias_restantes !== null ? /* @__PURE__ */ jsxs("span", { className: c.trial_dias_restantes <= 7 ? "text-orange-400" : "text-zinc-400", children: [
                  c.trial_dias_restantes,
                  "d restantes"
                ] }) : fmtData(c.sub_activa_desde ?? c.empresa_created) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxs(
                  Link,
                  {
                    href: `/super-admin/clientes/${c.id}`,
                    className: "inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-blue-500 hover:text-white",
                    children: [
                      /* @__PURE__ */ jsx(Eye, { className: "h-3 w-3" }),
                      "Detalhe"
                    ]
                  }
                ) })
              ] }, c.id)) })
            ] }) }),
            clientes.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Mostrando ",
                clientes.from,
                "-",
                clientes.to,
                " de ",
                clientes.total
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: Array.from({ length: clientes.last_page }, (_, i) => i + 1).map((p) => /* @__PURE__ */ jsx(
                Link,
                {
                  href: `/super-admin/clientes?page=${p}&busca=${busca}&estado=${estado}&tipo=${tipo}`,
                  className: `rounded px-2.5 py-1 ${p === clientes.current_page ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`,
                  children: p
                },
                p
              )) })
            ] })
          ] })
        ] }) })
      ]
    }
  );
}
function TipoBadge({ tipo }) {
  if (tipo === "admin_independente") {
    return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300", children: [
      /* @__PURE__ */ jsx(User, { className: "h-3 w-3" }),
      "Admin"
    ] });
  }
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300", children: [
    /* @__PURE__ */ jsx(Building2, { className: "h-3 w-3" }),
    "Empresa"
  ] });
}
function EstadoBadge({ estado }) {
  if (!estado) {
    return /* @__PURE__ */ jsx("span", { className: "rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500", children: "Sem subscrição" });
  }
  const config = {
    trial: { color: "bg-yellow-500/20 text-yellow-300", label: "● Trial" },
    activa: { color: "bg-green-500/20 text-green-300", label: "● Activa" },
    limitado: { color: "bg-orange-500/20 text-orange-300", label: "● Limitado" },
    cancelada: { color: "bg-red-500/20 text-red-300", label: "● Cancelada" }
  };
  const c = config[estado] ?? { color: "bg-zinc-700 text-zinc-300", label: estado };
  return /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.color}`, children: c.label });
}
export {
  Index as default
};
