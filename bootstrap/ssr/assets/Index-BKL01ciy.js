import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dh9fgZ4d.js";
import { Head, Link, router } from "@inertiajs/react";
import { Package, CircleCheck, Clock, TriangleAlert, Pause, Archive, Plus, ChevronRight } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function formatData(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(iso));
}
function formatMoeda(valor) {
  return new Intl.NumberFormat("pt-PT").format(valor) + " Kz";
}
function EstadoBadge({ estado, label }) {
  const estilos = {
    activa: "bg-emerald-500/15 text-emerald-300",
    pendente: "bg-amber-500/15 text-amber-300",
    suspensa: "bg-white/10 text-white/60",
    expirada: "bg-white/10 text-white/60",
    esgotada: "bg-red-500/15 text-red-300",
    cancelada: "bg-white/5 text-white/50"
  };
  const estilo = estilos[estado] ?? "bg-white/10 text-white/70";
  return /* @__PURE__ */ jsx("span", { className: `inline-block px-2 py-0.5 rounded text-[11px] font-medium ${estilo}`, children: label });
}
function AdminFeaturesIndex({
  subscriptions,
  contadores,
  features_dropdown,
  filtros
}) {
  const [estado, setEstado] = useState(filtros.estado ?? "");
  const [feature, setFeature] = useState(filtros.feature ?? "");
  const [tipoOwner, setTipoOwner] = useState(filtros.tipo_owner ?? "");
  const aplicarFiltros = () => {
    router.get(
      "/admin/features",
      {
        estado: estado || void 0,
        feature: feature || void 0,
        tipo_owner: tipoOwner || void 0
      },
      { preserveState: true }
    );
  };
  const limparFiltros = () => {
    setEstado("");
    setFeature("");
    setTipoOwner("");
    router.get("/admin/features");
  };
  const statCards = [
    { label: "Total", valor: contadores.total, icon: Package, cor: "text-white" },
    { label: "Activas", valor: contadores.activa, icon: CircleCheck, cor: "text-emerald-300" },
    { label: "Pendentes", valor: contadores.pendente, icon: Clock, cor: "text-amber-300" },
    {
      label: "Saldo baixo",
      valor: contadores.saldo_baixo,
      icon: TriangleAlert,
      cor: contadores.saldo_baixo > 0 ? "text-amber-300" : "text-white/60"
    },
    { label: "Suspensas", valor: contadores.suspensa, icon: Pause, cor: "text-white/60" },
    { label: "Expiradas", valor: contadores.expirada, icon: Clock, cor: "text-white/60" },
    { label: "Canceladas", valor: contadores.cancelada, icon: Archive, cor: "text-white/60" }
  ];
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Admin — Features" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto space-y-6 pt-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white tracking-tight", children: "Admin · Features" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Gerir todas as subscriptions de features do sistema" })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/admin/features/nova",
            className: "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00D4FF] text-black text-sm font-medium hover:bg-[#8FE7FF] transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Activar feature"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3", children: statCards.map((card) => {
        const Icon = card.icon;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "p-4 rounded-xl bg-white/[0.03] border border-white/10",
            children: [
              /* @__PURE__ */ jsx(Icon, { className: `w-4 h-4 ${card.cor} mb-2` }),
              /* @__PURE__ */ jsx("div", { className: `text-2xl font-semibold ${card.cor}`, children: card.valor }),
              /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/50 mt-0.5", children: card.label })
            ]
          },
          card.label
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Estado" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: estado,
              onChange: (e) => setEstado(e.target.value),
              className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Todos" }),
                /* @__PURE__ */ jsx("option", { value: "activa", children: "Activa" }),
                /* @__PURE__ */ jsx("option", { value: "pendente", children: "Pendente" }),
                /* @__PURE__ */ jsx("option", { value: "suspensa", children: "Suspensa" }),
                /* @__PURE__ */ jsx("option", { value: "expirada", children: "Expirada" }),
                /* @__PURE__ */ jsx("option", { value: "cancelada", children: "Cancelada" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Feature" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: feature,
              onChange: (e) => setFeature(e.target.value),
              className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Todas" }),
                features_dropdown.map((f) => /* @__PURE__ */ jsx("option", { value: f.slug, children: f.nome }, f.slug))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Tipo owner" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: tipoOwner,
              onChange: (e) => setTipoOwner(e.target.value),
              className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Ambos" }),
                /* @__PURE__ */ jsx("option", { value: "empresa", children: "Empresa" }),
                /* @__PURE__ */ jsx("option", { value: "condominio", children: "Condomínio" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: aplicarFiltros,
              className: "flex-1 px-3 py-2 rounded-lg bg-[#00D4FF] text-black text-sm font-medium hover:bg-[#8FE7FF]",
              children: "Filtrar"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: limparFiltros,
              className: "px-3 py-2 rounded-lg bg-white/5 text-white/70 text-sm hover:bg-white/10",
              children: "Limpar"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-white/[0.02] border-b border-white/10", children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-[11px] uppercase tracking-wide text-white/50", children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "#" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Feature" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Owner" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Estado" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Saldo / Expira" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Valor pago" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium w-10" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { children: [
            subscriptions.data.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "px-4 py-8 text-center text-white/50", children: "Nenhuma subscription encontrada." }) }),
            subscriptions.data.map((sub) => /* @__PURE__ */ jsxs(
              "tr",
              {
                className: "border-b border-white/5 hover:bg-white/[0.04] cursor-pointer",
                onClick: () => router.get(`/admin/features/${sub.id}`),
                children: [
                  /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-white/60 font-mono text-xs", children: [
                    "#",
                    sub.id
                  ] }),
                  /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                    /* @__PURE__ */ jsx("div", { className: "font-medium text-white", children: sub.feature.nome }),
                    /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/50", children: sub.feature.categoria_label })
                  ] }),
                  /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                    /* @__PURE__ */ jsx("div", { className: "text-white/90", children: sub.owner.nome }),
                    /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/50 capitalize", children: sub.owner.tipo })
                  ] }),
                  /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                    /* @__PURE__ */ jsx(EstadoBadge, { estado: sub.estado, label: sub.estado_label }),
                    sub.saldo_baixo && /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-medium", children: "SALDO BAIXO" }) })
                  ] }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-white/80 text-xs", children: sub.feature.modelo_cobranca === "consumable" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    sub.saldo_actual.toLocaleString("pt-PT"),
                    " /",
                    " ",
                    sub.saldo_inicial.toLocaleString("pt-PT"),
                    /* @__PURE__ */ jsx("span", { className: "text-white/40 ml-1", children: sub.feature.unidade })
                  ] }) : sub.expira_em ? formatData(sub.expira_em) : "—" }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-white/80", children: formatMoeda(sub.valor_pago_total) }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-white/30" }) })
                ]
              },
              sub.id
            ))
          ] })
        ] }) }),
        subscriptions.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 border-t border-white/10 flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-white/60", children: [
            subscriptions.from,
            "–",
            subscriptions.to,
            " de ",
            subscriptions.total
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: subscriptions.links.map((link, idx) => /* @__PURE__ */ jsx(
            "button",
            {
              disabled: !link.url,
              onClick: () => link.url && router.visit(link.url),
              className: `px-3 py-1 rounded text-xs ${link.active ? "bg-white/15 text-white" : link.url ? "text-white/70 hover:bg-white/10" : "text-white/30"}`,
              dangerouslySetInnerHTML: { __html: link.label }
            },
            idx
          )) })
        ] })
      ] })
    ] })
  ] });
}
export {
  AdminFeaturesIndex as default
};
