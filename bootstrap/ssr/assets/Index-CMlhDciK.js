import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dfn1r3bR.js";
import { Head, router, Link } from "@inertiajs/react";
import { Clock, Receipt, CheckCircle2, TrendingUp, Search, Filter, User, Building2, Calendar } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const formatarKz = (valor) => {
  const n = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "AOA",
    currencyDisplay: "narrowSymbol"
  }).format(n).replace("AOA", "Kz");
};
const formatarData = (data) => {
  return new Date(data).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};
const metodoLabel = {
  transferencia_bancaria: "Transferência",
  deposito_bancario: "Depósito",
  proxypay_rps: "Multicaixa",
  dinheiro: "Dinheiro",
  outro: "Outro"
};
const estadoStyle = {
  pendente: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Pendente" },
  em_revisao: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Em revisão" },
  confirmado: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Confirmado" },
  rejeitado: { bg: "bg-red-500/10", text: "text-red-400", label: "Rejeitado" },
  devolvido: { bg: "bg-orange-500/10", text: "text-orange-400", label: "Devolvido" }
};
function Index({ pagamentos, stats, filtros }) {
  const [search, setSearch] = useState(filtros.q || "");
  const [estado, setEstado] = useState(filtros.estado || "");
  const handleFiltrar = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.q = search;
    if (estado) params.estado = estado;
    router.get(route("pagamentos.index"), params, { preserveState: true });
  };
  const handleLimpar = () => {
    setSearch("");
    setEstado("");
    router.get(route("pagamentos.index"));
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Pagamentos" }),
    /* @__PURE__ */ jsx("div", { className: "py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: "Pagamentos" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 mt-1", children: "Validar pagamentos submetidos pelos condóminos" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: /* @__PURE__ */ jsx(Clock, { size: 18 }),
            label: "Pendentes",
            value: stats.pendentes.toString(),
            color: "amber",
            onClick: () => {
              setEstado("pendente");
              router.get(route("pagamentos.index"), { estado: "pendente" });
            },
            highlighted: true
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: /* @__PURE__ */ jsx(Receipt, { size: 18 }),
            label: "Em revisão",
            value: stats.em_revisao.toString(),
            color: "blue",
            onClick: () => {
              setEstado("em_revisao");
              router.get(route("pagamentos.index"), { estado: "em_revisao" });
            }
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: /* @__PURE__ */ jsx(CheckCircle2, { size: 18 }),
            label: "Confirmados (mês)",
            value: stats.confirmados_mes.toString(),
            color: "emerald"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: /* @__PURE__ */ jsx(TrendingUp, { size: 18 }),
            label: "Total recebido (mês)",
            value: formatarKz(stats.valor_confirmado_mes),
            color: "cyan"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleFiltrar, className: "flex flex-wrap gap-3 items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[200px] relative", children: [
          /* @__PURE__ */ jsx(Search, { size: 16, className: "absolute left-3 top-3 text-zinc-500" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Pesquisar por referência ou condómino...",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: estado,
            onChange: (e) => setEstado(e.target.value),
            className: "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Todos os estados" }),
              /* @__PURE__ */ jsx("option", { value: "pendente", children: "Pendente" }),
              /* @__PURE__ */ jsx("option", { value: "em_revisao", children: "Em revisão" }),
              /* @__PURE__ */ jsx("option", { value: "confirmado", children: "Confirmado" }),
              /* @__PURE__ */ jsx("option", { value: "rejeitado", children: "Rejeitado" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            className: "bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx(Filter, { size: 14 }),
              " Filtrar"
            ]
          }
        ),
        (search || estado) && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleLimpar,
            className: "text-zinc-400 hover:text-white px-3 py-2 text-sm",
            children: "Limpar"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden", children: [
        pagamentos.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-12 text-center text-zinc-500", children: [
          /* @__PURE__ */ jsx(Receipt, { size: 48, className: "mx-auto mb-4 opacity-30" }),
          /* @__PURE__ */ jsx("p", { children: "Sem pagamentos com estes filtros." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800", children: pagamentos.data.map((p) => {
          var _a, _b, _c, _d, _e, _f;
          return /* @__PURE__ */ jsx(
            Link,
            {
              href: route("pagamentos.show", p.id),
              className: "block hover:bg-zinc-800/50 transition-colors p-4",
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-white", children: p.referencia }),
                    /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded text-[11px] font-bold ${(_a = estadoStyle[p.estado]) == null ? void 0 : _a.bg} ${(_b = estadoStyle[p.estado]) == null ? void 0 : _b.text}`, children: (_c = estadoStyle[p.estado]) == null ? void 0 : _c.label })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-zinc-400 flex-wrap", children: [
                    /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(User, { size: 12 }),
                      " ",
                      ((_d = p.condomino) == null ? void 0 : _d.nome_completo) || "—"
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(Building2, { size: 12 }),
                      " ",
                      (_e = p.condominio) == null ? void 0 : _e.nome,
                      " · Fracção ",
                      (_f = p.fraccao) == null ? void 0 : _f.identificador
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(Calendar, { size: 12 }),
                      " ",
                      formatarData(p.data_pagamento)
                    ] }),
                    /* @__PURE__ */ jsx("span", { children: metodoLabel[p.metodo] || p.metodo })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-right", children: /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-white", children: formatarKz(p.valor) }) })
              ] })
            },
            p.id
          );
        }) }),
        pagamentos.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "border-t border-zinc-800 px-4 py-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-500", children: [
            "Página ",
            pagamentos.current_page,
            " de ",
            pagamentos.last_page,
            " (",
            pagamentos.total,
            " pagamentos)"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: pagamentos.links.map((link, i) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => link.url && router.get(link.url),
              disabled: !link.url,
              className: `px-3 py-1 rounded text-xs ${link.active ? "bg-cyan-500 text-white" : "text-zinc-400 hover:text-white disabled:opacity-30"}`,
              dangerouslySetInnerHTML: { __html: link.label }
            },
            i
          )) })
        ] })
      ] })
    ] }) })
  ] });
}
function StatCard({
  icon,
  label,
  value,
  color,
  onClick,
  highlighted
}) {
  const colors = {
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
  };
  const Component = onClick ? "button" : "div";
  return /* @__PURE__ */ jsxs(
    Component,
    {
      onClick,
      className: `text-left bg-zinc-900 border ${highlighted ? colors[color].split(" ")[2] : "border-zinc-800"} rounded-xl p-4 ${onClick ? "hover:bg-zinc-800/50 transition-colors cursor-pointer" : ""}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: `p-1.5 rounded ${colors[color]}`, children: icon }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-400 font-semibold", children: label })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-white", children: value })
      ]
    }
  );
}
export {
  Index as default
};
